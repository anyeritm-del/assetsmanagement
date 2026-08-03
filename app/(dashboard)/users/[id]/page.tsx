import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { UserForm } from "@/components/users/UserForm";
import { updateUserAction } from "@/lib/actions/users";
import { listProperties } from "@/lib/repositories/properties";
import { getUser } from "@/lib/repositories/users";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, properties] = await Promise.all([getUser(id), listProperties()]);
  if (!user) {
    notFound();
  }

  return (
    <FormDrawer title="Edit User" backHref="/users">
      <UserForm user={user} properties={properties} action={updateUserAction.bind(null, user.id)} />
    </FormDrawer>
  );
}
