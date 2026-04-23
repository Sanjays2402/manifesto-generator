"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { BroadsheetCard } from "@/components/broadsheet-card";

type Manifesto = { title: string; bullets: string[]; signoff: string };

export default function Home() {
  const [beliefs, setBeliefs] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [manifesto, setManifesto] = useState<Manifesto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    if (beliefs.some((b) => !b.trim())) {
      setError("All three, please.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/manifesto", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ beliefs }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Press jammed.");
      else setManifesto(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setManifesto(null);
    setError(null);
    setBeliefs(["", "", ""]);
  };

  const download = async () => {
    if (!cardRef.current) return;
    const png = await toPng(cardRef.current, { pixelRatio: 1, cacheBust: true });
    const a = document.createElement("a");
    a.href = png;
    a.download = `manifesto-${Date.now()}.png`;
    a.click();
  };

  const share = async () => {
    if (!manifesto) return;
    const text = `${manifesto.title}\n\n${manifesto.bullets.map((b, i) => `${String(i + 1).padStart(2, "0")}. ${b}`).join("\n")}\n\n— ${manifesto.signoff}`;
    if (navigator.share) {
      try { await navigator.share({ title: manifesto.title, text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    alert("Manifesto copied");
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* MASTHEAD — full width newspaper banner */}
      <header className="border-b-4 border-double border-ink">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="font-mono uppercase text-xs sm:text-sm tracking-[0.3em] text-ink">
            VOL. I · NO. 01
          </div>
          <div className="font-display text-3xl sm:text-5xl text-ink leading-none">
            THE BROADSHEET
          </div>
          <div className="font-mono uppercase text-xs sm:text-sm tracking-[0.3em] text-ink">
            FREE / PASS IT ON
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-3 flex items-center justify-between border-t border-ink/30 text-[11px] font-mono uppercase tracking-[0.3em] text-ink-dim">
          <span>set in lead type</span>
          <span>printed nightly</span>
          <span>by hand</span>
        </div>
      </header>

      <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <AnimatePresence mode="wait">
          {!manifesto ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-12 gap-10"
            >
              {/* LEFT COLUMN — drop-cap intro */}
              <div className="lg:col-span-5">
                <h1 className="font-display text-5xl sm:text-7xl text-ink leading-[0.9]">
                  PRINT YOUR<br/>
                  <span className="text-accent">BELIEFS.</span>
                </h1>
                <div className="h-1 bg-ink mt-4 w-24" />
                <p className="mt-6 font-mono text-ink leading-relaxed">
                  <span className="font-display text-7xl float-left mr-2 mt-1 leading-[0.7] text-accent">T</span>
                  hree things you believe in. We&rsquo;ll set them in lead type, run them through the press, and hand you a broadsheet to staple to the bulletin board.
                </p>
              </div>

              {/* RIGHT COLUMN — entry form, looks like a classified ad */}
              <form onSubmit={submit} className="lg:col-span-7 border-2 border-ink p-8 bg-bg-2/40">
                <div className="font-mono uppercase text-xs tracking-[0.4em] text-ink-dim border-b border-ink pb-2 mb-6">
                  SUBMISSIONS · DUE TONIGHT
                </div>
                <div className="space-y-5">
                  {beliefs.map((value, i) => (
                    <div key={i}>
                      <label className="block font-mono uppercase text-[10px] tracking-[0.3em] text-ink-dim mb-1">
                        BELIEF NO. {String(i + 1).padStart(2, "0")}
                      </label>
                      <input
                        type="text"
                        value={value}
                        maxLength={100}
                        onChange={(e) => {
                          const next = [...beliefs];
                          next[i] = e.target.value;
                          setBeliefs(next);
                        }}
                        placeholder={["small bookstores", "writing letters", "walking everywhere"][i]}
                        className="w-full bg-transparent border-b-2 border-ink/50 focus:border-accent px-0 py-2 text-ink font-display text-2xl placeholder-ink-dim/60 focus:outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-8 px-8 py-3 bg-ink text-bg font-mono uppercase tracking-[0.3em] text-sm hover:bg-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Setting type…" : "→ Run the press"}
                </button>
                {error && <p className="mt-4 text-sm text-rust font-mono">{error}</p>}
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-12 gap-10"
            >
              {/* LEFT — title block, like a newspaper headline */}
              <div className="lg:col-span-5">
                <div className="font-mono uppercase text-xs tracking-[0.3em] text-accent">
                  TONIGHT&rsquo;S EDITION
                </div>
                <h2 className="mt-2 font-display text-5xl sm:text-6xl leading-[0.9] text-ink">
                  {manifesto.title}
                </h2>
                <div className="h-0.5 bg-ink mt-4 w-32" />
                <p className="mt-6 font-display italic text-2xl text-accent-2 leading-snug">
                  — {manifesto.signoff}
                </p>

                <div className="mt-10 flex flex-wrap gap-2">
                  <button onClick={download} className="inline-flex items-center gap-2 bg-ink px-5 py-3 text-bg font-mono uppercase text-xs tracking-[0.3em] hover:bg-accent transition">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <button onClick={share} className="inline-flex items-center gap-2 border-2 border-ink px-5 py-3 text-ink font-mono uppercase text-xs tracking-[0.3em] hover:bg-ink hover:text-bg transition">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </button>
                  <button onClick={reset} className="inline-flex items-center gap-2 border-2 border-ink px-5 py-3 text-ink font-mono uppercase text-xs tracking-[0.3em] hover:bg-ink hover:text-bg transition">
                    <RefreshCw className="h-3.5 w-3.5" /> Reset press
                  </button>
                </div>
              </div>

              {/* RIGHT — the bulletins, in a numbered list with column rules */}
              <ol className="lg:col-span-7 space-y-5 lg:border-l-2 lg:border-ink lg:pl-10">
                {manifesto.bullets.map((b, i) => (
                  <li key={i} className="flex gap-4 items-start pb-5 border-b border-ink/20 last:border-b-0">
                    <span className="font-display text-accent text-5xl leading-none w-12 text-right flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-lg leading-snug text-ink pt-1">
                      {b}
                    </span>
                  </li>
                ))}
              </ol>

              <div aria-hidden style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}>
                <BroadsheetCard ref={cardRef} {...manifesto} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="border-t-2 border-ink mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center font-mono uppercase text-[11px] tracking-[0.4em] text-ink-dim">
          📜 manifesto-generator · all bulletins are opinions · staple this anywhere
        </div>
      </footer>
    </main>
  );
}
