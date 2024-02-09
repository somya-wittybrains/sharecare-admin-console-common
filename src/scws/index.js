import wsconnect from './wsconnect';

/*
 * Example usage of using in a component:
 *
  // scws stands for 'sharecare websockets'
  import scws from 'scws';

  useEffect(() => {
    const filter = [{ memberSecureId: 'mytest' }];
    const type = 'newMessage';
    scws.addListener({
      filter,
      type,
      onEvent: () => {
        conversationMessagesStore.load(
          activeConversation,
          member,
          sponsor,
          topic
        );
      }
    });
    return () => {
      // Make sure to always remove the listener when the component unmounts
      scws.removeListener({ filter, type });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 *
 */
const createWebSocketInstance = () => {
  let connectedWsObjs = {};

  const addListener = ({ filter, type, extraKey = '', sponsor, onEvent }) => {
    const filterStr = filter ? JSON.stringify(filter) : '';
    const onWsMessage = data => {
      const { type: eventType } = data;
      if (eventType === type) {
        onEvent(data);
      }
    };
    const key = `${filterStr}:${type}${extraKey}`;
    connectedWsObjs[key] = wsconnect(filter, sponsor, onWsMessage);
  };

  const removeListener = ({ filter, type, extraKey = '' }) => {
    const filterStr = filter ? JSON.stringify(filter) : '';
    const key = `${filterStr}:${type}${extraKey}`;
    const connectedWsObj = connectedWsObjs[key];
    if (connectedWsObj) {
      const { closeSocketInstance } = connectedWsObj;
      closeSocketInstance();
    }
  };

  return {
    addListener,
    removeListener
  };
};

export default createWebSocketInstance();
