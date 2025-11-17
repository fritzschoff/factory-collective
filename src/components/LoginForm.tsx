"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebase-client";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const auth = getFirebaseClientAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!auth) {
    return (
      <p className="text-sm text-black/60">
        Firebase credentials are missing. Provide NEXT_PUBLIC_FIREBASE_* env
        variables to enable authentication.
      </p>
    );
  }

  const clientAuth = auth;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const userCredential =
        mode === "signin"
          ? await signInWithEmailAndPassword(clientAuth, email, password)
          : await createUserWithEmailAndPassword(clientAuth, email, password);

      const idToken = await userCredential.user.getIdToken(true);
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Unable to persist session");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-black/50">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-black/50">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white"
      >
        {isSubmitting
          ? "Saving…"
          : mode === "signin"
          ? "Sign in"
          : "Create account"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="w-full text-center text-xs uppercase tracking-[0.3em] text-black/50"
      >
        {mode === "signin"
          ? "Create a new account"
          : "Already have an account?"}
      </button>
    </form>
  );
}
