'use client';

import { useState }          from 'react';
import Link                  from 'next/link';
import { useRouter }         from 'next/navigation';

import { Button }            from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
}                             from '@/components/ui/select';
import { FloatingInput }      from '@/components/ui/FloatingInput';
import { FloatingFileInput }  from '@/components/ui/FloatingFileInput';

import { toast }                  from 'sonner';

/* -------------------------------------------------- */
/* helpers                                            */
/* -------------------------------------------------- */
const formatPrice = (v: string) =>
  !v
    ? ''
    : parseFloat(v).toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
      });

/* -------------------------------------------------- */
/* component                                         */
/* -------------------------------------------------- */
export default function AddBookPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [filePreview, setFilePreview]   = useState<string | null>(null);
  const [coverSize, setCoverSize] = useState<number | null>(null);
  const [fileSize, setFileSize]   = useState<number | null>(null);
  const [form, setForm]       = useState({
    title         : '',
    author        : '',
    description   : '',
    category      : '',
    physicalPrice : '',
    digitalPrice  : '',
    bookCover     : null as File | null,
    bookFile      : null as File | null,
  });

  const categories = [
    'PRIMARIA',
    'SECUNDARIA',
    'BACHILLERATO',
    'PARA_MAESTROS',
  ];

  /* generic text handler ------------------------------------------ */
  const onText = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Only allow integers (no cents). Strip non-digits on the fly.
  const onPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D+/g, '');
    setForm({ ...form, [e.target.name]: clean });
  };

  /* file handler --------------------------------------------------- */
  const onFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'bookCover' | 'bookFile',
  ) => {
    const f = e.target.files?.[0] ?? null;
    setForm({ ...form, [key]: f });
    if (f) {
      if (key === 'bookCover') {
        setCoverPreview(URL.createObjectURL(f));
        setCoverSize(f.size);
      } else {
        setFilePreview(f.name);
        setFileSize(f.size);
      }
    }
  };

  // no progress conversion helpers needed

  /* submit --------------------------------------------------------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author) {
      return toast.error('Please complete required fields.');
    }

    try {
      // Build multipart form data
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('author', form.author);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('physicalPrice', String(Number(form.physicalPrice || 0)));
      fd.append('digitalPrice',  String(Number(form.digitalPrice  || 0)));
      if (form.bookCover) fd.append('bookCover', form.bookCover);
      if (form.bookFile)  fd.append('bookFile',  form.bookFile);

      toast.info('Subiendo archivos… serás redirigido cuando termine.');
      const res = await fetch('/api/admin/books/upload', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) {
        let msg = 'Upload failed';
        try { const j = await res.json(); msg = j?.error || msg; } catch {}
        throw new Error(msg);
      }
      toast.success('Book uploaded successfully!');
      router.push('/admin/books');
    } catch (e:any) {
      toast.error(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------- */
  /* JSX                                               */
  /* -------------------------------------------------- */
  return (
    <div className="bg-neutral-100 p-6">
      {/* breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/admin"       className="hover:underline">Lucero Admin Dashboard</Link>{' '}
        /<Link href="/admin/books" className="hover:underline"> Books</Link> / Add&nbsp;New&nbsp;Book
      </nav>

      <div className="max-h-[91vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
        <h2 className="mb-4 text-xl font-medium text-gray-900">Add a New Book</h2>

        <form onSubmit={onSubmit} className="space-y-10">
          {/* 1. information ----------------------------------------- */}
          <section className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Information</h3>
            <FloatingInput label="Title"       name="title"       value={form.title}       onChange={onText}/>
            <FloatingInput label="Author"      name="author"      value={form.author}      onChange={onText}/>
            <FloatingInput label="Description" name="description" value={form.description} onChange={onText}/>

            {/* category */}
            <div className="relative z-50 max-w-[300px] space-y-2">
              <label className="text-sm font-light text-gray-500">Category</label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="rounded-lg border-gray-300">
                  <SelectValue placeholder="Select a category"/>
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c.replace('_',' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* 2. files ---------------------------------------------- */}
          <section className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Files</h3>

            <FloatingFileInput
              label="Book Cover"
              name="bookCover"
              accept="image/*"
              onFileChangeAction={e => onFile(e, 'bookCover')}
            />

            {coverPreview && (
              <div className="mt-2 flex items-center gap-4">
                <img src={coverPreview} alt="Cover preview" className="h-28 w-28 rounded object-cover" />
                <div className="flex-1">
                  <p className="mt-1 text-xs text-gray-500">
                    {coverSize ? (coverSize / 1024 / 1024).toFixed(2) + ' MB' : ''}
                  </p>
                </div>
              </div>
            )}

            <FloatingFileInput
              label="Book File (PDF)"
              name="bookFile"
              accept=".pdf"
              onFileChangeAction={e => onFile(e, 'bookFile')}
            />

            {filePreview && (
              <div className="mt-2 flex items-center gap-4">
                <div className="flex-1">
                  <p className="mt-1 text-xs text-gray-500">
                    {filePreview} {fileSize ? '· ' + (fileSize / 1024 / 1024).toFixed(2) + ' MB' : ''}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* 3. pricing -------------------------------------------- */}
          <section className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Pricing</h3>
            <FloatingInput
              label="Physical Price (MXN)" name="physicalPrice" type="text"
              value={form.physicalPrice} onChange={onPriceInput} inputMode="numeric"/>
            <FloatingInput
              label="Digital Price (MXN)"  name="digitalPrice"  type="text"
              value={form.digitalPrice}  onChange={onPriceInput} inputMode="numeric"/>
          </section>

          {/* 4. save ---------------------------------------------- */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-black px-5 py-2 text-white hover:bg-gray-900"
              style={{ borderRadius: '8px' }}   /* rounded corners */
            >
              {loading ? 'Uploading…' : 'Save Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
