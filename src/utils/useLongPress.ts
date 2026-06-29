import { useCallback, useRef } from 'react';

export function useLongPress(onLongPress: () => void, delayMs = 550) {
  const timerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    longPressTriggeredRef.current = false;
    clear();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      longPressTriggeredRef.current = true;
      onLongPress();
    }, delayMs);
  }, [clear, delayMs, onLongPress]);

  const consumeLongPress = useCallback(() => {
    const wasLongPress = longPressTriggeredRef.current;
    longPressTriggeredRef.current = false;
    return wasLongPress;
  }, []);

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    consumeLongPress,
  };
}
