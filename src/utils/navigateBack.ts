import type { Location } from 'react-router-dom';

type BackState = {
  from?: string;
};

export function resolveBackPath(
  location: Location,
  options?: { defaultPath?: string; funChinesePath?: string },
): string {
  const { defaultPath = '/apps', funChinesePath = '/library/hub/fun-chinese' } = options ?? {};

  if (new URLSearchParams(location.search).get('from') === 'fun-chinese') {
    return funChinesePath;
  }

  const from = (location.state as BackState | null)?.from;
  if (from) return from;

  return defaultPath;
}
