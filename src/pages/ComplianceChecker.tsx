import { useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { scoreMetadata, parseKeywordInput, MetadataScore } from "@/lib/adobe";

const levelIcon = (level: "pass" | "warn" | "fail") =>
  level === "pass" ? (
    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
  ) : level === "warn" ? (
    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
  ) : (
    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
  );

const ComplianceChecker = () => {
  const [title, setTitle] = useState("");
  const [keywordsRaw, setKeywordsRaw] = useState("");
  const [result, setResult] = useState<MetadataScore | null>(null);
  const [checking, setChecking] = useState(false);

  const check = () => {
    setChecking(true);
    // tiny delay so the UI feels responsive
    setTimeout(() => {
      setResult(scoreMetadata(title, parseKeywordInput(keywordsRaw)));
      setChecking(false);
    }, 250);
  };

  const scoreColor =
    !result || result.score >= 80
      ? "text-green-500"
      : result.score >= 50
      ? "text-amber-500"
      : "text-red-500";

  const scoreBar =
    !result || result.score >= 80
      ? "bg-green-500"
      : result.score >= 50
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-foreground mb-2">
        <ShieldCheck className="w-8 h-8 text-primary inline-block mr-2 -mt-1" />
        Adobe Stock <span className="gradient-text">Compliance Checker</span>
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Paste your title and keywords — get an instant Adobe-readiness score with fix tips.
      </p>

      <div className="glass-card p-6 mb-6">
        <label className="text-sm font-semibold text-foreground mb-2 flex justify-between">
          Title
          <span className={`text-xs font-medium ${title.length > 70 ? "text-amber-500" : "text-muted-foreground"}`}>
            {title.length}/200
          </span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Red fox running through fresh snow at sunrise"
          className="w-full rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
        />
        <label className="text-sm font-semibold text-foreground mb-2 flex justify-between">
          Keywords
          <span className="text-xs font-medium text-muted-foreground">
            {parseKeywordInput(keywordsRaw).length}/49
          </span>
        </label>
        <textarea
          value={keywordsRaw}
          onChange={(e) => setKeywordsRaw(e.target.value)}
          rows={4}
          placeholder="fox, red fox, wildlife, snow, winter, sunrise… (comma or line separated)"
          className="w-full rounded-lg border bg-card text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        <button
          onClick={check}
          disabled={checking}
          className="gradient-btn px-8 py-2.5 text-sm mt-4 flex items-center gap-2 disabled:opacity-60"
        >
          {checking && <Loader2 className="w-4 h-4 animate-spin" />}
          {checking ? "Checking..." : "Check Compliance"}
        </button>
      </div>

      {result && (
        <div className="glass-card p-6 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-5">
            <div className={`text-5xl font-display font-bold ${scoreColor}`}>{result.score}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Adobe-readiness score</p>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${scoreBar}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {result.score >= 80
                  ? "Ready to submit — just double-check the warnings."
                  : result.score >= 50
                  ? "Needs fixes before submitting."
                  : "High rejection risk — fix the failures first."}
              </p>
            </div>
          </div>
          <div className="space-y-2.5">
            {result.checks.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                {levelIcon(c.level)}
                <span
                  className={
                    c.level === "pass"
                      ? "text-muted-foreground"
                      : c.level === "warn"
                      ? "text-foreground"
                      : "text-foreground font-medium"
                  }
                >
                  {c.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceChecker;
