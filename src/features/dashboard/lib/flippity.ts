export const FLIPPITY_HOME_URL = 'https://flippity.net/';

const FLIPPITY_RANDOM_NAME_PICKER_TITLE = 'Random Name Picker';

export function buildFlippityNamePickerUrl(firstNames: string[]): string {
  const names = firstNames.map((n) => n.trim()).filter(Boolean);
  const c = names.map(encodeURIComponent).join(',');
  const t = encodeURIComponent(FLIPPITY_RANDOM_NAME_PICKER_TITLE);
  return `https://flippity.net/rp.php?c=${c}&t=${t}`;
}
