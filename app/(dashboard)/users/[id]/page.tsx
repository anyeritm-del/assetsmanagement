import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { UserForm } from "@/components/users/UserForm";
import { updateUserAction } from "@/lib/actions/users";
import { getUser } from "@/lib/repositories/users";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) {
    notFound();
  }

  return (
    <FormDrawer title="Edit User" backHref="/users">
      <UserForm user={user} action={updateUserAction.bind(null, user.id)} />
    </FormDrawer>
  );
}
