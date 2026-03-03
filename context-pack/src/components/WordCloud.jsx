import React, { useMemo } from "react";

// Very small EN+FR stopword set (expand anytime)
const STOPWORDS = new Set([
  // EN
  "the","a","an","and","or","but","if","then","so","to","of","in","on","at","for","from","with","as",
  "is","are","was","were","be","been","being","it","its","this","that","these","those","i","we","you",
  "they","he","she","my","our","your","their","me","us","them","him","her",
  "do","does","did","done","have","has","had","can","could","would","should","will","just","very",
  "not","no","yes","more","most","less","least","about","into","over","under",
  // FR
  "le","la","les","un","une","des","du","de","d","et","ou","mais","si","donc","pour","par","avec","sans",
  "sur","sous","dans","chez","au","aux","ce","cet","cette","ces","ça","c","est","sont","été","être",
  "je","tu","il","elle","on","nous","vous","ils","elles","mon","ma","mes","ton","ta","tes","son","sa","ses",
  "notre","nos","votre","vos","leur","leurs",
  "ne","pas","plus","moins","très","trop","bien","mal",
]);

function normaliseToken(t) {
  return t
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/[^\p{L}\p{N}'-]+/gu, "")  // keep letters/numbers/'/-
    .replace(/^[-']+|[-']+$/g, "");
}

function makeWordFreq(texts, { minLen = 3, minCount = 2, maxWords = 60 } = {}) {
  const counts = new Map();

  for (const raw of texts) {
    if (!raw) continue;
    const tokens = String(raw)
      .split(/\s+/)
      .map(normaliseToken)
      .filter(Boolean);

    for (const tok of tokens) {
      if (tok.length < minLen) continue;
      if (STOPWORDS.has(tok)) continue;
      if (/^\d+$/.test(tok)) continue;
      // skip obvious redaction placeholders if you use them
      if (tok.includes("redacted")) continue;

      counts.set(tok, (counts.get(tok) || 0) + 1);
    }
  }

  const arr = [...counts.entries()]
    .filter(([, c]) => c >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWords)
    .map(([word, count]) => ({ word, count }));

  return arr;
}

export default function WordCloud({
  texts = [],
  title = "Word cloud",
  subtitle = "Most common words in comments",
  minCount = 2,
  maxWords = 60,
  onWordClick,
}) {
  const words = useMemo(
    () => makeWordFreq(texts, { minCount, maxWords }),
    [texts, minCount, maxWords]
  );

  const { min, max } = useMemo(() => {
    if (!words.length) return { min: 0, max: 0 };
    let mn = Infinity;
    let mx = -Infinity;
    for (const w of words) {
      mn = Math.min(mn, w.count);
      mx = Math.max(mx, w.count);
    }
    return { min: mn, max: mx };
  }, [words]);

  function sizeFor(count) {
    if (max === min) return 16;
    const t = (count - min) / (max - min); // 0..1
    return 12 + t * 22; // 12..34
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
      </div>

      {!words.length ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
          No words yet (need a few comments first).
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-2">
          {words.map(({ word, count }) => {
            const clickable = typeof onWordClick === "function";
            return (
              <button
                key={word}
                type="button"
                onClick={clickable ? () => onWordClick(word) : undefined}
                className={`rounded-full border border-white/10 bg-black/20 px-3 py-1 leading-none ${
                  clickable ? "hover:bg-white/10 cursor-pointer" : "cursor-default"
                }`}
                style={{ fontSize: `${sizeFor(count)}px` }}
                title={`${word} • ${count}`}
              >
                <span className="text-slate-100">{word}</span>
                <span className="ml-2 text-xs text-slate-400">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-xs text-slate-400">
        Based on redacted comments. Stopwords removed (EN/FR). Minimum count: {minCount}.
      </div>
    </div>
  );
}
