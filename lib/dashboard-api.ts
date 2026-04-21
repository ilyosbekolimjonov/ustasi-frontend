import {
  API_BASE_URL,
  parseJson,
  performFetch,
  refreshAuthTokens,
  resolveErrorMessage,
} from "./auth-api";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "./auth-storage";

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  regionId: string | null;
  address: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServiceRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  addressText: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  images: string[];
  status: string;
  isEditable?: boolean;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    phone: string;
    avatarUrl: string | null;
  };
  claimedByMaster: {
    id: string;
    fullName: string;
    phone: string;
    masterProfile: {
      id: string;
      slug: string;
      category: string;
      city: string;
      profileImageUrl: string;
    } | null;
  } | null;
};

export type ChatParticipant = {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  role: string;
  masterProfile: {
    id: string;
    slug: string;
    category: string;
    city: string;
    profileImageUrl: string;
  } | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export type ChatRequestSummary = {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  addressText: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  images: string[];
  status: string;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatConversationSummary = {
  id: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  request: ChatRequestSummary;
  counterpart: ChatParticipant;
  lastMessage: ChatMessage | null;
};

export type ChatConversationDetail = ChatConversationSummary & {
  messages: ChatMessage[];
};

export type ServiceRequestPayload = {
  title: string;
  description: string;
  category: string;
  city: string;
  addressText?: string;
  budgetMin?: number;
  budgetMax?: number;
  images?: string[];
};

export type MasterProfile = {
  id: string;
  userId?: string;
  slug: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  category: string;
  city: string;
  region: string | null;
  bio: string;
  experienceText: string;
  experienceYears: number | null;
  profileImageUrl: string;
  isAvailable: boolean;
  ratingAverage: number;
  jobsCompletedCount: number;
  memberSince?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardSummary = {
  profile: UserProfile;
  requestCounts?: {
    total: number;
    open: number;
    completed: number;
  };
  latestRequests: Array<
    Pick<ServiceRequest, "id" | "title" | "category" | "city" | "status" | "images"> & {
      budgetMin: number | null;
      budgetMax: number | null;
      createdAt: string;
    }
  >;
  suggestedMasters: MasterProfile[];
};

export type MasterDashboardSummary = {
  profile: UserProfile;
  openRequestCount: number;
  claimedRequestCount: number;
  latestClaimedRequests: Array<
    Pick<ServiceRequest, "id" | "title" | "category" | "city" | "status"> & {
      claimedAt: string | null;
      updatedAt: string;
    }
  >;
  latestOpenRequests: Array<
    Pick<ServiceRequest, "id" | "title" | "category" | "city" | "status"> & {
      createdAt: string;
    }
  >;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  code: number;
  brand: { id: string; name: string } | null;
  size: { id: string; name: string } | null;
  capacity: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type BasketItem = {
  id: string;
  profession: {
    id: string;
    nameUz?: string;
    nameRu?: string;
    nameEn?: string;
  };
  tool: {
    id: string;
    nameUz?: string;
    nameRu?: string;
    nameEn?: string;
    image: string;
    price: number;
  };
  level: {
    id: string;
    nameUz?: string;
    nameRu?: string;
    nameEn?: string;
  };
  count: number;
  timeUnit: "HOUR" | "DAY";
  workingTime: number;
  estimatedTotal: number;
  createdAt: string;
  updatedAt: string;
};

export type BasketItemUpdatePayload = Partial<{
  count: number;
  workingTime: number;
  timeUnit: "HOUR" | "DAY";
}>;

export type Order = {
  id: string;
  userId: string;
  user: {
    id: string;
    fullname: string;
    email: string;
    phone: string;
  };
  address: string;
  longitude: string;
  latitude: string;
  date: string;
  totalPrice: number;
  paymentType: string;
  withDelivery: boolean;
  status: string;
  deliveryComment: string;
  items: Array<{
    id: string;
    professionId?: string | null;
    toolId?: string | null;
    levelId?: string | null;
    timeUnit: string;
    workingTime: number;
    price: number;
    count: number;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfilePayload = Partial<{
  fullName: string;
  phone: string;
  avatarUrl: string;
  address: string;
  regionId: string;
}>;

export type UpdateMasterProfilePayload = Partial<{
  category: string;
  city: string;
  region: string;
  bio: string;
  experienceText: string;
  experienceYears: number;
  profileImageUrl: string;
  isAvailable: boolean;
}>;

export type SendChatMessagePayload = {
  text: string;
};

export type Region = {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
};

type QueryValue = string | number | boolean | undefined | null;

function buildQuery(params?: Record<string, QueryValue>) {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await performFetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && token) {
    const refreshedAccessToken = await refreshStoredSession();

    if (refreshedAccessToken) {
      headers.set("Authorization", `Bearer ${refreshedAccessToken}`);
      response = await performFetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
      });
    }
  }

  const json = await parseJson<T | Record<string, unknown>>(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    throw new Error(resolveErrorMessage(json, "So'rovni bajarib bo'lmadi."));
  }

  return json as T;
}

async function refreshStoredSession() {
  const session = readAuthSession();

  if (!session?.refreshToken) {
    return "";
  }

  try {
    const tokens = await refreshAuthTokens(session.refreshToken);

    writeAuthSession({
      user: session.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return tokens.accessToken;
  } catch {
    clearAuthSession();
    return "";
  }
}

export function getUserDashboardSummary(token: string) {
  return apiRequest<DashboardSummary>("/dashboard/user", {}, token);
}

export function getMasterDashboardSummary(token: string) {
  return apiRequest<MasterDashboardSummary>("/dashboard/master", {}, token);
}

export function listMyServiceRequests(
  token: string,
  params?: Record<string, QueryValue>,
) {
  return apiRequest<PaginatedResponse<ServiceRequest>>(
    `/service-requests/my${buildQuery(params)}`,
    {},
    token,
  );
}

export function getServiceRequest(token: string, id: string) {
  return apiRequest<ServiceRequest>(`/service-requests/${id}`, {}, token);
}

export function createServiceRequest(token: string, payload: ServiceRequestPayload) {
  return apiRequest<ServiceRequest>(
    "/service-requests",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function updateServiceRequest(token: string, id: string, payload: ServiceRequestPayload) {
  return apiRequest<ServiceRequest>(
    `/service-requests/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function cancelServiceRequest(token: string, id: string) {
  return apiRequest<ServiceRequest>(
    `/service-requests/${id}/cancel`,
    {
      method: "PATCH",
    },
    token,
  );
}

export function listMasters(params?: Record<string, QueryValue>) {
  return apiRequest<PaginatedResponse<MasterProfile>>(`/masters${buildQuery(params)}`);
}

export function getMaster(idOrSlug: string) {
  return apiRequest<MasterProfile>(`/masters/${idOrSlug}`);
}

export function getOwnMasterProfile(token: string) {
  return apiRequest<MasterProfile>("/masters/me", {}, token);
}

export function updateOwnMasterProfile(token: string, payload: UpdateMasterProfilePayload) {
  return apiRequest<MasterProfile>(
    "/masters/me",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function listOpenServiceRequests(token: string, params?: Record<string, QueryValue>) {
  return apiRequest<PaginatedResponse<ServiceRequest>>(
    `/service-requests/open${buildQuery(params)}`,
    {},
    token,
  );
}

export function listClaimedServiceRequests(token: string, params?: Record<string, QueryValue>) {
  return apiRequest<PaginatedResponse<ServiceRequest>>(
    `/service-requests/claimed/my${buildQuery(params)}`,
    {},
    token,
  );
}

export function claimServiceRequest(token: string, id: string) {
  return apiRequest<ServiceRequest>(
    `/service-requests/${id}/claim`,
    {
      method: "POST",
    },
    token,
  );
}

export function listChats(token: string) {
  return apiRequest<ChatConversationSummary[]>('/chats', {}, token);
}

export function getChatConversation(token: string, conversationId: string) {
  return apiRequest<ChatConversationDetail>(`/chats/${conversationId}`, {}, token);
}

export function sendChatMessage(
  token: string,
  conversationId: string,
  payload: SendChatMessagePayload,
) {
  return apiRequest<ChatMessage>(
    `/chats/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function getCurrentUser(token: string) {
  return apiRequest<UserProfile>("/users/me", {}, token);
}

export function updateCurrentUser(token: string, payload: UpdateProfilePayload) {
  return apiRequest<UserProfile>(
    "/users/me",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function listProducts(token: string, params?: Record<string, QueryValue>) {
  return apiRequest<PaginatedResponse<Product>>(`/products${buildQuery(params)}`, {}, token);
}

export function getProduct(token: string, id: string) {
  return apiRequest<Product>(`/products/${id}`, {}, token);
}

export function listBasket(token: string, params?: Record<string, QueryValue>) {
  return apiRequest<BasketItem[]>(`/basket${buildQuery(params)}`, {}, token);
}

export function updateBasketItem(
  token: string,
  id: string,
  payload: BasketItemUpdatePayload,
) {
  return apiRequest<BasketItem>(
    `/basket/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function deleteBasketItem(token: string, id: string) {
  return apiRequest<{ message: string }>(
    `/basket/${id}`,
    {
      method: "DELETE",
    },
    token,
  );
}

export function listOrders(token: string, params?: Record<string, QueryValue>) {
  return apiRequest<Order[]>(`/orders${buildQuery(params)}`, {}, token);
}

export function getOrder(token: string, id: string) {
  return apiRequest<Order>(`/orders/${id}`, {}, token);
}

export function listRegions(params?: Record<string, QueryValue>) {
  return apiRequest<Region[]>(`/region${buildQuery(params)}`);
}
