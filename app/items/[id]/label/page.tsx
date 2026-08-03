import { notFound } from "next/navigation";
import { buildItemLabelData } from "@/lib/itemLabel";
import { PrintButton } from "@/components/items/PrintButton";

export default async function ItemLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const label = await buildItemLabelData(id);
  if (!label) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-white p-8 print:block print:min-h-0 print:p-0 dark:bg-slate-950">
      <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-xl border border-slate-200 p-6 text-center print:border-0 print:p-4 dark:border-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={label.qrDataUrl} alt={`QR code for ${label.name}`} className="h-40 w-40" />
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{label.name}</p>
        {label.code && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{label.code}</p>
        )}
        {label.locationLine && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{label.locationLine}</p>
        )}
      </div>
      <PrintButton />
    </div>
  );
}
