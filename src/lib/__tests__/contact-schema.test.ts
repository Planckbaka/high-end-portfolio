import { contactSchema } from "../contact-schema";
const valid = { name: "Reader", email: "reader@example.com", message: "Question" };
it("normalizes whitespace and discards unexpected fields", () => {
  expect(
    contactSchema.parse({
      name: " Reader ",
      email: " reader@example.com ",
      message: " Question ",
      admin: true,
    })
  ).toEqual(valid);
});
it.each([
  { ...valid, name: " " },
  { ...valid, email: "not-an-email" },
  { ...valid, message: "x".repeat(5001) },
  { ...valid, name: 42 },
])("rejects malformed form data %j", (body) => {
  expect(contactSchema.safeParse(body).success).toBe(false);
});
