"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Share2, Megaphone } from "lucide-react";
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
      try {
        await navigator.share({ title: manifesto.title, text });
        return;
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(text);
    alert("Manifesto copied");
  };

  return (
    <main className="flex-1 flex flex-col">
      <header className="px-6 pt-12 sm:pt-20 pb-2 text-center">
        <div className="inline-flex items-center gap-2 mb-6 text-xs font-mono text-accent uppercase tracking-[0.4em]">
          <Megaphone className="h-3 w-3" /> broadsheet generator
        </div>
        <h1 className="text-4xl sm:text-6xl tracking-tight text-ink font-display leading-tight">
          PRINT YOUR <span className="text-accent">BELIEFS</span>.
        </h1>
        <p className="mt-4 text-ink-dim max-w-md mx-auto font-mono">
          Three things you believe in. We&rsquo;ll write the broadsheet.
        </p>
      </header>

      <section className="flex-1 px-6 py-12">
        <AnimatePresence mode="wait">
          {!manifesto ? (
            <motion.form
              key="input"
              onSubmit={submit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl mx-auto space-y-3"
            >
              {beliefs.map((value, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-display text-accent text-3xl w-10 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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
                    className="flex-1 bg-bg-2/60 border border-ink/20 rounded-xl px-4 py-3 text-ink placeholder-ink-dim font-mono focus:border-accent focus:outline-none"
                  />
                </div>
              ))}
              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-accent text-bg font-semibold hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed font-mono uppercase tracking-widest"
                >
                  {loading ? "Setting type…" : "Print it"}
                </button>
              </div>
              {error && <p className="mt-4 text-center text-sm text-rust font-mono">{error}</p>}
            </motion.form>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl mx-auto"
            >
              <div
                className="rounded-lg p-8 text-ink"
                style={{
                  background: "linear-gradient(180deg, #f1ead7 0%, #e7dfc4 100%)",
                  border: "2px solid #1a1612",
                  boxShadow: "0 12px 30px rgba(26,22,18,0.18)",
                }}
              >
                <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                  <div className="font-mono uppercase text-xs tracking-[0.4em]">BROADSHEET № 01</div>
                  <div className="font-mono uppercase text-xs tracking-[0.4em]">FREE / PASS IT ON</div>
                </div>
                <h2 className="mt-6 font-display text-4xl sm:text-5xl leading-none">
                  {manifesto.title}
                </h2>
                <div className="h-0.5 bg-ink mt-3 w-16" />
                <ol className="mt-6 space-y-3">
                  {manifesto.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="font-display text-accent text-2xl w-8 text-right leading-none mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono leading-snug">{b}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 pt-4 border-t-2 border-ink">
                  <p className="font-display italic text-accent-2 text-lg">— {manifesto.signoff}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button onClick={download} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-bg font-semibold hover:bg-accent-2 transition font-mono uppercase tracking-wider">
                  <Download className="h-4 w-4" /> Download
                </button>
                <button onClick={share} className="inline-flex items-center gap-2 rounded-xl border border-ink/30 px-5 py-3 text-ink hover:border-accent hover:text-accent transition font-mono uppercase tracking-wider">
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-ink/30 px-5 py-3 text-ink hover:border-accent hover:text-accent transition font-mono uppercase tracking-wider">
                  <RefreshCw className="h-4 w-4" /> Reset press
                </button>
              </div>

              <div aria-hidden style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}>
                <BroadsheetCard ref={cardRef} {...manifesto} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-ink-dim font-mono uppercase tracking-widest">
        📜 manifesto-generator · print &amp; post
      </footer>
    </main>
  );
}
