import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const SESSION_TTL = 60 * 60 * 24 * 5 * 1000; // 5 days in ms

export async function POST(request: Request) {
  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "Firebase admin is not configured" },
      { status: 500 },
    );
  }

  const { idToken } = (await request.json().catch(() => ({}))) as {
    idToken?: string;
  };

  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const expiresIn = SESSION_TTL;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_TTL / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name,
    });
  } catch (error) {
    console.error("Unable to create Firebase session", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  cookies().delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
