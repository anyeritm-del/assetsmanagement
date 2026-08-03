import { FormDrawer } from "@/components/ui/FormDrawer";
import { DepartmentForm } from "@/components/departments/DepartmentForm";
import { createDepartmentAction } from "@/lib/actions/departments";

export default function NewDepartmentPage() {
  return (
    <FormDrawer title="Create Department" backHref="/departments">
      <DepartmentForm action={createDepartmentAction} />
    </FormDrawer>
  );
}
