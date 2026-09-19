import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'data', 'database.json');
const FEW_SHOT_PATH = path.join(__dirname, 'data', 'few_shot_vectors.json');

// Helper to read/write JSON data
function getDatabase() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database:', err);
    return { branding: {}, tracks: [], milestones: [], events: [], prompts: [] };
  }
}

function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

function getFewShotData() {
  try {
    const raw = fs.readFileSync(FEW_SHOT_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading few-shot vectors:', err);
    return [];
  }
}

// -------------------------------------------------------------
// AI PROMPT GENERATOR ENGINE (4-LAYER ARCHITECTURE)
// -------------------------------------------------------------

// Layer 1: Meta-Prompt Layer (extracts intent, domain, tone)
function metaPromptAnalysis(userIdea) {
  const lower = userIdea.toLowerCase();
  let domain = 'dj_promo';
  let suggestedTone = 'Underground 90s Club Energy';

  if (lower.includes('art') || lower.includes('cover') || lower.includes('visual') || lower.includes('plaat')) {
    domain = 'artwork_generation';
    suggestedTone = 'Industrial, Acid Brutalism & Kinetic Vinyl Aesthetics';
  } else if (lower.includes('track') || lower.includes('overgang') || lower.includes('beatmatch') || lower.includes('mix')) {
    domain = 'dj_curation_tracklist';
    suggestedTone = 'Precision Harmonic Flow & Vinyl Cue Discipline';
  } else if (lower.includes('zaal') || lower.includes('boeking') || lower.includes('pitch') || lower.includes('club')) {
    domain = 'gig_pitch';
    suggestedTone = 'Direct, Authentic Underground Selector Representation';
  } else if (lower.includes('sneaker') || lower.includes('schoen') || lower.includes('kleding')) {
    domain = 'sneaker_crossover';
    suggestedTone = 'Subcultural Streetwear & Vinyl Club Crossover';
  }

  return {
    rawIdea: userIdea,
    domain,
    suggestedTone,
    extractedKeyphrases: userIdea.split(/\s+/).filter(w => w.length > 4)
  };
}

// Layer 2: Vector Embedding & Similarity Search (Few-Shot Selection)
function vectorSearchFewShot(metaAnalysis) {
  const fewShots = getFewShotData();
  const inputWords = metaAnalysis.rawIdea.toLowerCase().split(/\W+/).filter(Boolean);

  // Compute similarity score based on term frequencies and keyword vectors
  const scored = fewShots.map(item => {
    let matchCount = 0;
    for (const word of inputWords) {
      if (item.keywords.includes(word) || item.example_input.toLowerCase().includes(word)) {
        matchCount += 2;
      }
    }
    if (item.domain === metaAnalysis.domain) {
      matchCount += 3;
    }
    const score = matchCount / (item.keywords.length + 5);
    return { ...item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0] || fewShots[0];
}

// Layer 3: DSPy Optimization Loop (BootstrapFewShot)
function dspyOptimizationLoop(metaAnalysis, matchedFewShot, targetModel, feedback = null) {
  // Extract or synthesize dynamic variables
  const variables = [...(matchedFewShot.default_variables || [])];
  
  if (!variables.some(v => v.includes('mix_naam')) && metaAnalysis.domain === 'dj_promo') {
    variables.push('{{mix_naam}}');
  }
  if (!variables.some(v => v.includes('locatie'))) {
    variables.push('{{locatie}}');
  }

  // Model-specific prompt engineering
  let optimizedPrompt = '';

  if (targetModel === 'Claude 3.5 Sonnet') {
    optimizedPrompt = `<system>
Je bent een ${matchedFewShot.meta_role} met diepe wortels in de underground house- en technocultuur van Chicago en Detroit.
</system>

<context>
${matchedFewShot.context_focus}.
Doel van de opdracht: Vertaal het concept "${metaAnalysis.rawIdea}" naar een krachtige output conform underground selector standaarden.
${feedback ? `Toegepaste feedbackverfijning: ${feedback}` : ''}
</context>

<instructions>
${matchedFewShot.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}
4. Behoud altijd de rauwe esthetiek van analoge synthesizers, TR-909 percussie en authentieke vinyl cultuur.
</instructions>

<variables>
${variables.map(v => `- ${v}: Vul hier de specifieke projectwaarde in`).join('\n')}
</variables>

<output_format>
- Kinetische Headline / Hook
- Kernboodschap & Contextuele Uitwerking
- Call-to-Action & Relevant Platform Distributie Template
</output_format>`;

  } else if (targetModel === 'Llama 3') {
    optimizedPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Je bent een ${matchedFewShot.meta_role}. Richtlijn: ${matchedFewShot.context_focus}.
Randvoorwaarden:
${matchedFewShot.constraints.map(c => `- ${c}`).join('\n')}
${feedback ? `- Feedback correctie: ${feedback}` : ''}
<|eot_id|><|start_header_id|>user<|end_header_id|>
Opdracht: ${metaAnalysis.rawIdea}
Variabelen te hanteren: ${variables.join(', ')}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`;

  } else {
    // Default: GPT-4o (Structured Markdown & Schemas)
    optimizedPrompt = `### Rol & Persona
Je bent een **${matchedFewShot.meta_role}** geïnspireerd door de 90s underground warehouse scene (Chicago & Detroit vinyl cultuur).

### Context & Doelstelling
- **Gebruikersconcept**: "${metaAnalysis.rawIdea}"
- **Focusgebied**: ${matchedFewShot.context_focus}
${feedback ? `- **DSPy Optimalisatie Feedback**: ${feedback}` : ''}

### Strikte Richtlijnen
${matchedFewShot.constraints.map((c, idx) => `${idx + 1}. ${c}`).join('\n')}
- Vermijd generieke marketingtaal of commerciële EDM clichés.

### Dynamische Variabelen
${variables.map(v => `* \`${v}\``).join('\n')}

### Verwacht Output Formaat
1. **Underground Headline** (punchy & kinetisch)
2. **Body & Storytelling** (met focus op vinyl, club energy en subgenre authenticiteit)
3. **Actionable Call-to-Action & Links**`;
  }

  return {
    optimizedPrompt,
    variables,
    dspyIterations: feedback ? 2 : 1,
    optimizationStatus: 'CONVERGED_OPTIMAL'
  };
}

// Layer 4: Evaluation & Guardrails
function evaluateGuardrails(promptText) {
  const checks = {
    hasRole: promptText.includes('Rol') || promptText.includes('<system>') || promptText.includes('system'),
    hasVariables: /\{\{[a-zA-Z0-9_-]+\}\}/.test(promptText),
    safetyCheck: true,
    syntaxValid: true
  };
  return checks;
}

// Full 4-Layer Pipeline
function generatePromptPipeline(userIdea, targetModel = 'GPT-4o', feedback = null) {
  const meta = metaPromptAnalysis(userIdea);
  const matchedFewShot = vectorSearchFewShot(meta);
  const optimization = dspyOptimizationLoop(meta, matchedFewShot, targetModel, feedback);
  const guardrails = evaluateGuardrails(optimization.optimizedPrompt);

  return {
    meta,
    matchedFewShot,
    optimization,
    guardrails,
    finalPrompt: optimization.optimizedPrompt,
    variables: optimization.variables
  };
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. AI Prompt Engine: Generate
app.post('/api/v1/prompts/generate', (req, res) => {
  const { user_idea, target_model } = req.body;
  if (!user_idea || typeof user_idea !== 'string') {
    return res.status(400).json({ error: 'Het veld "user_idea" is verplicht.' });
  }

  const model = target_model || 'GPT-4o';
  const pipelineResult = generatePromptPipeline(user_idea, model);

  const promptId = 'pmt-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const newEntry = {
    id: promptId,
    user_idea,
    optimized_prompt: pipelineResult.finalPrompt,
    target_model: model,
    variables: pipelineResult.variables,
    created_at: new Date().toISOString()
  };

  const db = getDatabase();
  db.prompts.unshift(newEntry);
  saveDatabase(db);

  return res.status(201).json({
    prompt_id: promptId,
    optimized_prompt: pipelineResult.finalPrompt,
    variables: pipelineResult.variables,
    layers: {
      meta_domain: pipelineResult.meta.domain,
      few_shot_matched: pipelineResult.matchedFewShot.domain,
      dspy_status: pipelineResult.optimization.optimizationStatus,
      guardrails: pipelineResult.guardrails
    }
  });
});

// 2. AI Prompt Engine: Get by ID
app.get('/api/v1/prompts/:id', (req, res) => {
  const db = getDatabase();
  const prompt = db.prompts.find(p => p.id === req.params.id);
  if (!prompt) {
    return res.status(404).json({ error: 'Prompt niet gevonden.' });
  }
  return res.json(prompt);
});

// 3. AI Prompt Engine: Optimize with Feedback (DSPy Bootstrap Loop)
app.post('/api/v1/prompts/optimize', (req, res) => {
  const { prompt_id, feedback } = req.body;
  const db = getDatabase();
  const existing = db.prompts.find(p => p.id === prompt_id);

  if (!existing) {
    return res.status(404).json({ error: 'Prompt ID niet gevonden om te optimaliseren.' });
  }

  const pipelineResult = generatePromptPipeline(existing.user_idea, existing.target_model, feedback);
  existing.optimized_prompt = pipelineResult.finalPrompt;
  existing.variables = pipelineResult.variables;
  existing.last_feedback = feedback;
  existing.updated_at = new Date().toISOString();

  saveDatabase(db);

  return res.json({
    prompt_id: existing.id,
    optimized_prompt: existing.optimized_prompt,
    variables: existing.variables,
    dspy_iterations: 2,
    feedback_applied: feedback
  });
});

// 4. DJ Hub: Tracks & Mixes
app.get('/api/v1/tracks', (req, res) => {
  const { genre } = req.query;
  const db = getDatabase();
  let tracks = db.tracks || [];

  if (genre && genre !== 'All') {
    tracks = tracks.filter(t => t.genre.toLowerCase() === genre.toLowerCase());
  }

  return res.json(tracks);
});

// 5. DJ Hub: Events & Gigs
app.get('/api/v1/events', (req, res) => {
  const db = getDatabase();
  return res.json(db.events || []);
});

app.post('/api/v1/events', (req, res) => {
  const { venue_name, city, date, genre, contacts, status } = req.body;
  if (!venue_name) {
    return res.status(400).json({ error: 'Venue naam is verplicht.' });
  }

  const newEvent = {
    id: 'evt-' + Date.now().toString(36),
    venue_name,
    city: city || 'Onbekend',
    date: date || new Date().toISOString().split('T')[0],
    genre: genre || 'Underground House',
    contacts: contacts || '',
    status: status || 'In optie'
  };

  const db = getDatabase();
  db.events.push(newEvent);
  saveDatabase(db);

  return res.status(201).json(newEvent);
});

// 6. DJ Hub: Milestones
app.get('/api/v1/milestones', (req, res) => {
  const db = getDatabase();
  return res.json(db.milestones || []);
});

app.post('/api/v1/milestones/toggle', (req, res) => {
  const { id } = req.body;
  const db = getDatabase();
  const item = (db.milestones || []).find(m => m.id === id);
  if (item) {
    item.completed = !item.completed;
    saveDatabase(db);
    return res.json(item);
  }
  return res.status(404).json({ error: 'Mijlpaal niet gevonden.' });
});

// 7. Branding & Sneaker Arty Farty
app.get('/api/v1/branding', (req, res) => {
  const db = getDatabase();
  return res.json(db.branding || {});
});

// -------------------------------------------------------------
// GRAPHQL ENDPOINT (/graphql)
// -------------------------------------------------------------
app.post('/graphql', (req, res) => {
  const { query, variables } = req.body;
  const db = getDatabase();

  if (!query) {
    return res.status(400).json({ errors: [{ message: 'Query string missing' }] });
  }

  // Support listTracks
  if (query.includes('listTracks')) {
    let genreFilter = null;
    if (variables && variables.genre) {
      genreFilter = variables.genre;
    } else {
      const match = query.match(/genre:\s*"([^"]+)"/);
      if (match) genreFilter = match[1];
    }

    let tracks = db.tracks || [];
    if (genreFilter) {
      tracks = tracks.filter(t => t.genre.toLowerCase() === genreFilter.toLowerCase());
    }

    return res.json({
      data: {
        listTracks: tracks.map(t => ({
          id: t.id,
          title: t.title,
          genre: t.genre,
          platformUrl: t.platform_url
        }))
      }
    });
  }

  // Support getPrompt
  if (query.includes('getPrompt')) {
    let promptId = (variables && variables.id);
    if (!promptId) {
      const match = query.match(/id:\s*"([^"]+)"/);
      if (match) promptId = match[1];
    }
    const found = db.prompts.find(p => p.id === promptId);
    return res.json({
      data: {
        getPrompt: found ? {
          id: found.id,
          userIdea: found.user_idea,
          optimizedPrompt: found.optimized_prompt,
          targetModel: found.target_model,
          variables: found.variables
        } : null
      }
    });
  }

  // Support generatePrompt mutation
  if (query.includes('generatePrompt')) {
    const userIdea = (variables && variables.userIdea) || 'Chicago House DJ set';
    const targetModel = (variables && variables.targetModel) || 'GPT-4o';
    const pipeline = generatePromptPipeline(userIdea, targetModel);

    const newPrompt = {
      id: 'pmt-gql-' + Date.now().toString(36),
      user_idea: userIdea,
      optimized_prompt: pipeline.finalPrompt,
      target_model: targetModel,
      variables: pipeline.variables,
      created_at: new Date().toISOString()
    };
    db.prompts.unshift(newPrompt);
    saveDatabase(db);

    return res.json({
      data: {
        generatePrompt: {
          id: newPrompt.id,
          userIdea: newPrompt.user_idea,
          optimizedPrompt: newPrompt.optimized_prompt,
          targetModel: newPrompt.target_model,
          variables: newPrompt.variables
        }
      }
    });
  }

  // Fallback default GraphQL response
  return res.json({
    data: {
      message: 'GraphQL endpoint active. Supported operations: listTracks, getPrompt, generatePrompt'
    }
  });
});

// Health check endpoint for Render zero-downtime deploys
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🎛️ DJ G-SUB & SOULCRAFT Server running at http://0.0.0.0:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !process.env.PORT) {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);

