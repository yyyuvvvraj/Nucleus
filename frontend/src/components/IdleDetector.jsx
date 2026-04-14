import React, { useState, useEffect } from 'react';
import SleepScreen from './SleepScreen';

const IdleDetector = ({ children }) => {
  const [isLocked, setIsLocked] = useState(sessionStorage.getItem('isLocked') === 'true');
  const IDLE_TIME = 2 * 60 * 1000; // 2 minutes

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      if (isLocked) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsLocked(true);
        sessionStorage.setItem('isLocked', 'true');
      }, IDLE_TIME);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timer);
    };
  }, [isLocked]);

  const handleUnlock = () => {
    setIsLocked(false);
    sessionStorage.setItem('isLocked', 'false');
  };

  return (
    <>
      {isLocked && <SleepScreen onUnlock={handleUnlock} />}
      {children}
    </>
  );
};

export default IdleDetector;
