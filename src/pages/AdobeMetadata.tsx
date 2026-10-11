import { useState } from "react";
import { FileCheck2, Copy, Download, Image as ImageIcon, Type, Loader2, AlertTriangle } from "lucide-react";
import {
  generateAdobeMetadataFromText,
  generateAdobeMetadataFromImage,
  hasAnyApiKey,
  AdobeMetadataResult,
} from "@/lib/api";
import {
  ADOBE_CATEGORIES,
  categoryName,
  downloadAdobeCsv,
  TITLE_IDEAL,
} from "@/lib/adobe";
import { toast } from "sonner";

const AdobeMetadata = () => {
  const [mode, setMode] = useState<"text" | "image">("text");
  const [description, setDescription] = useState("");
  const [filename, setFilename] = useState("asset-001.jpg");
  const [imageBase64, setImageBase64] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdobeMetadataResult | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1] || "");
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!hasAnyApiKey()) return toast.error("Please add an API key in Settings.");
    if (mode === "text" && !description.trim()) return toast.error("Describe your asset first.");
    if (mode === "image" && !imageBase64) return toast.error("Upload an image first.");
    setLoading(true);
    setResult(null);
    try {
      const out =
        mode === "text"
          ? await generateAdobeMetadataFromText(description.trim())
          : await generateAdobeMetadataFromImage(imageBase64);
      setResult(out);
      toast.success("Adobe Stock metadata generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const downloadCsv = () => {
    if (!result) return;
    downloadAdobeCsv("adobe_stock_metadata.csv", [
      {
        filename: filename.trim() || "asset-001.jpg",
        title: result.title,
        keywords: result.keywords,
        categoryId: result.categoryId,
      },
    ]);
    toast.success("Adobe CSV downloaded!");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-foreground mb-2">
        <FileCheck2 className="w-8 h-8 text-primary inline-block mr-2 -mt-1" />
        Adobe Stock <span className="gradient-text">Metadata Generator</span>
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Titles (≤70 chars), 25–35 ordered keywords, and the right category — following Adobe's
        official contributor rules.
      </p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { id: "text", label: "From Description", icon: Type },
            { id: "image", label: "From Image", icon: ImageIcon },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === t.id
                ? "gradient-btn"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 mb-6">
        {mode === "text" ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder='Describe your asset, e.g. "A red fox running through snow at sunrise, close-up wildlife photo"'
            className="w-full rounded-lg border bg-card text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
        ) : (
          <div>
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors p-8 text-center">
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              {imagePreview ? (
                <img src={imagePreview} alt="Upload preview" className="max-h-56 mx-auto rounded-lg" />
              ) : (
                <div className="text-muted-foreground">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <p className="text-sm font-medium">Click to upload your image</p>
                  <p className="text-xs mt-1">JPG, PNG — analyzed by AI vision</p>
                </div>
              )}
            </label>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Filename (e.g. red-fox-snow.jpg)"
            className="flex-1 rounded-lg border bg-card text-foreground px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="gradient-btn px-8 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Generating..." : "Generate Metadata"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Title</h3>
              <span
                className={`text-xs font-medium ${
                  result.title.length > TITLE_IDEAL ? "text-amber-500" : "text-primary"
                }`}
              >
                {result.title.length}/{TITLE_IDEAL}
              </span>
            </div>
            <p className="text-foreground bg-muted/50 rounded-lg px-4 py-3 text-sm">{result.title}</p>
            <button
              onClick={() => copy(result.title, "Title")}
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy title
            </button>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Keywords</h3>
              <span className="text-xs font-medium text-primary">{result.keywords.length} keywords</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((k, i) => (
                <span
                  key={i}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    i < 10
                      ? "bg-primary/10 border-primary/30 text-primary font-medium"
                      : "bg-muted/60 border-border text-muted-foreground"
                  }`}
                  title={i < 10 ? "Top 10 — highest search weight" : undefined}
                >
                  {k}
                </span>
              ))}
            </div>
            <button
              onClick={() => copy(result.keywords.join(", "), "Keywords")}
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy keywords
            </button>
          </div>

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">Category</h3>
            <span className="text-sm bg-secondary/15 text-secondary-foreground border border-secondary/30 rounded-lg px-3 py-1.5 inline-block">
              {result.categoryId} — {categoryName(result.categoryId)}
            </span>
          </div>

          <button
            onClick={downloadCsv}
            className="gradient-btn-secondary px-6 py-2.5 text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Adobe CSV
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Columns: Filename, Title, Keywords, Category, Releases — matches Adobe's bulk uploader
            template.
          </p>
        </div>
      )}

      {/* Generative AI disclosure checklist */}
      <div className="glass-card p-5 border-amber-500/30">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Before you submit to Adobe Stock
        </h3>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li>☑ Tick <strong className="text-foreground">"Created using generative AI tools"</strong> in the contributor portal for AI-made assets.</li>
          <li>☑ If people or property look real but are fictional, also tick <strong className="text-foreground">"People and Property are fictional"</strong>.</li>
          <li>☑ Photo-realistic AI images → submit as <strong className="text-foreground">Photos</strong>; other AI art → <strong className="text-foreground">Illustrations</strong>. Never as Illustrative Editorial.</li>
          <li>☑ No brand names, real people, or artist styles in prompts unless you own the rights.</li>
        </ul>
      </div>

      {/* Category reference */}
      <details className="glass-card p-5 mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-foreground">
          Adobe Stock category numbers (1–21)
        </summary>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-3 text-xs text-muted-foreground">
          {ADOBE_CATEGORIES.map((c) => (
            <span key={c.id}>
              <strong className="text-foreground">{c.id}</strong> — {c.name}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
};

export default AdobeMetadata;
