export const FORKLIFT_COLORS: Record<number, string> = {
  0: 'rgb(234, 88, 12)',   // Pomarańczowy
  1: 'rgb(234, 179, 8)',   // Żółty
  2: 'rgb(37, 99, 235)',   // Niebieski
  3: 'rgb(22, 163, 74)',   // Zielony
  4: 'rgb(220, 38, 38)',   // Czerwony
  5: 'rgb(147, 51, 234)',  // Fioletowy
  6: 'rgb(13, 148, 136)',  // Morski (turkus)
  7: 'rgb(236, 72, 153)',  // Różowy
  8: 'rgb(217, 119, 6)',   // Bursztynowy / miodowy
  9: 'rgb(75, 85, 99)',    // Grafitowy / stalowy
};

export const FORKLIFT_CONFIG = {
  colors: FORKLIFT_COLORS,
};

export function getForkliftColor(id: number): string {
  const colorsCount = Object.keys(FORKLIFT_COLORS).length;
  const index = Math.abs(id) % colorsCount;
  return FORKLIFT_COLORS[index];
}