import { useState } from "react";
import { Languages, Copy, Download, Loader2 } from "lucide-react";
import { translatePrompt, downloadTxt, getApiKey, hasAnyApiKey } from "@/lib/api";
import { toast } from "sonner";

const languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Korean", "Chinese"];

const PromptTranslator = () => {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("Spanish");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return toast.error("Please enter a prompt.");
    if (!hasAnyApiKey()) return toast.error("Please add an API key in Settings.");
    
    setLoading(true);
    try {
      const translated = await translatePrompt(input, language);
      setResult(translated);
      toast.success("Prompt translated!");
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
        <Languages className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Prompt <span className="gradient-text">Translator</span>
        </h1>
        <p className="text-muted-foreground">Translate prompts into multiple languages.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Your Prompt</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your prompt to translate..."
            className="w-full h-28 rounded-lg border bg-card text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Target Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading}
          className="w-full gradient-btn py-3 text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</> : <><Languages className="w-4 h-4" /> Translate Prompt</>}
        </button>
      </div>

      {result && (
        <div className="glass-card p-6 mt-6 animate-fade-in-up">
          <h3 className="font-display font-semibold text-foreground mb-3">Translated Prompt ({language})</h3>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mb-4">{result}</p>
          <div className="flex gap-3">
            <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-colors">
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button onClick={() => downloadTxt(`translated_prompt_${language.toLowerCase()}.txt`, result)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download TXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptTranslator;
