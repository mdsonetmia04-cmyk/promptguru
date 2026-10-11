// ---------------------------------------------------------------------------
// PromptGuru AI provider engine
// Any ONE configured provider key makes every tool on the site work.
// Providers are tried in priority order (preferred provider first) and the
// engine automatically falls through to the next one on failure.
// ---------------------------------------------------------------------------

export type ProviderId = "gemini" | "groq" | "openrouter" | "cerebras" | "huggingface";

export interface ProviderDef {
  id: ProviderId;
  name: string;
  tagline: string;
  keyUrl: string;
  keyPlaceholder: string;
  supportsVision: boolean;
}

export const PROVIDERS: ProviderDef[] = [
  {
    id: "gemini",
    name: "Gemini",
    tagline: "Free tier • text + image",
    keyUrl: "https://aistudio.google.com/apikey",
    keyPlaceholder: "Enter Gemini API key",
    supportsVision: true,
  },
  {
    id: "groq",
    name: "Groq",
    tagline: "Free tier • ultra-fast",
    keyUrl: "https://console.groq.com/keys",
    keyPlaceholder: "Enter Groq API key",
    supportsVision: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    tagline: "Free :free models",
    keyUrl: "https://openrouter.ai/keys",
    keyPlaceholder: "Enter OpenRouter API key",
    supportsVision: true,
  },
  {
    id: "cerebras",
    name: "Cerebras",
    tagline: "Free tier • fastest inference",
    keyUrl: "https://cloud.cerebras.ai/",
    keyPlaceholder: "Enter Cerebras API key",
    supportsVision: false,
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    tagline: "Free serverless inference",
    keyUrl: "https://huggingface.co/settings/tokens",
    keyPlaceholder: "Enter Hugging Face token (read access)",
    supportsVision: false,
  },
];

// ------------------------- Key storage (browser only) ------------------------

export const getApiKey = (provider: ProviderId): string | null => {
  return localStorage.getItem(`${provider}_api_key`);
};

export const setApiKey = (provider: ProviderId, key: string) => {
  localStorage.setItem(`${provider}_api_key`, key.trim());
};

export const removeApiKey = (provider: ProviderId) => {
  localStorage.removeItem(`${provider}_api_key`);
};

export const getConfiguredProviders = (): ProviderId[] =>
  PROVIDERS.filter((p) => getApiKey(p.id)).map((p) => p.id);

export const hasAnyApiKey = (): boolean => getConfiguredProviders().length > 0;

export const getPreferredProvider = (): ProviderId | null =>
  (localStorage.getItem("preferred_provider") as ProviderId) || null;

export const setPreferredProvider = (id: ProviderId | "") => {
  if (id) localStorage.setItem("preferred_provider", id);
  else localStorage.removeItem("preferred_provider");
};

const providerName = (id: ProviderId): string =>
  PROVIDERS.find((p) => p.id === id)?.name || id;

const DEFAULT_PRIORITY: ProviderId[] = ["gemini", "groq", "openrouter", "cerebras", "huggingface"];

function orderedProviders(vision: boolean): ProviderId[] {
  const configured = new Set(getConfiguredProviders());
  const list = DEFAULT_PRIORITY.filter(
    (id) =>
      configured.has(id) &&
      (!vision || PROVIDERS.find((p) => p.id === id)?.supportsVision)
  );
  const preferred = getPreferredProvider();
  if (preferred && list.includes(preferred)) {
    return [preferred, ...list.filter((id) => id !== preferred)];
  }
  return list;
}

// ------------------------- Low-level provider calls ------------------------

async function readJsonSafe(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extractOpenAIText(data: any): string {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content;
  if (Array.isArray(content)) {
    const joined = content.map((p: any) => p?.text || "").join("");
    if (joined.trim()) return joined;
  }
  const err = data?.error;
  throw new Error(typeof err === "string" ? err : err?.message || "Empty response from provider");
}

async function callOpenAIChat(
  url: string,
  key: string,
  models: string[],
  messages: any[],
  extraHeaders: Record<string, string> = {},
  maxTokens = 4096
): Promise<string> {
  let lastError: unknown = new Error("No models configured");
  for (const model of models) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          ...extraHeaders,
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        throw new Error(data?.error?.message || `Request failed (${res.status})`);
      }
      return extractOpenAIText(data);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

async function callGemini(key: string, prompt: string, imageBase64?: string): Promise<string> {
  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    }
  );
  const data = await readJsonSafe(res);
  if (!res.ok || data?.error) {
    throw new Error(data?.error?.message || `Gemini request failed (${res.status})`);
  }
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p?.text || "")
      .join("") || "";
  if (!text.trim()) throw new Error("Gemini returned an empty response");
  return text;
}

async function callHuggingFace(key: string, prompt: string): Promise<string> {
  const models = ["mistralai/Mistral-7B-Instruct-v0.3", "HuggingFaceH4/zephyr-7b-beta"];
  let lastError: unknown = new Error("No models configured");
  for (const model of models) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 2048, return_full_text: false, temperature: 0.7 },
        }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : `Request failed (${res.status})`
        );
      }
      const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
      if (typeof text === "string" && text.trim()) return text.trim();
      throw new Error("Empty response from provider");
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

const appReferer =
  typeof window !== "undefined" ? window.location.origin : "https://promptguru.app";

type TextCaller = (key: string, prompt: string) => Promise<string>;
type VisionCaller = (key: string, systemPrompt: string, imageBase64: string) => Promise<string>;

const TEXT_CALLERS: Record<ProviderId, TextCaller> = {
  gemini: (key, prompt) => callGemini(key, prompt),
  groq: (key, prompt) =>
    callOpenAIChat(
      "https://api.groq.com/openai/v1/chat/completions",
      key,
      ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
      [{ role: "user", content: prompt }]
    ),
  openrouter: (key, prompt) =>
    callOpenAIChat(
      "https://openrouter.ai/api/v1/chat/completions",
      key,
      ["meta-llama/llama-3.3-70b-instruct:free", "google/gemma-3-27b-it:free"],
      [{ role: "user", content: prompt }],
      { "HTTP-Referer": appReferer, "X-Title": "PromptGuru" }
    ),
  cerebras: (key, prompt) =>
    callOpenAIChat(
      "https://api.cerebras.ai/v1/chat/completions",
      key,
      ["llama-3.3-70b", "llama3.1-8b"],
      [{ role: "user", content: prompt }]
    ),
  huggingface: (key, prompt) => callHuggingFace(key, prompt),
};

const VISION_CALLERS: Partial<Record<ProviderId, VisionCaller>> = {
  gemini: (key, systemPrompt, imageBase64) => callGemini(key, systemPrompt, imageBase64),
  groq: (key, systemPrompt, imageBase64) =>
    callOpenAIChat(
      "https://api.groq.com/openai/v1/chat/completions",
      key,
      ["qwen/qwen3.6-27b"],
      [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ]
    ),
  openrouter: (key, systemPrompt, imageBase64) =>
    callOpenAIChat(
      "https://openrouter.ai/api/v1/chat/completions",
      key,
      ["google/gemma-3-27b-it:free"],
      [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      { "HTTP-Referer": appReferer, "X-Title": "PromptGuru" }
    ),
};

// ------------------------- Unified generation entry ------------------------

const NO_KEY_ERROR =
  "No API key found. Add a free key from any provider in Settings — Gemini, Groq, OpenRouter, Cerebras, or Hugging Face.";

async function generateText(prompt: string): Promise<string> {
  const providers = orderedProviders(false);
  if (!providers.length) throw new Error(NO_KEY_ERROR);
  const errors: string[] = [];
  for (const id of providers) {
    try {
      return await TEXT_CALLERS[id](getApiKey(id)!, prompt);
    } catch (e) {
      errors.push(`${providerName(id)}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(
    `All configured providers failed. ${errors.join(" | ")} Please check your keys in Settings.`
  );
}

async function generateVisionText(systemPrompt: string, imageBase64: string): Promise<string> {
  const providers = orderedProviders(true);
  if (!providers.length) {
    throw new Error(
      "No image-capable API key found. Add a Gemini, Groq, or OpenRouter key in Settings."
    );
  }
  const errors: string[] = [];
  for (const id of providers) {
    try {
      return await VISION_CALLERS[id]!(getApiKey(id)!, systemPrompt, imageBase64);
    } catch (e) {
      errors.push(`${providerName(id)}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(
    `All configured providers failed. ${errors.join(" | ")} Please check your keys in Settings.`
  );
}

// ------------------------- File downloads ----------------------------------

export const downloadTxt = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ------------------------- Tool functions ------------------------------------

export const generatePromptFromImage = async (
  imageBase64: string,
  promptType: string,
  promptLength: string,
  includeSeo: boolean
): Promise<{ prompt: string; title: string; keywords: string }> => {
  const lengthInstruction = promptLength === "short" ? "Keep it under 50 words." : promptLength === "medium" ? "Keep it around 100 words." : "Make it very detailed, around 200 words.";
  const seoInstruction = includeSeo ? "Also generate a short SEO-friendly title and 10 relevant keywords separated by commas." : "";
  const systemPrompt = `You are an expert AI prompt engineer. Generate a ${promptType} prompt for the given image. ${lengthInstruction} ${seoInstruction} Return in this exact format:\nPrompt: <prompt>\nTitle: <title>\nKeywords: <keywords>`;
  const text = await generateVisionText(systemPrompt, imageBase64);
  return parsePromptResponse(text);
};

export const generatePromptsFromIdea = async (
  idea: string,
  style: string,
  tone: string,
  quantity: number
): Promise<string[]> => {
  const systemPrompt = `You are an expert AI prompt engineer. Generate exactly ${quantity} unique ${style} prompts based on this idea: "${idea}". Tone: ${tone}. Return each prompt on a new line, numbered like:\n1. <prompt>\n2. <prompt>`;
  const text = await generateText(systemPrompt);
  return parseIdeaResponse(text);
};

export const improvePrompt = async (prompt: string, style: string): Promise<string> => {
  const instruction = `You are an expert AI prompt engineer. Rewrite this ${style} prompt to make it more detailed, professional and optimized for AI image generation. Only return the improved prompt, nothing else.\n\nOriginal prompt: "${prompt}"`;
  return await generateText(instruction);
};

export const generateVariations = async (basePrompt: string, quantity: number): Promise<string[]> => {
  const instruction = `Generate exactly ${quantity} unique creative variations of this prompt. Each variation should be different in style, mood, or approach while keeping the core concept. Return only the prompts, one per line, numbered like:\n1. <prompt>\n2. <prompt>\n\nBase prompt: "${basePrompt}"`;
  const text = await generateText(instruction);
  return parseIdeaResponse(text);
};

export const expandPrompt = async (prompt: string, detailLevel: string): Promise<string> => {
  const levelDesc = detailLevel === "medium" ? "moderately detailed" : detailLevel === "detailed" ? "highly detailed" : "extremely detailed and cinematic";
  const instruction = `Expand this short prompt into a ${levelDesc} AI art prompt. Include environment, lighting, style, mood, composition, and artistic details. Only return the expanded prompt, nothing else.\n\nShort prompt: "${prompt}"`;
  return await generateText(instruction);
};

export const fixPrompt = async (prompt: string): Promise<string> => {
  const instruction = `Correct and optimize this poorly structured prompt for AI image generation. Fix grammar, structure, and make it professional. Only return the fixed prompt, nothing else.\n\nBad prompt: "${prompt}"`;
  return await generateText(instruction);
};

export const translatePrompt = async (prompt: string, targetLanguage: string): Promise<string> => {
  const instruction = `Translate this AI image generation prompt to ${targetLanguage}. Preserve the prompt structure and technical terms. Only return the translated prompt, nothing else.\n\nPrompt: "${prompt}"`;
  return await generateText(instruction);
};

export const brainstormPrompts = async (topic: string, quantity: number): Promise<string[]> => {
  const instruction = `Generate exactly ${quantity} creative AI image prompt ideas related to this topic. Make them diverse and inspiring. Return only the ideas, one per line, numbered like:\n1. <idea>\n2. <idea>\n\nTopic: "${topic}"`;
  const text = await generateText(instruction);
  return parseIdeaResponse(text);
};

export const generateSilhouettePrompts = async (topic: string, style: string, quantity: number): Promise<string[]> => {
  const instruction = `Generate exactly ${quantity} professional AI image prompts for fresh black silhouette illustrations isolated on white background. Style: ${style}. Each prompt must include phrases like: fresh black silhouette, isolated on white background, clean vector style, minimal detail, crisp edges. Make them optimized for stock illustration and vector generation. Return only the prompts, one per line, numbered like:\n1. <prompt>\n2. <prompt>\n\nTopic/Object: "${topic}"`;
  const text = await generateText(instruction);
  return parseIdeaResponse(text);
};

export interface AdobeMetadataResult {
  title: string;
  keywords: string[];
  categoryId: number;
}

const ADOBE_CATEGORY_LIST = `1 Animals, 2 Buildings and Architecture, 3 Business, 4 Drinks, 5 Environment, 6 States of Mind, 7 Food, 8 Healthcare, 9 Hobbies and Leisure, 10 Industry, 11 Landscape, 12 Lifestyle, 13 People, 14 Plants and Flowers, 15 Culture and Religion, 16 Science, 17 Social Issues, 18 Sports, 19 Technology, 20 Transport, 21 Travel`;

const ADOBE_METADATA_RULES = `You are an expert Adobe Stock contributor metadata writer. Follow Adobe's official rules strictly:
- Title: ONE natural descriptive sentence, max 70 characters, NO commas, no ALL CAPS, no brand or trademark names, no people's names, no camera specs. Describe only what is visible.
- Keywords: 25 to 35 keywords, ordered by importance (most important first). Single words or short natural phrases. Nouns in singular form. No duplicates. No brand names, no people's names, no camera specs, no standalone numbers.
- Category: reply with ONLY the category number (1-21) from this list: ${ADOBE_CATEGORY_LIST}.
Return EXACTLY in this format and nothing else:
Title: <title>
Keywords: <kw1>, <kw2>, ...
Category: <number>`;

export const generateAdobeMetadataFromText = async (
  description: string
): Promise<AdobeMetadataResult> => {
  const prompt = `${ADOBE_METADATA_RULES}\n\nDescribe this asset for Adobe Stock:\n"${description}"`;
  const text = await generateText(prompt);
  return parseAdobeMetadata(text);
};

export const generateAdobeMetadataFromImage = async (
  imageBase64: string
): Promise<AdobeMetadataResult> => {
  const prompt = `${ADOBE_METADATA_RULES}\n\nLook at the image and describe it for Adobe Stock.`;
  const text = await generateVisionText(prompt, imageBase64);
  return parseAdobeMetadata(text);
};

const parseAdobeMetadata = (text: string): AdobeMetadataResult => {
  const titleMatch = text.match(/Title:\s*(.+)/i);
  const keywordsMatch = text.match(/Keywords:\s*([\s\S]*?)(?=\nCategory:|$)/i);
  const categoryMatch = text.match(/Category:\s*(\d{1,2})/i);
  const title = (titleMatch?.[1] || "").trim().replace(/,$/, "");
  const keywords = (keywordsMatch?.[1] || "")
    .split(",")
    .map((k) => k.trim().replace(/^\d+[\.\)]\s*/, ""))
    .filter((k) => k.length > 1)
    .slice(0, 49);
  const categoryId = Math.min(21, Math.max(1, parseInt(categoryMatch?.[1] || "0", 10) || 0));
  return { title, keywords, categoryId };
};

// ------------------------- Response parsing ----------------------------------

const parsePromptResponse = (text: string): { prompt: string; title: string; keywords: string } => {
  const promptMatch = text.match(/Prompt:\s*([\s\S]*?)(?=\nTitle:|\n*$)/i);
  const titleMatch = text.match(/Title:\s*(.*?)(?=\nKeywords:|\n*$)/i);
  const keywordsMatch = text.match(/Keywords:\s*(.*)/i);
  return {
    prompt: promptMatch?.[1]?.trim() || text.trim(),
    title: titleMatch?.[1]?.trim() || "",
    keywords: keywordsMatch?.[1]?.trim() || "",
  };
};

const parseIdeaResponse = (text: string): string[] => {
  return text
    .split("\n")
    .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((line) => line.length > 5);
};
