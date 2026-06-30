/** Inset to keep immersive content clear of IpadDeviceShell inner border-radius. */
export function getDeviceScreenInset(): number {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  if (screenSize === '960x540') return 12;
  if (screenSize === '2000x1200') return 18;
  if (screenSize === '1920x1125') return 20;
  return 14;
}
