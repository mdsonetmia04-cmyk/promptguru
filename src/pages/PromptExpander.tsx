import { useState } from "react";
import { Maximize2, Copy, Download, Loader2 } from "lucide-react";
import { expandPrompt, downloadTxt, getApiKey } from "@/lib/api";
import { toast } from "sonner";

const detailLevels = ["Medium", "Detailed", "Ultra Detailed"];

const PromptExpander = () => {
  const [input, setInput] = useState("");
  const [level, setLevel] = useState("Detailed");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExpand = async () => {
    if (!input.trim()) return toast.error("Please enter a prompt.");
    if (!getApiKey("groq")) return toast.error("Please add Groq API key in Settings.");
    
    setLoading(true);
    try {
      const expanded = await expandPrompt(input, level.toLowerCase().replace(" ", "-"));
      setResult(expanded);
      toast.success("Prompt expanded!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Maximize2 className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Prompt <span className="gradient-text">Expander</span>
        </h1>
        <p className="text-muted-foreground">Convert short prompts into detailed cinematic prompts.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Short Prompt</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter short prompt... e.g. cyberpunk city"
            className="w-full rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Detail Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {detailLevels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <button
          onClick={handleExpand}
          disabled={loading}
          className="w-full gradient-btn py-3 text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Expanding...</> : <><Maximize2 className="w-4 h-4" /> Expand Prompt</>}
        </button>
      </div>

      {result && (
        <div className="glass-card p-6 mt-6 animate-fade-in-up">
          <h3 className="font-display font-semibold text-foreground mb-3">Expanded Prompt</h3>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mb-4">{result}</p>
          <div className="flex gap-3">
            <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-colors">
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button onClick={() => downloadTxt("expanded_prompt.txt", result)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download TXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptExpander;
