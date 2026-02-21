export type Subscriber = {
  id: number;
  code?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  deleted?: boolean;
  deletedAt?: string;
};

export type SubscriptionStatus = "ACTIVE" | "RENEWAL_REQUIRED" | "EXPIRED";

export type Subscription = {
  id: number;
  startDate: string;
  endDate: string;
  amount: number;
  status: SubscriptionStatus;
  deleted?: boolean;
  deletedAt?: string;
  subscriber?: Subscriber;
};

export type SubscriptionUpsertPayload = {
  startDate: string;
  endDate: string;
  amount: number;
  status: SubscriptionStatus;
  subscriberId: number;
};

export type Notification = {
  subscriptionId: number;
  subscriberId: number | null;
  subscriberName: string;
  endDate: string;
  daysUntilEnd: number;
  status: SubscriptionStatus;
};
