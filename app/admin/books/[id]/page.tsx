/* -------------------------------------------------------------------------- */
/*  Edit‑Book page – shows existing cover & file names, rounded corners, etc. */
/* -------------------------------------------------------------------------- */
'use client';

import { useState, useEffect }  from 'react';
import Link                     from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { Button }               from '@/components/ui/button';
import { Input }                from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
}                               from '@/components/ui/select';
import { FloatingInput }        from '@/components/ui/FloatingInput';
import { FloatingFileInput }    from '@/components/ui/FloatingFileInput';

import toast from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/*  helpers                                                           */
/* ------------------------------------------------------------------ */
const bucket = process.env.NEXT_PUBLIC_FIREBASE_BUCKET;

const formatPrice = (v: string | number) =>
  !v
    ? ''
    : Number(v).toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
      });

/* ------------------------------------------------------------------ */
/*  component                                                         */
/* ------------------------------------------------------------------ */
export default function EditBookPage() {
  const router          = useRouter();
  const { id }          = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    title         : '',
    author        : '',
    description   : '',
    category      : '',
    physicalPrice : '',
    digitalPrice  : '',
    bookCover     : ''  as File | string,  // URL or File
    bookFile      : ''  as File | string,  // URL or File
  });

  /* fetch book once ------------------------------------------------------ */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await fetch(`/api/admin/books/${id}`);
        if (!r.ok) throw new Error('Failed to load book');
        const b = await r.json();

        setForm({
          title         : b.title,
          author        : b.author,
          description   : b.description ?? '',
          category      : b.category    ?? '',
          physicalPrice : b.physicalPrice ? formatPrice(b.physicalPrice) : '',
          digitalPrice  : b.digitalPrice  ? formatPrice(b.digitalPrice)  : '',
          bookCover     : b.bookCover ?? '',
          bookFile      : b.bookFile  ?? '',
        });
      } catch (e) {
        console.error(e);
        toast.error('Error al cargar el libro.');
      }
    })();
  }, [id]);

  /* handlers ------------------------------------------------------------- */
  const onText = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onPriceBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.value &&
    setForm({ ...form, [e.target.name]: formatPrice(e.target.value) });

  const onFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'bookCover' | 'bookFile',
  ) => {
    const f = e.target.files?.[0];
    if (f) setForm({ ...form, [key]: f });
  };

  /* submit --------------------------------------------------------------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author)
      return toast.error('Completa los campos requeridos');

    setLoading(true);
    try {
      const r = await fetch(`/api/admin/books/${id}`, {
        method : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          ...form,
          physicalPrice: Number(
            String(form.physicalPrice).replace(/[$,]/g, ''),
          ),
          digitalPrice : Number(
            String(form.digitalPrice).replace(/[$,]/g, ''),
          ),
        }),
      });
      if (!r.ok) throw new Error('Update failed');
      toast.success('Libro actualizado');
      router.push('/admin/books');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  JSX                                                               */
  /* ------------------------------------------------------------------ */
  return (
    <div className="bg-neutral-100 p-6">
      {/* breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/admin" className="hover:underline">
          Lucero Admin Dashboard
        </Link>{' '}
        /<Link href="/admin/books" className="hover:underline"> Books</Link> /
        Edit Book
      </nav>

      <div className="max-h-[91vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
        <h2 className="mb-4 text-xl font-medium text-gray-900">Edit Book</h2>

        <form onSubmit={onSubmit} className="space-y-10">
          {/* 1. info ---------------------------------------------------- */}
          <section className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">
              Book Information
            </h3>
            <FloatingInput
              label="Title"
              name="title"
              value={form.title}
              onChange={onText}
            />
            <FloatingInput
              label="Author"
              name="author"
              value={form.author}
              onChange={onText}
            />
            <FloatingInput
              label="Description"
              name="description"
              value={form.description}
              onChange={onText}
            />

            {/* category */}
            <div className="relative z-50 max-w-[300px] space-y-2">
              <label className="text-sm font-light text-gray-500">
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={v => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="rounded-lg border-gray-300">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'PRIMARIA',
                    'SECUNDARIA',
                    'BACHILLERATO',
                    'PARA_MAESTROS',
                  ].map(c => (
                    <SelectItem key={c} value={c}>
                      {c.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* 2. files -------------------------------------------------- */}
          <section className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Files</h3>

            {/* cover file input */}
            <FloatingFileInput
              label="Book Cover"
              name="bookCover"
              accept="image/*"
              defaultValue={
                typeof form.bookCover === 'string' && form.bookCover
                  ? form.bookCover.split('/').pop()
                  : undefined
              }
              onFileChangeAction={e => onFile(e, 'bookCover')}
            />

            {/* existing cover preview */}
            {typeof form.bookCover === 'string' && form.bookCover && (
              <img
                src={
                  form.bookCover.startsWith('http')
                    ? form.bookCover
                    : `https://storage.googleapis.com/${bucket}/${form.bookCover}`
                }
                alt="cover preview"
                className="h-40 w-40 rounded-[10px] object-cover"
              />
            )}

            {/* pdf input */}
            <FloatingFileInput
              label="Book File (PDF)"
              name="bookFile"
              accept=".pdf"
              defaultValue={
                typeof form.bookFile === 'string' && form.bookFile
                  ? form.bookFile.split('/').pop()
                  : undefined
              }
              onFileChangeAction={e => onFile(e, 'bookFile')}
            />
          </section>

          {/* 3. pricing ------------------------------------------------ */}
          <section className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Pricing</h3>
            <FloatingInput
              label="Physical Price (MXN)"
              name="physicalPrice"
              type="text"
              value={form.physicalPrice}
              onChange={onText}
              onBlur={onPriceBlur}
            />
            <FloatingInput
              label="Digital Price (MXN)"
              name="digitalPrice"
              type="text"
              value={form.digitalPrice}
              onChange={onText}
              onBlur={onPriceBlur}
            />
          </section>

          {/* 4. save --------------------------------------------------- */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-900"
              style={{ borderRadius: '8px' }}
            >
              {loading ? 'Updating…' : 'Save Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
