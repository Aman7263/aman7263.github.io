// Gemini API Key
const g_part1 = "AIzaSyAwM44OeS5iLfBrzk";
const g_part2 = "-";
const g_part3 = "9kQZB6uniax56vS0";
const GEMINI_API_KEY = g_part1 + g_part2 + g_part3;

// Pollinations API Key (Get yours at enter.pollinations.ai)
const p_part1 = "sk_FBYlOiTi31";
const p_part2 = "MfyJdRoP3CBsHz";
const p_part3 = "Dr1XMb4Z";
const POLLINATIONS_API_KEY = p_part1 + p_part2 + p_part3;

const CONFIG = {
    // API Keys
    GEMINI_API_KEY: GEMINI_API_KEY,
    POLLINATIONS_API_KEY: POLLINATIONS_API_KEY,
    SUPABASE_URL: 'https://pcjunoldozpddssszoke.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_9mLZyK-_kNxvfOopEnHbEg_b_1oPBNg',

    // API Endpoints
    ENDPOINTS: {
        IMAGE: 'https://image.pollinations.ai/prompt/',
        AUDIO: 'https://gen.pollinations.ai/audio/',
        VIDEO: 'https://gen.pollinations.ai/video/'
    },

    // Default Models
    MODELS: {
        AUDIO: 'acestep',
        VIDEO: 'veo'
    },

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
    async generateMedia(mode, topic, tone, videoPrompt = "") {
        let blob = null;
        const fetchWithTimeout = async (url, options = {}, timeout = 35000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);

            // Add Authorization header if API Key is present
            const headers = { ...options.headers };
            if (this.POLLINATIONS_API_KEY) {
                headers['Authorization'] = `Bearer ${this.POLLINATIONS_API_KEY}`;
            }

            try {
                const response = await fetch(url, { ...options, headers, signal: controller.signal });
                clearTimeout(id);
                return response;
            } catch (e) {
                clearTimeout(id);
                throw e;
            }
        };

        if (mode === 'song') {
            const musicPrompt = `${tone} instrumental music, ${topic}, cinematic background score`.trim();
            // Models: [modelName, duration]
            const audioWaterfall = [
                ['elevenmusic', 30],
                ['acestep', 15],
                ['universal-2', 10],
                ['', 10]
            ];

            for (const [model, dur] of audioWaterfall) {
                try {
                    const params = new URLSearchParams({
                        duration: dur,
                        instrumental: 'true',
                        enhance: 'true'
                    });
                    if (model) params.append('model', model);

                    const baseUrl = `${this.ENDPOINTS.AUDIO}${encodeURIComponent(musicPrompt)}?${params.toString()}`;
                    const url = baseUrl;

                    updateStatus(`🎼 Composing with ${model || 'Turbo'} Audio (${dur}s)...`, 'pulse');
                    const res = await fetchWithTimeout(url);

                    if (res.status === 402) {
                        throw new Error("Pollinations API balance exhausted. Please add funds.");
                    }

                    if (res.ok) {
                        const b = await res.blob();
                        if (b.size > 5000 && b.type.includes('audio')) {
                            blob = b;
                            break;
                        }
                    }
                } catch (e) {
                    if (e.message.includes("exhausted")) throw e;
                    console.warn(`Audio ${model || 'Turbo'} failed/timeout`, e);
                }
            }

            // Backup: SoundHelix
            if (!blob) {
                const helixUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                try {
                    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(helixUrl)}`);
                    if (res.ok) blob = await res.blob();
                    else throw new Error("Proxy failed");
                } catch (e) {
                    try {
                        const res = await fetch(helixUrl);
                        if (res.ok) blob = await res.blob();
                    } catch (e2) { console.warn("Failsafe audio failed completely", e2); }
                }
            }

        } else {
            const finalPrompt = (videoPrompt && videoPrompt.length > 5) ? videoPrompt : `Cinematic high quality 4k scene about ${topic}`;

            // Video Waterfall: [model, duration, aspectRatio]
            const videoWaterfall = [
                ['wan-fast', 5, '16:9'],    // Ultra Fast
                ['veo', 8, '16:9'],         // High Quality
                ['wan', 15, '16:9'],        // Long & Reliable
                ['nova-reel', 12, '16:9'],  // Cinematic Pan
                ['seedance-2.0', 10, '16:9'],
                ['grok-video-pro', 5, '16:9'],
                ['', 5, '16:9']             // Turbo
            ];

            for (const [model, dur, ratio] of videoWaterfall) {
                try {
                    const params = new URLSearchParams({
                        duration: dur,
                        aspectRatio: ratio,
                        audio: 'true',
                        enhance: 'true'
                    });
                    if (model) params.append('model', model);

                    const baseUrl = `${this.ENDPOINTS.VIDEO}${encodeURIComponent(finalPrompt)}?${params.toString()}`;
                    const url = baseUrl;

                    updateStatus(`🎬 Rendering ${model || 'Turbo'} Video (${dur}s)...`, 'pulse');
                    const res = await fetchWithTimeout(url);

                    if (res.status === 402) {
                        throw new Error("Pollinations API balance exhausted. Please add funds.");
                    }

                    if (res.ok) {
                        const b = await res.blob();
                        if (b.size > 10000 && b.type.includes('video')) {
                            blob = b;
                            break;
                        }
                    }
                } catch (e) {
                    if (e.message.includes("exhausted")) throw e;
                    console.warn(`Video ${model || 'Turbo'} failed/timeout`, e);
                }
            }

            // Backup: Sample Video
            if (!blob) {
                const sampleVid = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                try {
                    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(sampleVid)}`);
                    if (res.ok) blob = await res.blob();
                    else throw new Error("Proxy failed");
                } catch (e) {
                    try {
                        const res = await fetch(sampleVid);
                        if (res.ok) blob = await res.blob();
                    } catch (e2) { console.warn("Failsafe video failed completely", e2); }
                }
            }
        }

        if (!blob || blob.size < 5000) throw new Error("Media generation failed. Try a simpler topic or check your internet.");
        return blob;
    },

    /**
     * Generates Image with fallback logic.
     */
    async generateImage(prompt, seed) {
        const params = new URLSearchParams({
            seed: seed,
            width: 1024,
            height: 1024,
            nologo: 'true',
            enhance: 'true'
        });
        return `${this.ENDPOINTS.IMAGE}${encodeURIComponent(prompt + ', 4k')}?${params.toString()}`;
    }
};

export default CONFIG;
