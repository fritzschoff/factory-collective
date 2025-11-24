import { LoginForm } from '@/components/LoginForm';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col gap-6 px-6 py-14">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-black/40">
          Access
        </p>
        <h1 className="text-3xl font-semibold">Enter the factory</h1>
        <p className="text-sm text-black/60">
          Sign in with Firebase Auth. Accounts are private to your workspace
          keys.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
