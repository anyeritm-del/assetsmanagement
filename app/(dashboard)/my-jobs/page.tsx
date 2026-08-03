import { HardHat } from "lucide-react";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MyJobsView } from "@/components/myJobs/MyJobsView";
import { getEmployeeByEmail } from "@/lib/repositories/employees";
import { listItems } from "@/lib/repositories/items";
import { listAllMaintenanceRequests } from "@/lib/repositories/maintenanceRequests";
import { listProperties } from "@/lib/repositories/properties";

export default async function MyJobsPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  const [employee, allRequests, items, properties] = await Promise.all([
    email ? getEmployeeByEmail(email) : null,
    listAllMaintenanceRequests(),
    listItems(),
    listProperties(),
  ]);

  // Cross-property on purpose: a technician's assigned jobs aren't limited to whichever hotel
  // happens to be selected in the header switcher.
  const myJobs = employee
    ? allRequests.filter((request) => request.assigned_to_employee_id === employee.id)
    : [];

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const propertiesById = new Map(properties.map((property) => [property.id, property]));

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "My Jobs" }]} />
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        <HardHat className="h-6 w-6 text-amber-500" />
        My Jobs
      </h1>
      <MyJobsView jobs={myJobs} itemsById={itemsById} propertiesById={propertiesById} />
    </div>
  );
}
