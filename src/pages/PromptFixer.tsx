import { useState } from "react";
import { Wrench, Copy, Download, Loader2 } from "lucide-react";
import { fixPrompt, downloadTxt, getApiKey } from "@/lib/api";
import { toast } from "sonner";

const PromptFixer = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFix = async () => {
    if (!input.trim()) return toast.error("Please enter a prompt to fix.");
    if (!getApiKey("groq")) return toast.error("Please add Groq API key in Settings.");
    
    setLoading(true);
    try {
      const fixed = await fixPrompt(input);
      setResult(fixed);
      toast.success("Prompt fixed!");
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
        <Wrench className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Prompt <span className="gradient-text">Fixer</span>
        </h1>
        <p className="text-muted-foreground">Correct bad or poorly structured prompts.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Bad Prompt</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your poorly structured prompt... e.g. lotus mehendi hd beautiful"
            className="w-full h-28 rounded-lg border bg-card text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <button
          onClick={handleFix}
          disabled={loading}
          className="w-full gradient-btn py-3 text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Fixing...</> : <><Wrench className="w-4 h-4" /> Fix Prompt</>}
        </button>
      </div>

      {result && (
        <div className="glass-card p-6 mt-6 animate-fade-in-up">
          <h3 className="font-display font-semibold text-foreground mb-3">Fixed Prompt</h3>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mb-4">{result}</p>
          <div className="flex gap-3">
            <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-colors">
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button onClick={() => downloadTxt("fixed_prompt.txt", result)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download TXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptFixer;
