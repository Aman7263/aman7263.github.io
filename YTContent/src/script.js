import CONFIG from './config.js';

const supaClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// State
let currentMode = "song"; // song, cartoon, story
let currentText = "";
let currentImageUrl = "";
let currentMediaBlob = null;
let currentTopic = "";
let currentLanguage = "English";
let currentTone = "energetic";
// Auto-generate media after confirming edited text
let autoGenerateMediaOnConfirm = true;

// UI Elements
const modeBtns = document.querySelectorAll('.mode-btn');
const genTextBtnSpan = document.getElementById('genTextBtnSpan');
const genMediaBtnSpan = document.getElementById('genMediaBtnSpan');

const statusMonitor = document.getElementById('statusMonitor');
const statusMsg = document.getElementById('statusMsg');
const statusDot = statusMonitor.querySelector('.status-dot');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

const textForm = document.getElementById('textForm');
const editableText = document.getElementById('editableText');
const imagePreview = document.getElementById('imagePreview');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');

const audioPlayer = document.getElementById('audioPlayer');
const videoPlayer = document.getElementById('videoPlayer');

const genTextBtn = document.getElementById('genTextBtn');
const textContent = document.getElementById('textContent');
const confirmTextBtn = document.getElementById('confirmTextBtn');
const confirmedTextControls = document.getElementById('confirmedTextControls');
const editTextBtn = document.getElementById('editTextBtn');
const downloadTextBtn = document.getElementById('downloadTextBtn');
const genImageBtn = document.getElementById('genImageBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');
const genMediaBtn = document.getElementById('genMediaBtn');
const downloadMediaBtn = document.getElementById('downloadMediaBtn');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

function toggleLoader(btn, isLoading) {
    if (!btn) return;
    try {
        btn.disabled = isLoading;
        const loader = btn.querySelector('.loader');
        if (loader) loader.style.display = isLoading ? 'block' : 'none';
    } catch (e) {
        // ignore
    }
}

// Mode Switching
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        updateUIForMode();
    });
});

function updateUIForMode() {
    const topicInput = document.getElementById('topic');
    const descInput = document.getElementById('description');
    const s1 = document.getElementById('step1Badge');
    const s2 = document.getElementById('step2Badge');
    const s3 = document.getElementById('step3Badge');

    if (currentMode === 'song') {
        genTextBtnSpan.textContent = 'Generate Lyrics';
        genMediaBtnSpan.textContent = '🎵 Generate AI Music';
        topicInput.placeholder = "The Neon Rain";
        descInput.placeholder = "A futuristic city under purple rain...";
        s1.textContent = 'Step 1: Song Setup';
        s2.textContent = 'Step 2: Edit Lyrics';
        s3.textContent = 'Step 3: Music Production';
    } else if (currentMode === 'cartoon') {
        genTextBtnSpan.textContent = 'Generate Cartoon Script';
        genMediaBtnSpan.textContent = '🧸 Generate AI Cartoon Video';
        topicInput.placeholder = "Silly Squirrel Adventure";
        descInput.placeholder = "A squirrel who thinks he's a superhero...";
        s1.textContent = 'Step 1: Cartoon Story';
        s2.textContent = 'Step 2: Edit Script';
        s3.textContent = 'Step 3: Animation Rendering';
    } else {
        genTextBtnSpan.textContent = 'Generate Story Script';
        genMediaBtnSpan.textContent = '📖 Generate AI Story Video';
        topicInput.placeholder = "The Lost Kingdom";
        descInput.placeholder = "A traveler finds a forgotten world deep in the mountains...";
        s1.textContent = 'Step 1: Narrative Setup';
        s2.textContent = 'Step 2: Edit Narrative';
        s3.textContent = 'Step 3: Story Rendering';
    }
}

// Persistence Logic
function saveState() {
    const state = {
        currentMode,
        currentText,
        currentImageUrl,
        currentTopic,
        currentLanguage,
        currentTone,
        step2Visible: step2.style.display === 'block',
        step3Visible: step3.style.display === 'block',
        step2ReadOnly: editableText.disabled,
        step3MediaBlurred: genMediaBtn.classList.contains('blurred-control'),
        step3SaveBlurred: saveBtn.classList.contains('blurred-control'),
        formValues: {
            topic: document.getElementById('topic').value,
            language: document.getElementById('language').value,
            tone: document.getElementById('tone').value,
            description: document.getElementById('description').value
        }
    };
    localStorage.setItem('aiStudioState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('aiStudioState');
    if (!saved) { updateUIForMode(); return; }

    const state = JSON.parse(saved);

    currentMode = state.currentMode || 'song';
    modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === currentMode));
    updateUIForMode();

    currentText = state.currentText;
    currentImageUrl = state.currentImageUrl;
    currentTopic = state.currentTopic;
    currentLanguage = state.currentLanguage;
    currentTone = state.currentTone;

    // Restore Form
    if (state.formValues) {
        document.getElementById('topic').value = state.formValues.topic || '';
        document.getElementById('language').value = state.formValues.language || 'English';
        document.getElementById('tone').value = state.formValues.tone || 'energetic';
        document.getElementById('description').value = state.formValues.description || '';
    }

    // Restore UI
    if (state.step2Visible) {
        step2.style.display = 'block';
        editableText.value = currentText;
        if (state.step2ReadOnly) {
            editableText.disabled = true;
            editableText.style.opacity = '0.7';
            confirmTextBtn.style.display = 'none';
            confirmedTextControls.style.display = 'flex';
        } else {
            editableText.disabled = false;
            editableText.style.opacity = '1';
            confirmTextBtn.style.display = 'flex';
            confirmedTextControls.style.display = 'none';
        }
    }
    if (state.step3Visible) {
        step3.style.display = 'block';
        if (currentImageUrl) {
            imagePreview.src = currentImageUrl;
            imagePreview.style.opacity = "1";
            downloadImageBtn.style.display = 'block';
        }

        if (!state.step3MediaBlurred) genMediaBtn.classList.remove('blurred-control');

        // Force user to regenerate media since Blob cannot be saved in localStorage
        saveBtn.classList.add('blurred-control');
        downloadMediaBtn.style.display = 'none';
    }
}

resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to erase all progress and reset the studio?")) {
        localStorage.removeItem('aiStudioState');
        window.location.reload();
    }
});

// STEP 1: Generate Text
textForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateStatus("Writing content with Gemini AI...", 'pulse');
    toggleLoader(genTextBtn, true);

    const topic = document.getElementById('topic').value;
    const language = document.getElementById('language').value;
    const tone = document.getElementById('tone').value;
    const description = document.getElementById('description').value;
    currentTopic = topic;
    currentLanguage = language;
    currentTone = tone;

    try {
        let prompt = "";
        if (currentMode === 'song') {
            prompt = `Write a song about "${topic}" in ${language} language. Tone: ${tone}. Description: ${description}. Return ONLY lyrics.`;
        } else if (currentMode === 'cartoon') {
            prompt = `Write a short 30-second fun script for a kids animated cartoon about "${topic}" in ${language} language. Tone: ${tone}. Description: ${description}. Return ONLY the script/story without any extra conversational text.`;
        } else {
            prompt = `Write a short 30-second dramatic story script about "${topic}" in ${language} language. Tone: ${tone}. Description: ${description}. Return ONLY the story.`;
        }

        // Using the new centralized API call from config.js
        currentText = await CONFIG.generateContent(prompt);
        if (!currentText) throw new Error("Invalid response from Gemini.");

        editableText.value = currentText;

        step2.style.display = 'block';
        step2.scrollIntoView({ behavior: 'smooth' });
        updateStatus("Content generated!", 'success');
        saveState();
        setTimeout(() => statusMonitor.style.display = 'none', 3000);
    } catch (err) {
        console.error(err);
        updateStatus(err.message, 'error');
        alert("❌ Error: " + err.message);
    } finally {
        toggleLoader(genTextBtn, false);
    }
});

window.updateStatus = function (msg, type = 'pulse') {
    statusMonitor.style.display = 'block';
    statusMsg.innerText = msg;
    statusMsg.className = 'status-text ' + (type === 'error' ? 'error' : type === 'success' ? 'success' : '');
    statusDot.className = 'status-dot ' + (type === 'pulse' ? 'pulse' : '');
    if (type === 'error') statusDot.style.background = '#ff7675';
    else if (type === 'success') statusDot.style.background = '#55efc4';
    else statusDot.style.background = '#6c5ce7';
}
const updateStatus = window.updateStatus;

// STEP 2: Confirm Text
confirmTextBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    currentText = editableText.value;

    textContent.classList.add('read-only-wrapper-active');
    editableText.disabled = true;
    editableText.style.opacity = '0.7';
    confirmTextBtn.style.display = 'none';
    confirmedTextControls.style.display = 'flex';

    step3.style.display = 'block';
    step3.scrollIntoView({ behavior: 'smooth' });

    await generateVisuals();
    // Optionally auto-generate media from the confirmed/edited text
    if (autoGenerateMediaOnConfirm) {
        try { await generateMedia(); } catch (e) { console.warn('Auto media generation failed', e); }
    }
    saveState();
});

// STEP 2.1: Edit Again
editTextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    editableText.disabled = false;
    editableText.style.opacity = '1';
    confirmTextBtn.style.display = 'flex';
    confirmedTextControls.style.display = 'none';

    genImageBtn.classList.add('blurred-control');
    genMediaBtn.classList.add('blurred-control');
    saveBtn.classList.add('blurred-control');

    updateStatus("Editing mode active. Re-confirm when done.", 'pulse');
    saveState();
});

// Image generation function
async function generateVisuals() {
    toggleLoader(genImageBtn, true);
    updateStatus("🤖 Crafting visual concept...", 'pulse');
    imagePreview.classList.add('loading');
    imagePreview.style.opacity = '1';

    try {
        const description = document.getElementById('description').value;
        let contextPrompt = `Topic: ${currentTopic}\nDescription: ${description}\n\nLyrics: ${currentText.substring(0, 2000)}\n\nBased on the above, create a highly descriptive image generation prompt (40 words). The image MUST feature a boy and a girl as the main subjects. Describe their emotional connection, their outfits, and a symbolic background that perfectly captures the FEELING and MOOD of the lyrics and description. NO text.`;

        if (currentMode === 'cartoon') {
            contextPrompt = `Topic: ${currentTopic}\nDescription: ${description}\n\nScript: ${currentText.substring(0, 2000)}\n\nBased on the above, create a detailed 3D animated (Pixar style) scene prompt. Describe the characters' expressions, the vibrant environment, and the action happening. Ensure the visuals capture the exact feeling and energy of this script. NO text.`;
        } else if (currentMode === 'story') {
            contextPrompt = `Topic: ${currentTopic}\nDescription: ${description}\n\nStory: ${currentText.substring(0, 2000)}\n\nBased on the above, create a cinematic, epic digital painting prompt. Describe the atmosphere, lighting, and a key dramatic moment. Focus on capturing the core emotion and feeling of this narrative. NO text.`;
        }

        const imagePrompt = await CONFIG.generateContent(contextPrompt);

        // Stronger sanitization to avoid characters that trigger server errors
        const raw = (imagePrompt || currentTopic || '').replace(/\u2019/g, "'");
        let safePrompt = raw
            .replace(/['"`<>\\]/g, ' ')        // strip problem chars
            .replace(/\s+/g, ' ')               // collapse whitespace
            .trim()
            .substring(0, 250);                  // limit length

        updateStatus("🎨 Generating visuals...", 'pulse');

        const seed = Math.floor(Math.random() * 1000000);
        // Ask CONFIG to provide an image URL (Hugging Face when configured, otherwise placeholder)
        try {
            const imgUrl = await CONFIG.generateImage(safePrompt, seed);
            imagePreview.src = imgUrl;
            await new Promise((resolve, reject) => {
                const t = setTimeout(() => reject(new Error('Timeout')), 30000);
                imagePreview.onload = () => { clearTimeout(t); resolve(); };
                imagePreview.onerror = () => { clearTimeout(t); reject(new Error('Image load error')); };
            });
            currentImageUrl = imgUrl;
        } catch (e) {
            console.warn('Image generation failed, using placeholder', e);
            const placeholder = `https://picsum.photos/seed/${seed}/1024/1024`;
            imagePreview.src = placeholder;
            await new Promise((resolve, reject) => {
                imagePreview.onload = () => resolve();
                imagePreview.onerror = () => reject(new Error('All image attempts failed'));
            });
            currentImageUrl = placeholder;
        }

        imagePreview.classList.remove('loading');
        genMediaBtn.classList.remove('blurred-control');
        downloadImageBtn.style.display = 'block';

        updateStatus("✨ Visuals ready!", 'success');
        saveState();
        setTimeout(() => statusMonitor.style.display = 'none', 2000);
    } catch (err) {
        console.error("Image Error:", err);
        imagePreview.classList.remove('loading');
        updateStatus("Visuals failed: " + err.message, 'error');
    } finally {
        toggleLoader(genImageBtn, false);
    }
}

genImageBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await generateVisuals();
});

imagePreview.addEventListener('click', () => {
    if (imagePreview.src && !imagePreview.classList.contains('loading')) {
        modalImage.src = imagePreview.src;
        imageModal.classList.add('active');
    }
});

imageModal.addEventListener('click', () => {
    imageModal.classList.remove('active');
});

// --- Client-side fallback media generation ---
async function synthesizeBackgroundAudio(text, durationSec = 8) {
    // Simple procedural melody based on text length using OfflineAudioContext
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(1, sampleRate * durationSec, sampleRate);

    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();

    osc.type = 'sine';
    // Derive base frequency from text
    let sum = 0;
    for (let i = 0; i < text.length; i++) sum += text.charCodeAt(i);
    const baseFreq = 220 + (sum % 300);

    osc.frequency.setValueAtTime(baseFreq, 0);
    gain.gain.setValueAtTime(0.0001, 0);
    gain.gain.exponentialRampToValueAtTime(0.2, durationSec * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, durationSec);

    osc.connect(gain).connect(offlineCtx.destination);

    osc.start(0);
    osc.stop(durationSec);

    const rendered = await offlineCtx.startRendering();

    // Convert AudioBuffer to WAV Blob
    function audioBufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const bufferArray = new ArrayBuffer(length);
        const view = new DataView(bufferArray);

        function setFloat32(output, offset, input) {
            const s = Math.max(-1, Math.min(1, input));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        /* RIFF identifier */ writeString(view, 0, 'RIFF');
        /* file length */ view.setUint32(4, 36 + buffer.length * numOfChan * 2, true);
        /* RIFF type */ writeString(view, 8, 'WAVE');
        /* format chunk identifier */ writeString(view, 12, 'fmt ');
        /* format chunk length */ view.setUint32(16, 16, true);
        /* sample format (raw) */ view.setUint16(20, 1, true);
        /* channel count */ view.setUint16(22, numOfChan, true);
        /* sample rate */ view.setUint32(24, buffer.sampleRate, true);
        /* byte rate (sampleRate * blockAlign) */ view.setUint32(28, buffer.sampleRate * numOfChan * 2, true);
        /* block align (channel count * bytes per sample) */ view.setUint16(32, numOfChan * 2, true);
        /* bits per sample */ view.setUint16(34, 16, true);
        /* data chunk identifier */ writeString(view, 36, 'data');
        /* data chunk length */ view.setUint32(40, buffer.length * numOfChan * 2, true);

        // write interleaved data
        let offset = 44;
        const channels = [];
        for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numOfChan; ch++) {
                setFloat32(view, offset, channels[ch][i]);
                offset += 2;
            }
        }

        return new Blob([view], { type: 'audio/wav' });

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }
    }

    return audioBufferToWav(rendered);
}

// Create a richer backing track for songs (simple drums + pads + bass)
async function synthesizeSongBacking(text, durationSec = 16) {
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSec, sampleRate);

    // Simple pad (triangle oscillator with slow attack)
    const pad = offlineCtx.createOscillator();
    pad.type = 'triangle';
    const padGain = offlineCtx.createGain();
    padGain.gain.setValueAtTime(0.0001, 0);
    padGain.gain.exponentialRampToValueAtTime(0.18, durationSec * 0.1);
    padGain.gain.exponentialRampToValueAtTime(0.0001, durationSec);
    // base frequency derived from text
    let sum = 0; for (let i = 0; i < text.length; i++) sum += text.charCodeAt(i);
    const base = 110 + (sum % 220);
    pad.frequency.setValueAtTime(base, 0);
    pad.connect(padGain).connect(offlineCtx.destination);
    pad.start(0); pad.stop(durationSec);

    // Bass (sine, rhythmic) using gain automation
    const bass = offlineCtx.createOscillator(); bass.type = 'sine';
    const bassGain = offlineCtx.createGain(); bassGain.gain.setValueAtTime(0.0001, 0);
    bass.connect(bassGain).connect(offlineCtx.destination);
    bass.frequency.setValueAtTime(base / 2, 0);
    // simple rhythm: pulse every half-second
    const step = 0.5;
    for (let t = 0; t < durationSec; t += step) {
        bassGain.gain.setValueAtTime(0.0001, t);
        bassGain.gain.linearRampToValueAtTime(0.6, t + 0.02);
        bassGain.gain.linearRampToValueAtTime(0.0001, t + 0.12);
    }
    bass.start(0); bass.stop(durationSec);

    // Soft hi-hat-like noise per 0.25s
    const bufferSize = sampleRate * durationSec;
    const noiseBuf = offlineCtx.createBuffer(1, bufferSize, sampleRate);
    const noisy = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) noisy[i] = (Math.random() * 2 - 1) * 0.02;
    const noiseSrc = offlineCtx.createBufferSource(); noiseSrc.buffer = noiseBuf;
    const noiseGain = offlineCtx.createGain(); noiseGain.gain.setValueAtTime(0.0001, 0);
    noiseSrc.connect(noiseGain).connect(offlineCtx.destination);
    noiseSrc.start(0); noiseSrc.stop(durationSec);

    const rendered = await offlineCtx.startRendering();

    // Convert to WAV blob
    function audioBufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const bufferArray = new ArrayBuffer(length);
        const view = new DataView(bufferArray);

        function setFloat32(output, offset, input) {
            const s = Math.max(-1, Math.min(1, input));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        }

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + buffer.length * numOfChan * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numOfChan, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * numOfChan * 2, true);
        view.setUint16(32, numOfChan * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, buffer.length * numOfChan * 2, true);

        let offset = 44;
        const channels = [];
        for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numOfChan; ch++) {
                setFloat32(view, offset, channels[ch][i]);
                offset += 2;
            }
        }
        return new Blob([view], { type: 'audio/wav' });
    }

    return audioBufferToWav(rendered);
}

// Mix backing + recorded vocals (if available) into a single WAV Blob
async function synthesizeSong(text, durationSec = 16) {
    // create backing first
    const backingBlob = await synthesizeSongBacking(text, durationSec);

    // attempt to capture vocals via display-capture TTS
    let vocalBlob = null;
    try {
        vocalBlob = await synthesizeSpeechViaDisplayCapture(text, 'en-US', 0.95);
    } catch (e) {
        console.warn('Vocals recording unavailable, using backing only', e);
    }

    if (!vocalBlob) return backingBlob;

    // Mix backing and vocals using OfflineAudioContext
    const audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 44100 * durationSec, 44100);

    async function decodeToBuffer(blob) {
        const ab = await blob.arrayBuffer();
        const baseCtx = new (window.AudioContext || window.webkitAudioContext)();
        const buf = await baseCtx.decodeAudioData(ab);
        baseCtx.close();
        return buf;
    }

    const backingBuf = await decodeToBuffer(backingBlob);
    const vocalBuf = await decodeToBuffer(vocalBlob);

    const backingSrc = audioCtx.createBufferSource(); backingSrc.buffer = backingBuf;
    const vocalSrc = audioCtx.createBufferSource(); vocalSrc.buffer = vocalBuf;

    const master = audioCtx.createGain(); master.gain.setValueAtTime(1.0, 0);
    const vocalGain = audioCtx.createGain(); vocalGain.gain.setValueAtTime(1.0, 0);
    vocalGain.gain.setValueAtTime(0.9, 0);

    backingSrc.connect(master).connect(audioCtx.destination);
    vocalSrc.connect(vocalGain).connect(audioCtx.destination);

    backingSrc.start(0); vocalSrc.start(0);

    const rendered = await audioCtx.startRendering();

    // Convert to WAV blob (reuse audioBufferToWav implementation)
    function audioBufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const bufferArray = new ArrayBuffer(length);
        const view = new DataView(bufferArray);

        function setFloat32(output, offset, input) {
            const s = Math.max(-1, Math.min(1, input));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        }

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + buffer.length * numOfChan * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numOfChan, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * numOfChan * 2, true);
        view.setUint16(32, numOfChan * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, buffer.length * numOfChan * 2, true);

        let offset = 44;
        const channels = [];
        for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numOfChan; ch++) {
                setFloat32(view, offset, channels[ch][i]);
                offset += 2;
            }
        }
        return new Blob([view], { type: 'audio/wav' });
    }

    return audioBufferToWav(rendered);
}

// Try to produce higher-quality speech by recording the browser's speech synthesis output.
// This requires user permission to capture tab/system audio via getDisplayMedia.
async function synthesizeSpeechViaDisplayCapture(text, lang = 'en-US', rate = 1.0) {
    if (!('speechSynthesis' in window) || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Speech synthesis or display capture not supported');
    }

    updateStatus('🔊 Requesting permission to record speech output...', 'pulse');

    // Ask user to share tab audio (will prompt). Must be a user gesture.
    let stream;
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false });
    } catch (e) {
        throw new Error('Audio capture permission denied');
    }

    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };

    const utterance = new SpeechSynthesisUtterance(text || ' ');
    utterance.lang = lang;
    utterance.rate = rate;

    const endPromise = new Promise((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
    });

    recorder.start();
    // small delay to ensure recording started
    await new Promise(r => setTimeout(r, 150));
    speechSynthesis.speak(utterance);

    // wait for utterance to finish
    await endPromise;

    // stop recorder and tracks
    recorder.stop();
    await new Promise((resolve) => { recorder.onstop = resolve; });
    stream.getTracks().forEach(t => t.stop());

    const blob = new Blob(chunks, { type: 'audio/webm' });
    return blob;
}

async function generateVideoFromImageAndAudio(imageUrl, audioBlob, text, durationSec = 8) {
    // Parse script into scenes by sentences (any punctuation break)
    const scenes = (text || '').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    if (scenes.length === 0) scenes.push('');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

    const width = 1280, height = 720;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');

    // audio element
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioEl = document.createElement('audio'); audioEl.src = audioUrl; audioEl.crossOrigin = 'anonymous';

    // capture streams
    const canvasStream = canvas.captureStream(30);
    const audioStream = audioEl.captureStream ? audioEl.captureStream() : null;
    const tracks = [];
    canvasStream.getVideoTracks().forEach(t => tracks.push(t));
    if (audioStream) audioStream.getAudioTracks().forEach(t => tracks.push(t));
    const mixedStream = new MediaStream(tracks);

    const recorder = new MediaRecorder(mixedStream, { mimeType: 'video/webm;codecs=vp9,opus' });
    const chunks = []; recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.start(100);

    // Helper: draw character avatar (boy/girl) with simple expressions
    function drawCharacter(ctx, x, y, size, type = 'boy', expr = 'neutral', flip = false) {
        // body circle
        ctx.save();
        ctx.translate(x, y);
        if (flip) ctx.scale(-1, 1);
        ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fillStyle = (type === 'boy' ? '#6c5ce7' : '#fd79a8'); ctx.fill();
        // eyes
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-size * 0.35, -size * 0.15, size * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.05, -size * 0.15, size * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(-size * 0.35, -size * 0.15, size * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.05, -size * 0.15, size * 0.08, 0, Math.PI * 2); ctx.fill();
        // mouth expression
        ctx.strokeStyle = '#222'; ctx.lineWidth = Math.max(1, size * 0.08);
        ctx.beginPath();
        if (expr === 'happy') ctx.arc(-size * 0.15, size * 0.1, size * 0.35, 0, Math.PI);
        else if (expr === 'sad') ctx.arc(-size * 0.15, size * 0.3, size * 0.35, Math.PI, 0);
        else if (expr === 'surprised') { ctx.beginPath(); ctx.arc(-size * 0.05, size * 0.05, size * 0.12, 0, Math.PI * 2); ctx.fillStyle = '#222'; ctx.fill(); }
        else ctx.moveTo(-size * 0.35, size * 0.12), ctx.lineTo(size * 0.05, size * 0.12);
        ctx.stroke();
        ctx.restore();
    }

    // Per-scene durations
    const perScene = durationSec / scenes.length;
    const start = performance.now();

    function sceneExpression(sceneText) {
        const s = sceneText.toLowerCase();
        if (s.match(/happy|joy|smile|laugh/)) return 'happy';
        if (s.match(/sad|cry|tears|lonely/)) return 'sad';
        if (s.match(/!|surprise|shock|wow|oh/)) return 'surprised';
        return 'neutral';
    }

    function drawFrame(now) {
        const t = (now - start) / 1000; // seconds
        // clamp
        const sceneIndex = Math.min(scenes.length - 1, Math.floor(t / perScene));
        const sceneProgress = (t - sceneIndex * perScene) / perScene;
        const sceneText = scenes[sceneIndex] || '';

        // Background: use base image with hue shift per scene
        ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);
        // draw image scaled to cover
        const ratio = Math.max(width / img.width, height / img.height);
        const iw = img.width * ratio, ih = img.height * ratio;
        // apply slight pan per scene
        const panX = (sceneIndex - (scenes.length - 1) / 2) * 20; // shift per scene
        ctx.drawImage(img, (width - iw) / 2 + panX * sceneProgress, (height - ih) / 2, iw, ih);
        // overlay color tint to vary scenes
        ctx.fillStyle = `rgba(${(50 + sceneIndex * 30) % 255}, ${(80 + sceneIndex * 50) % 255}, ${(120 + sceneIndex * 20) % 255}, 0.25)`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Draw two characters (boy left, girl right) with small idle animation
        const leftX = width * 0.25; const rightX = width * 0.75; const baseY = height * 0.55; const size = 110;
        const expr = sceneExpression(sceneText);
        const bob = Math.sin(t * 2 * Math.PI * 0.5) * 6;
        drawCharacter(ctx, leftX, baseY + bob, size, 'boy', expr, false);
        drawCharacter(ctx, rightX, baseY - bob * 0.6, size, 'girl', expr, false);

        // Draw small props or simple actions (if script mentions 'walk' or 'run' animate x)
        if (sceneText.toLowerCase().match(/walk|run|move/)) {
            const moverX = width * (0.1 + 0.8 * sceneProgress);
            ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(moverX, baseY + 120, 18, 0, Math.PI * 2); ctx.fill();
        }

        // Subtitle box and text
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, height - 160, width, 160);
        ctx.fillStyle = '#fff'; ctx.font = '28px sans-serif'; ctx.textAlign = 'center';
        const wrapped = wrapText(ctx, sceneText, width - 160);
        for (let i = 0; i < Math.min(3, wrapped.length); i++) ctx.fillText(wrapped[i], width / 2, height - 110 + i * 34);

        if (t < durationSec) requestAnimationFrame(drawFrame);
        else setTimeout(() => recorder.stop(), 120);
    }

    requestAnimationFrame(drawFrame);
    try { await audioEl.play(); } catch (e) { /* ignore autoplay restrictions */ }

    const blob = await new Promise((res) => { recorder.onstop = () => res(new Blob(chunks, { type: 'video/webm' })); });
    URL.revokeObjectURL(audioUrl);
    return blob;

    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        return lines;
    }
}

async function generateMediaClientFallback(mode, text, imageUrl) {
    try {
        updateStatus('⚙️ Creating client-side media fallback...', 'pulse');
        // For songs: create a proper song audio (backing + optional vocals)
        if (mode === 'song') {
            try {
                const duration = 14;
                const songBlob = await synthesizeSong(text || 'A short song', duration);
                if (songBlob && songBlob.size > 1000) return songBlob;
            } catch (e) {
                console.warn('synthesizeSong failed, falling back to simple backing', e);
            }
            // fallback: simple backing
            const duration = 12;
            const audioBlob = await synthesizeBackgroundAudio(text || 'A short instrumental', duration);
            return audioBlob;
        }

        // For non-song modes (story/cartoon): prefer recorded narration + video compositor
        try {
            const duration = 10;
            const speechBlob = await synthesizeSpeechViaDisplayCapture(text || 'Narration', 'en-US', 1.0);
            if (speechBlob && speechBlob.size > 1000) {
                const videoBlob = await generateVideoFromImageAndAudio(imageUrl || imagePreview.src, speechBlob, text, Math.max(8, Math.floor((speechBlob.size / 1000) % 20) || duration));
                return videoBlob;
            }
        } catch (recErr) {
            console.warn('Speech-recording fallback unavailable or denied:', recErr);
        }

        // If recording failed, create procedural audio + story video
        const duration = 10;
        const audioBlob = await synthesizeBackgroundAudio(text || 'Narration', duration);
        const videoBlob = await generateVideoFromImageAndAudio(imageUrl || imagePreview.src, audioBlob, text, duration);
        return videoBlob;
    } catch (e) {
        console.error('Client fallback failed', e);
        return null;
    }
}

// Media generation is handled by the consolidated `generateMedia()` function below.


// STEP 5: Save to Database
genMediaBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await generateMedia();
});

// Reusable media generation used by the button and auto-generation on confirm
async function generateMedia() {
    toggleLoader(genMediaBtn, true);
    statusMonitor.style.display = 'flex';
    try {
        updateStatus("🎬 Generating media...", 'pulse');

        const safeTopic = (currentTopic || "creative scene").trim().substring(0, 60);
        const safeTone = currentTone || "energetic";

        let mediaBlob = null;

        // --- Try external providers (Hugging Face) if configured in CONFIG ---
        try {
            if (CONFIG.HUGGINGFACE_API_KEY) {
                updateStatus('🔁 Trying configured external provider (Hugging Face)...', 'pulse');
                if (currentMode === 'song' && CONFIG.HUGGINGFACE_TTS_MODEL) {
                    try {
                        const audioBlob = await CONFIG.generateAudioHuggingFace(currentText || safeTopic);
                        if (audioBlob && audioBlob.size > 1000) {
                            mediaBlob = audioBlob;
                            updateStatus('🎧 Generated audio via Hugging Face', 'success');
                        }
                    } catch (hfErr) {
                        console.warn('Hugging Face TTS failed', hfErr);
                    }
                } else if (currentMode !== 'song' && CONFIG.HUGGINGFACE_IMAGE_MODEL && CONFIG.HUGGINGFACE_TTS_MODEL) {
                    try {
                        const prompt = currentText.substring(0, 1000) || safeTopic;
                        const imgBlob = await CONFIG.generateImageHuggingFace(prompt);
                        const imgUrl = URL.createObjectURL(imgBlob);
                        const audioBlob = await CONFIG.generateAudioHuggingFace(currentText || safeTopic);
                        const videoBlob = await generateVideoFromImageAndAudio(imgUrl, audioBlob, currentText, 8);
                        URL.revokeObjectURL(imgUrl);
                        if (videoBlob && videoBlob.size > 5000) {
                            mediaBlob = videoBlob;
                            updateStatus('🎬 Generated video via Hugging Face + client compositor', 'success');
                        }
                    } catch (hfErr) {
                        console.warn('Hugging Face image+tts flow failed', hfErr);
                    }
                }
            }
        } catch (e) {
            console.warn('External provider attempt failed', e);
        }

        // If external provider didn't produce media, use client-side fallback
        if (!mediaBlob || mediaBlob.size < 5000) {
            updateStatus('🔧 No external provider available or generation incomplete — using client fallback', 'pulse');
            mediaBlob = await generateMediaClientFallback(currentMode, currentText, currentImageUrl);
            if (!mediaBlob) throw new Error('Client-side fallback failed to create media.');
        }

        const blobUrl = URL.createObjectURL(mediaBlob);

        // Show appropriate player
        audioPlayer.style.display = 'none';
        videoPlayer.style.display = 'none';

        if (mediaBlob.type.includes('video') || currentMode !== 'song') {
            videoPlayer.src = blobUrl;
            videoPlayer.style.display = 'block';
        } else {
            audioPlayer.src = blobUrl;
            audioPlayer.style.display = 'block';
        }

        currentMediaBlob = mediaBlob;
        downloadMediaBtn.style.display = 'block';
        saveBtn.classList.remove('blurred-control');

        updateStatus('✅ Media ready!', 'success');
    } catch (err) {
        console.error(err);
        updateStatus('❌ Media generation failed', 'error');
        alert('Media generation failed. Try again or use the client fallback.');
    } finally {
        toggleLoader(genMediaBtn, false);
    }
}

downloadMediaBtn.addEventListener('click', () => {
    if (!currentMediaBlob) return;
    const url = URL.createObjectURL(currentMediaBlob);
    const a = document.createElement('a');
    a.href = url;
    let ext = 'bin';
    if (currentMediaBlob.type.includes('video')) ext = currentMediaBlob.type.split('/')[1] || 'webm';
    else if (currentMediaBlob.type.includes('audio')) ext = currentMediaBlob.type.split('/')[1] || 'wav';
    if (ext === 'mpeg') ext = 'mp3';
    a.download = `${currentTopic.replace(/\s+/g, '_') || 'media'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
});

// Initialize state on load
window.addEventListener('load', async () => {
    loadState();
});

// STEP 5: Save to Database (Supabase)
saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!currentMediaBlob) { alert('No media to save. Generate media first.'); return; }

    toggleLoader(saveBtn, true);
    updateStatus('🚀 Saving to cloud...', 'pulse');

    try {
        const fileName = `${Date.now()}-${(currentTopic || 'content').replace(/\s+/g, '_').replace(/[^\w_]/g, '')}`;

        // Determine media type and extension
        const isVideo = currentMediaBlob.type.includes('video') || currentMode !== 'song';
        const folder = isVideo ? 'videos' : 'audio';
        let ext = 'bin';
        if (currentMediaBlob.type.includes('video')) ext = currentMediaBlob.type.split('/')[1] || 'webm';
        else if (currentMediaBlob.type.includes('audio')) ext = currentMediaBlob.type.split('/')[1] || 'wav';
        if (ext === 'mpeg') ext = 'mp3';

        updateStatus('🎵 Uploading media file...', 'pulse');
        const { error: aError } = await supaClient.storage.from('songs').upload(`${folder}/${fileName}.${ext}`, currentMediaBlob);
        if (aError) throw aError;
        const mediaDbUrl = supaClient.storage.from('songs').getPublicUrl(`${folder}/${fileName}.${ext}`).data.publicUrl;

        // Upload image (thumbnail)
        updateStatus('🖼️ Uploading thumbnail...', 'pulse');
        let imgBlob = null;
        try {
            const res = await fetch(currentImageUrl);
            imgBlob = await res.blob();
        } catch (e) {
            console.warn('Failed to fetch currentImageUrl, using placeholder', e);
            const res = await fetch('https://picsum.photos/1024/1024');
            imgBlob = await res.blob();
        }

        const { error: iError } = await supaClient.storage.from('songs').upload(`images/${fileName}.jpg`, imgBlob, { contentType: 'image/jpeg' });
        if (iError) throw iError;
        const imgDbUrl = supaClient.storage.from('songs').getPublicUrl(`images/${fileName}.jpg`).data.publicUrl;

        // Insert DB record
        updateStatus('💾 Saving to database...', 'pulse');
        const { error: dbError } = await supaClient.from('AudioSongs').insert([{
            topic: `[${currentMode.toUpperCase()}] ${currentTopic}`,
            language: currentLanguage,
            tone: currentTone,
            description: document.getElementById('description').value || '',
            lyrics: currentText,
            audio_file: mediaDbUrl,
            image_file: imgDbUrl,
            created_at: new Date().toISOString()
        }]);
        if (dbError) throw dbError;

        updateStatus('✅ Saved Successfully!', 'success');
        alert('🎉 Content saved! Head to the Library to view.');
        // Persist a lightweight record of the saved items locally and clear working state
        try {
            localStorage.setItem('aiStudioLastSaved', JSON.stringify({ media: mediaDbUrl, image: imgDbUrl, topic: currentTopic, mode: currentMode, saved_at: new Date().toISOString() }));
            // Remove working draft state so UI refreshes into a clean state
            localStorage.removeItem('aiStudioState');
        } catch (e) {
            console.warn('LocalStorage update failed', e);
        }

        // Clear in-memory blobs and UI controls
        try {
            currentMediaBlob = null;
            currentImageUrl = '';
            downloadMediaBtn.style.display = 'none';
            downloadImageBtn.style.display = 'none';
            saveBtn.classList.add('blurred-control');
        } catch (e) { /* ignore UI clearing errors */ }

        // Refresh the page to reflect cleared local state and library updates
        setTimeout(() => { window.location.reload(); }, 800);
    } catch (err) {
        console.error('Save failed:', err);
        updateStatus('Save failed: ' + err.message, 'error');
        alert('❌ Save failed: ' + err.message);
    } finally {
        toggleLoader(saveBtn, false);
    }
});
