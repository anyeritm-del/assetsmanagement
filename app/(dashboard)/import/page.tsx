import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ImportItemsForm } from "@/components/items/ImportItemsForm";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";
import { isViewOnly } from "@/lib/viewOnlyGuard";

// Server Actions invoked from this page (importItemsBatchAction) can run up to this long --
// a ~15-row batch at the ~1.2s per-write rate limit takes ~18s, above the platform's 10-15s
// serverless defaults but comfortably under this ceiling.
export const maxDuration = 60;

export default async function ImportPage() {
  const [{ selected }, viewOnly] = await Promise.all([getSelectedPropertyContext(), isViewOnly()]);

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to import items into it.
      </div>
    );
  }

  if (viewOnly) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Your account is view-only and can&apos;t import items.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Import Items" }]} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Import Items ({selected.name})
      </h1>
      <ImportItemsForm propertyId={selected.id} />
    </div>
  );
}
