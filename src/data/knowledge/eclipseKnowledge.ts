// Eclipse Knowledge Base — The Canvas Learning System
// This file stores all learned patterns, prompts, and capabilities
// so The Canvas can eventually generate everything autonomously

export interface KnowledgeEntry {
  id: string;
  category: 'image' | 'video' | '3d' | 'cinematic' | 'game-engine' | 'lore' | 'prompt';
  name: string;
  description: string;
  promptTemplate: string;
  learnedFrom: string;
  quality: 'standard' | 'high' | 'aaa';
  tags: string[];
}

export const ECLIPSE_KNOWLEDGE: KnowledgeEntry[] = [
  // ═══════════════════════════════════════════════════════════════
  // IMAGE GENERATION — Character Concept Art
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ancestry-sheet',
    category: 'image',
    name: 'Ancestry Character Sheet',
    description: 'Full character concept sheet with front/back/side views, weapons, racial traits, playstyle, physical stats, In Action combat shot, color palette. AAA dark fantasy quality.',
    promptTemplate: 'Full character concept sheet for a fantasy RPG race called {RACE_NAME}. {DESCRIPTION}. Front view, back view, side profile, facial portrait. Weapons: {WEAPONS}. Racial traits: {TRAITS}. Playstyle: {PLAYSTYLE}. Physical stats: height {HEIGHT}, weight {WEIGHT}. Color palette: {COLORS}. In Action combat shot. Dark fantasy, full melanin, intricate detail, 2K resolution, concept art sheet format with multiple views arranged vertically.',
    learnedFrom: 'Eclipse: Realms of the Fractured — 138 concept art pieces generated',
    quality: 'aaa',
    tags: ['character', 'ancestry', 'concept-art', 'dark-fantasy', 'full-melanin'],
  },
  {
    id: 'class-sheet',
    category: 'image',
    name: 'Class Character Sheet',
    description: 'Class-specific character sheet with weapons, abilities, playstyle. AAA quality.',
    promptTemplate: 'Full character concept sheet for a fantasy RPG {CLASS_NAME} class. {DESCRIPTION}. Front view, back view, side profile, facial portrait. Weapons: {WEAPONS}. Abilities: {ABILITIES}. Playstyle: {PLAYSTYLE}. Dark fantasy, ornate armor, elemental accents, 2K resolution.',
    learnedFrom: 'Eclipse — 17 class sheets generated',
    quality: 'aaa',
    tags: ['character', 'class', 'concept-art', 'dark-fantasy'],
  },
  {
    id: 'armor-set',
    category: 'image',
    name: 'Full Armor Set Detail Sheet',
    description: 'Complete armor set with detail callouts for helmet, shoulders, chest, gauntlets, legs, boots.',
    promptTemplate: 'Full armor set for a {ANCESTRY} {CLASS} in a dark fantasy RPG. {ARMOR_DESCRIPTION}. Full helmet, shoulder pauldons, breastplate, gauntlets, greaves, boots. Front view with detail callouts: {DETAILS}. {COLOR_SCHEME} color scheme. Dark fantasy, intricate filigree, battle-worn details, 2K, concept art sheet format.',
    learnedFrom: 'Eclipse — 10 full armor sets + 12 class armor sets generated',
    quality: 'aaa',
    tags: ['armor', 'equipment', 'dark-fantasy', 'detail-callouts'],
  },
  {
    id: 'weapon-concept',
    category: 'image',
    name: 'Weapon Concept with States',
    description: 'Weapon showing dormant, charged, and ultimate states with detail callouts.',
    promptTemplate: 'Highly detailed concept art of a {WEAPON_TYPE} called {WEAPON_NAME} for a dark fantasy RPG. {WEAPON_DESCRIPTION}. Three views: dormant (subtle internal glow), charged ({CHARGED_EFFECT}), and ultimate ({ULTIMATE_EFFECT}). Engraved channels visible. Detail callouts: {DETAILS}. {COLOR_SCHEME} color scheme. 2K weapon concept sheet format.',
    learnedFrom: 'Eclipse — 12 signature weapons + 6 elemental sets generated',
    quality: 'aaa',
    tags: ['weapon', 'equipment', 'states', 'dark-fantasy'],
  },
  {
    id: 'environment-concept',
    category: 'image',
    name: 'Environment Concept Art',
    description: 'Full environment scene with atmospheric lighting, scale, and mood.',
    promptTemplate: 'Highly detailed environment concept art for a dark fantasy RPG. {ENVIRONMENT_NAME}: {DESCRIPTION}. {LIGHTING} lighting, {ATMOSPHERE} atmosphere. {ARCHITECTURE} architecture. Dark fantasy, volumetric fog, dramatic scale, 2K, concept art.',
    learnedFrom: 'Eclipse — Cathedral, Weeping Foundry, Duel Circle, Gothic City, World Map generated',
    quality: 'aaa',
    tags: ['environment', 'atmosphere', 'dark-fantasy'],
  },
  {
    id: 'cultural-armor',
    category: 'image',
    name: 'Cultural Armor Set',
    description: 'Culturally-inspired armor with traditional motifs and materials.',
    promptTemplate: 'Full armor set inspired by {CULTURE} culture for a dark fantasy RPG. {CULTURAL_DESCRIPTION}. Ornate details with {MATERIALS}. Ceremonial shoulder pieces. Detailed metalwork with {MOTIFS} motifs. Full melanin model. Dark fantasy meets cultural heritage, 2K.',
    learnedFrom: 'Eclipse — West African, Persian, Egyptian, Viking armor sets + redesigns',
    quality: 'aaa',
    tags: ['armor', 'cultural', 'heritage', 'diverse'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 3D MODEL GENERATION
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'meshy-3d-character',
    category: '3d',
    name: 'Meshy Character 3D Model',
    description: 'Convert concept art to 3D model with PBR textures via Meshy.ai API.',
    promptTemplate: 'POST https://api.meshy.ai/openapi/v1/image-to-3d — Body: { image_url: "data:image/jpeg;base64,{BASE64}", enable_pbr: true, ai_model: "meshy-7.1", orientation: "default", art_style: "realistic" }. Poll until status=SUCCEEDED. Download GLB.',
    learnedFrom: 'Eclipse — 25+ 3D models generated via Meshy API (1.4 GB total)',
    quality: 'aaa',
    tags: ['meshy', '3d', 'character', 'pbr', 'glb'],
  },
  {
    id: 'rodin-3d-hero',
    category: '3d',
    name: 'Rodin High-Detail Hero Model',
    description: 'Ultra-high-detail 3D for hero characters and bosses via Rodin/Hyper3D.',
    promptTemplate: 'POST https://api.hyper3d.com/api/v2/rodin — For hero characters and bosses requiring 10M+ polygons, 4K PBR textures. No auto-rigging — use Meshy for rigged characters.',
    learnedFrom: 'Eclipse — Rodin $30/mo for hero detail, Meshy for standard characters',
    quality: 'aaa',
    tags: ['rodin', 'hyper3d', '3d', 'hero', 'boss', 'high-detail'],
  },
  {
    id: 'blender-refinement',
    category: '3d',
    name: 'Blender 4.2 Refinement Pipeline',
    description: 'Manual sculpting, UV mapping, normal map baking, material editing in Blender.',
    promptTemplate: 'Import GLB to Blender 4.2 LTS. Sculpt additional detail. Create UV maps. Bake normal maps. Apply PBR materials. Export as FBX for UE5.8.',
    learnedFrom: 'Eclipse — Blender 4.2 installed, Python API ready, Python312 + fpdf2 + Pillow',
    quality: 'aaa',
    tags: ['blender', 'sculpting', 'uv', 'normal-maps', 'fbx'],
  },

  // ═══════════════════════════════════════════════════════════════
  // VIDEO / CINEMATICS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'runway-cinematic',
    category: 'video',
    name: 'Runway Gen-3 Cinematic Shot',
    description: '4K cinematic video generation via Runway Gen-3 API.',
    promptTemplate: '4K cinematic shot: {SHOT_DESCRIPTION}. Dark fantasy, dramatic lighting, volumetric fog, film-quality composition, {COLOR_GRADING}. {CAMERA_MOVEMENT}. {DURATION}s. AAA game trailer quality matching Elden Ring / Black Myth: Wukong / Nightreign.',
    learnedFrom: 'Eclipse — 5 trailer breakdowns with 4K target, Runway endpoint api.dev.runwayml.com',
    quality: 'aaa',
    tags: ['runway', 'video', 'cinematic', '4k', 'trailer'],
  },
  {
    id: 'fal-animation',
    category: 'video',
    name: 'fal.ai Animation Generation',
    description: 'AI animation generation via fal.ai API.',
    promptTemplate: 'Generate animation via fal.ai API. {ANIMATION_DESCRIPTION}. Character animation, combat sequences, environmental motion.',
    learnedFrom: 'Eclipse — fal.ai key wired (36 chars)',
    quality: 'high',
    tags: ['fal', 'animation', 'motion'],
  },
  {
    id: 'minimax-video',
    category: 'video',
    name: 'MiniMax Video Generation',
    description: 'High-motion coherence video via MiniMax API.',
    promptTemplate: 'Generate video via MiniMax API. {VIDEO_DESCRIPTION}. High-motion coherence, character consistency.',
    learnedFrom: 'Eclipse — MiniMax key wired (126 chars)',
    quality: 'high',
    tags: ['minimax', 'video', 'motion-coherence'],
  },

  // ═══════════════════════════════════════════════════════════════
  // GAME ENGINE (UE5.8 + Aura)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ue5-project-setup',
    category: 'game-engine',
    name: 'UE5.8 Project Setup',
    description: 'Create UE5.8 project with Aura, Niagara, EnhancedInput plugins.',
    promptTemplate: 'Create .uproject with EngineAssociation 5.8. Enable plugins: Aura, Niagara, EnhancedInput. Create Content folders: Characters, Weapons, Environments, VFX, Materials, Blueprints, UI, Audio. Create Source/EclipseRotF/ with Build.cs, module files, EclipseCharacter.h/cpp (13 ancestries, 17 classes, GCD, Fracture Flow, weapon leveling), EclipseDRSystem.h/cpp (6 DR categories, 100/50/25/immune).',
    learnedFrom: 'Eclipse — Full UE5.8 project built at C:/Users/Tap/EclipseRotF/',
    quality: 'aaa',
    tags: ['ue5', 'unreal', 'project', 'aura', 'niagara'],
  },
  {
    id: 'aura-blueprint-gen',
    category: 'game-engine',
    name: 'Aura Blueprint Generation',
    description: 'Use Aura by Ramen inside UE5.8 to generate Blueprints from text prompts.',
    promptTemplate: 'In UE5.8 with Aura plugin enabled, type: "Create a {BLUEPRINT_TYPE} Blueprint with {COMPONENTS} and {FUNCTIONALITY}. Connect {INPUTS} to {OUTPUTS}. Set up {VARIABLES}."',
    learnedFrom: 'Eclipse — Aura installed in UE5.8 at C:/Program Files/Epic Games/UE_5.8/Engine/Plugins/Marketplace/Aura/',
    quality: 'aaa',
    tags: ['aura', 'blueprint', 'ue5', 'ai-codegen'],
  },
  {
    id: 'aura-combat-system',
    category: 'game-engine',
    name: 'Aura Combat System Generation',
    description: 'Generate combat system (GCD, ability queue, cast bars, Fracture Flow) via Aura.',
    promptTemplate: 'In UE5.8 Aura chat: "Build a combat system with: Global Cooldown (1.5s standard, 1.0s fast classes, configurable), ability queueing (300-400ms window), cast bars, channeling, interrupts, Fracture Flow (build through skillful play, unlock finishers), Diminishing Returns (6 categories, 100/50/25/immune, 15s reset), weapon leveling (50 levels, 1000 kills per level), server-authoritative resolution with client prediction."',
    learnedFrom: 'Eclipse — 18-part combat architecture directive + C++ implementation',
    quality: 'aaa',
    tags: ['aura', 'combat', 'gcd', 'fracture-flow', 'dr', 'cast-bars'],
  },
  {
    id: 'niagara-vfx',
    category: 'game-engine',
    name: 'Niagara VFX System',
    description: 'Create weapon VFX with Niagara particle systems.',
    promptTemplate: 'Create Niagara particle system for {ELEMENT} weapon effect. States: dormant (subtle glow), equipped (responds to movement), attack (directional trails), charged (escalating light), impact (surface-dependent debris), ultimate (reality distortion), recovery (dissipating energy). Use dynamic material instances, Lumen lighting, mesh-based weapon trails. 8 elemental families: Solar (gold-white), Void (amethyst-black), Storm (branching electricity), Frost (crystalline growth), Ember (molten veins), Nature (living runes), Soul (spectral echoes), Temporal (time echoes).',
    learnedFrom: 'Eclipse — Full VFX directive with 10 sections, 8 elemental families, class-specific VFX',
    quality: 'aaa',
    tags: ['niagara', 'vfx', 'particles', 'elements', 'lumen'],
  },
  {
    id: 'lumen-lighting',
    category: 'game-engine',
    name: 'Lumen Dynamic Lighting',
    description: 'Dynamic global illumination for weapon effects influencing surroundings.',
    promptTemplate: 'Use Lumen GI for weapon effect lighting. Dynamic colored light on nearby armor, skin, walls. Reflections on wet stone and polished metal. Energy illuminating wielder face/hands/hair. Controlled emissive bloom. Light intensity responds to charging, attacking, parrying. Environment-specific behavior for caves, forests, ruins, snowfields, dark interiors.',
    learnedFrom: 'Eclipse — VFX directive Section 2: Physically Responsive Lighting',
    quality: 'aaa',
    tags: ['lumen', 'lighting', 'gi', 'dynamic', 'reflections'],
  },
  {
    id: 'nanite-geometry',
    category: 'game-engine',
    name: 'Nanite Virtualized Geometry',
    description: 'Film-quality geometry for environments and characters.',
    promptTemplate: 'Enable Nanite on all static meshes. Film-quality geometry for stone architecture, environment props, character armor detail. LOD-free rendering. Supports millions of polygons per object.',
    learnedFrom: 'Eclipse — Visual target: Wukong/Elden Ring/Nightreign level on RX 6800 16GB',
    quality: 'aaa',
    tags: ['nanite', 'geometry', 'film-quality', 'lods'],
  },

  // ═══════════════════════════════════════════════════════════════
  // LORE & STORYTELLING
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'lore-bible',
    category: 'lore',
    name: 'Eclipse Lore Bible',
    description: 'Complete canonical lore: The Fracture, The Eclipse, Seven Mandates, 13 ancestry origins, three endings, 10 zones, 14 bosses, 14 factions.',
    promptTemplate: 'Read ECLIPSE_LORE_BIBLE.md (55,704 chars). 15 locked rules — cannot be contradicted. The Aethel was consumed by the Eclipse. The Fracture split the continent. 13 ancestries are fragments of the Aethel. Three canonical endings: The Mending, The Fracture, The Acceleration. No dragons exist (Draven are dragon-KIN, not dragons). No retcons allowed.',
    learnedFrom: 'Eclipse — Lore bible with 15 locked rules, 3 canonical endings, no retcons',
    quality: 'aaa',
    tags: ['lore', 'story', 'canon', 'world-building'],
  },

  // ═══════════════════════════════════════════════════════════════
  // PDF / DOCUMENT GENERATION
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'pdf-bible',
    category: 'prompt',
    name: 'Master Bible PDF Builder',
    description: 'Build comprehensive game bible PDFs with fpdf2, dark theme, embedded images.',
    promptTemplate: 'Use fpdf2 with PIL for image resizing. Dark background on every page (header fills full page). Gold (#D4AF37) and amethyst (#9146FF) accents. Cover page, table of contents, section headers, subsection headers, body text, bullet points. Embed concept art images (resized to fit). Footer with Momentum Labs branding. Output to C:/Users/Tap/AppData/Local/hermes/cache/documents/.',
    learnedFrom: 'Eclipse — 131-page bible built, 76-page visual review, 30-page image catalog',
    quality: 'aaa',
    tags: ['pdf', 'fpdf2', 'documentation', 'bible'],
  },
  {
    id: 'base44-website-prompt',
    category: 'prompt',
    name: 'Base44 Website Builder Prompt',
    description: 'Complete website builder prompt for Base44 to create the Eclipse game website.',
    promptTemplate: 'Build a dark fantasy game website with: Home (hero, stats, featured), Ancestries (13 cards), Classes (17 cards), Combat (GCD, Fracture Flow, DR), Affinities (10 elements, 45 combos), Game Modes (11), Gear (50 levels, 7 tiers), World (16 zones), Bosses (14), Premades (24), Character Creation, PvP, Social, Gallery, Tech, Brand. Dark theme, gold/purple accents, fractured glass motifs, cosmic backgrounds, responsive, SEO.',
    learnedFrom: 'Eclipse — Full Base44 prompt with 16 pages + lore page prompt',
    quality: 'aaa',
    tags: ['base44', 'website', 'game', 'marketing'],
  },
];

// ═══════════════════════════════════════════════════════════════
// CAPABILITIES MATRIX — What The Canvas Can Do
// ═══════════════════════════════════════════════════════════════
export const CANVAS_CAPABILITIES = {
  // Currently Working
  image_generation: {
    providers: ['OpenAI DALL-E 3', 'Stability SD3', 'Google Imagen 3', 'MiniMax'],
    status: 'active',
    resolution: '2K',
    capabilities: ['character concept art', 'armor sets', 'weapons', 'environments', 'spell VFX', 'UI mockups', 'cultural armor', 'world maps'],
  },
  video_generation: {
    providers: ['Runway Gen-3', 'fal.ai', 'MiniMax'],
    status: 'active',
    resolution: '4K target',
    capabilities: ['cinematic trailers', 'combat sequences', 'environment flythroughs', 'boss reveals', 'cut scenes'],
  },
  '3d_model_generation': {
    providers: ['Meshy.ai', 'Rodin/Hyper3D', 'Tripo MCP'],
    status: 'active',
    format: 'GLB/FBX with PBR',
    capabilities: ['character models', 'weapon models', 'armor models', 'environment props', 'auto-rigging', '600+ animations'],
  },
  '3d_refinement': {
    providers: ['Blender 4.2 LTS'],
    status: 'active',
    capabilities: ['sculpting', 'UV mapping', 'normal map baking', 'material editing', 'FBX export'],
  },
  game_engine: {
    providers: ['Unreal Engine 5.8', 'Aura by Ramen'],
    status: 'active',
    capabilities: ['C++ source', 'Blueprint generation', 'Niagara VFX', 'Lumen lighting', 'Nanite geometry', 'World Partition', 'Gameplay Ability System', 'combat systems', 'character controllers', 'materials', 'level design'],
  },
  pdf_generation: {
    providers: ['fpdf2', 'PIL/Pillow'],
    status: 'active',
    capabilities: ['game bibles', 'visual reviews', 'image catalogs', 'design documents', 'pitch decks'],
  },
  website_generation: {
    providers: ['Base44'],
    status: 'active',
    capabilities: ['game websites', 'lore pages', 'marketing sites', 'brand pages'],
  },
  mcp_servers: {
    providers: ['ImagineArt', 'ACE Studio', 'BeatStars', 'REA', 'Creatify', 'Tripo'],
    status: 'active',
    capabilities: ['AI image gen', 'vocal synthesis', 'beat marketplace', 'reverse engineering', 'content creation', '3D generation'],
  },

  // Future Capabilities (being learned)
  future: {
    full_game_engine: 'The Canvas will eventually have built-in game engine capabilities — scene building, physics, materials, Blueprint visual scripting, level design — all within The Canvas UI without needing UE5.8 separately.',
    autonomous_pipeline: 'The Canvas will eventually take a game bible PDF and autonomously generate: all concept art → 3D models → cinematics → game build → website. One input, complete game.',
    cinematic_director: 'The Canvas will eventually direct full cinematics: storyboard → generate shots → composite → score → final 4K trailer. No manual intervention.',
    world_builder: 'The Canvas will eventually generate entire game worlds from lore descriptions: terrain, cities, dungeons, NPCs, quests, all procedurally from the lore bible.',
  },
};

// ═══════════════════════════════════════════════════════════════
// PIPELINE — The Full Eclipse Production Flow
// ═══════════════════════════════════════════════════════════════
export const ECLIPSE_PIPELINE = {
  step1_lore: {
    name: 'Lore & Design',
    tools: ['Hermes', 'Markdown', 'PDF'],
    output: 'Game Bible PDF (131 pages), Lore Bible, Combat Architecture, VFX Directive',
    time: 'Hours',
  },
  step2_concept_art: {
    name: 'Concept Art Generation',
    tools: ['The Canvas (DALL-E 3, SD3, Imagen)', 'image_generate (Krea-3)'],
    output: '138 concept art pieces (2K), dark fantasy, full melanin, AAA quality',
    time: 'Minutes per batch',
  },
  step3_3d_models: {
    name: '3D Model Generation',
    tools: ['Meshy.ai API', 'Rodin/Hyper3D API', 'Blender 4.2'],
    output: 'GLB/FBX with PBR textures, auto-rigged, 600+ animations',
    time: 'Minutes per model',
  },
  step4_cinematics: {
    name: 'Cinematics & Trailers',
    tools: ['Runway Gen-3 API', 'fal.ai', 'MiniMax', 'DALL-E 3 (storyboards)'],
    output: '4K cinematic trailers, cut scenes, boss reveals',
    time: 'Hours per trailer',
  },
  step5_game_build: {
    name: 'Game Engine Build',
    tools: ['UE5.8', 'Aura by Ramen', 'Niagara', 'Lumen', 'Nanite'],
    output: 'Playable game with combat, characters, environments, VFX',
    time: 'Days to weeks',
  },
  step6_website: {
    name: 'Website & Marketing',
    tools: ['Base44', 'The Canvas'],
    output: 'Game website on momentumlabsstudio.com with all content',
    time: 'Hours',
  },
  step7_audio: {
    name: 'Sound & Music',
    tools: ['The Engine Room (VST3/AAX/AU)', 'ACE Studio', 'fal.ai'],
    output: 'Game audio, weapon sounds, ambient music, voice acting',
    time: 'Days',
  },
};
