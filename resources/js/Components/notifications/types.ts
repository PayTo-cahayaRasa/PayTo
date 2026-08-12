export type NotificationType = 'success' | 'error' | 'info';

export type NotificationInput = {
    message: string;
    type?: NotificationType;
};

export type Notification = NotificationInput & {
    id: number;
    type: NotificationType;
};

export const NOTIFICATION_DURATION = 5_000;
