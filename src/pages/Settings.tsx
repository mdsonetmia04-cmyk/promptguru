import { useState, useEffect } from "react";
import { Key, CheckCircle, XCircle } from "lucide-react";
import { getApiKey, setApiKey } from "@/lib/api";
import { toast } from "sonner";

const Settings = () => {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [groqConnected, setGroqConnected] = useState(false);

  useEffect(() => {
    const g = getApiKey("gemini");
    const q = getApiKey("groq");
    if (g) { setGeminiKey(g); setGeminiConnected(true); }
    if (q) { setGroqKey(q); setGroqConnected(true); }
  }, []);

  const save = (provider: "gemini" | "groq") => {
    const key = provider === "gemini" ? geminiKey : groqKey;
    if (!key.trim()) return toast.error("Please enter an API key.");
    setApiKey(provider, key.trim());
    if (provider === "gemini") setGeminiConnected(true);
    else setGroqConnected(true);
    toast.success(`${provider === "gemini" ? "Gemini" : "Groq"} API key saved!`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">
        <Key className="w-8 h-8 text-primary inline-block mr-2 -mt-1" />
        AI API <span className="gradient-text">Settings</span>
      </h1>

      <div className="space-y-6">
        {/* Gemini */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Gemini API Key</h3>
            <div className="flex items-center gap-1.5 text-sm">
              {geminiConnected ? <><CheckCircle className="w-4 h-4 text-primary" /><span className="text-primary font-medium">Connected</span></> : <><XCircle className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">Not Connected</span></>}
            </div>
          </div>
          <div className="flex gap-3">
            <input value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} type="password" placeholder="Enter Gemini API key"
              className="flex-1 rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={() => save("gemini")} className="gradient-btn px-5 py-2.5 text-sm">Add API</button>
          </div>
        </div>

        {/* Groq */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Groq API Key</h3>
            <div className="flex items-center gap-1.5 text-sm">
              {groqConnected ? <><CheckCircle className="w-4 h-4 text-primary" /><span className="text-primary font-medium">Connected</span></> : <><XCircle className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">Not Connected</span></>}
            </div>
          </div>
          <div className="flex gap-3">
            <input value={groqKey} onChange={(e) => setGroqKey(e.target.value)} type="password" placeholder="Enter Groq API key"
              className="flex-1 rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={() => save("groq")} className="gradient-btn px-5 py-2.5 text-sm">Add API</button>
          </div>
        </div>

        {!geminiConnected && !groqConnected && (
          <div className="glass-card p-5 border-primary/30">
            <p className="text-sm text-primary font-medium">⚠️ Please add an API key to generate prompts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
