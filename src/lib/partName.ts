/** series が name の接頭辞と重複する場合は省いた表示名を返す */
export function partDisplayName(part: { series?: string | null; name: string }): string {
  if (part.series && !part.name.startsWith(part.series)) {
    return `${part.series} ${part.name}`
  }
  return part.name
}
