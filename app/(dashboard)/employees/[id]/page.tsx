import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { updateEmployeeAction } from "@/lib/actions/employees";
import { getEmployee } from "@/lib/repositories/employees";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await getEmployee(id);
  if (!employee) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Employee" backHref="/employees">
      <EmployeeForm employee={employee} action={updateEmployeeAction.bind(null, employee.id)} />
    </FormDrawer>
  );
}
