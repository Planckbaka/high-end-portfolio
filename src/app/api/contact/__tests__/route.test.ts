/** @jest-environment node */
import { NextRequest } from "next/server";
import { POST } from "../route";
let sequence = 0;
function request(body: unknown, raw = false, extra: Record<string, string> = {}) {
  return new NextRequest("https://example.com/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-connecting-ip": `test-${sequence++}`,
      ...extra,
    },
    body: raw ? String(body) : JSON.stringify(body),
  });
}
const valid = { name: "Reader", email: "reader@example.com", message: "A test only." };
const savedKey = process.env.RESEND_API_KEY;
beforeEach(() => {
  process.env.RESEND_API_KEY = "test-key";
  global.fetch = jest.fn();
});
afterEach(() => {
  if (savedKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = savedKey;
  jest.restoreAllMocks();
});
it.each([null, [], { ...valid, name: 5 }, { ...valid, message: {} }, { ...valid, message: "  " }])(
  "rejects invalid input without contacting Resend: %j",
  async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  }
);
it("rejects malformed JSON", async () => {
  expect((await POST(request("{", true))).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});
it("forwards a stable submission key and uses a bounded provider request", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true });
  expect(
    (await POST(request(valid, false, { "idempotency-key": "submission_123456789" }))).status
  ).toBe(200);
  const options = (fetch as jest.Mock).mock.calls[0][1];
  expect(options.headers["Idempotency-Key"]).toBe("contact/submission_123456789");
  expect(options.signal).toBeInstanceOf(AbortSignal);
});
it("reports provider timeouts without claiming delivery", async () => {
  (fetch as jest.Mock).mockRejectedValue(new DOMException("timeout", "TimeoutError"));
  expect((await POST(request(valid))).status).toBe(504);
});
it("uses the Cloudflare client address ahead of a supplied forwarded header", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true });
  for (let i = 0; i < 5; i++)
    await POST(
      request(valid, false, { "cf-connecting-ip": "limited-client", "x-forwarded-for": String(i) })
    );
  expect(
    (
      await POST(
        request(valid, false, { "cf-connecting-ip": "limited-client", "x-forwarded-for": "new" })
      )
    ).status
  ).toBe(429);
});
