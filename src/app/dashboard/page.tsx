import { DashboardForm } from '@/components/DashboardForm';
import { requireUser } from '@/lib/auth/session';
import { getUserProfile } from '@/lib/profile-store';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getUserProfile(user);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-10 px-6 py-14">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-black/40">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold">Operate your drop stack</h1>
        <p className="text-sm text-black/60">
          Update your billing, shipping, and fulfillment preferences. All
          requests render server-side and sync back to Firebase/Firestore when
          keys are configured.
        </p>
      </div>
      <DashboardForm profile={profile} />
    </div>
  );
}
