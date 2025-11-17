import type { SessionUser, UserProfile } from "@/types";
import { getFirebaseFirestore } from "./firebase-admin";

const COLLECTION = "profiles";
const inMemoryProfiles = new Map<string, UserProfile>();

function buildDefaultProfile(user: SessionUser): UserProfile {
  const now = new Date().toISOString();
  return {
    uid: user.uid,
    fullName: user.displayName ?? "Factory Member",
    email: user.email ?? "member@factory.collective",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
    },
    shipping: {
      provider: "",
      accountNumber: "",
      instructions: "",
    },
    payment: {
      cardBrand: "",
      lastFour: "",
      expMonth: "",
      expYear: "",
    },
    updatedAt: now,
  };
}

export async function getUserProfile(user: SessionUser): Promise<UserProfile> {
  const db = getFirebaseFirestore();

  if (db) {
    const snapshot = await db.collection(COLLECTION).doc(user.uid).get();
    if (snapshot.exists) {
      return snapshot.data() as UserProfile;
    }
  }

  if (inMemoryProfiles.has(user.uid)) {
    return inMemoryProfiles.get(user.uid)!;
  }

  const profile = buildDefaultProfile(user);
  inMemoryProfiles.set(user.uid, profile);
  return profile;
}

export async function saveUserProfile(profile: UserProfile) {
  const nextProfile = { ...profile, updatedAt: new Date().toISOString() };
  const db = getFirebaseFirestore();

  if (db) {
    await db
      .collection(COLLECTION)
      .doc(profile.uid)
      .set(nextProfile, { merge: true });
  }

  inMemoryProfiles.set(profile.uid, nextProfile);
  return nextProfile;
}
