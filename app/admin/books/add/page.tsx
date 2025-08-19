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

import toast                  from 'react-hot-toast';

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

  const onPriceBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.value &&
    setForm({ ...form, [e.target.name]: formatPrice(e.target.value) });

  /* file handler --------------------------------------------------- */
  const onFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'bookCover' | 'bookFile',
  ) => {
    const f = e.target.files?.[0] ?? null;
    setForm({ ...form, [key]: f });
  };

  /* convert file → base64 (for current back‑end) ------------------- */
  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  /* submit --------------------------------------------------------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.bookFile) {
      return toast.error('Please complete required fields.');
    }

    setLoading(true);
    try {
      /* encode files */
      const cover64 = form.bookCover ? await toBase64(form.bookCover) : null;
      const file64  = await toBase64(form.bookFile!);

      /* strip $ and , from prices */
      const strip = (s: string) => Number(s.replace(/[$,]/g, '') || 0);

      const res = await fetch('/api/admin/books/upload', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title        : form.title,
          author       : form.author,
          description  : form.description,
          category     : form.category,
          physicalPrice: strip(form.physicalPrice),
          digitalPrice : strip(form.digitalPrice),
          bookCover    : cover64,
          bookFile     : file64,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Upload failed');
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

            <FloatingFileInput
              label="Book File (PDF)"
              name="bookFile"
              accept=".pdf"
              onFileChangeAction={e => onFile(e, 'bookFile')}
            />
          </section>

          {/* 3. pricing -------------------------------------------- */}
          <section className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Pricing</h3>
            <FloatingInput
              label="Physical Price (MXN)" name="physicalPrice" type="text"
              value={form.physicalPrice} onChange={onText} onBlur={onPriceBlur}/>
            <FloatingInput
              label="Digital Price (MXN)"  name="digitalPrice"  type="text"
              value={form.digitalPrice}  onChange={onText} onBlur={onPriceBlur}/>
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
