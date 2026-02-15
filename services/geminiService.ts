import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordItem } from "../types";

// --- TTS Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Service Class ---

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private audioContext: AudioContext | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  }

  updateApiKey(key: string) {
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  // Generate Vocabulary List
  async generateWordList(category: string): Promise<WordItem[]> {
    if (!this.ai) throw new Error("API Key not initialized");

    const prompt = `Generate a list of 5 English vocabulary words specifically for '${category}' level/topic. 
    Provide the definition in Traditional Mongolian (Hudum) script. 
    Ensure the Mongolian output uses proper unicode characters for vertical display.
    Return JSON only.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              mongolian: { type: Type.STRING, description: "Definition in Traditional Mongolian script" },
              example: { type: Type.STRING, description: "Short example sentence in English" }
            },
            required: ["english", "mongolian"]
          }
        }
      }
    });

    let jsonStr = response.text || "[]";
    // Strip markdown code blocks if present
    jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");

    const data = JSON.parse(jsonStr);
    
    return data.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      english: item.english,
      mongolian: item.mongolian,
      example: item.example
    }));
  }

  // Generate Speech (TTS)
  async playPronunciation(text: string): Promise<void> {
    if (!this.ai || !this.audioContext) {
      console.warn("Gemini TTS not available, falling back to browser.");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
      return;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is good for clear pronunciation
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!base64Audio) throw new Error("No audio data returned");

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        this.audioContext,
        24000,
        1
      );

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();

    } catch (error) {
      console.error("Gemini TTS Failed:", error);
      // Fallback
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
}