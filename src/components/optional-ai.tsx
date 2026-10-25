"use client";
import { useEffect, useState } from "react";
import type { Report, Field } from "@/lib/engine";
import { labels } from "@/lib/engine";
import type { AiOutput } from "@/lib/ai";
export default function OptionalAi({ report }: { report: Report }) {
  const [config, setConfig] = useState<{
      enabled: boolean;
      provider: string;
    }>(),
    [consent, setConsent] = useState(false),
    [language, setLanguage] = useState("en"),
    [output, setOutput] = useState<AiOutput>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/ai")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setError("Unable to read model configuration."));
  }, []);
  async function run() {
    setBusy(true);
    setOutput(undefined);
    setError("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: report.original,
          revised: report.revised,
          fictional: consent,
          language,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOutput(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI unavailable.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card">
      <h2>Optional model interpretation</h2>
      <p>
        {config?.enabled
          ? `Configured provider: ${config.provider === "ollama" ? "Ollama on the application server" : "Gemini (Google cloud)"}.`
          : "No model is enabled. Current findings come from local deterministic processing, not AI inference."}{" "}
        Model output stays separate from the extracted document facts.
      </p>
      <p>
        {config?.provider === "ollama"
          ? "Requests go to Ollama on the application server. For a local installation, inference runs on your computer."
          : "Enabling Gemini sends both document texts to Google. Use only a project without billing and eligible free-tier access."}
      </p>
      <label>
        Explanation language
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="bn">বাংলা / Bangla</option>
        </select>
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />{" "}
        These are fictional or non-sensitive test documents; I consent to
        sending them to the configured model.
      </label>
      <button
        className="button secondary"
        disabled={!config?.enabled || !consent || busy}
        onClick={() => void run()}
      >
        {busy ? "Model is analyzing…" : "Generate grounded interpretation"}
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {output && (
        <div>
          <p className="warning">
            AI INTERPRETATION — unverified. Exact quote matching does not
            establish semantic correctness. Not saved into the deterministic
            report.
          </p>
          {output.facts.map((f, i) => (
            <details key={i}>
              <summary>
                {labels[f.field as Field]}: {f.value}
              </summary>
              <blockquote>
                {f.quote}
                <cite>
                  {f.document === "original"
                    ? report.original.title
                    : report.revised.title}
                </cite>
              </blockquote>
            </details>
          ))}
          {output.interpretations.map((item, i) => (
            <article className="card" key={i}>
              <p>{item.explanation}</p>
              <p className="warning">{item.uncertainty}</p>
              <div className="two">
                <blockquote>{item.originalQuote}</blockquote>
                <blockquote>{item.revisedQuote}</blockquote>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
