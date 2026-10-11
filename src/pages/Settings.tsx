import { useState, useEffect } from "react";
import { Key, CheckCircle, XCircle, ExternalLink, Trash2, Star } from "lucide-react";
import {
  PROVIDERS,
  ProviderId,
  getApiKey,
  setApiKey,
  removeApiKey,
  getConfiguredProviders,
  getPreferredProvider,
  setPreferredProvider,
} from "@/lib/api";
import { toast } from "sonner";

const Settings = () => {
  const [keys, setKeys] = useState<Record<ProviderId, string>>({
    gemini: "",
    groq: "",
    openrouter: "",
    cerebras: "",
    huggingface: "",
  });
  const [connected, setConnected] = useState<ProviderId[]>([]);
  const [preferred, setPreferred] = useState<string>("auto");

  useEffect(() => {
    const next = { ...keys };
    const conf: ProviderId[] = [];
    for (const p of PROVIDERS) {
      const k = getApiKey(p.id);
      if (k) {
        next[p.id] = k;
        conf.push(p.id);
      }
    }
    setKeys(next);
    setConnected(conf);
    setPreferred(getPreferredProvider() || "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (id: ProviderId) => {
    const key = keys[id].trim();
    if (!key) return toast.error("Please enter an API key.");
    setApiKey(id, key);
    if (!connected.includes(id)) setConnected([...connected, id]);
    const name = PROVIDERS.find((p) => p.id === id)?.name || id;
    toast.success(`${name} API key saved!`);
  };

  const remove = (id: ProviderId) => {
    removeApiKey(id);
    setKeys({ ...keys, [id]: "" });
    setConnected(connected.filter((c) => c !== id));
    if (preferred === id) {
      setPreferred("auto");
      setPreferredProvider("");
    }
    const name = PROVIDERS.find((p) => p.id === id)?.name || id;
    toast.success(`${name} API key removed.`);
  };

  const changePreferred = (value: string) => {
    setPreferred(value);
    setPreferredProvider(value === "auto" ? "" : (value as ProviderId));
  };

  const anyConnected = connected.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-foreground mb-2">
        <Key className="w-8 h-8 text-primary inline-block mr-2 -mt-1" />
        AI API <span className="gradient-text">Settings</span>
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Add a free key from <strong className="text-foreground">any one</strong> provider below —
        every tool on the site will work. Keys stay only in your browser.
      </p>

      {/* Preferred provider */}
      <div className="glass-card p-5 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Preferred provider</p>
            <p className="text-xs text-muted-foreground">Tried first; auto-fallback to others on failure</p>
          </div>
        </div>
        <select
          value={preferred}
          onChange={(e) => changePreferred(e.target.value)}
          className="rounded-lg border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="auto">Auto</option>
          {connected.map((id) => (
            <option key={id} value={id}>
              {PROVIDERS.find((p) => p.id === id)?.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {PROVIDERS.map((p) => {
          const isConnected = connected.includes(p.id);
          return (
            <div key={p.id} className="glass-card p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-semibold text-foreground">{p.name}</h3>
                <div className="flex items-center gap-1.5 text-sm">
                  {isConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-primary font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">{p.tagline}</span>
                <a
                  href={p.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  Get free key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-3">
                <input
                  value={keys[p.id]}
                  onChange={(e) => setKeys({ ...keys, [p.id]: e.target.value })}
                  type="password"
                  placeholder={p.keyPlaceholder}
                  className="flex-1 rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button onClick={() => save(p.id)} className="gradient-btn px-5 py-2.5 text-sm">
                  {isConnected ? "Update" : "Add API"}
                </button>
                {isConnected && (
                  <button
                    onClick={() => remove(p.id)}
                    aria-label={`Remove ${p.name} key`}
                    className="px-3 py-2.5 rounded-lg border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!anyConnected && (
          <div className="glass-card p-5 border-primary/30">
            <p className="text-sm text-primary font-medium">
              ⚠️ Please add an API key from any provider above to generate prompts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
