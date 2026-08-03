import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ItemAssignmentsTable } from "@/components/items/ItemAssignmentsTable";
import { listEmployees } from "@/lib/repositories/employees";
import { listItemsByProperty } from "@/lib/repositories/items";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function ItemAssignmentsPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view item assignments.
      </div>
    );
  }

  const [items, employees] = await Promise.all([
    listItemsByProperty(selected.id),
    listEmployees(),
  ]);
  const employeesById = new Map(employees.map((employee) => [employee.id, employee]));

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Item Assign To User" }]} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Items</h1>
      <ItemAssignmentsTable items={items} employeesById={employeesById} />
    </div>
  );
}
