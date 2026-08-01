"use client";

import { useState, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
import { ALLOWED_PHOTO_MIME_TYPES, MAX_PHOTO_SIZE_BYTES } from "@/lib/constants";

interface PhotoUploadFieldProps {
  existingPhotoUrl?: string | null;
}

export function PhotoUploadField({ existingPhotoUrl }: PhotoUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(existingPhotoUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_MIME_TYPES)[number])) {
      setError("Only JPEG, PNG, or WebP images are allowed.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setError("Photo must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Photo</label>
      <div className="mt-1 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Item preview" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <input
          type="file"
          name="photo"
          accept={ALLOWED_PHOTO_MIME_TYPES.join(",")}
          onChange={handleChange}
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 dark:text-slate-300 dark:file:bg-blue-500/10 dark:file:text-blue-400"
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
