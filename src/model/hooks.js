import { useContext } from 'react';
import { ModelStoreContext } from 'model';
import { NotificationStoreContext } from 'model/NotificationStore';

export function useAuthStore() {
  const modelStore = useContext(ModelStoreContext);
  return modelStore.authStore;
}

export function useNotificationStore() {
  return useContext(NotificationStoreContext);
}

export function useVersionStore() {
  const modelStore = useContext(ModelStoreContext);
  return modelStore.versionStore;
}

export function useConfigStore() {
  const modelStore = useContext(ModelStoreContext);
  return modelStore.configStore;
}

export function useSponsorStore() {
  const modelStore = useContext(ModelStoreContext);
  return modelStore.sponsorStore;
}

export function useCasesTasksStore() {
  const modelStore = useContext(ModelStoreContext);
  return modelStore.casesTasksStore;
}

export function useAppModelStore() {
  return useContext(ModelStoreContext);
}
