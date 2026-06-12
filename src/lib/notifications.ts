export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'volunteer' | 'urgency' | 'registration';
  unread: boolean;
}

const STORAGE_KEY = 'cativeiro_notifications';
const EVENT_NAME = 'cativeiro_notifications_updated';

export function getNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error loading notifications:', err);
    return [];
  }
}

export function saveNotifications(notifications: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

export function addNotification(
  title: string,
  description: string,
  type: 'volunteer' | 'urgency' | 'registration'
) {
  const notifications = getNotifications();
  const newItem: NotificationItem = {
    id: Date.now().toString(),
    title,
    description,
    time: 'Agora mesmo',
    type,
    unread: true,
  };
  
  // Keep up to 30 notifications
  const updated = [newItem, ...notifications].slice(0, 30);
  saveNotifications(updated);
}

export function markAsRead(id: string) {
  const notifications = getNotifications();
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, unread: false } : n
  );
  saveNotifications(updated);
}

export function markAllAsRead() {
  const notifications = getNotifications();
  const updated = notifications.map((n) => ({ ...n, unread: false }));
  saveNotifications(updated);
}

export function clearNotifications() {
  saveNotifications([]);
}

export function listenToNotifications(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
