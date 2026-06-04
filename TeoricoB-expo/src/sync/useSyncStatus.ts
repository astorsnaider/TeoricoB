/**
 * useSyncStatus — hook reactivo que devuelve el estado de la
 * sincronización con Supabase. Lo consumen los componentes que muestran
 * el indicador "Sincronizado / Sincronizando…" en Profile, banners,
 * etc.
 *
 * El estado se mantiene en el módulo `syncEngine` (singleton); este
 * hook solo se suscribe a los cambios para re-renderizar el componente.
 */
import { useEffect, useState } from 'react';
import { SyncStatus, getSyncStatus, subscribeSyncStatus } from './syncEngine';

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus);
  useEffect(() => {
    return subscribeSyncStatus(setStatus);
  }, []);
  return status;
}

/**
 * Devuelve un mensaje corto en castellano apto para mostrar al usuario.
 * Por ejemplo en la card "Cuenta" del Profile.
 */
export function syncStatusLabel(status: SyncStatus, email?: string | null): string {
  switch (status.kind) {
    case 'idle':     return email ? 'Sesión iniciada' : 'Sin sincronizar';
    case 'pending':  return 'Cambios sin guardar…';
    case 'syncing':  return 'Sincronizando…';
    case 'synced':   return 'Sincronizado · ' + relativeTime(status.at);
    case 'error':    return 'Error al sincronizar';
  }
}

function relativeTime(at: number): string {
  const secs = Math.max(1, Math.round((Date.now() - at) / 1000));
  if (secs < 60) return `hace ${secs} s`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.round(hrs / 24);
  return `hace ${days} d`;
}
