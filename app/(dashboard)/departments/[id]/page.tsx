import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { DepartmentForm } from "@/components/departments/DepartmentForm";
import { updateDepartmentAction } from "@/lib/actions/departments";
import { getDepartment } from "@/lib/repositories/departments";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const department = await getDepartment(id);
  if (!department) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Department" backHref="/departments">
      <DepartmentForm
        department={department}
        action={updateDepartmentAction.bind(null, department.id)}
      />
    </FormDrawer>
  );
}
