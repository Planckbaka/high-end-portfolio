import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ContactClient from "../ContactClient";
function fill() {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Example Reader" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "reader@example.com" } });
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "A test message that must never be sent." },
  });
}
afterEach(() => jest.restoreAllMocks());
it("retains input after an error and announces the failure", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: false, json: async () => ({ error: "Please try later." }) });
  render(<ContactClient />);
  fill();
  fireEvent.submit(screen.getByRole("form"));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Please try later."));
  expect(screen.getByLabelText("Message")).toHaveValue("A test message that must never be sent.");
});
it("blocks duplicate submissions and clears fields on success", async () => {
  let finish: (value: unknown) => void = () => {};
  global.fetch = jest.fn(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  ) as jest.Mock;
  render(<ContactClient />);
  fill();
  fireEvent.submit(screen.getByRole("form"));
  fireEvent.submit(screen.getByRole("form"));
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: /Sending/ })).toBeDisabled();
  finish({ ok: true, json: async () => ({}) });
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("Message sent successfully")
  );
  expect(screen.getByLabelText("Message")).toHaveValue("");
});
it("reuses a submission key after failure and renews it when content changes", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Retry" }) });
  render(<ContactClient />);
  fill();
  fireEvent.submit(screen.getByRole("form"));
  await waitFor(() => expect(screen.getByRole("button", { name: /Send message/ })).toBeEnabled());
  const first = (fetch as jest.Mock).mock.calls[0][1].headers["Idempotency-Key"];
  fireEvent.submit(screen.getByRole("form"));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.getByRole("button", { name: /Send message/ })).toBeEnabled());
  expect((fetch as jest.Mock).mock.calls[1][1].headers["Idempotency-Key"]).toBe(first);
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Changed message" } });
  fireEvent.submit(screen.getByRole("form"));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  expect((fetch as jest.Mock).mock.calls[2][1].headers["Idempotency-Key"]).not.toBe(first);
});
it("associates schema errors with fields and does not send invalid input", async () => {
  global.fetch = jest.fn();
  render(<ContactClient />);
  fill();
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "   " } });
  fireEvent.submit(screen.getByRole("form"));
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByLabelText("Name")).toHaveAccessibleDescription("Enter your name.");
});
