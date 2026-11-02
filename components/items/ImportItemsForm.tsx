"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Download, Upload } from "lucide-react";
import {
  importItemsBatchAction,
  type ImportRowInput,
  type ImportRowResult,
} from "@/lib/actions/importItems";
import {
  IMPORT_TEMPLATE_EXAMPLE_ROW,
  IMPORT_TEMPLATE_HEADERS,
  REQUIRED_IMPORT_COLUMNS,
  normalizeHeader,
  type ImportItemRow,
} from "@/lib/itemImport";

const BATCH_SIZE = 100;

interface ImportItemsFormProps {
  propertyId: string;
}

function downloadTemplate() {
  const csv = Papa.unparse({
    fields: [...IMPORT_TEMPLATE_HEADERS],
    data: [IMPORT_TEMPLATE_HEADERS.map((header) => IMPORT_TEMPLATE_EXAMPLE_ROW[header])],
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "items-import-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function ImportItemsForm({ propertyId }: ImportItemsFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<ImportRowResult[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setResults([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: async (parsed) => {
        const missingColumns = REQUIRED_IMPORT_COLUMNS.filter(
          (required) => !parsed.meta.fields?.includes(required),
        ).map((column) => IMPORT_TEMPLATE_HEADERS.find((header) => normalizeHeader(header) === column));
        if (missingColumns.length > 0) {
          setParseError(
            `CSV is missing required column(s): ${missingColumns.join(", ")}. Download the template to see the expected columns.`,
          );
          return;
        }

        const rows: ImportRowInput[] = parsed.data.map((data, index) => ({
          rowNumber: index + 2, // +1 for 0-index, +1 for the header row
          data: data as unknown as ImportItemRow,
        }));

        if (rows.length === 0) {
          setParseError("The CSV file has no data rows.");
          return;
        }

        setIsProcessing(true);
        setProgress({ done: 0, total: rows.length });

        const batches = chunk(rows, BATCH_SIZE);
        const allResults: ImportRowResult[] = [];
        for (const batch of batches) {
          const result = await importItemsBatchAction(propertyId, batch);
          if (!result.success) {
            setParseError(result.error ?? "Import failed");
            break;
          }
          allResults.push(...(result.results ?? []));
          setResults([...allResults]);
          setProgress({ done: allResults.length, total: rows.length });
        }

        setIsProcessing(false);
        router.refresh();
      },
      error: (error) => {
        setParseError(error.message);
      },
    });
  }

  const createdCount = results.filter((r) => r.status === "created").length;
  const skippedCount = results.filter((r) => r.status === "skipped_duplicate").length;
  const errorResults = results.filter((r) => r.status === "error");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          1. Download the template
        </h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          The columns match the asset register spreadsheet, so you can export it as CSV and
          upload it directly. Only <strong>Item Name</strong> and <strong>Building</strong> are
          required. Building, Floor, Location, Department, Article (with Group) and Equipment are
          matched by name against what already exists -- create any missing ones first.
          Warranty is in months; dates use YYYY-MM-DD.
        </p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Download CSV Template
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          2. Upload your CSV
        </h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Rows whose <strong>code</strong> already exists in this property are skipped, not
          overwritten.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
          id="import-file-input"
        />
        <label
          htmlFor="import-file-input"
          className={`inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 ${
            isProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <Upload className="h-4 w-4" />
          {fileName ?? "Choose CSV File"}
        </label>

        {parseError && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {parseError}
          </p>
        )}

        {progress && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isProcessing
                ? `Processing ${progress.done} of ${progress.total} rows...`
                : `Done -- processed ${progress.done} of ${progress.total} rows.`}
            </p>
          </div>
        )}

        {!isProcessing && results.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex gap-4 text-sm">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {createdCount} created
              </span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {skippedCount} skipped (duplicate code)
              </span>
              <span className="font-medium text-rose-600 dark:text-rose-400">
                {errorResults.length} errors
              </span>
            </div>
            {errorResults.length > 0 && (
              <ul className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-500/10 dark:text-rose-400">
                {errorResults.map((result) => (
                  <li key={result.rowNumber}>
                    Row {result.rowNumber}: {result.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
