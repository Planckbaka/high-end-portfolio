"use client";

import { useState } from "react";
import type { LabFile } from "@/types";

const KIND_BADGE: Record<LabFile["kind"], string> = {
  impl: "Implementation",
  test: "Verification Suite",
  result: "Recorded Output",
};

/**
 * Interactive source & verification file stack for a lab detail page,
 * with Expand all / Collapse all controls.
 */
export function LabFileStack({ files }: { files: LabFile[] }) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(files.map((f) => [f.relativePath, Boolean(f.defaultOpen)]))
  );

  const allOpen = files.length > 0 && files.every((f) => openMap[f.relativePath]);

  function toggleAll() {
    const next = !allOpen;
    setOpenMap(Object.fromEntries(files.map((f) => [f.relativePath, next])));
  }

  return (
    <section className="lab-files-section" aria-labelledby="lab-source-files">
      <div className="lab-files-header">
        <div>
          <h2 id="lab-source-files" className="paper-sec-heading">
            Source &amp; Verification Files
          </h2>
          <span className="eyebrow">
            Primary implementation expanded · Click any file header to toggle
          </span>
        </div>
        {files.length > 1 && (
          <button
            type="button"
            className="paper-util-btn"
            onClick={toggleAll}
            aria-expanded={allOpen}
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>

      <div className="lab-file-stack">
        {files.map((file) => {
          const isOpen = Boolean(openMap[file.relativePath]);
          return (
            <details
              key={file.relativePath}
              className="lab-file-panel"
              open={isOpen}
              onToggle={(event) => {
                const target = event.currentTarget;
                setOpenMap((prev) =>
                  prev[file.relativePath] === target.open
                    ? prev
                    : { ...prev, [file.relativePath]: target.open }
                );
              }}
            >
              <summary className="lab-file-summary">
                <div className="lab-file-summary-left">
                  <span className="lab-file-kind" data-kind={file.kind}>
                    {KIND_BADGE[file.kind]}
                  </span>
                  <code className="lab-file-name">{file.name}</code>
                </div>
                <div className="lab-file-summary-right">
                  <span className="lab-file-lines">{file.lineCount} lines</span>
                  <span className="lab-file-toggle-hint" aria-hidden="true" />
                </div>
              </summary>
              <div className="lab-file-content">
                <div className="lab-file-subbar">
                  <span>/{file.relativePath}</span>
                  <a className="text-link" href={`/${file.relativePath}`} download={file.name}>
                    Raw file ↓
                  </a>
                </div>
                <div dangerouslySetInnerHTML={{ __html: file.html }} />
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
