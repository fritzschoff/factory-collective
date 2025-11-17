export type StorefrontProduct = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  priceId: string;
  currency: string;
  imageUrl?: string | null;
  features?: string[];
  metadata?: Record<string, string | number | null>;
};

export type CartItem = {
  productId: string;
  priceId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string | null;
};

export type SessionUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shipping: {
    provider: string;
    accountNumber?: string;
    instructions?: string;
  };
  payment: {
    cardBrand: string;
    lastFour: string;
    expMonth?: string;
    expYear?: string;
  };
  updatedAt: string;
};
