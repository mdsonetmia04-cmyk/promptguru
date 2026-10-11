import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Download, Copy, Check, Trash2 } from "lucide-react";
import { generatePromptsFromIdea, downloadTxt, downloadCsv } from "@/lib/api";
import { toast } from "sonner";

const styles = ["Stock Image Prompt", "AI Art Prompt", "Tattoo Prompt", "Mehendi Prompt", "Realistic Photography", "Illustration Prompt"];
const tones = ["Simple", "Professional", "SEO Optimized", "Highly Detailed"];
const quantities = [10, 20, 50, 100, 200];

const IdeaGenerator = () => {
  const location = useLocation();
  const [idea, setIdea] = useState((location.state as any)?.idea || "");
  const [style, setStyle] = useState(styles[0]);
  const [tone, setTone] = useState(tones[0]);
  const [quantity, setQuantity] = useState(10);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = async () => {
    if (!idea.trim()) return toast.error("Enter a prompt idea first.");
    setLoading(true);
    try {
      const results = await generatePromptsFromIdea(idea, style, tone, quantity);
      setPrompts(results);
      // Auto download
      downloadTxt("prompt_list.txt", results.map((p, i) => `${i + 1}. ${p}`).join("\n"));
      downloadCsv("prompt_list.csv", ["#", "Prompt"], results.map((p, i) => [`${i + 1}`, p]));
      toast.success(`${results.length} prompts generated and downloaded!`);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const copy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">
        Idea to <span className="gradient-text">Prompt Generator</span>
      </h1>

      <div className="glass-card p-6 mb-8 space-y-6">
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Enter your prompt idea</label>
          <input
            value={idea} onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. lotus mehendi design"
            className="w-full rounded-lg border bg-card text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Prompt Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full rounded-lg border bg-card text-foreground px-3 py-2.5 text-sm">
              {styles.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Prompt Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-lg border bg-card text-foreground px-3 py-2.5 text-sm">
              {tones.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Quantity</label>
            <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-lg border bg-card text-foreground px-3 py-2.5 text-sm">
              {quantities.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={loading}
          className="gradient-btn px-8 py-3.5 flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {loading ? "Generating..." : "Generate Prompts"}
        </button>
      </div>

      {prompts.length > 0 && (
        <div>
          <div className="flex gap-3 mb-4">
            <button onClick={() => {
              downloadTxt("prompt_list.txt", prompts.map((p, i) => `${i+1}. ${p}`).join("\n"));
            }} className="gradient-btn px-5 py-2 text-sm flex items-center gap-2"><Download className="w-4 h-4" /> Download Again</button>
            <button onClick={() => setPrompts([])} className="px-5 py-2 text-sm rounded-xl border text-foreground hover:bg-muted transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear All</button>
          </div>
          <div className="space-y-3">
            {prompts.map((p, i) => (
              <div key={i} className="glass-card p-4 flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{i + 1}</span>
                <p className="flex-1 text-sm text-foreground">{p}</p>
                <button onClick={() => copy(i, p)} className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors">
                  {copiedIdx === i ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaGenerator;
