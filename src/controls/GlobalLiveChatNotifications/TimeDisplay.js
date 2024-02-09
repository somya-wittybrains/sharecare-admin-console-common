import React, { useEffect, useState } from 'react';

const TimeDisplay = ({ onTimeChange }) => {
  const [time, setTime] = useState(0);

  const max = 120;

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time => time + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onTimeChange(time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  const toHoursAndMinutes = totalSeconds => {
    const totalMinutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const s = seconds < 10 ? `0${seconds}` : seconds;

    if (hours) {
      return `${hours}:${minutes}:${s}`;
    } else if (minutes) {
      return `${minutes}:${s}`;
    } else {
      return s;
    }
  };

  const percentageRaw = (time / max) * 100;
  const percentage = percentageRaw > 100 ? 100 : percentageRaw;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '200px' }}>
        <div
          style={{
            background: '#80808080',
            width: '100%',
            borderRadius: '10px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              height: '10px',
              width: `${percentage}%`
            }}
          >
            &nbsp;
          </div>
        </div>
      </div>
      <div style={{ marginLeft: '10px' }}>{`${toHoursAndMinutes(
        time
      )} wait`}</div>
    </div>
  );
};
export default TimeDisplay;