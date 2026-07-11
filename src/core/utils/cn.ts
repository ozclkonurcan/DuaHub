/** className parçalarını birleştirir; falsy değerleri atlar. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
