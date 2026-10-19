export type ChipVariant = 'dark' | 'tan' | 'outline';

export interface StatusView {
  label: string;
  variant: ChipVariant;
}

// Backend enums (packages and orders) -> Polish label + badge look.
// dark = in progress, tan = done / resting, outline = waiting
const STATUS_VIEWS: Record<string, StatusView> = {
  PENDING: { label: 'OCZEKUJE', variant: 'outline' },
  ALLOCATED: { label: 'PRZYDZIELONA', variant: 'dark' },
  IN_TRANSIT: { label: 'W TRANSPORCIE', variant: 'dark' },
  STORED: { label: 'NA PÓŁCE', variant: 'tan' },
  SENDING: { label: 'DO WYDANIA', variant: 'dark' },
  DROPPED: { label: 'W STREFIE WYDAŃ', variant: 'tan' },
  UNLOADING: { label: 'ROZŁADUNEK', variant: 'dark' },
  STORING: { label: 'SKŁADOWANIE', variant: 'dark' },
  IN_PROGRESS: { label: 'W REALIZACJI', variant: 'dark' },
  COMPLETED: { label: 'ZAKOŃCZONE', variant: 'tan' },
};

export function getStatusView(status: string): StatusView {
  return STATUS_VIEWS[status] ?? { label: status, variant: 'outline' };
}
