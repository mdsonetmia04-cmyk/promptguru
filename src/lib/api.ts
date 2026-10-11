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
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const getApiKey = (provider: "gemini" | "groq"): string | null => {
  return localStorage.getItem(`${provider}_api_key`);
};

export const setApiKey = (provider: "gemini" | "groq", key: string) => {
  localStorage.setItem(`${provider}_api_key`, key);
};

const callGroqApi = async (prompt: string): Promise<string> => {
  const groqKey = getApiKey("groq");
  if (!groqKey) {
    throw new Error("Please add Groq API key in Settings to use AI tools.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data?.choices?.[0]?.message?.content || "";
};

export const generatePromptFromImage = async (
  imageBase64: string,
  promptType: string,
  promptLength: string,
  includeSeo: boolean
): Promise<{ prompt: string; title: string; keywords: string }> => {
  const geminiKey = getApiKey("gemini");
  const groqKey = getApiKey("groq");

  const lengthInstruction = promptLength === "short" ? "Keep it under 50 words." : promptLength === "medium" ? "Keep it around 100 words." : "Make it very detailed, around 200 words.";
  const seoInstruction = includeSeo ? "Also generate a short SEO-friendly title and 10 relevant keywords separated by commas." : "";
  const systemPrompt = `You are an expert AI prompt engineer. Generate a ${promptType} prompt for the given image. ${lengthInstruction} ${seoInstruction} Return in this exact format:\nPrompt: <prompt>\nTitle: <title>\nKeywords: <keywords>`;

  if (geminiKey) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
            ],
          }],
        }),
      }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "Gemini API error");
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return parsePromptResponse(text);
  }

  if (groqKey) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          { role: "user", content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ]},
        ],
        max_tokens: 1024,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "Groq API error");
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    const text = data?.choices?.[0]?.message?.content || "";
    return parsePromptResponse(text);
  }

  throw new Error("No API key configured. Please add a Gemini or Groq API key in Settings.");
};

export const generatePromptsFromIdea = async (
  idea: string,
  style: string,
  tone: string,
  quantity: number
): Promise<string[]> => {
  const geminiKey = getApiKey("gemini");
  const groqKey = getApiKey("groq");

  const systemPrompt = `You are an expert AI prompt engineer. Generate exactly ${quantity} unique ${style} prompts based on this idea: "${idea}". Tone: ${tone}. Return each prompt on a new line, numbered like:\n1. <prompt>\n2. <prompt>`;

  if (geminiKey) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
      }
    );
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return parseIdeaResponse(text);
  }

  if (groqKey) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: systemPrompt }],
        max_tokens: 4096,
      }),
    });
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return parseIdeaResponse(text);
  }

  throw new Error("No API key configured. Please add a Gemini or Groq API key in Settings.");
};

// New AI Tool Functions
export const improvePrompt = async (prompt: string, style: string): Promise<string> => {
  const instruction = `You are an expert AI prompt engineer. Rewrite this ${style} prompt to make it more detailed, professional and optimized for AI image generation. Only return the improved prompt, nothing else.\n\nOriginal prompt: "${prompt}"`;
  return await callGroqApi(instruction);
};

export const generateVariations = async (basePrompt: string, quantity: number): Promise<string[]> => {
  const instruction = `Generate exactly ${quantity} unique creative variations of this prompt. Each variation should be different in style, mood, or approach while keeping the core concept. Return only the prompts, one per line, numbered like:\n1. <prompt>\n2. <prompt>\n\nBase prompt: "${basePrompt}"`;
  const text = await callGroqApi(instruction);
  return parseIdeaResponse(text);
};

export const expandPrompt = async (prompt: string, detailLevel: string): Promise<string> => {
  const levelDesc = detailLevel === "medium" ? "moderately detailed" : detailLevel === "detailed" ? "highly detailed" : "extremely detailed and cinematic";
  const instruction = `Expand this short prompt into a ${levelDesc} AI art prompt. Include environment, lighting, style, mood, composition, and artistic details. Only return the expanded prompt, nothing else.\n\nShort prompt: "${prompt}"`;
  return await callGroqApi(instruction);
};

export const fixPrompt = async (prompt: string): Promise<string> => {
  const instruction = `Correct and optimize this poorly structured prompt for AI image generation. Fix grammar, structure, and make it professional. Only return the fixed prompt, nothing else.\n\nBad prompt: "${prompt}"`;
  return await callGroqApi(instruction);
};

export const translatePrompt = async (prompt: string, targetLanguage: string): Promise<string> => {
  const instruction = `Translate this AI image generation prompt to ${targetLanguage}. Preserve the prompt structure and technical terms. Only return the translated prompt, nothing else.\n\nPrompt: "${prompt}"`;
  return await callGroqApi(instruction);
};

export const brainstormPrompts = async (topic: string, quantity: number): Promise<string[]> => {
  const instruction = `Generate exactly ${quantity} creative AI image prompt ideas related to this topic. Make them diverse and inspiring. Return only the ideas, one per line, numbered like:\n1. <idea>\n2. <idea>\n\nTopic: "${topic}"`;
  const text = await callGroqApi(instruction);
  return parseIdeaResponse(text);
};

export const generateSilhouettePrompts = async (topic: string, style: string, quantity: number): Promise<string[]> => {
  const instruction = `Generate exactly ${quantity} professional AI image prompts for fresh black silhouette illustrations isolated on white background. Style: ${style}. Each prompt must include phrases like: fresh black silhouette, isolated on white background, clean vector style, minimal detail, crisp edges. Make them optimized for stock illustration and vector generation. Return only the prompts, one per line, numbered like:\n1. <prompt>\n2. <prompt>\n\nTopic/Object: "${topic}"`;
  const text = await callGroqApi(instruction);
  return parseIdeaResponse(text);
};

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
