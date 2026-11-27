/** @jest-environment node */
import { NextRequest } from "next/server";
import { POST } from "../route";

const send = jest.fn();
jest.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({ env: { SEND_EMAIL: { send } } }),
}));
jest.mock(
  "cloudflare:email",
  () => ({
    EmailMessage: class {
      constructor(public from: string, public to: string, public raw: string) {}
    },
  }),
  { virtual: true }
);

let sequence = 0;
function request(body: unknown, raw = false, extra: Record<string, string> = {}) {
  return new NextRequest("https://example.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": `test-${sequence++}`, ...extra },
    body: raw ? String(body) : JSON.stringify(body),
  });
}
const valid = { name: "Reader", email: "reader@example.com", message: "A test only." };
beforeEach(() => {
  process.env.CONTACT_FROM = "contact@example.com";
  send.mockReset().mockResolvedValue(undefined);
});
it.each([null, [], { ...valid, name: 5 }, { ...valid, message: {} }, { ...valid, message: "  " }])(
  "rejects invalid input without sending: %j",
  async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  }
);
it("rejects malformed JSON", async () => {
  expect((await POST(request("{", true))).status).toBe(400);
  expect(send).not.toHaveBeenCalled();
});
it("sends via the Cloudflare email binding with reply-to", async () => {
  expect((await POST(request(valid))).status).toBe(200);
  const msg = send.mock.calls[0][0];
  expect(msg.from).toBe("contact@example.com");
  expect(msg.raw).toContain("Reply-To: reader@example.com");
});
it("fails when sending fails", async () => {
  send.mockRejectedValue(new Error("boom"));
  expect((await POST(request(valid))).status).toBe(500);
});
it("returns 500 when CONTACT_FROM is missing", async () => {
  delete process.env.CONTACT_FROM;
  expect((await POST(request(valid))).status).toBe(500);
});
it("uses the Cloudflare client address ahead of a supplied forwarded header", async () => {
  for (let i = 0; i < 5; i++)
    await POST(request(valid, false, { "cf-connecting-ip": "limited-client", "x-forwarded-for": String(i) }));
  expect(
    (await POST(request(valid, false, { "cf-connecting-ip": "limited-client", "x-forwarded-for": "new" }))).status
  ).toBe(429);
});
it("sets no-store and nosniff headers and allows wrangler dev origins", async () => {
  const res = await POST(request(valid, false, { origin: "http://localhost:8787" }));
  expect(res.status).toBe(200);
  expect(res.headers.get("Cache-Control")).toBe("no-store");
  expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
});
it("deduplicates repeated requests with the same Idempotency-Key", async () => {
  const headers = { "cf-connecting-ip": "idem-client", "Idempotency-Key": "key-123" };
  const first = await POST(request(valid, false, headers));
  const second = await POST(request(valid, false, headers));
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
  expect(second.headers.get("Idempotency-Key")).toBe("key-123");
  expect(send).toHaveBeenCalledTimes(1);
});
