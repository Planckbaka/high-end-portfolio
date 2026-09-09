// Return the last heading reached, including when scrolling back through the article.
export function headingIndex(offsets: number[], position: number): number {
  let low = 0,
    high = offsets.length - 1,
    result = 0;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    if (offsets[middle] <= position) {
      result = middle;
      low = middle + 1;
    } else high = middle - 1;
  }
  return offsets.length ? result : -1;
}
