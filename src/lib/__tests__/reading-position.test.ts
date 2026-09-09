import { headingIndex } from "../reading-position";
it.each([
  [0, 0],
  [150, 0],
  [299, 0],
  [300, 1],
  [800, 2],
  [1000, 2],
])("finds heading at scroll position %i", (position, expected) => {
  expect(headingIndex([150, 300, 800], position)).toBe(expected);
});
it("handles no headings", () => expect(headingIndex([], 200)).toBe(-1));
