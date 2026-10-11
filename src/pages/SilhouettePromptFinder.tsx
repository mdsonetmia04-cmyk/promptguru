import { useState } from "react";
import { CircleDot, Copy, Download, Star, Loader2 } from "lucide-react";
import { generateSilhouettePrompts, downloadTxt, getApiKey, hasAnyApiKey } from "@/lib/api";
import { toast } from "sonner";

const styles = ["Vector Silhouette", "Minimal Silhouette", "Dynamic Silhouette", "Logo Style Silhouette", "Illustration Silhouette"];
const quantities = [5, 10, 20, 50];

const SilhouettePromptFinder = () => {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState(styles[0]);
  const [quantity, setQuantity] = useState(10);
  const [results, setResults] = useState<{ text: string; favorite: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return toast.error("Please enter a topic/object.");
    if (!hasAnyApiKey()) return toast.error("Please add an API key in Settings.");
    
    setLoading(true);
    try {
      const prompts = await generateSilhouettePrompts(input, style, quantity);
      setResults(prompts.map((text) => ({ text, favorite: false })));
      toast.success(`Generated ${prompts.length} silhouette prompts!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (index: number) => {
    setResults((prev) => prev.map((r, i) => i === index ? { ...r, favorite: !r.favorite } : r));
  };

  const copyOne = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const downloadAll = () => {
    downloadTxt("silhouette_prompts.txt", results.map((r) => r.text).join("\n\n"));
    toast.success("Downloaded!");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <CircleDot className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Fresh Black <span className="gradient-text">Silhouette</span> Prompt Generator
        </h1>
        <p className="text-muted-foreground">Generate stock-ready silhouette prompts instantly.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Topic / Object</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. cat, lion, football player, tree, bird flying"
            className="w-full rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Prompt Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {styles.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
          <div className="flex gap-2">
            {quantities.map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${quantity === q ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full gradient-btn py-3 text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating silhouette prompts...</> : <><CircleDot className="w-4 h-4" /> Generate Silhouette Prompts</>}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">{results.length} Silhouette Prompts</h3>
            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download All
            </button>
          </div>
          {results.map((r, i) => (
            <div key={i} className="glass-card p-4 flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground flex-1">{r.text}</p>
              <div className="flex gap-1">
                <button onClick={() => toggleFavorite(i)} className={`p-2 rounded-lg hover:bg-muted transition-colors ${r.favorite ? "text-yellow-500" : "text-muted-foreground"}`}>
                  <Star className="w-4 h-4" fill={r.favorite ? "currentColor" : "none"} />
                </button>
                <button onClick={() => copyOne(r.text)} className="p-2 rounded-lg hover:bg-muted transition-colors text-primary">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SilhouettePromptFinder;
