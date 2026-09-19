// DJ G-SUB & SOULCRAFT Client Application
document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    tracks: [],
    currentTrackIndex: 0,
    isPlaying: false,
    milestones: [],
    events: [],
    currentPromptId: null,
    rawPromptTemplate: '',
    selectedModel: 'GPT-4o',
    audioContext: null,
    synthesizerInterval: null
  };

  // DOM Elements
  const playBtn = document.getElementById('playBtn');
  const nextBtn = document.getElementById('nextBtn');
  const vinylDisc = document.getElementById('vinylDisc');
  const tonearm = document.getElementById('tonearm');
  const trackTitle = document.getElementById('nowPlayingTitle');
  const trackGenre = document.getElementById('nowPlayingGenre');
  const trackBpm = document.getElementById('nowPlayingBpm');
  const meterBars = document.querySelectorAll('.meter-bar');
  const tracksContainer = document.getElementById('tracksList');
  const genreTabs = document.querySelectorAll('.genre-tab');
  const milestonesContainer = document.getElementById('milestonesList');
  const eventsContainer = document.getElementById('eventsList');
  const promptInput = document.getElementById('promptInput');
  const btnGenerate = document.getElementById('btnGenerate');
  const promptOutput = document.getElementById('promptOutput');
  const btnCopy = document.getElementById('btnCopy');
  const variablesContainer = document.getElementById('variablesContainer');
  const variableInputsGrid = document.getElementById('variableInputsGrid');
  const feedbackInput = document.getElementById('feedbackInput');
  const btnOptimize = document.getElementById('btnOptimize');
  const layerSteps = document.querySelectorAll('.layer-step');
  const newGigModal = document.getElementById('newGigModal');
  const btnOpenGigModal = document.getElementById('btnOpenGigModal');
  const btnCloseGigModal = document.getElementById('btnCloseGigModal');
  const newGigForm = document.getElementById('newGigForm');
  const toastContainer = document.getElementById('toastContainer');

  // Hidden native audio element for streaming fallback
  const nativeAudio = new Audio();
  nativeAudio.crossOrigin = 'anonymous';

  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // -------------------------------------------------------------
  // 90s WEB AUDIO DRUM SYNTHESIZER (Guaranteed sound in browser)
  // -------------------------------------------------------------
  function initAudioContext() {
    if (!state.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioCtx();
    }
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
  }

  function play909Kick() {
    if (!state.audioContext) return;
    const ctx = state.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  function play909HiHat() {
    if (!state.audioContext) return;
    const ctx = state.audioContext;
    // Metallic noise buffer
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  let beatCount = 0;
  function startGrooveSynthesizer(bpm = 128) {
    stopGrooveSynthesizer();
    initAudioContext();
    const intervalMs = (60 / bpm / 2) * 1000; // 8th notes

    state.synthesizerInterval = setInterval(() => {
      beatCount++;
      // Animate LED meter bars
      meterBars.forEach((bar, idx) => {
        const height = Math.min(100, Math.max(15, Math.sin(beatCount + idx) * 50 + 50));
        bar.style.height = `${height}%`;
        bar.classList.add('active');
      });

      // Chicago 4-on-the-floor kick & offbeat hat
      if (beatCount % 2 === 0) {
        play909Kick();
      } else {
        play909HiHat();
      }
    }, intervalMs);
  }

  function stopGrooveSynthesizer() {
    if (state.synthesizerInterval) {
      clearInterval(state.synthesizerInterval);
      state.synthesizerInterval = null;
    }
    meterBars.forEach(bar => {
      bar.style.height = '15%';
      bar.classList.remove('active');
    });
  }

  // -------------------------------------------------------------
  // AUDIO & VINYL PLAYER CONTROLS
  // -------------------------------------------------------------
  function setTrack(index) {
    if (!state.tracks.length) return;
    state.currentTrackIndex = (index + state.tracks.length) % state.tracks.length;
    const track = state.tracks[state.currentTrackIndex];

    trackTitle.textContent = track.title;
    trackGenre.textContent = track.genre;
    trackBpm.textContent = `${track.bpm} BPM`;

    // Highlight in list
    document.querySelectorAll('.track-item').forEach((el, i) => {
      el.classList.toggle('current', i === state.currentTrackIndex);
    });

    if (state.isPlaying) {
      startPlayback();
    }
  }

  function startPlayback() {
    initAudioContext();
    state.isPlaying = true;
    vinylDisc.classList.add('spinning');
    tonearm.classList.add('engaged');
    playBtn.innerHTML = '<span>⏸</span> PAUZE';

    const currentTrack = state.tracks[state.currentTrackIndex];
    if (currentTrack) {
      startGrooveSynthesizer(currentTrack.bpm || 128);
    }
    showToast(`Nu aan het draaien: ${currentTrack?.title || 'SOULCRAFT Track'}`);
  }

  function pausePlayback() {
    state.isPlaying = false;
    vinylDisc.classList.remove('spinning');
    tonearm.classList.remove('engaged');
    playBtn.innerHTML = '<span>▶</span> AFSPELEN';
    stopGrooveSynthesizer();
    nativeAudio.pause();
  }

  playBtn.addEventListener('click', () => {
    if (state.isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  });

  nextBtn.addEventListener('click', () => {
    setTrack(state.currentTrackIndex + 1);
  });

  // -------------------------------------------------------------
  // LOAD TRACKS & GENRE FILTERING
  // -------------------------------------------------------------
  async function loadTracks(genre = 'All') {
    try {
      const url = genre === 'All' ? '/api/v1/tracks' : `/api/v1/tracks?genre=${encodeURIComponent(genre)}`;
      const res = await fetch(url);
      const data = await res.json();
      state.tracks = data;

      renderTracksList();
      if (data.length > 0 && !state.isPlaying) {
        setTrack(0);
      }
    } catch (err) {
      console.error('Fout bij ophalen tracks:', err);
    }
  }

  function renderTracksList() {
    tracksContainer.innerHTML = '';
    state.tracks.forEach((track, idx) => {
      const item = document.createElement('div');
      item.className = `track-item ${idx === state.currentTrackIndex ? 'current' : ''}`;
      item.innerHTML = `
        <div class="track-item-info">
          <div class="track-item-title">${track.title}</div>
          <div class="track-item-sub">${track.genre} • ${track.bpm} BPM • ${track.duration}</div>
        </div>
        <button class="track-play-btn" data-index="${idx}">CUE & PLAY</button>
      `;

      item.querySelector('.track-play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        setTrack(idx);
        startPlayback();
      });

      item.addEventListener('click', () => {
        setTrack(idx);
      });

      tracksContainer.appendChild(item);
    });
  }

  genreTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      genreTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadTracks(tab.getAttribute('data-genre'));
    });
  });

  // -------------------------------------------------------------
  // MILESTONES / DJ STAPPENPLAN
  // -------------------------------------------------------------
  async function loadMilestones() {
    try {
      const res = await fetch('/api/v1/milestones');
      const data = await res.json();
      state.milestones = data;
      renderMilestones();
    } catch (err) {
      console.error('Fout bij ophalen milestones:', err);
    }
  }

  function renderMilestones() {
    milestonesContainer.innerHTML = '';
    state.milestones.forEach(item => {
      const el = document.createElement('div');
      el.className = `milestone-item ${item.completed ? 'done' : ''}`;
      el.innerHTML = `
        <input type="checkbox" class="milestone-checkbox" ${item.completed ? 'checked' : ''} data-id="${item.id}">
        <div class="milestone-content">
          <div class="milestone-title">${item.title}</div>
          <div class="milestone-desc">${item.description}</div>
        </div>
      `;

      el.querySelector('.milestone-checkbox').addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        try {
          const res = await fetch('/api/v1/milestones/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const updated = await res.json();
          item.completed = updated.completed;
          el.classList.toggle('done', item.completed);
          showToast(`Mijlpaal bijgewerkt: ${item.title}`);
        } catch (err) {
          console.error(err);
        }
      });

      milestonesContainer.appendChild(el);
    });
  }

  // -------------------------------------------------------------
  // EVENTS & GIGS MANAGEMENT
  // -------------------------------------------------------------
  async function loadEvents() {
    try {
      const res = await fetch('/api/v1/events');
      const data = await res.json();
      state.events = data;
      renderEvents();
    } catch (err) {
      console.error('Fout bij ophalen events:', err);
    }
  }

  function renderEvents() {
    eventsContainer.innerHTML = '';
    state.events.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <div>
          <div class="event-venue">${evt.venue_name} (${evt.city})</div>
          <div class="event-details">📅 ${evt.date} • 🎛️ ${evt.genre}</div>
          <div class="event-details">👤 Contact: ${evt.contacts}</div>
        </div>
        <div class="event-status">${evt.status}</div>
      `;
      eventsContainer.appendChild(card);
    });
  }

  btnOpenGigModal.addEventListener('click', () => {
    newGigModal.classList.add('open');
  });

  btnCloseGigModal.addEventListener('click', () => {
    newGigModal.classList.remove('open');
  });

  newGigForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(newGigForm);
    const newGig = {
      venue_name: formData.get('venue_name'),
      city: formData.get('city'),
      date: formData.get('date'),
      genre: formData.get('genre'),
      contacts: formData.get('contacts'),
      status: formData.get('status')
    };

    try {
      const res = await fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGig)
      });
      const saved = await res.json();
      state.events.push(saved);
      renderEvents();
      newGigModal.classList.remove('open');
      newGigForm.reset();
      showToast(`Nieuwe gig toegevoegd: ${saved.venue_name}`);
    } catch (err) {
      console.error(err);
    }
  });

  // -------------------------------------------------------------
  // MODULE B: AI PROMPT GENERATOR ENGINE
  // -------------------------------------------------------------

  // Model Selection
  document.querySelectorAll('input[name="targetModel"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.selectedModel = e.target.value;
      document.querySelectorAll('.model-option').forEach(el => el.classList.remove('active'));
      e.target.closest('.model-option').classList.add('active');
    });
  });

  // Suggestion Chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      promptInput.value = chip.getAttribute('data-prompt');
      promptInput.focus();
    });
  });

  // 4-Layer Step Animation Helper
  function animateLayers() {
    layerSteps.forEach((step, idx) => {
      setTimeout(() => {
        step.classList.add('active');
      }, idx * 250);
    });
  }

  function resetLayerAnimation() {
    layerSteps.forEach(step => step.classList.remove('active'));
  }

  // Generate Prompt
  btnGenerate.addEventListener('click', async () => {
    const userIdea = promptInput.value.trim();
    if (!userIdea) {
      showToast('Voer eerst een prompt idee of concept in!');
      promptInput.focus();
      return;
    }

    resetLayerAnimation();
    animateLayers();
    btnGenerate.disabled = true;
    btnGenerate.innerHTML = '<span>⚡</span> GENEREREN VIA DSPY LOOP...';

    try {
      const res = await fetch('/api/v1/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_idea: userIdea,
          target_model: state.selectedModel
        })
      });

      const data = await res.json();
      state.currentPromptId = data.prompt_id;
      state.rawPromptTemplate = data.optimized_prompt;

      renderPromptOutput(data.optimized_prompt, data.variables);
      showToast(`Prompt succesvol geoptimaliseerd voor ${state.selectedModel}!`);
    } catch (err) {
      console.error('Fout bij genereren:', err);
      showToast('Fout opgetreden bij genereren.');
    } finally {
      btnGenerate.disabled = false;
      btnGenerate.innerHTML = '<span>⚡</span> OPTIMALISEER PROMPT';
    }
  });

  // Render Output & Variable Inputs
  function renderPromptOutput(promptText, variables = []) {
    promptOutput.textContent = promptText;
    renderVariableInputs(variables);
  }

  function renderVariableInputs(variables) {
    variableInputsGrid.innerHTML = '';
    if (!variables || variables.length === 0) {
      variablesContainer.style.display = 'none';
      return;
    }

    variablesContainer.style.display = 'flex';
    variables.forEach(varName => {
      const wrapper = document.createElement('div');
      wrapper.className = 'var-input-item';
      wrapper.innerHTML = `
        <input type="text" placeholder="${varName}" data-var="${varName}">
      `;

      wrapper.querySelector('input').addEventListener('input', updatePromptWithVariables);
      variableInputsGrid.appendChild(wrapper);
    });
  }

  function updatePromptWithVariables() {
    let updated = state.rawPromptTemplate;
    const inputs = variableInputsGrid.querySelectorAll('input');
    inputs.forEach(inp => {
      const varTag = inp.getAttribute('data-var');
      const val = inp.value.trim();
      if (val) {
        updated = updated.replaceAll(varTag, val);
      }
    });
    promptOutput.textContent = updated;
  }

  // Copy to Clipboard
  btnCopy.addEventListener('click', () => {
    const textToCopy = promptOutput.textContent;
    if (!textToCopy || textToCopy.includes('Nog geen prompt gegenereerd.')) {
      showToast('Niets om te kopiëren!');
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Prompt gekopieerd naar klembord! Klaar voor gebruik.');
    }).catch(err => {
      console.error(err);
      showToast('Kopiëren mislukt.');
    });
  });

  // Re-optimize with Feedback (DSPy loop)
  btnOptimize.addEventListener('click', async () => {
    if (!state.currentPromptId) {
      showToast('Genereer eerst een basis-prompt.');
      return;
    }
    const feedback = feedbackInput.value.trim();
    if (!feedback) {
      showToast('Voer feedback of verfijningsinstructies in.');
      feedbackInput.focus();
      return;
    }

    btnOptimize.disabled = true;
    btnOptimize.textContent = 'HEROPTIMALISEREN...';

    try {
      const res = await fetch('/api/v1/prompts/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: state.currentPromptId,
          feedback: feedback
        })
      });

      const data = await res.json();
      state.rawPromptTemplate = data.optimized_prompt;
      renderPromptOutput(data.optimized_prompt, data.variables);
      feedbackInput.value = '';
      showToast('Prompt her-geoptimaliseerd via DSPy Bootstrap loop!');
    } catch (err) {
      console.error(err);
      showToast('Fout bij heroptimaliseren.');
    } finally {
      btnOptimize.disabled = false;
      btnOptimize.textContent = 'HEROPTIMALISEER';
    }
  });

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  loadTracks();
  loadMilestones();
  loadEvents();
});
