import { useAppModelStore } from 'model/hooks';

const ACTION_MAP = {
  login: (auth, ...args) => auth.getLoginURL(...args),
  logout: (auth, ...args) => auth.getLogoutURL(...args)
};

export default function useSAML () {
  const { configStore, authStore, restStore } = useAppModelStore();

  const performSAMLAction = action => {
    if (!ACTION_MAP.hasOwnProperty(action)) {
      throw new Error(`Invalid SAML action: ${action}`);
    }
    if (configStore.ssoMethod === 'saml2_provider') {
      const makeSAMLUrl = ACTION_MAP[action];
      const state = window.location.href;
      const redirectURI = `${window.location.protocol}//${
        window.location.host
      }/api/auth/oauth`;
      const authUrl = makeSAMLUrl(authStore, redirectURI, state);
      if (action === 'login') 
        restStore.updateLastRefresh();
      else        
        restStore.clearLastRefresh();
      window.location.replace(authUrl);
    }
  };

  const isSAMLEnabled = () => {
    return configStore.ssoMethod === 'saml2_provider';
  };

  return { performSAMLAction, isSAMLEnabled };
}
