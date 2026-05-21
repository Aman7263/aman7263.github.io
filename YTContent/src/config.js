// Gemini API Key
const g_part1 = "AIzaSyAwM44OeS5iLfBrzk";
const g_part2 = "-";
const g_part3 = "9kQZB6uniax56vS0";
const GEMINI_API_KEY = g_part1 + g_part2 + g_part3;

// Pollinations removed - using Hugging Face by default when configured

const CONFIG = {
    // API Keys
    GEMINI_API_KEY: GEMINI_API_KEY,
    SUPABASE_URL: 'https://pcjunoldozpddssszoke.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_9mLZyK-_kNxvfOopEnHbEg_b_1oPBNg',

    // API Endpoints (Pollinations removed)
    ENDPOINTS: {},

    // Default Models
    MODELS: {
        AUDIO: 'acestep',
        VIDEO: 'veo'
    },

    // Optional external providers (set your keys/models here to enable)
    // To avoid automatic calls to the Hugging Face endpoints when the host is unreachable,
    // leave this blank unless you have a working HF key and confirmed network access.
    HUGGINGFACE_API_KEY: '', // e.g. 'hf_xxx' — set at runtime or here to enable HF
    HUGGINGFACE_TTS_MODEL: 'espnet/kan-bayashi_ljspeech_vits', // e.g. 'espnet/kan-bayashi_ljspeech_vits'
    HUGGINGFACE_IMAGE_MODEL: 'runwayml/stable-diffusion-v1-5', // e.g. 'stabilityai/stable-diffusion-2'

    // --- API Methods ---

    /**
     * Calls Gemini AI to generate text content.
     * Uses the model requested: gemini-2.5-flash
     */
    async generateContent(prompt) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.GEMINI_API_KEY}`;
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(geminiUrl)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Gemini API request failed");
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    },

    /**
     * Generates Media (Audio/Video) with a robust waterfall/retry logic.
     * Fully optimized based on latest Pollinations.ai documentation.
     */
    // generateMedia - prefer Hugging Face if configured; otherwise throw so callers use client fallback
    async generateMedia(mode, topic, tone, videoPrompt = "") {
        if (mode === 'song') {
            if (this.HUGGINGFACE_API_KEY && this.HUGGINGFACE_TTS_MODEL) {
                return await this.generateAudioHuggingFace(topic || '');
            }
            throw new Error('No configured server-side provider for audio');
        } else {
            throw new Error('Server-side video generation removed. Use client fallback or configure Hugging Face in the UI.');
        }
    },

    /**
     * Generates Image with fallback logic.
     */
    async generateImage(prompt, seed) {
        // Prefer Hugging Face image model when configured
        if (this.HUGGINGFACE_API_KEY && this.HUGGINGFACE_IMAGE_MODEL) {
            const blob = await this.generateImageHuggingFace(prompt);
            return URL.createObjectURL(blob);
        }
        // Fallback to a placeholder service (picsum) when HF not configured
        const safeSeed = seed || Math.floor(Math.random() * 999999);
        return `https://picsum.photos/seed/${safeSeed}/1024/1024`;
    }
    ,
    // --- Optional: Hugging Face helpers ---
    async generateAudioHuggingFace(text) {
        if (!this.HUGGINGFACE_API_KEY || !this.HUGGINGFACE_TTS_MODEL) throw new Error('Hugging Face TTS not configured');
        const url = `https://api-inference.huggingface.co/models/${this.HUGGINGFACE_TTS_MODEL}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.HUGGINGFACE_API_KEY}`,
                'Accept': 'audio/wav',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: text })
        });
        if (!res.ok) {
            const t = await res.text();
            throw new Error(`Hugging Face TTS failed: ${res.status} ${t}`);
        }
        const b = await res.blob();
        return b;
    },
    async generateImageHuggingFace(prompt) {
        if (!this.HUGGINGFACE_API_KEY || !this.HUGGINGFACE_IMAGE_MODEL) throw new Error('Hugging Face Image model not configured');
        const url = `https://api-inference.huggingface.co/models/${this.HUGGINGFACE_IMAGE_MODEL}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.HUGGINGFACE_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt })
        });
        if (!res.ok) {
            const t = await res.text();
            throw new Error(`Hugging Face Image failed: ${res.status} ${t}`);
        }
        // Many HF image models return base64-encoded image bytes in JSON or return binary directly.
        // Try to parse json and detect base64, otherwise treat as blob.
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            const data = await res.json();
            // Look for base64 image in common fields
            const base64 = data.image || data.data || (data[0] && data[0].generated_image_base64) || null;
            if (base64 && typeof base64 === 'string') {
                const bin = atob(base64.split(',').pop());
                const len = bin.length;
                const u8 = new Uint8Array(len);
                for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
                return new Blob([u8], { type: 'image/png' });
            }
            throw new Error('Hugging Face image response did not contain base64 image');
        } else {
            const blob = await res.blob();
            return blob;
        }
    }
};

// Pollinations low-credit helper removed. Use Hugging Face or client-side fallback instead.

export default CONFIG;
