import { Notification, Subscriber, Subscription } from "@/lib/types";

export const sampleSubscribers: Subscriber[] = [
  { id: 1, firstName: "Alice", lastName: "Martin", email: "alice@example.com", phone: "+33 6 00 00 00 00" },
  { id: 2, firstName: "Bob", lastName: "Dupont", email: "bob@example.com", phone: "+33 6 11 22 33 44" },
  { id: 3, firstName: "Chloe", lastName: "Ben Youssef", email: "chloe@example.com", phone: "+971 50 123 4567" },
];

export const sampleSubscriptions: Subscription[] = [
  {
    id: 101,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    amount: 49.9,
    status: "ACTIVE",
    subscriber: sampleSubscribers[0],
  },
  {
    id: 102,
    startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    amount: 29,
    status: "RENEWAL_REQUIRED",
    subscriber: sampleSubscribers[1],
  },
];

export const sampleNotifications: Notification[] = [
  {
    subscriptionId: 102,
    subscriberId: 2,
    subscriberName: "Bob Dupont",
    endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    daysUntilEnd: 2,
    status: "RENEWAL_REQUIRED",
  },
  {
    subscriptionId: 103,
    subscriberId: 3,
    subscriberName: "Chloe Ben Youssef",
    endDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    daysUntilEnd: -1,
    status: "EXPIRED",
  },
];
