"use client";

import type { UserProfile } from "@/types";
import { useFormState } from "react-dom";
import { updateProfileAction } from "@/app/actions/profile-actions";

const initialState = {
  status: "idle" as const,
  message: undefined,
};

type InputProps = {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
};

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: InputProps) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-xs uppercase tracking-[0.3em] text-black/50">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3"
      />
    </label>
  );
}

export function DashboardForm({ profile }: { profile: UserProfile }) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-10">
      <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
        <h2 className="text-sm uppercase tracking-[0.4em] text-black/40">
          Identity
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field
            label="Full name"
            name="fullName"
            defaultValue={profile.fullName}
          />
          <Field
            label="Email"
            name="email"
            defaultValue={profile.email}
            type="email"
          />
          <Field label="Phone" name="phone" defaultValue={profile.phone} />
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
        <h2 className="text-sm uppercase tracking-[0.4em] text-black/40">
          Address
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field
            label="Line 1"
            name="addressLine1"
            defaultValue={profile.address.line1}
          />
          <Field
            label="Line 2"
            name="addressLine2"
            defaultValue={profile.address.line2 ?? ""}
          />
          <Field label="City" name="city" defaultValue={profile.address.city} />
          <Field
            label="State"
            name="state"
            defaultValue={profile.address.state}
          />
          <Field
            label="Postal"
            name="postalCode"
            defaultValue={profile.address.postalCode}
          />
          <Field
            label="Country"
            name="country"
            defaultValue={profile.address.country}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
        <h2 className="text-sm uppercase tracking-[0.4em] text-black/40">
          Shipping
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field
            label="Provider"
            name="shippingProvider"
            defaultValue={profile.shipping.provider}
          />
          <Field
            label="Account"
            name="shippingAccount"
            defaultValue={profile.shipping.accountNumber ?? ""}
          />
          <label className="md:col-span-2">
            <span className="text-xs uppercase tracking-[0.3em] text-black/50">
              Instructions
            </span>
            <textarea
              name="shippingInstructions"
              defaultValue={profile.shipping.instructions ?? ""}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3"
              rows={3}
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
        <h2 className="text-sm uppercase tracking-[0.4em] text-black/40">
          Payment
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Field
            label="Card brand"
            name="cardBrand"
            defaultValue={profile.payment.cardBrand}
          />
          <Field
            label="Last four"
            name="cardLastFour"
            defaultValue={profile.payment.lastFour}
          />
          <Field
            label="Exp month"
            name="expMonth"
            defaultValue={profile.payment.expMonth}
          />
          <Field
            label="Exp year"
            name="expYear"
            defaultValue={profile.payment.expYear}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {state.message && (
          <p
            className={
              state.status === "error"
                ? "text-sm text-red-500"
                : "text-sm text-green-600"
            }
          >
            {state.message}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white md:w-auto"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}
