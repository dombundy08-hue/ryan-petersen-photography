"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Download, LoaderCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * How many photos are fetched at once.
 *
 * One at a time leaves a 108-photo gallery paying round-trip latency 108
 * times over; all 108 at once means 108 response buffers resident before
 * anything reaches the zip. Fetching in fixed batches of four keeps the
 * pipe full, caps the bytes held outside the zip at four photos (~1.6 MB),
 * and — because each batch is written to the zip in index order before the
 * next starts — keeps the archive itself in gallery order rather than in
 * whatever order the network happened to answer.
 */
const BATCH_SIZE = 4;

export interface DownloadAllButtonProps {
  /**
   * The photos' ORIGINAL paths (`/images/...`, already through
   * withBasePath), not the `<Image>` srcs the gallery renders.
   *
   * This distinction is the whole point of the feature. On Netlify every
   * `<Image>` goes through src/lib/netlify-image-loader.ts, which rewrites
   * the src to `/.netlify/images?url=…&w=640` — a resized, re-encoded WebP
   * sized for the tile it sits in. That is correct for page speed and
   * worthless to a client who paid for the session. Fetching these paths
   * directly bypasses the CDN and returns the file Ryan uploaded.
   */
  photos: string[];
  /** Slug-shaped stem for the zip and the files inside it. */
  fileBaseName: string;
  /** Shoot title, used to give the button a self-contained a11y name. */
  galleryLabel: string;
  /** Total bytes of the originals, measured at build time. */
  totalBytes?: number;
}

type Phase = "idle" | "fetching" | "zipping" | "error";

function formatSize(bytes: number): string {
  const mb = bytes / 1_000_000;
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}

/**
 * `dominicks-senior-session-001.jpg`.
 *
 * The camera's own names (dsc01904.jpg) sort by shutter order only by
 * accident and tell the client nothing about which session they're from
 * once the files leave the zip. Zero-padded so the gallery's order
 * survives the extract: an unpadded -9 sorts after -108 everywhere.
 */
function entryName(baseName: string, index: number, src: string, total: number): string {
  const dot = src.lastIndexOf(".");
  const ext = dot > src.lastIndexOf("/") ? src.slice(dot).toLowerCase() : ".jpg";
  const width = Math.max(String(total).length, 2);
  return `${baseName}-${String(index + 1).padStart(width, "0")}${ext}`;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoked on the next tick rather than inline: some browsers have not
  // finished reading the blob out of the object URL when click() returns,
  // and revoking too early hands the user a 0-byte file.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function DownloadAllButton({
  photos,
  fileBaseName,
  galleryLabel,
  totalBytes,
}: DownloadAllButtonProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fetched, setFetched] = useState(0);
  const [zipPercent, setZipPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hintId = useId();
  const running = useRef(false);

  const busy = phase === "fetching" || phase === "zipping";

  const handleDownload = useCallback(async () => {
    // The button is disabled while busy, but a double-fire (Enter held, a
    // stray programmatic click) would otherwise start a second 35 MB run.
    if (running.current) return;
    running.current = true;

    setPhase("fetching");
    setFetched(0);
    setZipPercent(0);
    setError(null);

    const controller = new AbortController();

    try {
      // Lazily loaded so the ~100 KB zip library is a chunk that only a
      // client who actually clicks pays for — every other visitor is here
      // to look at photos, not to unpack them.
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      const grab = async (src: string) => {
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) throw new Error(`${src} returned ${response.status}`);
        /**
         * ArrayBuffer, never an <img>/ImageBitmap. A 2400x1600 JPEG is
         * ~340 KB on the wire and ~15 MB once decoded, and this codebase
         * has already killed mobile tabs by holding a pool of decoded
         * photos resident at once (see the 2026-08-05 note in
         * .claude/skills/rp-photography-deploy/SKILL.md). Handing the raw
         * bytes straight to JSZip means the peak here is the stored size of
         * the shoot, not its decoded size — ~35 MB rather than ~1.6 GB for
         * a 108-photo gallery.
         */
        return response.arrayBuffer();
      };

      for (let start = 0; start < photos.length; start += BATCH_SIZE) {
        const batch = photos.slice(start, start + BATCH_SIZE);
        const buffers = await Promise.all(batch.map(grab));
        buffers.forEach((buffer, offset) => {
          const index = start + offset;
          zip.file(
            entryName(fileBaseName, index, photos[index], photos.length),
            buffer
          );
        });
        setFetched(start + buffers.length);
      }

      setPhase("zipping");
      const blob = await zip.generateAsync(
        {
          /**
           * STORE, not DEFLATE. Every file going in is already a JPEG, i.e.
           * already entropy-coded. Measured on this 108-photo gallery:
           * STORE 35.15 MB in 141 ms, DEFLATE 34.74 MB in 2543 ms — 1.2%
           * smaller for 18x the CPU, and that CPU is main-thread JS, so on
           * a phone (3-5x slower again) it buys 400 KB in exchange for ten
           * seconds of frozen tab. The zip here is a container, not a
           * compressor.
           */
          type: "blob",
          compression: "STORE",
        },
        (metadata) => setZipPercent(Math.round(metadata.percent))
      );

      saveBlob(blob, `${fileBaseName}.zip`);
      setPhase("idle");
    } catch (err) {
      controller.abort();
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
    } finally {
      running.current = false;
    }
  }, [photos, fileBaseName]);

  const sizeHint = totalBytes ? ` · about ${formatSize(totalBytes)}` : "";

  return (
    <div className="mt-6">
      <Button
        size="lg"
        variant="outline"
        onClick={handleDownload}
        disabled={busy}
        aria-busy={busy}
        /* Contains the visible label verbatim (WCAG 2.5.3) and adds the
           gallery, so a screen-reader user landing on the button out of
           context knows whose photos it means. */
        aria-label={`Download all photos from ${galleryLabel}`}
        aria-describedby={hintId}
      >
        {busy ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Download aria-hidden="true" />
        )}
        Download all photos
      </Button>

      {/* Said up front, not after the download starts: this is the full-size
          originals, and on a phone that is a real amount of data. */}
      <p id={hintId} className="mt-2 text-sm text-muted-foreground">
        {photos.length} full-resolution photo{photos.length === 1 ? "" : "s"}
        {sizeHint} · one ZIP file
      </p>

      {/* Always in the DOM so the first progress update is announced — a
          live region added at the same moment as its text usually isn't. */}
      <p
        aria-live="polite"
        className="mt-1 text-sm text-muted-foreground empty:mt-0"
      >
        {phase === "fetching" && `Preparing ${fetched} of ${photos.length}…`}
        {phase === "zipping" && `Building the ZIP file… ${zipPercent}%`}
      </p>

      {phase === "error" && (
        <div
          role="alert"
          className="mt-2 flex max-w-md items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            The download didn&apos;t finish ({error}). Check your connection and
            try again — nothing was saved.
          </span>
        </div>
      )}
    </div>
  );
}
