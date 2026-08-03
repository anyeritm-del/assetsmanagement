import { FormDrawer } from "@/components/ui/FormDrawer";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { createEmployeeAction } from "@/lib/actions/employees";

export default function NewEmployeePage() {
  return (
    <FormDrawer title="Create Employee" backHref="/employees">
      <EmployeeForm action={createEmployeeAction} />
    </FormDrawer>
  );
}
