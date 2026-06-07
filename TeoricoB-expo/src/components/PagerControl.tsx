import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface PagerControlValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const PagerControlCtx = createContext<PagerControlValue>({
  enabled: true,
  setEnabled: () => {},
});

export function PagerControlProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  // Acumulador de "lockers" — cualquier pantalla puede bloquear el pager
  // mientras esté montada en una subvista. Cuando todos liberan, vuelve a
  // estar habilitado.
  const lockCountRef = useRef(0);

  const setEnabled = useCallback((next: boolean) => {
    if (next) {
      lockCountRef.current = Math.max(0, lockCountRef.current - 1);
    } else {
      lockCountRef.current += 1;
    }
    setEnabledState(lockCountRef.current === 0);
  }, []);

  return (
    <PagerControlCtx.Provider value={{ enabled, setEnabled }}>
      {children}
    </PagerControlCtx.Provider>
  );
}

export function usePagerControl() {
  return useContext(PagerControlCtx);
}

/**
 * Hook que bloquea el swipe horizontal del pager mientras esté activo.
 * Se libera automáticamente al desmontar o al cambiar `locked` a false.
 */
export function useLockPagerSwipe(locked: boolean) {
  const { setEnabled } = usePagerControl();
  useEffect(() => {
    if (!locked) return;
    setEnabled(false);
    return () => setEnabled(true);
  }, [locked, setEnabled]);
}
