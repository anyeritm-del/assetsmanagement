import { FormDrawer } from "@/components/ui/FormDrawer";
import { UserForm } from "@/components/users/UserForm";
import { createUserAction } from "@/lib/actions/users";

export default function NewUserPage() {
  return (
    <FormDrawer title="Create User" backHref="/users">
      <UserForm action={createUserAction} />
    </FormDrawer>
  );
}
