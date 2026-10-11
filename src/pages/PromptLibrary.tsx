import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Copy, Check } from "lucide-react";

const categories: Record<string, string[]> = {
  "Photography Prompts": [
    "A serene lake surrounded by autumn trees reflecting golden foliage",
    "Street photography of a bustling night market with neon lights",
    "Macro shot of morning dew on a spider web with bokeh background",
  ],
  "Tattoo Prompts": [
    "Japanese koi fish swimming upstream with cherry blossom petals",
    "Geometric wolf head with sacred geometry patterns",
    "Minimalist mountain range with dotwork shading technique",
  ],
  "Mehendi Prompts": [
    "Intricate paisley mehendi pattern with lotus centerpiece for bridal hands",
    "Arabic style mehendi with bold floral trails and negative space",
    "Modern geometric mehendi design with mandala elements",
  ],
  "Nature Prompts": [
    "Misty forest path with sunbeams filtering through ancient trees",
    "Dramatic thunderstorm over lavender fields at sunset",
    "Crystal clear turquoise waterfall in a tropical jungle",
  ],
  "Product Prompts": [
    "Luxury perfume bottle on marble surface with rose petals",
    "Minimal coffee cup flatlay with beans and linen texture",
    "Elegant watch on dark slate with dramatic side lighting",
  ],
  "Portrait Prompts": [
    "Cinematic portrait with dramatic Rembrandt lighting and smoke",
    "Fashion editorial portrait with bold colors and geometric shadows",
    "Environmental portrait of artisan in their workshop",
  ],
  "Fantasy Prompts": [
    "Enchanted forest with glowing mushrooms and fairy dust particles",
    "Dragon perched on crystal mountain under aurora borealis",
    "Underwater mermaid city with bioluminescent coral architecture",
  ],
  "Cinematic Prompts": [
    "Film noir scene with rain-slicked streets and neon reflections",
    "Epic wide shot of lone warrior on desert dunes at golden hour",
    "Cyberpunk alleyway with holographic advertisements and steam",
  ],
  "YouTube Thumbnail Prompts": [
    "Shocked face reaction with explosive colorful background",
    "Split comparison before-after with bold arrow pointing right",
    "Top 10 list layout with eye-catching gradient numbers",
  ],
  "Stock Image Prompts": [
    "Diverse team collaborating around laptop in modern office space",
    "Happy family having breakfast at sunlit kitchen table",
    "Professional handshake in corporate meeting room setting",
  ],
};

const PromptLibrary = () => {
  const [selectedCat, setSelectedCat] = useState(Object.keys(categories)[0]);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const navigate = useNavigate();

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(key);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const useAsIdea = (text: string) => {
    navigate("/idea-generator", { state: { idea: text } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">
        <BookOpen className="w-8 h-8 text-primary inline-block mr-2 -mt-1" />
        Prompt <span className="gradient-text">Library</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="glass-card p-3 space-y-1 lg:sticky lg:top-24">
            {Object.keys(categories).map((cat) => (
              <button key={cat} onClick={() => setSelectedCat(cat)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedCat === cat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {categories[selectedCat].map((prompt, i) => {
            const key = `${selectedCat}-${i}`;
            return (
              <div key={key} className="glass-card p-5 flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{i + 1}</span>
                <p className="flex-1 text-sm text-foreground">{prompt}</p>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => useAsIdea(prompt)} className="px-3 py-1.5 text-xs rounded-lg bg-accent text-accent-foreground hover:bg-primary/10 transition-colors font-medium">Use</button>
                  <button onClick={() => copy(key, prompt)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    {copiedIdx === key ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PromptLibrary;
