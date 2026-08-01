import { signIn } from "@/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
          A
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Archipelago Asset Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign in with your Archipelago Google account.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            Access denied. Please sign in with an @archipelagohotels.com account.
          </p>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
