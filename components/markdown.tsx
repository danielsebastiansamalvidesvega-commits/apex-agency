"use client";

export function SimpleMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-zinc-200">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const first = lines[0] ?? "";

        if (first.startsWith("### ")) {
          return (
            <div key={i}>
              <h4 className="mb-1 text-sm font-semibold tracking-wide text-amber-300">
                {first.replace(/^###\s+/, "")}
              </h4>
              {lines.slice(1).map((line, j) => (
                <Line key={j} text={line} />
              ))}
            </div>
          );
        }

        if (first.startsWith("## ")) {
          return (
            <div key={i}>
              <h3 className="mb-1.5 text-base font-semibold text-white">
                {first.replace(/^##\s+/, "")}
              </h3>
              {lines.slice(1).map((line, j) => (
                <Line key={j} text={line} />
              ))}
            </div>
          );
        }

        if (first.startsWith("# ")) {
          return (
            <div key={i}>
              <h2 className="mb-2 text-lg font-semibold text-white">
                {first.replace(/^#\s+/, "")}
              </h2>
              {lines.slice(1).map((line, j) => (
                <Line key={j} text={line} />
              ))}
            </div>
          );
        }

        if (lines.every((l) => /^\s*[-*]\s+/.test(l) || l.trim() === "")) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 text-zinc-300">
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li key={j}>
                    <Inline text={l.replace(/^\s*[-*]\s+/, "")} />
                  </li>
                ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\s*\d+\.\s+/.test(l) || l.trim() === "")) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5 text-zinc-300">
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li key={j}>
                    <Inline text={l.replace(/^\s*\d+\.\s+/, "")} />
                  </li>
                ))}
            </ol>
          );
        }

        if (first.startsWith("```")) {
          const code = lines.slice(1).join("\n").replace(/```$/, "");
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 text-[13px] leading-relaxed text-emerald-200"
            >
              <code>{code}</code>
            </pre>
          );
        }

        return (
          <p key={i} className="text-zinc-300">
            {lines.map((line, j) => (
              <span key={j}>
                <Inline text={line} />
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function Line({ text }: { text: string }) {
  if (!text.trim()) return null;
  if (/^\s*[-*]\s+/.test(text)) {
    return (
      <div className="flex gap-2 text-zinc-300">
        <span className="text-amber-400/80">•</span>
        <Inline text={text.replace(/^\s*[-*]\s+/, "")} />
      </div>
    );
  }
  if (/^\s*\d+\.\s+/.test(text)) {
    return (
      <div className="text-zinc-300">
        <Inline text={text} />
      </div>
    );
  }
  return (
    <p className="text-zinc-300">
      <Inline text={text} />
    </p>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-amber-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
