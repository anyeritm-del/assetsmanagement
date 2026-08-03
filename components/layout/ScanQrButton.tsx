"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import { Camera, X } from "lucide-react";

QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";

const ITEM_URL_PATTERN = /\/items\/([0-9a-f-]{36})/i;

export function ScanQrButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open || !videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const match = result.data.match(ITEM_URL_PATTERN);
        if (match) {
          setOpen(false);
          router.push(`/items/${match[1]}`);
          return;
        }
        setError("That QR code isn't a recognized item label.");
      },
      { highlightScanRegion: true, highlightCodeOutline: true },
    );

    scanner.start().catch(() => {
      setError("Couldn't access the camera. Check permissions and try again.");
    });

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [open, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        aria-label="Scan QR code"
        title="Scan QR code"
      >
        <Camera className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Scan Item QR Code
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <video ref={videoRef} className="w-full rounded-lg bg-black" muted playsInline />
            {error && (
              <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
