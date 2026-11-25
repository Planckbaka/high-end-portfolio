"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
const subscribe = () => () => {};
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;
    const color = resolvedTheme === "dark" ? "#141413" : "#faf9f5";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", color));
  }, [mounted, resolvedTheme]);
  return (
    <div className="theme-switch" role="group" aria-label="Colour theme">
      {(
        [
          { value: "light", Icon: Sun },
          { value: "dark", Icon: Moon },
        ] as const
      ).map(({ value, Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={`Switch to ${value} theme`}
          aria-pressed={mounted && resolvedTheme === value}
          onClick={() => setTheme(value)}
        >
          <Icon size={14} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
