"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserProfile, saveUserProfile } from "@/lib/profile-store";
import { requireUser } from "@/lib/auth/session";

const profileSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  addressLine1: z.string().min(2),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(2),
  country: z.string().min(2),
  shippingProvider: z.string().optional(),
  shippingAccount: z.string().optional(),
  shippingInstructions: z.string().optional(),
  cardBrand: z.string().optional(),
  cardLastFour: z.string().optional(),
  expMonth: z.string().optional(),
  expYear: z.string().optional(),
});

export type ProfileFormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();

  try {
    const parsed = profileSchema.parse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2"),
      city: formData.get("city"),
      state: formData.get("state"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
      shippingProvider: formData.get("shippingProvider"),
      shippingAccount: formData.get("shippingAccount"),
      shippingInstructions: formData.get("shippingInstructions"),
      cardBrand: formData.get("cardBrand"),
      cardLastFour: formData.get("cardLastFour"),
      expMonth: formData.get("expMonth"),
      expYear: formData.get("expYear"),
    });

    const current = await getUserProfile(user);
    await saveUserProfile({
      ...current,
      fullName: parsed.fullName,
      email: parsed.email,
      phone: parsed.phone,
      address: {
        line1: parsed.addressLine1,
        line2: parsed.addressLine2,
        city: parsed.city,
        state: parsed.state,
        postalCode: parsed.postalCode,
        country: parsed.country,
      },
      shipping: {
        provider: parsed.shippingProvider ?? "",
        accountNumber: parsed.shippingAccount,
        instructions: parsed.shippingInstructions,
      },
      payment: {
        cardBrand: parsed.cardBrand ?? "",
        lastFour: parsed.cardLastFour ?? "",
        expMonth: parsed.expMonth,
        expYear: parsed.expYear,
      },
    });

    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Profile updated",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: (error as Error).message,
    };
  }
}
