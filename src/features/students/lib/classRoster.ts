export function formatClassListForClipboard(firstNames: string[]): string {
  return firstNames.map((n) => n.trim()).filter(Boolean).join('\n');
}
