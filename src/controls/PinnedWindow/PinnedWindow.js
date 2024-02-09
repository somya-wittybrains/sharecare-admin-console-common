import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'semantic-ui-react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

import 'react-resizable/css/styles.css';

import GlobalEventsListener from 'controls/GlobalEventsListener/GlobalEventsListener';

const PinnedWindow = (
    {
      id,
      order,
      startPinnedPosition,
      isVerticalMoveAllowed,
      headerComponent,
      component,
      baseZIndex,
      updateBaseZIndex,
      minimizeToPos = 0,
      onMinimizedUpdated,
      suppressResize,
      suppressDrag,
      isPinnable,
      pinMetaData,
      width,
      height,
      forceUpdateNum,
      keepAlive,
      onCloseClicked,
      onMinimizeChange,
      initOffScreen
    },
    ref
  ) => {
    const defaultSize = {
      width: width || window.innerWidth * 0.5,
      height: height || window.innerHeight * 0.5
    };

    const maxSize = {
      width: window.innerWidth,
      height: window.innerHeight - 40
    };

    const zeroPosition = { x: 0, y: 0 };
    const offScreenPosition = { x: -100000, y: -100000 };
    const [defaultPosition, setDefaultPosition] = useState(
      initOffScreen ? offScreenPosition : zeroPosition
    );

    useEffect(() => {
      // After a short time span allowing for init useEffects to execute...alway set default position to zeroposition
      setTimeout(() => {
        setDefaultPosition(zeroPosition);
      }, 200);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [position, setPosition] = useState(defaultPosition);
    const [size, setSize] = useState(defaultSize);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isPinned, setIsPinned] = useState(false);

    const [currentZIndex, setCurrentZIndex] = useState(baseZIndex);

    const onResize = (event, { element, size, handle }) => {
      if (!isMinimized) {
        setSize({ width: size.width, height: size.height });
      }
    };

    // Below effect code manages resizing height when browser window updates if the window is
    // either set to full screen or in special pinned mode
    useEffect(() => {
      const onWindowResized = () => {
        if (isMaximized) {
          setSize({
            width: window.innerWidth,
            height: window.innerHeight - 40
          });
        } else if (isPinned) {
          setSize({
            width: (pinMetaData && pinMetaData.width) || 480,
            height: window.innerHeight - 40
          });
        }
      };
      window.addEventListener('resize', onWindowResized);
      return () => window.removeEventListener('resize', onWindowResized);
    }, [isMaximized, isPinned, pinMetaData]);

    const containerRef = useRef();

    useEffect(() => {
      setIsMinimized(false);
      setPosition(defaultPosition);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceUpdateNum]);

    useEffect(() => {
      if (onMinimizeChange) {
        onMinimizeChange(isMinimized);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMinimized]);

    useEffect(() => {
      const isThisMaxed =
        containerRef.current &&
        containerRef.current.offsetWidth >= maxSize.width &&
        containerRef.current.offsetHeight >= maxSize.height - 5
          ? true
          : false;
      setIsMaximized(isThisMaxed);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size, isMinimized]);

    useEffect(() => {
      onMinimizedUpdated(id, order, isMinimized);

      setSize(defaultSize);

      const pos = { ...defaultPosition };
      if (isMinimized) {
        pos.y = minimizeToPos;
      }
      setPosition(pos);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMinimized]);

    useEffect(() => {
      if (isMinimized) {
        const pos = { ...defaultPosition };
        if (isMinimized) {
          pos.y = 0;
          /* There is extensive logic to support mulipled windows stacking ontop of each other,
           * however the main use case for this code here is no longer desired and causes a potential conflict
           * when there exists 2 seperate window locations (Five9 window on the right, chat windows on the left).
           *
           * Instead of overcomplicating an unused stacking solution we are not using this for now, however I am
           * leaving the stacking code/logic in in case we decide to ever support stacking on multiple sides.
           *
           * The bulk of the logic is performed in AppPinnedWindow.js which calculates the minimizeToPos value
           * seen here below:
           */
          // pos.y = minimizeToPos;
        }
        setPosition(pos);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [minimizeToPos, isMinimized]);

    const onMaximizeToggle = () => {
      if (isMaximized) {
        setSize(defaultSize);
      } else {
        setSize(maxSize);
      }
      setPosition(defaultPosition);
      if (isMinimized) {
        setIsMinimized(false);
      }
    };

    const onMinToggle = () => {
      setIsMinimized(isMinimized => !isMinimized);
    };

    const onDragging = (e, data) => {
      setPosition({ x: data.x, y: isVerticalMoveAllowed ? data.y : 0 });
    };

    const onPinToggle = forceUpdateVal => {
      const pinUpdateVal =
        typeof forceUpdateVal === 'boolean' ? forceUpdateVal : !isPinned;
      setPosition(defaultPosition);

      GlobalEventsListener.dispatchEvent({
        type: 'onPinDockedChange',
        data: { id, pinDockValue: pinUpdateVal }
      });

      if (pinUpdateVal) {
        setSize({
          width: (pinMetaData && pinMetaData.width) || 480,
          height: maxSize.height
        });
      } else {
        setSize(defaultSize);
      }

      setIsPinned(pinUpdateVal);
    };

    const setWindowPinDockedStatusEvent = (data = {}) => {
      const { id: eventWindowId, pinDockValue } = data;
      if (id === eventWindowId) {
        onPinToggle(pinDockValue);
      }
    };

    useEffect(() => {
      GlobalEventsListener.addListener({
        type: 'setWindowPinDockedStatus',
        onEvent: setWindowPinDockedStatusEvent
      });
      return () => {
        GlobalEventsListener.removeListener({
          type: 'setWindowPinDockedStatus',
          onEvent: setWindowPinDockedStatusEvent
        });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      width: `${size.width}px`,
      height: isMinimized ? 'auto' : `${size.height}px`,
      maxHeight: '100%',
      position: 'fixed',
      zIndex: currentZIndex,
      backgroundColor: '#fff',
      border: '1px solid #dedede'
    };

    let resizeHandles;
    if (startPinnedPosition === 'left') {
      containerStyle.bottom = '0px';
      containerStyle.left = '0px';
      resizeHandles = ['ne'];
      // resizeHandles = ['ne', 'n', 'e'];
    } else {
      containerStyle.bottom = '0px';
      containerStyle.right = '0px';
      resizeHandles = ['nw'];
      // resizeHandles = ['nw', 'n', 'w'];
    }

    if (suppressResize || isPinned) {
      resizeHandles = [];
    }

    if (isPinned) {
      containerStyle.top = '40px';
      containerStyle.left = '0px';
      containerStyle.transform = 'none!important';
    }

    return (
      <Draggable
        axis='x'
        handle='.handle'
        defaultPosition={defaultPosition}
        disabled={isMinimized || suppressDrag || isPinned ? true : false}
        position={position}
        onStart={() => setIsDragging(true)}
        onStop={() => setIsDragging(false)}
        onDrag={onDragging}
      >
        <Resizable
          height={size.height}
          width={size.width}
          onResize={onResize}
          resizeHandles={isMinimized ? [] : resizeHandles}
        >
          <div
            onClick={() => {
              const updateToZIndex = baseZIndex + 1;
              updateBaseZIndex(updateToZIndex);
              setCurrentZIndex(updateToZIndex);
            }}
            ref={containerRef}
            style={containerStyle}
          >
            <div
              ref={ref}
              className='pinnedWindowHeaderWrapper'
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f7f7f7',
                borderBottom: '1px solid #dedede'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                {' '}
                <div
                  className='handle'
                  style={{
                    flex: 1,
                    padding: '5px',
                    cursor:
                      isMinimized || suppressDrag || isPinned
                        ? 'default'
                        : isDragging
                        ? 'grabbing'
                        : 'grab'
                  }}
                >
                  &nbsp;
                </div>
                {isPinnable && !isMinimized && (
                  <Icon
                    style={{ cursor: 'pointer', marginRight: '20px' }}
                    onClick={onPinToggle}
                    name={isPinned ? 'chevron down' : 'pin'}
                  />
                )}
                {!isPinned && (
                  <Icon
                    style={{ cursor: 'pointer', marginRight: '20px' }}
                    onClick={onMinToggle}
                    name={isMinimized ? 'plus' : 'minus'}
                  />
                )}
                {!isMinimized && !suppressResize && !isPinned && (
                  <Icon
                    style={{ cursor: 'pointer', marginRight: '20px' }}
                    onClick={() => onMaximizeToggle()}
                    name={
                      isMaximized
                        ? 'window restore outline'
                        : 'window maximize outline'
                    }
                  />
                )}
                {!isPinned && (
                  <Icon
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => {
                      if (keepAlive) {
                        setPosition(offScreenPosition);
                      } else {
                        GlobalEventsListener.dispatchEvent({
                          type: 'togglePinnedWindow',
                          data: { id, isOpen: false }
                        });
                      }
                      if (onCloseClicked) {
                        onCloseClicked();
                      }
                    }}
                    name='close'
                  />
                )}
              </div>
              {headerComponent && <div>{headerComponent}</div>}
            </div>
            {keepAlive ? (
              <div
                style={
                  isMinimized
                    ? { height: '0px', display: 'flex', overflow: 'hidden' }
                    : { flex: 1, display: 'flex', overflow: 'hidden' }
                }
              >
                {component}
              </div>
            ) : (
              !isMinimized && (
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  {component}
                </div>
              )
            )}
          </div>
        </Resizable>
      </Draggable>
    );
  }

export default React.forwardRef(PinnedWindow);
