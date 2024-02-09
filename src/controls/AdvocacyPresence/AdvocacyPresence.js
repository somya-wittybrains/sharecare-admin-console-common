import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { modelStoreSingleton } from '../../model';
import { observer } from 'mobx-react-lite';

const { restStore } = modelStoreSingleton;
let presenseInterval;

const reducer = (state = {}, action = {}) => {
  const { type, payload = {} } = action;
  switch (type) {
    case 'UPDATE':
      return {
        ...state,
        ...payload
      };
    case 'REPLACE':
      return {
        ...payload
      };
    default:
      return state;
  }
};

const initialState = {};

export const AdvocacyPresenceContext = createContext(initialState);

export const AdvocacyPresenceStore = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AdvocacyPresenceContext.Provider value={{ state, dispatch }}>
      {children}
    </AdvocacyPresenceContext.Provider>
  );
};

export function useAdvocacyPresenceContext () {
  return useContext(AdvocacyPresenceContext);
}

let presenceUpdateLock = 0;

/*
 * Listener details have not been ironed out yet....will likely create a websocket listener here,
 * For now just setting up a listener that simulates a data load after several seconds
 */
export const AdvocacyPresenceListener = observer(({ authStore }) => {
  const { isAdvocateUser, isLoggedOut } = authStore;
  //const advocacyPermissions =
  //  (permissions.find(p => p.module === 'advocacy') || {}).roles || [];
  //const isAdvocateUser = advocacyPermissions.length > 0;

  const { dispatch } = useAdvocacyPresenceContext();

  const getPresenceData = async () => {
    try {
      const data = await restStore.fetch(
        '/api/advocacyproxy-five9/agent-presence',
        {
          method: 'GET',
          skip401: true
        }
      );
      return data;
    } catch (e) {}
  };

  const getPresenceMeta = async () => {
    try {
      const data = await restStore.fetch(
        '/api/advocacyproxy-five9/agent-presence-master',
        {
          method: 'GET',
          skip401: true
        }
      );
      return data;
    } catch (e) {}
  };

  const createPresenceMap = (presenceData = [], metaData = []) => {
    const presenceMap = {};

    presenceData.forEach(({ ssoId, presenceId }) => {
      const foundPresenceObj = metaData.find(({ id }) => id === presenceId);
      if (ssoId && foundPresenceObj) {
        presenceMap[ssoId] = foundPresenceObj;
      }
    });

    return presenceMap;
  };

  useEffect(() => {
    const initApiCalls = async () => {
      if (isAdvocateUser && !isLoggedOut) {
        const presenceMeta = await getPresenceMeta();
        const presenceData = await getPresenceData();
        const presenceMap = createPresenceMap(presenceData, presenceMeta);
        dispatch({ type: 'REPLACE', payload: presenceMap });

        // Until websockets are put into place...poll for advocacy presence updates every 30 seconds
        presenseInterval = setInterval(async () => {
          // We do this every 30 seconds, but if for some reason a request takes longer than 30 seconds, we could have two concurrent requests.  This won't happen in normal operation, but to prevent exacerbating any trouble in abnormal circumstances, we create a lock to prevent subsequent attempts until the current attempt is finished (whether through successful return or through timeout or other error).
          if(isLoggedOut)
            clearInterval(presenseInterval);
          if (presenceUpdateLock) return;
          presenceUpdateLock += 1;
          try {
            const pData = await getPresenceData();
            const pMap = createPresenceMap(pData, presenceMeta);
            dispatch({ type: 'REPLACE', payload: pMap });
          } catch (err) {
            console.error('Loading latest agent presence failed: ', err);
          } finally {
            presenceUpdateLock -= 1;
          }
        }, 30000);
      } else {
        clearInterval(presenseInterval);
      }
    };
    initApiCalls();
    return () => {
          clearInterval(presenseInterval);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvocateUser]);

  return <></>;
});
