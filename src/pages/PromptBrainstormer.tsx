import { useState } from "react";
import { Lightbulb, Copy, Download, Loader2 } from "lucide-react";
import { brainstormPrompts, downloadTxt, getApiKey } from "@/lib/api";
import { toast } from "sonner";

const quantities = [10, 20, 50];

const PromptBrainstormer = () => {
  const [input, setInput] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return toast.error("Please enter a topic.");
    if (!getApiKey("groq")) return toast.error("Please add Groq API key in Settings.");
    
    setLoading(true);
    try {
      const ideas = await brainstormPrompts(input, quantity);
      setResults(ideas);
      toast.success(`Generated ${ideas.length} ideas!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyOne = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const downloadAll = () => {
    downloadTxt("brainstorm_ideas.txt", results.join("\n\n"));
    toast.success("Downloaded!");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Lightbulb className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Prompt <span className="gradient-text">Brainstormer</span>
        </h1>
        <p className="text-muted-foreground">Generate creative prompt ideas from a topic.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Topic</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter topic... e.g. tattoo ideas"
            className="w-full rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Lightbulb className="w-4 h-4" /> Generate Ideas</>}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">{results.length} Ideas</h3>
            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download All
            </button>
          </div>
          {results.map((r, i) => (
            <div key={i} className="glass-card p-4 flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground flex-1">{r}</p>
              <button onClick={() => copyOne(r)} className="p-2 rounded-lg hover:bg-muted transition-colors text-primary">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptBrainstormer;
