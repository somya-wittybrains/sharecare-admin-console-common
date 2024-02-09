import React from 'react';

const CircularProgress = ({
  children,
  size = 100,
  progressColor = '#0092f2',
  backgroundColor = '#e0e1e2',
  stroke = 4,
  progress = 0,
  style
}) => {
  const circumference = size * Math.PI - stroke;
  const center = size / 2;
  const radius = (size - stroke) / 2;
  const progressDashoffset = circumference - (progress / 100) * circumference;
  const backgroundDashoffset = progressDashoffset - circumference;
  const sharedCircleProps = {
    r: radius,
    cx: center,
    cy: center,
    strokeWidth: stroke,
    fill: 'transparent',
    strokeDasharray: `${circumference} ${circumference}`
  };

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        ...style
      }}
    >
      <svg
        style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
      >
        <circle
          stroke={progressColor}
          strokeDashoffset={progressDashoffset}
          {...sharedCircleProps}
        />
        <circle
          stroke={backgroundColor}
          strokeDashoffset={backgroundDashoffset}
          {...sharedCircleProps}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default CircularProgress;
