import { FormDrawer } from "@/components/ui/FormDrawer";
import { UserForm } from "@/components/users/UserForm";
import { createUserAction } from "@/lib/actions/users";
import { listProperties } from "@/lib/repositories/properties";

export default async function NewUserPage() {
  const properties = await listProperties();

  return (
    <FormDrawer title="Create User" backHref="/users">
      <UserForm properties={properties} action={createUserAction} />
    </FormDrawer>
  );
}
