/* -------------------------------------------------------------------------- */
/*  components/ui/pdf-viewer.tsx – full-height, full-width React-PDF viewer   */
/* -------------------------------------------------------------------------- */
'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import {
  CircleMinus,
  CirclePlus,
  Loader2,
  RotateCcw,
  RotateCw,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs, Thumbnail } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const ZOOM_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4, 8];

function highlightPattern(text: string, pattern: string, itemIndex: number) {
  return text.replace(
    pattern,
    value => `<mark id="search-result-${itemIndex}">${value}</mark>`
  );
}

function Component({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const textRenderer = useCallback(
    (t: { str: string; itemIndex: number }) =>
      highlightPattern(t.str, searchQuery, t.itemIndex),
    [searchQuery]
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  /* ---------- intersection observer keeps currentPage in sync ---------- */
  useEffect(() => {
    if (!viewportRef.current) return;

    const opts: IntersectionObserverInit = {
      root: viewportRef.current,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageEl = entry.target.closest('[data-page-number]');
          if (pageEl) {
            const n = parseInt(
              pageEl.getAttribute('data-page-number') || '1',
              10
            );
            setCurrentPage(n);
          }
        }
      });
    }, opts);

    const mo = new MutationObserver(() => {
      viewportRef.current
        ?.querySelectorAll('.react-pdf__Page')
        .forEach(p => io.observe(p));
    });

    mo.observe(viewportRef.current, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [numPages]);

  /* ------------------------------ RENDER ------------------------------ */
  return (
    <SidebarProvider>
      {/* outer wrapper guarantees full width AND height */}
      <div className="flex w-full">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex-1 h-full w-full flex flex-row"
          loading={
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="size-4 animate-spin" />
            </div>
          }
        >
          {/* ---- thumbnail sidebar ---- */}
          <Sidebar>
            <SidebarRail />
            <SidebarContent className="flex flex-col p-8 items-center">
              {Array.from({ length: numPages ?? 0 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col gap-2 mb-4 w-48 hover:bg-muted transition p-2',
                    i + 1 === currentPage && 'bg-muted'
                  )}
                >
                  <Thumbnail
                    pageNumber={i + 1}
                    className="border shadow-xs"
                    width={170}
                    height={100}
                    rotate={rotation}
                  />
                  <span className="text-sm text-gray-500 text-center">
                    {i + 1}
                  </span>
                </div>
              ))}
            </SidebarContent>
          </Sidebar>

          {/* ---- main column ---- */}
          <div className="flex w-full flex-col">
            {/* toolbar */}
            <div className="flex justify-between p-2 border-b">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {numPages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setRotation(rotation - 90)}
                >
                  <RotateCcw className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setRotation(rotation + 90)}
                >
                  <RotateCw className="size-4" />
                </Button>
                <Separator orientation="vertical" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={zoom <= ZOOM_OPTIONS[0]}
                  onClick={() => setZoom(zoom - 0.25)}
                >
                  <CircleMinus className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={zoom >= ZOOM_OPTIONS.at(-1)!}
                  onClick={() => setZoom(zoom + 0.25)}
                >
                  <CirclePlus className="size-4" />
                </Button>
                <Select
                  value={zoom.toString()}
                  onValueChange={v => setZoom(Number(v))}
                >
                  <SelectTrigger className="h-7 rounded-sm w-24">
                    <SelectValue placeholder="Zoom">
                      {`${zoom * 100}%`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="end">
                    {ZOOM_OPTIONS.map(o => (
                      <SelectItem key={o} value={o.toString()}>
                        {`${o * 100}%`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <Search className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Input
                      placeholder="Search"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* pages */}
            <ScrollArea className="grow w-full">
              <div className="flex flex-row grow">
                <ScrollArea className="grow w-48" ref={viewportRef}>
                  <ScrollBar orientation="horizontal" />
                  <div className="flex flex-col items-center p-8 grow w-full">
                    {Array.from({ length: numPages ?? 0 }, (_, i) => (
                      <Page
                        key={i}
                        pageNumber={i + 1}
                        className="border shadow-xs mb-8"
                        data-page-number={i + 1}
                        renderAnnotationLayer={false}
                        scale={zoom}
                        rotate={rotation}
                        loading={null}
                        customTextRenderer={textRenderer}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ScrollArea>
          </div>
        </Document>
      </div>
    </SidebarProvider>
  );
}

export { Component };
