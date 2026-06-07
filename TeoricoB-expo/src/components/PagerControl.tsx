import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface TabResetSignal {
  tabs: string[];
  counter: number;
}

interface PagerControlValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  resetSignal: TabResetSignal;
  signalTabsReset: (tabs: string[]) => void;
}

const PagerControlCtx = createContext<PagerControlValue>({
  enabled: true,
  setEnabled: () => {},
  resetSignal: { tabs: [], counter: 0 },
  signalTabsReset: () => {},
});

export function PagerControlProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const [resetSignal, setResetSignal] = useState<TabResetSignal>({ tabs: [], counter: 0 });

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

  const signalTabsReset = useCallback((tabs: string[]) => {
    if (tabs.length === 0) return;
    setResetSignal(prev => ({ tabs, counter: prev.counter + 1 }));
  }, []);

  return (
    <PagerControlCtx.Provider value={{ enabled, setEnabled, resetSignal, signalTabsReset }}>
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

/**
 * Hook que ejecuta `onReset` cuando el tab `tabKey` deja de estar activo.
 * Así la próxima vez que el usuario vuelva, la pantalla ya está reseteada
 * (en lugar de saltar a su posición original al entrar, que se nota).
 * No se dispara cuando se cierra una subpágina dentro del propio tab.
 */
export function useTabResetEffect(tabKey: string, onReset: () => void) {
  const { resetSignal } = usePagerControl();
  const lastCounterRef = useRef(0);
  useEffect(() => {
    if (resetSignal.counter === lastCounterRef.current) return;
    lastCounterRef.current = resetSignal.counter;
    if (resetSignal.tabs.includes(tabKey)) onReset();
  }, [resetSignal, tabKey, onReset]);
}
