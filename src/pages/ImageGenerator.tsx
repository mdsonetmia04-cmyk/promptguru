import { useState, useCallback } from "react";
import { Upload, X, Loader2, Download, Copy, Trash2, Check } from "lucide-react";
import { generatePromptFromImage, downloadTxt, downloadCsv } from "@/lib/api";
import { toast } from "sonner";

const promptTypes = [
  "Stock Photography", "AI Art", "Midjourney Prompt", "Stable Diffusion Prompt",
  "Tattoo Design Prompt", "Mehendi Design Prompt", "Cinematic Photography",
  "Product Photography", "Illustration Prompt",
];

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  base64: string;
  result?: { prompt: string; title: string; keywords: string };
  processing?: boolean;
}

const ImageGenerator = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [promptType, setPromptType] = useState(promptTypes[0]);
  const [promptLength, setPromptLength] = useState<"short" | "medium" | "detailed">("medium");
  const [includeSeo, setIncludeSeo] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    ).slice(0, 100);

    const newItems: ImageItem[] = await Promise.all(
      fileArray.map(async (file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        base64: await fileToBase64(file),
      }))
    );
    setImages((prev) => [...prev, ...newItems].slice(0, 100));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const generate = async () => {
    if (images.length === 0) return toast.error("Please upload images first.");
    setProcessing(true);
    setProgress({ current: 0, total: images.length });

    const updated = [...images];
    for (let i = 0; i < updated.length; i++) {
      setProgress({ current: i + 1, total: updated.length });
      try {
        const result = await generatePromptFromImage(updated[i].base64, promptType, promptLength, includeSeo);
        updated[i] = { ...updated[i], result };
      } catch (err: any) {
        toast.error(err.message || "Failed to generate prompt");
        break;
      }
    }
    setImages(updated);
    setProcessing(false);

    // Auto download
    const completed = updated.filter((img) => img.result);
    if (completed.length > 0) {
      const txtContent = completed.map((img, i) =>
        `Image ${i + 1}\nPrompt: ${img.result!.prompt}\nTitle: ${img.result!.title}\nKeywords: ${img.result!.keywords}\n`
      ).join("\n---\n\n");
      downloadTxt("image_prompts.txt", txtContent);

      const csvRows = completed.map((img, i) => [
        `Image ${i + 1}`, img.result!.prompt, img.result!.title, img.result!.keywords,
      ]);
      downloadCsv("image_prompts.csv", ["Image", "Prompt", "Title", "Keywords"], csvRows);
      toast.success("Prompts generated and downloaded!");
    }
  };

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">
        Bulk Image <span className="gradient-text">Prompt Generator</span>
      </h1>

      {/* Upload */}
      <div
        className="glass-card p-10 text-center cursor-pointer mb-8 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = ".jpg,.jpeg,.png,.webp";
          input.onchange = () => input.files && handleFiles(input.files);
          input.click();
        }}
      >
        <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
        <p className="text-foreground font-semibold mb-1">Drag & Drop or Click to Upload</p>
        <p className="text-sm text-muted-foreground">JPG, PNG, WEBP · Up to 100 images</p>
      </div>

      {/* Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border">
              <img src={img.preview} alt="" className="w-full aspect-square object-cover" />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="glass-card p-6 mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Prompt Type</label>
            <select value={promptType} onChange={(e) => setPromptType(e.target.value)} className="w-full rounded-lg border bg-card text-foreground px-3 py-2.5 text-sm">
              {promptTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Prompt Length</label>
            <div className="flex gap-2">
              {(["short", "medium", "detailed"] as const).map((len) => (
                <button key={len} onClick={() => setPromptLength(len)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${promptLength === len ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                >{len.charAt(0).toUpperCase() + len.slice(1)}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">SEO Elements</label>
            <button onClick={() => setIncludeSeo(!includeSeo)}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${includeSeo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >{includeSeo ? "Title & Keywords ON" : "Title & Keywords OFF"}</button>
          </div>
        </div>
      </div>

      {/* Generate */}
      <button onClick={generate} disabled={processing || images.length === 0}
        className="gradient-btn px-8 py-3.5 mb-8 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        {processing ? `Processing ${progress.current}/${progress.total}` : "Generate Prompts"}
      </button>

      {/* Results */}
      {images.some((img) => img.result) && (
        <div className="space-y-4">
          <div className="flex gap-3 mb-4">
            <button onClick={() => {
              const completed = images.filter(i => i.result);
              const txt = completed.map((img, i) => `Image ${i+1}\nPrompt: ${img.result!.prompt}\nTitle: ${img.result!.title}\nKeywords: ${img.result!.keywords}\n`).join("\n---\n\n");
              downloadTxt("image_prompts.txt", txt);
            }} className="gradient-btn px-5 py-2 text-sm flex items-center gap-2"><Download className="w-4 h-4" /> Download Again</button>
            <button onClick={() => setImages([])} className="px-5 py-2 text-sm rounded-xl border text-foreground hover:bg-muted transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear All</button>
          </div>
          {images.filter((img) => img.result).map((img, i) => (
            <div key={img.id} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <img src={img.preview} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Image {i + 1}</p>
                  <p className="text-sm text-foreground mb-2"><span className="font-semibold">Prompt:</span> {img.result!.prompt}</p>
                  {img.result!.title && <p className="text-sm text-foreground mb-1"><span className="font-semibold">Title:</span> {img.result!.title}</p>}
                  {img.result!.keywords && <p className="text-sm text-muted-foreground"><span className="font-semibold">Keywords:</span> {img.result!.keywords}</p>}
                </div>
                <button onClick={() => copyPrompt(img.id, img.result!.prompt)} className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors">
                  {copiedId === img.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
