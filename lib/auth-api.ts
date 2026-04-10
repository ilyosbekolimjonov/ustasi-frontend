export type UstasiRole =
  | "USER"
  | "USER_FIZ"
  | "USER_YUR"
  | "MASTER"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "VIEWER_ADMIN";

export type SignupRole = "USER" | "MASTER";

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  role: SignupRole;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  avatarFile?: File | null;
  category?: string;
  city?: string;
  region?: string;
  experienceText?: string;
  bio?: string;
  profileImageFile?: File | null;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UstasiRole;
  isEmailVerified?: boolean;
};

type LoginResponse = {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
};

type SignupResponse = {
  user: AuthUser;
  message: string;
  verificationEmailSent: boolean;
};

type UploadResponse = {
  url: string;
};

type AuthUserPayload = Partial<AuthUser> & {
  id?: string;
  fullname?: string;
};

type JsonObject = Record<string, unknown>;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

export function resolveErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    Array.isArray(payload.message) &&
    payload.message.length > 0 &&
    typeof payload.message[0] === "string"
  ) {
    return payload.message[0];
  }

  return fallback;
}

function normalizeUser(user: AuthUserPayload): AuthUser {
  return {
    id: user.id ?? "",
    fullName: user.fullName ?? user.fullname ?? "Foydalanuvchi",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role ?? "USER",
    isEmailVerified: user.isEmailVerified,
  };
}

export async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export async function performFetch(input: string, init: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Server bilan bog'lanib bo'lmadi. Iltimos, keyinroq urinib ko'ring.");
  }
}

export async function uploadPublicImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await performFetch(
    `${API_BASE_URL}/uploads/public`,
    {
      method: "POST",
      body: formData,
    },
  );

  const json = await parseJson<UploadResponse | JsonObject>(response);

  if (!response.ok || !json || typeof json !== "object" || !("url" in json)) {
    throw new Error(resolveErrorMessage(json, "Rasm yuklanmadi."));
  }

  return String(json.url);
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await performFetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: payload.email.trim().toLowerCase(),
        password: payload.password,
      }),
    },
  );

  const json = await parseJson<
    | { user?: AuthUserPayload; accessToken?: string; refreshToken?: string; message?: string | string[] }
    | JsonObject
  >(response);

  if (!response.ok || !json || typeof json !== "object") {
    throw new Error("Email yoki parol noto'g'ri");
  }

  const user = "user" in json && json.user ? normalizeUser(json.user) : normalizeUser({});

  return {
    accessToken: "accessToken" in json ? String(json.accessToken ?? "") : undefined,
    refreshToken: "refreshToken" in json ? String(json.refreshToken ?? "") : undefined,
    user,
  };
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const [avatarUrl, profileImageUrl] = await Promise.all([
    payload.avatarFile ? uploadPublicImage(payload.avatarFile) : Promise.resolve(undefined),
    payload.profileImageFile
      ? uploadPublicImage(payload.profileImageFile)
      : Promise.resolve(undefined),
  ]);

  const response = await performFetch(
    `${API_BASE_URL}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: payload.role,
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone,
        password: payload.password,
        avatarUrl,
        category: payload.category?.trim() || undefined,
        city: payload.city?.trim() || undefined,
        region: payload.region?.trim() || undefined,
        experienceText: payload.experienceText?.trim() || undefined,
        bio: payload.bio?.trim() || undefined,
        profileImageUrl,
      }),
    },
  );

  const json = await parseJson<
    | {
        user?: AuthUserPayload;
        message?: string | string[];
        verificationEmailSent?: boolean;
      }
    | JsonObject
  >(response);

  if (!response.ok || !json || typeof json !== "object") {
    throw new Error(resolveErrorMessage(json, "Ro'yxatdan o'tish amalga oshmadi."));
  }

  return {
    user: "user" in json && json.user ? normalizeUser(json.user) : normalizeUser({}),
    message: resolveErrorMessage(
      json,
      "Hisob yaratildi. Emailingizga tasdiqlash havolasi yuborildi.",
    ),
    verificationEmailSent:
      "verificationEmailSent" in json ? Boolean(json.verificationEmailSent) : false,
  };
}
