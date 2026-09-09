// Verify the built application in workerd. Never submit a valid contact message.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const requestedPort = Number(process.env.WORKER_CHECK_PORT || 0);
assert(
  Number.isInteger(requestedPort) && requestedPort >= 0 && requestedPort < 65536,
  "Invalid test port"
);
const reservation = createServer();
await new Promise((resolve, reject) => {
  reservation.once("error", reject);
  reservation.listen(requestedPort, "127.0.0.1", resolve);
});
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const directory = await mkdtemp(path.join(tmpdir(), "blog-worker-check-"));
const base = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  [
    "node_modules/wrangler/bin/wrangler.js",
    "dev",
    "--local",
    "--env",
    "",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
    "--persist-to",
    directory,
  ],
  {
    stdio: ["ignore", "ignore", "ignore"],
    env: {
      ...process.env,
      WRANGLER_SEND_METRICS: "false",
      WRANGLER_LOG_PATH: path.join(directory, "wrangler.log"),
    },
  }
);
let exited = false;
const closed = new Promise((resolve) =>
  child.once("exit", () => {
    exited = true;
    resolve();
  })
);
child.on("error", () => {
  exited = true;
});
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (exited) throw new Error("Local Worker exited before startup");
    try {
      const r = await fetch(base + "/contact", { signal: AbortSignal.timeout(1000) });
      if (r.status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await delay(1000);
  }
  assert(ready, "Local Worker did not become ready");
  for (const route of [
    "/",
    "/articles",
    "/series/reliable-model-systems",
    "/articles/kv-cache-tiny-decoder",
    "/contact",
    "/labs/engineering-labs.zip",
  ]) {
    const r = await fetch(base + route, { signal: AbortSignal.timeout(10000) });
    assert.equal(r.status, 200, route);
    await r.arrayBuffer();
  }
  const feed = await fetch(base + "/feed.xml");
  assert.equal(feed.status, 200);
  assert.match(feed.headers.get("content-type") || "", /application\/rss\+xml/);
  assert.equal(((await feed.text()).match(/<item>/g) || []).length, 18);
  for (const body of [
    "{",
    "null",
    '{"name":42,"email":"reader@example.com","message":"invalid input"}',
  ]) {
    const r = await fetch(base + "/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    assert.equal(r.status, 400, "Invalid contact payload must not reach provider");
  }
  console.log(
    "Workers runtime: pages, six-part series, 18-item RSS, archive and invalid contact requests pass. No email sent."
  );
} finally {
  if (!exited) child.kill("SIGTERM");
  await Promise.race([closed, delay(3000)]);
  if (!exited) {
    child.kill("SIGKILL");
    await closed;
  }
  await rm(directory, { recursive: true, force: true });
}
