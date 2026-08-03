import { buildItemLabelData } from "@/lib/itemLabel";
import { PrintButton } from "@/components/items/PrintButton";

export default async function PrintLabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const itemIds = (ids ?? "").split(",").filter(Boolean);

  const labels = (await Promise.all(itemIds.map((id) => buildItemLabelData(id)))).filter(
    (label) => label !== null,
  );

  if (labels.length === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white p-8 dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">No items selected to print.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white p-8 print:p-0 dark:bg-slate-950">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 print:grid-cols-2">
        {labels.map((label) => (
          <div
            key={label.itemId}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-center break-inside-avoid print:border print:border-slate-300 dark:border-slate-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={label.qrDataUrl} alt={`QR code for ${label.name}`} className="h-32 w-32" />
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {label.name}
            </p>
            {label.code && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{label.code}</p>
            )}
            {label.locationLine && (
              <p className="text-xs text-slate-400 dark:text-slate-500">{label.locationLine}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
