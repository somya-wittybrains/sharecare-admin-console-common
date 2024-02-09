import { modelStoreSingleton } from '../model';
const { restStore } = modelStoreSingleton;

let websocketUrl;

export default (filter, sponsor, onEvent) => {
  let socket;
  let shouldConnect = true;

  /*
   * Currently unused but keeping this flavor of refreshing then fetching the bearer token
   * in case we need to roll back to this option
   *
  const refreshBearer = async () => {
    return await fetch(`/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      mode: 'same-origin'
    });
  };

  const getBearer = async () => {
    const response = await fetch(`/api/auth/getBearer`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      mode: 'same-origin'
    });
    return await response.json();
  };

  
  const getBearerViaStandardFetch = async () => {
    await refreshBearer();
    return await getBearer();
  };
  */

  const getBearerViaRestStore = async () => {
    return await restStore.fetch('/api/auth/getBearer', {
      method: 'GET'
    });
  };

  const connect = async () => {
    if (!shouldConnect) return;

    if (!websocketUrl) {
      websocketUrl = await restStore.fetch('/api/scws/url', {
        method: 'GET'
      });
    }

    const localSocket = (socket = new WebSocket(websocketUrl));

    // Connection opened
    localSocket.addEventListener('open', async () => {
      const bearer = await getBearerViaRestStore();

      const connectionObj = {
        type: 'AUTHORIZATION',
        access_key: `Bearer ${bearer}`,
        filter
      };

      if (sponsor) {
        connectionObj.sponsor = sponsor;
      }

      localSocket.send(JSON.stringify(connectionObj));
    });
    // Reconnect if ws auto closes
    localSocket.addEventListener('close', connect);

    // Listen for messages
    localSocket.addEventListener('message', function (event) {
      if (onEvent) {
        onEvent(JSON.parse(event.data));
      }
    });
  };

  connect();

  return {
    socket,
    closeSocketInstance: () => {
      shouldConnect = false;
      if (socket) {
        socket.close();
      }
    }
  };
};
