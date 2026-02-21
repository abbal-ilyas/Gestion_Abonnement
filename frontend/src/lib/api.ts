import { Notification, Subscriber, Subscription, SubscriptionUpsertPayload } from "@/lib/types";
import { sampleNotifications, sampleSubscribers, sampleSubscriptions } from "@/lib/sampleData";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/backend-api";
const STATIC_AUTH_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const API_USERNAME = process.env.NEXT_PUBLIC_API_USERNAME || "admin";
const API_PASSWORD = process.env.NEXT_PUBLIC_API_PASSWORD || "admin123";

let cachedToken: string | null = STATIC_AUTH_TOKEN || null;

async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: API_USERNAME, password: API_PASSWORD }),
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { token?: string };
    if (data.token) {
      cachedToken = data.token;
      return cachedToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const execute = async (token: string | null) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    };
    return fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  };

  let token = await getAuthToken();
  let res = await execute(token);

  if ((res.status === 401 || res.status === 403) && token) {
    cachedToken = null;
    token = await getAuthToken();
    res = await execute(token);
  }

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(`Request failed: ${res.status}${raw ? ` - ${raw}` : ""}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export async function fetchSubscribers(search?: string): Promise<Subscriber[]> {
  try {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return await request(`/subscribers${qs}`);
  } catch {
    return sampleSubscribers;
  }
}

export async function createSubscriber(payload: Partial<Subscriber>): Promise<Subscriber> {
  return request(`/subscribers`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateSubscriber(id: number, payload: Partial<Subscriber>): Promise<Subscriber> {
  return request(`/subscribers/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteSubscriber(id: number): Promise<void> {
  try {
    await request(`/subscribers/${id}`, { method: "DELETE" });
  } catch {
    return;
  }
}

export async function fetchSubscriptions(params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  subscriberId?: number;
  search?: string;
}): Promise<Subscription[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.startDate) qs.append("startDate", params.startDate);
    if (params?.endDate) qs.append("endDate", params.endDate);
    if (params?.status) qs.append("status", params.status);
    if (params?.subscriberId) qs.append("subscriberId", String(params.subscriberId));
    if (params?.search) qs.append("search", params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return await request(`/subscriptions${suffix}`);
  } catch {
    return sampleSubscriptions;
  }
}

export async function createSubscription(payload: SubscriptionUpsertPayload): Promise<Subscription> {
  return request(`/subscriptions`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateSubscription(id: number, payload: SubscriptionUpsertPayload): Promise<Subscription> {
  return request(`/subscriptions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteSubscription(id: number): Promise<void> {
  try {
    await request(`/subscriptions/${id}`, { method: "DELETE" });
  } catch {
    return;
  }
}

export async function purgeSubscription(id: number, adminPin: string): Promise<void> {
  await request(`/subscriptions/${id}/purge`, {
    method: "DELETE",
    headers: { "X-Admin-Pin": adminPin },
  });
}

export async function purgeSubscriber(id: number, adminPin: string): Promise<void> {
  await request(`/subscribers/${id}/purge`, {
    method: "DELETE",
    headers: { "X-Admin-Pin": adminPin },
  });
}

export async function fetchSubscriptionHistory(params?: {
  year?: number;
  month?: number;
  date?: string;
  search?: string;
  status?: string;
  amount?: number;
  deletedTarget?: string;
}): Promise<Subscription[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.year) qs.append("year", String(params.year));
    if (params?.month) qs.append("month", String(params.month));
    if (params?.date) qs.append("date", params.date);
    if (params?.search) qs.append("search", params.search);
    if (params?.status) qs.append("status", params.status);
    if (typeof params?.amount === "number" && !Number.isNaN(params.amount)) {
      qs.append("amount", String(params.amount));
    }
    if (params?.deletedTarget) qs.append("deletedTarget", params.deletedTarget);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return await request(`/subscriptions/history${suffix}`);
  } catch {
    return sampleSubscriptions;
  }
}

export async function fetchNotifications(date?: string): Promise<Notification[]> {
  try {
    const qs = date ? `?date=${date}` : "";
    return await request(`/notifications/daily${qs}`);
  } catch {
    return sampleNotifications;
  }
}
