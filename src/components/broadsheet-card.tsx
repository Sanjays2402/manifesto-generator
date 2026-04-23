"use client";

import { forwardRef } from "react";

type Props = { title: string; bullets: string[]; signoff: string };

export const BroadsheetCard = forwardRef<HTMLDivElement, Props>(function BroadsheetCard(
  { title, bullets, signoff },
  ref
) {
  return (
    <div
      ref={ref}
      style={{ width: 1080, height: 1350 }}
      className="relative overflow-hidden flex flex-col"
    >
      {/* paper bg */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 0%, rgba(194,65,12,0.06), transparent 60%), linear-gradient(180deg, #f1ead7 0%, #e7dfc4 100%)",
        }}
      />
      {/* paper grain */}
      <div
        className="absolute inset-0 opacity-[0.10] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* deckle edge frame */}
      <div className="absolute" style={{ inset: 60, border: "2px solid #1a1612" }} />
      <div className="absolute" style={{ inset: 70, border: "1px solid #1a1612" }} />

      <div className="relative z-10 flex-1 flex flex-col px-28 py-28">
        {/* masthead */}
        <div className="flex items-center justify-between border-b-2 border-ink pb-4">
          <div className="font-mono uppercase text-ink" style={{ fontSize: 18, letterSpacing: "0.4em" }}>
            BROADSHEET № 01
          </div>
          <div className="font-mono uppercase text-ink" style={{ fontSize: 18, letterSpacing: "0.4em" }}>
            FREE / PASS IT ON
          </div>
        </div>

        {/* title */}
        <h2
          className="font-display text-ink mt-12 leading-none"
          style={{ fontSize: 110, letterSpacing: "0.02em" }}
        >
          {title}
        </h2>
        <div className="h-1 bg-ink mt-6 w-32" />

        {/* bullets */}
        <ol className="mt-12 space-y-6 list-none flex-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-6 items-start">
              <span
                className="font-display text-accent flex-shrink-0"
                style={{ fontSize: 56, lineHeight: 1, marginTop: -8 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="font-mono text-ink"
                style={{ fontSize: 36, lineHeight: 1.35 }}
              >
                {b}
              </span>
            </li>
          ))}
        </ol>

        {/* signoff */}
        <div className="mt-12 pt-8 border-t-2 border-ink">
          <p
            className="font-display italic text-accent-2"
            style={{ fontSize: 38, lineHeight: 1.3 }}
          >
            — {signoff}
          </p>
          <div
            className="mt-6 font-mono uppercase text-ink-dim"
            style={{ fontSize: 16, letterSpacing: "0.4em" }}
          >
            📜 manifesto-generator · print and post
          </div>
        </div>
      </div>
    </div>
  );
});
