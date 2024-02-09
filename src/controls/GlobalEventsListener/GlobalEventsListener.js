/*
 * Example usage of setting up a subscripting in a component:
 *

  useEffect(() => {
    const type = 'togglePinnedWindow';
    const onEvent = ({ isOpen } = {}) => {
      setPinnedWindow(isOpen)
    }

    GlobalEventsListener.addListener({
      type,
      onEvent,
    });

    return () => {
      // Make sure to always remove the listener when the component unmounts
      GlobalEventsListener.removeListener({
        type,
        onEvent,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  Example usage of triggering event anywhere in admin console:

  GlobalEventsListener.dispatchEvent({
    type: 'togglePinnedWindow',
    data: { isOpen: true }
  })

 *
 */

const createGlobalEventsListenerInstance = () => {
  let subscriptions = {};

  const addListener = ({ type, onEvent, isReplace }) => {
    if (!subscriptions[type]) {
      subscriptions[type] = [];
    }

    // only add if current function is not already subscribed
    if (subscriptions[type].findIndex(item => item === onEvent) < 0) {
      if (isReplace) {
        subscriptions[type] = [onEvent];
      } else {
        subscriptions[type].push(onEvent);
      }
    }
  };

  const removeListener = ({ type, onEvent }) => {
    const typeSubs = subscriptions[type] || [];
    const existingIndex = typeSubs.findIndex(item => item === onEvent);

    if (existingIndex > -1) {
      typeSubs.splice(existingIndex, 1);
    }
  };

  const dispatchEvent = ({ type, data }) => {
    if (subscriptions[type]) {
      subscriptions[type].forEach(onEvent => {
        onEvent(data);
      });
    }
  };

  return {
    addListener,
    removeListener,
    dispatchEvent
  };
};

export default createGlobalEventsListenerInstance();
