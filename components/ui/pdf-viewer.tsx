/* -------------------------------------------------------------------------- */
/*  components/ui/pdf-viewer.tsx – full-viewport React-PDF viewer             */
/* -------------------------------------------------------------------------- */
'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  ScrollArea,
  ScrollBar
} from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  SidebarProvider,
  SidebarTrigger
} from '@/components/blocks/sidebar';
import { cn } from '@/lib/utils';

import {
  CircleMinus,
  CirclePlus,
  Loader2,
  RotateCcw,
  RotateCw,
  Search
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Document,
  Page,
  Thumbnail,
  pdfjs
} from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const ZOOM_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4, 8];

function highlight(text: string, pattern: string, idx: number) {
  return text.replace(pattern,
    v => `<mark id="search-${idx}">${v}</mark>`);
}

export function Component({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [query, setQuery] = useState('');
  const viewport = useRef<HTMLDivElement>(null);

  /* keep page indicator in sync */
  useEffect(() => {
    if (!viewport.current) return;

    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          setCurrent(+e.target.getAttribute('data-page-number')!);
        }
      });
    }, { root: viewport.current, threshold: 0.5 });

    const mo = new MutationObserver(() => {
      viewport.current
        ?.querySelectorAll('.react-pdf__Page')
        .forEach(p => io.observe(p));
    });
    mo.observe(viewport.current, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [numPages]);

  const textRenderer = useCallback(
    (t: { str: string; itemIndex: number }) =>
      highlight(t.str, query, t.itemIndex),
    [query]
  );

  /* ───────────────────────── render ───────────────────────── */
  return (
    <SidebarProvider>
      <div className="flex h-full w-full overflow-hidden">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="flex h-full w-full flex-row overflow-hidden"
          loading={<div className="flex h-full w-full items-center justify-center">
            <Loader2 className="size-4 animate-spin" />
          </div>}
        >
          {/* ─── Sidebar – own scroll ─── */}
          <Sidebar>
            <SidebarRail />
            {/* Sidebar thumbnails */}
            <SidebarContent className="h-full overflow-y-auto p-4 w-60 shrink-0">
              {Array.from({ length: numPages ?? 0 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'mb-4 w-48 rounded p-2 transition',
                    current === i + 1
                      ? 'ring-2 ring-blue-500 shadow-lg bg-muted' // selected
                      : 'border shadow'                           // default
                  )}
                >
                  <Thumbnail
                    pageNumber={i + 1}
                    width={160}
                    height={100}
                    className="border shadow-xs"
                    rotate={rotate}
                  />
                  <p className="mt-1 text-center text-sm text-gray-500">{i + 1}</p>
                </div>
              ))}
            </SidebarContent>


          </Sidebar>

          {/* ─── Main pane ─── */}
          <div className="flex min-h-0 flex-1 flex-col">
            {/* toolbar */}
            <div className="sticky top-0 z-10 flex justify-between border-b bg-white p-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground">
                  Page {current} of {numPages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-7"
                  onClick={() => setRotate(r => r - 90)}>
                  <RotateCcw className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7"
                  onClick={() => setRotate(r => r + 90)}>
                  <RotateCw className="size-4" />
                </Button>
                <Separator orientation="vertical" />
                <Button variant="ghost" size="icon" className="size-7"
                  disabled={zoom <= ZOOM_OPTIONS[0]}
                  onClick={() => setZoom(z => z - 0.25)}>
                  <CircleMinus className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7"
                  disabled={zoom >= ZOOM_OPTIONS.at(-1)!}
                  onClick={() => setZoom(z => z + 0.25)}>
                  <CirclePlus className="size-4" />
                </Button>
                <Select value={zoom.toString()}
                  onValueChange={(v: string) => setZoom(+v)}>
                  <SelectTrigger className="h-7 w-24 rounded-sm">
                    <SelectValue>{`${zoom * 100}%`}</SelectValue>
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
                    <Input placeholder="Search"
                      value={query}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setQuery(e.target.value)} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* pages – own scroll */}
            <div ref={viewport} className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center p-8">
                {Array.from({ length: numPages ?? 0 }, (_, i) => (
                  <Page key={i}
                    pageNumber={i + 1}
                    data-page-number={i + 1}
                    className="mb-8 border shadow-xs"
                    renderAnnotationLayer={false}
                    scale={zoom}
                    rotate={rotate}
                    loading={null}
                    customTextRenderer={textRenderer} />
                ))}
              </div>
            </div>
          </div>
        </Document>
      </div>
    </SidebarProvider>
  );
}
