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
        let contextPrompt = `Topic: ${currentTopic}\nDescription: ${description}\n\nLyrics: ${currentText.substring(0, 800)}\n\nBased on the above, create a highly descriptive image generation prompt (40 words). The image MUST feature a boy and a girl as the main subjects. Describe their emotional connection, their outfits, and a symbolic background that perfectly captures the FEELING and MOOD of the lyrics and description. NO text.`;

        if (currentMode === 'cartoon') {
            contextPrompt = `Topic: ${currentTopic}\nDescription: ${description}\n\nScript: ${currentText.substring(0, 800)}\n\nBased on the above, create a detailed 3D animated (Pixar style) scene prompt. Describe the characters' expressions, the vibrant environment, and the action happening. Ensure the visuals capture the exact feeling and energy of this script. NO text.`;
        } else if (currentMode === 'story') {
            contextPrompt = `Topic: ${currentTopic}\nDescription: ${description}\n\nStory: ${currentText.substring(0, 800)}\n\nBased on the above, create a cinematic, epic digital painting prompt. Describe the atmosphere, lighting, and a key dramatic moment. Focus on capturing the core emotion and feeling of this narrative. NO text.`;
        }

        const imagePrompt = await CONFIG.generateContent(contextPrompt);

        // Sanitize the prompt to prevent Pollinations API failures
        const safePrompt = (imagePrompt || currentTopic).replace(/[^a-zA-Z0-9\s,]/g, ' ').replace(/\s+/g, ' ').trim();

        updateStatus("🎨 Generating visuals...", 'pulse');

        const seed = Math.floor(Math.random() * 1000000);
        currentImageUrl = await CONFIG.generateImage(safePrompt, seed);

        imagePreview.src = '';
        await new Promise(r => setTimeout(r, 80));
        imagePreview.src = currentImageUrl;

        try {
            await Promise.race([
                new Promise((resolve, reject) => {
                    imagePreview.onload = () => resolve();
                    imagePreview.onerror = () => reject(new Error('Primary image failed'));
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 60000))
            ]);
        } catch (e) {
            console.warn("Primary image generation failed, trying fallback...", e);
            updateStatus("🔄 Using stable fallback visual...", 'pulse');
            const safeTopic = currentTopic.replace(/[^\w\s]/gi, '').trim().substring(0, 50);
            const fallbackPrompt = encodeURIComponent(`Professional cover art, ${safeTopic}, ${currentTone} mood, cinematic lighting`);
            currentImageUrl = `https://image.pollinations.ai/prompt/${fallbackPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;

            imagePreview.src = currentImageUrl;
            await new Promise((resolve, reject) => {
                imagePreview.onload = () => resolve();
                imagePreview.onerror = () => reject(new Error('All image attempts failed'));
            });
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

// STEP 4: Generate Media (Audio/Video) - LOW CREDIT MODE
genMediaBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    toggleLoader(genMediaBtn, true);
    statusMonitor.style.display = 'flex';

    try {
        updateStatus("🎬 Preparing low-credit media generation...", 'pulse');

        const safeTopic = (currentTopic || "creative scene").trim().substring(0, 60);
        const safeTone = currentTone || "energetic";

        let mediaBlob = null;

        // === STRATEGY: Try cheapest options first ===
        if (currentMode === 'song') {
            // Audio - Use cheapest TTS / music model
            updateStatus("🎵 Generating music (low credit mode)...", 'pulse');
            mediaBlob = await CONFIG.generateMediaLowCredit('audio', safeTopic, safeTone);
        }
        else {
            // Video - Use very lightweight model first
            updateStatus("🎬 Generating short video (low credit mode)...", 'pulse');
            mediaBlob = await CONFIG.generateMediaLowCredit('video', safeTopic, safeTone);
        }

        if (!mediaBlob || mediaBlob.size < 5000) {
            throw new Error("Generation failed. Try again in a few minutes when pollen renews.");
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

        updateStatus("✅ Media ready! (Low credit mode)", 'success');

    } catch (err) {
        console.error(err);
        updateStatus("❌ Media generation failed - low pollen", 'error');
        alert("Not enough Pollen (0.01). Wait for hourly renewal or try a simpler topic.");
    } finally {
        toggleLoader(genMediaBtn, false);
    }
});


// STEP 5: Save to Database
saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    toggleLoader(saveBtn, true);
    updateStatus("🚀 Saving to cloud...", 'pulse');
    try {
        const fileName = `${Date.now()}-${currentTopic.replace(/\s+/g, '_').replace(/[^\w_]/g, '')}`;

        // 1. Upload Media
        updateStatus("🎵 Uploading media file...", 'pulse');
        const isVideo = currentMediaBlob.type.includes('video') || currentMode !== 'song';
        const folder = isVideo ? 'videos' : 'audio';
        const ext = isVideo ? 'mp4' : 'mp3';

        const { error: aError } = await supaClient.storage.from('songs').upload(`${folder}/${fileName}.${ext}`, currentMediaBlob);
        if (aError) throw aError;
        const mediaDbUrl = supaClient.storage.from('songs').getPublicUrl(`${folder}/${fileName}.${ext}`).data.publicUrl;

        // 2. Upload Image
        updateStatus("🖼️ Uploading thumbnail...", 'pulse');
        const imgRes = await fetch(currentImageUrl);
        const imgBlob = await imgRes.blob();
        const { error: iError } = await supaClient.storage.from('songs').upload(`images/${fileName}.jpg`, imgBlob, { contentType: 'image/jpeg' });
        if (iError) throw iError;
        const imgDbUrl = supaClient.storage.from('songs').getPublicUrl(`images/${fileName}.jpg`).data.publicUrl;

        // 3. Save to DB (We use AudioSongs table for everything, mapped intuitively)
        updateStatus("💾 Saving to database...", 'pulse');
        const { error: dbError } = await supaClient.from('AudioSongs').insert([{
            topic: `[${currentMode.toUpperCase()}] ${currentTopic}`,
            language: currentLanguage,
            tone: currentTone,
            description: document.getElementById('description').value || '',
            lyrics: currentText,
            audio_file: mediaDbUrl, // Works for both audio and video
            image_file: imgDbUrl,
            created_at: new Date().toISOString()
        }]);
        if (dbError) throw dbError;

        updateStatus("✅ Saved Successfully!", 'success');
        alert("🎉 Content saved! Head to the Library to view.");
    } catch (err) {
        updateStatus("Save failed: " + err.message, 'error');
        alert("❌ Save failed: " + err.message);
    } finally {
        toggleLoader(saveBtn, false);
    }
});

function toggleLoader(btn, isLoading) {
    btn.disabled = isLoading;
    if (btn.querySelector('.loader')) btn.querySelector('.loader').style.display = isLoading ? 'block' : 'none';
}

// DOWNLOAD HANDLERS
downloadTextBtn.addEventListener('click', () => {
    if (!currentText) return;
    const blob = new Blob([currentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTopic.replace(/\s+/g, '_') || 'content'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

downloadImageBtn.addEventListener('click', async () => {
    if (!currentImageUrl) return;
    try {
        const res = await fetch(currentImageUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentTopic.replace(/\s+/g, '_') || 'thumbnail'}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Failed to download image", err);
        alert("Could not download image. Try opening the full view and saving manually.");
    }
});

downloadMediaBtn.addEventListener('click', () => {
    if (!currentMediaBlob) return;
    const url = URL.createObjectURL(currentMediaBlob);
    const a = document.createElement('a');
    a.href = url;
    const ext = (currentMediaBlob.type.includes('video') || currentMode !== 'song') ? 'mp4' : 'mp3';
    a.download = `${currentTopic.replace(/\s+/g, '_') || 'media'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
});

// Initialize state on load
window.addEventListener('load', async () => {
    loadState();
});