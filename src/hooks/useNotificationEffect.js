import { useEffect } from 'react';
import { useNotificationStore } from 'model/hooks';

export default function useNotificationEffect (effect, dependencies, notificationId = '') {
  const notificationStore = useNotificationStore();

  return useEffect(() => {
    effect({
      addSuccess: notification =>
        notificationStore.addNotification(notification, { notificationId, type: 'success' }),
      addError: notification =>
        notificationStore.addNotification(notification, { notificationId, type: 'error' }),
      addWarning: notification =>
        notificationStore.addNotification(notification, { notificationId, type: 'warning' }),
      addInfo: notification =>
        notificationStore.addNotification(notification, { notificationId, type: 'info' }),
      addFetchResult: (
        { resolved, rejected, pending },
        { success: formatResolved, error: formatRejected } = {}
      ) => {
        if (pending) return;
        if (resolved !== undefined && formatResolved) {
          notificationStore.addNotification(formatResolved(resolved), {
            type: 'success',
            notificationId
          });
        }
        if (rejected !== undefined) {
          notificationStore.addNotification(
            formatRejected ? formatRejected(rejected) : rejected,
            { type: 'error', notificationId }
          );
        }
      }
    });
    // This is an exception to not block CRA update (CN-577). Do not duplicate. Properly fix this instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
