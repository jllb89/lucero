/* -------------------------------------------------------------------------- */
/*  components/ui/pdf-viewer.tsx – full-viewport protected PDF viewer         */
/* -------------------------------------------------------------------------- */
'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/blocks/sidebar';
import { cn } from '@/lib/utils';

import { CircleMinus, CirclePlus, Loader2, RotateCcw, RotateCw, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, Thumbnail, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4, 8];

/* util: underline every match and give each one a unique id */
const highlight = (str: string, pattern: string, idx: number) => {
  if (!pattern) return str;
  const escPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
  return str.replace(
    new RegExp(escPattern, 'gi'),
    m => `<mark id="search-${idx}">${m}</mark>`,
  );
};


export function Component({
  url,
  userEmail,
}: {
  url: string;
  /** optional – shows in the watermark */
  userEmail?: string;
}) {
  /* ── state ── */
  const [numPages, setNumPages] = useState<number | null>(null);
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [search, setSearch] = useState('');
  const pageViewport = useRef<HTMLDivElement>(null);

  /* ── keep current-page indicator in sync ── */
  useEffect(() => {
    if (!pageViewport.current) return;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setCurrent(+e.target.getAttribute('data-page-number')!);
          }
        });
      },
      { root: pageViewport.current, threshold: 0.5 }
    );

    const mo = new MutationObserver(() => {
      pageViewport.current
        ?.querySelectorAll('.react-pdf__Page')
        .forEach(p => io.observe(p));
    });
    mo.observe(pageViewport.current, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [numPages]);

  /* 3⃣  Block Ctrl/⌘-C (copy) inside the viewer pages only */
  useEffect(() => {
    const node = pageViewport.current;
    if (!node) return;
    const stopCopy = (e: ClipboardEvent) => e.preventDefault();
    node.addEventListener('copy', stopCopy);
    return () => node.removeEventListener('copy', stopCopy);
  }, []);

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <SidebarProvider>
      {/* watermark overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 flex select-none items-center justify-center"
        style={{ userSelect: 'none' }}
      >
        <span
          className="whitespace-nowrap text-6xl font-bold text-black/40 opacity-10 rotate-45"
          style={{ transform: 'translateX(50px) rotate(45deg)' }}
        >
          {userEmail ?? 'LUCERO'}
        </span>
      </div>

      {/* viewer */}
      <div className="flex h-full w-full overflow-hidden">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="flex h-full w-full flex-row overflow-hidden"
          loading={
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="size-4 animate-spin" />
            </div>
          }
        >
          {/* ─────────── sidebar ─────────── */}
          <Sidebar>
            <SidebarRail />
            <SidebarContent className="h-full w-60 overflow-y-auto p-4">
              {Array.from({ length: numPages ?? 0 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'mb-4 w-48 cursor-pointer rounded p-2 transition',
                    current === i + 1
                      ? 'ring-2 ring-blue-500 bg-muted shadow-lg'
                      : 'border shadow'
                  )}
                  onClick={() => setCurrent(i + 1)}
                >
                  <Thumbnail
                    pageNumber={i + 1}
                    width={160}
                    height={100}
                    rotate={rotate}
                    className="border shadow-xs"
                  />
                  <p className="mt-1 text-center text-sm text-gray-500">{i + 1}</p>
                </div>
              ))}
            </SidebarContent>
          </Sidebar>

          {/* ─────────── main column ─────────── */}
          <div className="flex min-h-0 flex-1 flex-col">
            {/* sticky toolbar */}
            <div className="sticky top-0 z-10 flex justify-between border-b bg-white p-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground">
                  Page {current} of {numPages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setRotate(r => r - 90)}>
                  <RotateCcw className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setRotate(r => r + 90)}>
                  <RotateCw className="size-4" />
                </Button>

                <Separator orientation="vertical" />

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={zoom <= ZOOM_STEPS[0]}
                  onClick={() => setZoom(z => z - 0.25)}
                >
                  <CircleMinus className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={zoom >= ZOOM_STEPS.at(-1)!}
                  onClick={() => setZoom(z => z + 0.25)}
                >
                  <CirclePlus className="size-4" />
                </Button>

                <Select value={zoom.toString()} onValueChange={(v: string) => setZoom(+v)}>
                  <SelectTrigger className="h-7 w-24 rounded-sm">
                    <SelectValue>{`${zoom * 100}%`}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align="end">
                    {ZOOM_STEPS.map(o => (
                      <SelectItem key={o} value={o.toString()}>
                        {`${o * 100}%`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Separator orientation="vertical" />

                {/* search box (text layer disabled, highlights off; UI kept) */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <Search className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex items-center gap-2 bg-white p-2">
                    <Input
                      className="h-8 w-52"
                      placeholder="Search disabled"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <Button size="sm" className="h-8 px-3" disabled>
                      Go
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* pages – independent scroll */}
            <div ref={pageViewport} className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center p-8">
                {Array.from({ length: numPages ?? 0 }, (_, i) => (
                  <Page
                    key={i}
                    pageNumber={i + 1}
                    data-page-number={i + 1}
                    className="mb-8 border shadow-xs"
                    renderAnnotationLayer={false}          /* keep annotations off */
                    customTextRenderer={({ str, itemIndex }) =>
                      highlight(str, search, itemIndex)    /* underline matches   */
                    }
                    scale={zoom}
                    rotate={rotate}
                    loading={null}
                  />

                ))}
              </div>
            </div>
          </div>
        </Document>
      </div>
    </SidebarProvider>
  );
}
