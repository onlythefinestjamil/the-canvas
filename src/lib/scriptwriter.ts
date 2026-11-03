// Script Studio - generation engine for The Canvas
// 6 modes: Commercial, Music Video, Social Media, Screenplay, Shot List, Director's Treatment
// Plus pre-built Poppin templates, OTF commercial concepts, HDPC framework, and top hooks.

// ---------------------------------------------------------------------------
// Shared input
// ---------------------------------------------------------------------------

export interface ScriptInput {
  brand: string;
  product?: string;
  audience?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'tv';
  duration: 15 | 30 | 60 | 90;
  styleRefs?: string;
  tone?: string;
}

// ---------------------------------------------------------------------------
// Mode A: Commercial Ad Scripts
// ---------------------------------------------------------------------------

export type CommercialDuration = 15 | 30 | 60 | 90;

export interface CommercialShot {
  time: string;
  visual: string;
  audio: string;
  onScreenText: string;
  cameraAngle: string;
  lens: string;
  lighting: string;
  movement: string;
  voiceover: string;
  musicSfx: string;
}

export interface CommercialVariation {
  title: string;
  angle: string;
  shots: CommercialShot[];
  platform: ScriptInput['platform'];
}

export interface CommercialScript {
  mode: 'commercial';
  brand: string;
  duration: CommercialDuration;
  platform: ScriptInput['platform'];
  variations: CommercialVariation[];
}

const CAMERA_ANGLES = [
  'Wide establishing',
  'Medium tracking',
  'Close-up',
  'Overhead',
  'Low angle hero',
  'POV handheld',
  'Drone pullback',
  'Macro detail',
];

const LENSES = ['24mm', '35mm', '50mm', '85mm', 'Macro 100mm', 'Anamorphic 40mm'];

const MOVEMENTS = ['Static', 'Slow push-in', 'Tracking dolly', 'Handheld follow', 'Crane up', 'Whip pan', 'Orbit', 'Gimbal walk'];

const LIGHTING = ['Soft key + ambient fill', 'Hard rim backlight', 'Golden hour natural', 'Neon practicals', 'High-key bright', 'Low-key moody', 'Window side light'];

function padTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function buildCommercialShots(input: ScriptInput, variation: CommercialVariation): CommercialShot[] {
  const total = input.duration;
  const beatCount = Math.max(4, Math.round(total / 5));
  const beats: CommercialShot[] = [];
  const hook = TOP_HOOKS[Math.floor(Math.random() * TOP_HOOKS.length)];
  const product = input.product || input.brand;
  for (let i = 0; i < beatCount; i++) {
    const start = Math.round((i / beatCount) * total);
    const end = Math.round(((i + 1) / beatCount) * total);
    const beat: CommercialShot = {
      time: `${padTime(start)} - ${padTime(end)}`,
      visual: i === 0
        ? `${variation.angle}. ${input.brand} logo reveals over a ${input.audience || 'lifestyle'} moment.`
        : i === beatCount - 1
          ? `Hero shot of ${product}. ${input.brand} logo lockup, end card.`
          : `Product beat ${i}: ${product} in use, ${input.audience || 'subject'} reacting.`,
      audio: i === 0 ? `Music in. ${hook.name} hook.` : i === beatCount - 1 ? 'Music swells to resolve. VO outro.' : `Bed under VO. Subtle SFX.`,
      onScreenText: i === 0 ? input.brand.toUpperCase() : i === beatCount - 1 ? `${input.brand} - ${product}` : '',
      cameraAngle: CAMERA_ANGLES[i % CAMERA_ANGLES.length],
      lens: LENSES[i % LENSES.length],
      lighting: LIGHTING[i % LIGHTING.length],
      movement: MOVEMENTS[i % MOVEMENTS.length],
      voiceover: i === 0 ? `This is ${input.brand}.` : i === beatCount - 1 ? `${input.brand}. ${product}.` : `Beat ${i} VO line.`,
      musicSfx: i === 0 ? 'Brand stinger' : i === beatCount - 1 ? 'Riser + impact' : 'Texture bed',
    };
    beats.push(beat);
  }
  return beats;
}

const COMMERCIAL_ANGLES = [
  { title: 'Problem / Solution', angle: 'Open on a relatable frustration, then reveal the product as the fix.' },
  { title: 'Aspirational Lifestyle', angle: 'Show the audience the life they could have with the product.' },
  { title: 'Founder Story', angle: 'Personal, behind-the-brand narrative told as a mini-doc.' },
];

export function generateCommercial(input: ScriptInput): CommercialScript {
  const variations: CommercialVariation[] = COMMERCIAL_ANGLES.map((a) => {
    const v: CommercialVariation = {
      title: a.title,
      angle: a.angle,
      platform: input.platform,
      shots: [],
    };
    v.shots = buildCommercialShots(input, v);
    return v;
  });
  return { mode: 'commercial', brand: input.brand, duration: input.duration, platform: input.platform, variations };
}

// ---------------------------------------------------------------------------
// Mode B: Music Video Treatments
// ---------------------------------------------------------------------------

export interface MusicVideoScene {
  scene: number;
  description: string;
  shotList: string[];
  lighting: string;
  wardrobe: string;
  location: string;
}

export interface MusicVideoTreatment {
  mode: 'music-video';
  title: string;
  artist: string;
  visualStyle: string;
  colorPalette: string[];
  mood: string;
  pacing: string;
  scenes: MusicVideoScene[];
  locations: string[];
}

const PALETTES = [
  ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
  ['#0c0c0c', '#c9a227', '#8b6f3f', '#f5f5f7'],
  ['#0a0a0a', '#7c5cff', '#5b8cff', '#f5f5f7'],
  ['#1b1b1b', '#ff6b3d', '#ff4fa3', '#fff5ee'],
];

const LOCATIONS = [
  'Rooftop at golden hour',
  'Neon-lit alley',
  'Empty warehouse with haze',
  'Beach at dusk',
  'Studio cyc with projected visuals',
  'Moving vehicle (interior)',
];

export function generateMusicVideo(input: ScriptInput): MusicVideoTreatment {
  const sceneCount = 6;
  const scenes: MusicVideoScene[] = [];
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      scene: i + 1,
      description: `Scene ${i + 1}: ${input.brand} performs in a ${LOCATIONS[i % LOCATIONS.length]}. ${i === 0 ? 'Cold open, first beat drops.' : i === sceneCount - 1 ? 'Climactic finale with full cast.' : 'Bridge section, mood shift.'}`,
      shotList: [
        `Wide establishing of ${LOCATIONS[i % LOCATIONS.length]}`,
        `Medium tracking of ${input.brand}`,
        `Close-up on hands / instrument`,
        i % 2 === 0 ? 'Drone orbit' : 'Slow crane up',
      ],
      lighting: LIGHTING[i % LIGHTING.length],
      wardrobe: ['All black streetwear', 'Head-to-toe ${brand} look', 'Statement piece + minimal'][i % 3].replace('${brand}', input.brand),
      location: LOCATIONS[i % LOCATIONS.length],
    });
  }
  return {
    mode: 'music-video',
    title: `${input.brand} - Music Video Treatment`,
    artist: input.brand,
    visualStyle: input.styleRefs || 'Cinematic, high-contrast, performance-led with narrative intercuts.',
    colorPalette: palette,
    mood: input.tone || 'Confident, nocturnal, charged.',
    pacing: 'Verse slow / chorus kinetic / bridge reset / outro crescendo.',
    scenes,
    locations: Array.from(new Set(scenes.map((s) => s.location))),
  };
}

// ---------------------------------------------------------------------------
// Mode C: Social Media Scripts (Reels, TikToks, Shorts)
// ---------------------------------------------------------------------------

export interface SocialVariation {
  title: string;
  hook: string;
  hookType: string;
  body: string[];
  cta: string;
  captions: string;
  hashtags: string;
  audioSuggestion: string;
  platform: ScriptInput['platform'];
}

export interface SocialScript {
  mode: 'social';
  brand: string;
  platform: ScriptInput['platform'];
  variations: SocialVariation[];
}

const SOCIAL_VARIATIONS = [
  { title: 'Specific Outcome', hookType: 'Specific Outcome (45%)', hook: `Stop scrolling if you want ${'{outcome}'}.` },
  { title: 'POV', hookType: 'POV (42%)', hook: `POV: you just discovered ${'{product}'}.` },
  { title: 'Contrarian', hookType: 'Contrarian (38%)', hook: `Everyone is wrong about ${'{product}'}. Here's why.` },
];

export function generateSocial(input: ScriptInput): SocialScript {
  const product = input.product || input.brand;
  const outcomes = ['the cleanest fit on your feed', '10x faster results', 'the exact look you have been searching for', 'a wardrobe that actually works'];
  const variations: SocialVariation[] = SOCIAL_VARIATIONS.map((v, i) => ({
    title: v.title,
    hook: v.hook.replace('{outcome}', outcomes[i % outcomes.length]).replace('{product}', product),
    hookType: v.hookType,
    body: [
      `Open on ${product} in action.`,
      `Quick cut to the detail that matters.`,
      `Show the result / transformation.`,
      `Reinforce with one stat or social proof line.`,
    ],
    cta: `Follow ${input.brand} for more. Link in bio.`,
    captions: `${product} is the move. #ad`,
    hashtags: `#${input.brand.replace(/\s+/g, '')} #${input.platform} #fyp #style #${(input.product || 'fit').replace(/\s+/g, '')}`,
    audioSuggestion: i === 0 ? 'Trending upbeat instrumental' : i === 1 ? 'Soft lo-fi bed' : 'Dropped beat / spoken-word style',
    platform: input.platform,
  }));
  return { mode: 'social', brand: input.brand, platform: input.platform, variations };
}

// ---------------------------------------------------------------------------
// Mode D: Screenplay Format (industry standard)
// ---------------------------------------------------------------------------

export interface ScreenplayScene {
  heading: string;
  action: string;
  dialogue: { character: string; parenthetical?: string; line: string }[];
  transition: string;
}

export interface Screenplay {
  mode: 'screenplay';
  title: string;
  scenes: ScreenplayScene[];
  format: string;
}

export function generateScreenplay(input: ScriptInput): Screenplay {
  const product = input.product || input.brand;
  const scenes: ScreenplayScene[] = [
    {
      heading: `INT. ${input.brand.toUpperCase()} SHOWROOM - DAY`,
      action: `Clean white walls, a single pedestal. On it: ${product.toUpperCase()}. Light spills through floor-to-ceiling windows.`,
      dialogue: [
        { character: 'NARRATOR', parenthetical: 'V.O.', line: `They said it could not be done.` },
        { character: 'LEAD', line: `Watch this.` },
      ],
      transition: 'CUT TO:',
    },
    {
      heading: `EXT. CITY STREET - DAY`,
      action: `The LEAD carries ${product.toUpperCase()} down a busy block. Heads turn. Time seems to slow.`,
      dialogue: [
        { character: 'BYSTANDER', parenthetical: 'under their breath', line: `Is that... ${product}?` },
      ],
      transition: 'CUT TO:',
    },
    {
      heading: `INT. ${input.brand.toUpperCase()} SHOWROOM - DAY`,
      action: `Back in the showroom. The pedestal is empty. ${product.toUpperCase()} is in the world now.`,
      dialogue: [
        { character: 'NARRATOR', parenthetical: 'V.O.', line: `${input.brand}. ${product}. Only the finest.` },
      ],
      transition: 'FADE OUT.',
    },
  ];
  return { mode: 'screenplay', title: `${input.brand} - ${product}`, scenes, format: 'Industry standard: Courier 12pt, 1.5in left margin, 1in right, all caps scene headings, centered dialogue.' };
}

// ---------------------------------------------------------------------------
// Mode E: Shot List Generator
// ---------------------------------------------------------------------------

export interface ShotListEntry {
  shot: number;
  scene: string;
  shotType: string;
  cameraMovement: string;
  lens: string;
  lighting: string;
  duration: string;
  notes: string;
}

export interface ShotList {
  mode: 'shot-list';
  project: string;
  shots: ShotListEntry[];
}

const SHOT_TYPES = ['Wide', 'Medium', 'Close-up', 'Overhead', 'Tracking', 'Drone', 'Insert', 'OTS'];

export function generateShotList(input: ScriptInput): ShotList {
  const count = 12;
  const shots: ShotListEntry[] = [];
  for (let i = 0; i < count; i++) {
    shots.push({
      shot: i + 1,
      scene: `Scene ${Math.floor(i / 4) + 1}`,
      shotType: SHOT_TYPES[i % SHOT_TYPES.length],
      cameraMovement: MOVEMENTS[i % MOVEMENTS.length],
      lens: LENSES[i % LENSES.length],
      lighting: LIGHTING[i % LIGHTING.length],
      duration: `${2 + (i % 4)}s`,
      notes: `${input.brand} beat ${i + 1}. ${i === 0 ? 'Cold open.' : i === count - 1 ? 'End card.' : 'Coverage.'}`,
    });
  }
  return { mode: 'shot-list', project: `${input.brand} - ${input.product || 'Spot'}`, shots };
}

// ---------------------------------------------------------------------------
// Mode F: Director's Treatment
// ---------------------------------------------------------------------------

export interface DirectorsTreatment {
  mode: 'director';
  brand: string;
  visualStyle: string;
  tone: string;
  mood: string;
  colorGrading: string;
  pacing: string;
  referenceFilms: string[];
  musicDirection: string;
  lensing: string[];
}

export function generateDirector(input: ScriptInput): DirectorsTreatment {
  return {
    mode: 'director',
    brand: input.brand,
    visualStyle: input.styleRefs || 'Cinematic, anamorphic, shallow depth of field. Practical light over artificial.',
    tone: input.tone || 'Confident, restrained, premium.',
    mood: 'Nocturnal energy with daylight warmth in the resolution.',
    colorGrading: 'Cool shadows, warm highlights. Slight teal-orange split. Crushed but textured blacks.',
    pacing: `${input.duration}s: slow open, accelerating middle, held beat on hero, snap to end card.`,
    referenceFilms: [
      'Nike "You Can not Stop Us" - split-frame kineticism',
      'Apple "Shot on iPhone" - natural light authenticity',
      'Saint Laurent self-titled - minimal, high-contrast, music-led',
    ],
    musicDirection: 'Original score. Sub-bass pulse under verses, full arrangement on the drop, stripped back on the outro.',
    lensing: ['24mm for establishing wides', '50mm for hero portraits', '85mm for detail inserts', 'Anamorphic for the brand reveal'],
  };
}

// ---------------------------------------------------------------------------
// HDPC Framework (Hook / Demo / Proof / CTA)
// ---------------------------------------------------------------------------

export interface HdpcBeat {
  label: string;
  range: string;
  description: string;
}

export const HDPC_FRAMEWORK: HdpcBeat[] = [
  { label: 'Hook', range: '0 - 3s', description: 'Stop the scroll. One bold visual or statement that earns the next 3 seconds.' },
  { label: 'Demo', range: '3 - 15s', description: 'Show the product in action. Fast cuts, clear benefit, no wasted frames.' },
  { label: 'Proof', range: '15 - 25s', description: 'Social proof, a stat, a testimonial, or a before/after. Justify the claim.' },
  { label: 'CTA', range: '25 - 30s', description: 'One clear action. Shop now, follow, link in bio. No ambiguity.' },
];

// ---------------------------------------------------------------------------
// Top Hooks
// ---------------------------------------------------------------------------

export interface Hook {
  name: string;
  type: string;
  weight: number;
  template: string;
}

export const TOP_HOOKS: Hook[] = [
  { name: 'Specific Outcome', type: 'Specific Outcome', weight: 0.45, template: 'Stop scrolling if you want {outcome}.' },
  { name: 'POV', type: 'POV', weight: 0.42, template: 'POV: you just discovered {product}.' },
  { name: 'Contrarian', type: 'Contrarian', weight: 0.38, template: 'Everyone is wrong about {product}. Here is why.' },
  { name: 'Question', type: 'Question', weight: 0.33, template: 'What if {product} was the only thing you needed?' },
  { name: 'Bold Claim', type: 'Bold Claim', weight: 0.30, template: 'This is the last {category} you will ever buy.' },
];

// ---------------------------------------------------------------------------
// 21 Poppin Concepts (from the content plan)
// ---------------------------------------------------------------------------

export interface PoppinConcept {
  id: number;
  name: string;
  category: string;
  description: string;
  hdpc: { hook: string; demo: string; proof: string; cta: string };
}

export const POPPIN_CONCEPTS: PoppinConcept[] = [
  { id: 1, name: 'Reaction Videos', category: 'Poppin', description: 'Record a genuine first reaction to a product reveal or unboxing.', hdpc: { hook: 'Pure shock face in the first frame.', demo: 'Unbox and react in real time.', proof: 'Replay the best moment in slow-mo.', cta: 'Comment your reaction.' } },
  { id: 2, name: 'BTS vs Shot', category: 'Poppin', description: 'Show the messy behind-the-scenes next to the polished final frame.', hdpc: { hook: 'Split screen: BTS chaos vs clean final.', demo: 'Cut between setup and result.', proof: 'Side-by-side reveal.', cta: 'Follow for more BTS.' } },
  { id: 3, name: 'Snapchat Method', category: 'Poppin', description: 'Fast vertical snaps stacked into a single Reel-style narrative.', hdpc: { hook: 'First snap sets the scene.', demo: '5 rapid snaps tell the story.', proof: 'Final snap shows the result.', cta: 'Save this method.' } },
  { id: 4, name: 'Slide Posts', category: 'Poppin', description: 'Carousel of slides each revealing one beat of the story.', hdpc: { hook: 'Slide 1 is the boldest frame.', demo: 'Slides 2-6 build the arc.', proof: 'Slide 7 shows the payoff.', cta: 'Swipe through and share.' } },
  { id: 5, name: 'Movie Scene', category: 'Poppin', description: 'Frame the product drop like a film scene with a score.', hdpc: { hook: 'Cinematic cold open.', demo: 'The product is the MacGuffin.', proof: 'A character reacts to it.', cta: 'Watch till the end.' } },
  { id: 6, name: 'Social Battery', category: 'Poppin', description: 'Show how the product recharges or drains your social energy.', hdpc: { hook: 'Low-battery meter on screen.', demo: 'Product brings it back to full.', proof: 'Full charge, good vibes.', cta: 'What recharges you?' } },
  { id: 7, name: 'The Accountant', category: 'Poppin', description: 'Deadpan list of what the product costs vs what it is worth.', hdpc: { hook: 'Spreadsheet on screen.', demo: 'Line-item the value.', proof: 'Total beats the price.', cta: 'Worth every penny.' } },
  { id: 8, name: 'Revis Island', category: 'Poppin', description: 'Lockdown coverage vibe - nothing gets past this product.', hdpc: { hook: 'Defensive stance cold open.', demo: 'Product shuts down the problem.', proof: 'Replay the lockdown.', cta: 'Covered. Period.' } },
  { id: 9, name: 'Too Many Options', category: 'Poppin', description: 'Overwhelm with choice, then the product is the only answer.', hdpc: { hook: 'A wall of options.', demo: 'Cut between alternatives.', proof: 'One clears the board.', cta: 'The only one you need.' } },
  { id: 10, name: 'Fit Check', category: 'Poppin', description: 'Head-to-toe outfit reveal to a beat.', hdpc: { hook: 'First frame is the shoes.', demo: 'Pan up the fit.', proof: 'Full look reveal.', cta: 'Rate the fit 1-10.' } },
  { id: 11, name: 'Unboxing ASMR', category: 'Poppin', description: 'Tactile, audio-forward unboxing with no music.', hdpc: { hook: 'Tape rip, close-up.', demo: 'Slow reveal of each layer.', proof: 'Final piece in hand.', cta: 'Sound on for this one.' } },
  { id: 12, name: 'Day in the Life', category: 'Poppin', description: 'Follow the product through a real day, start to finish.', hdpc: { hook: 'Alarm clock, morning light.', demo: 'Montage of moments.', proof: 'End of day reflection.', cta: 'A day with {brand}.' } },
  { id: 13, name: 'Before / After', category: 'Poppin', description: 'Classic transformation split.', hdpc: { hook: 'The before.', demo: 'The process in fast-forward.', proof: 'The after, held.', cta: 'Try it yourself.' } },
  { id: 14, name: 'Street Interviews', category: 'Poppin', description: 'Ask real people about the product, cut the best answers.', hdpc: { hook: 'One sharp question.', demo: 'Quick answers in the wild.', proof: 'One perfect response.', cta: 'What would you say?' } },
  { id: 15, name: 'Text Story', category: 'Poppin', description: 'A narrative told through fake text messages on screen.', hdpc: { hook: 'Incoming text alert.', demo: 'The conversation unfolds.', proof: 'The clincher message.', cta: 'Send this to a friend.' } },
  { id: 16, name: 'Green Screen Remix', category: 'Poppin', description: 'Self over a green screen of the product context.', hdpc: { hook: 'Pop into frame.', demo: 'React over the backdrop.', proof: 'Drop the key fact.', cta: 'Remix this template.' } },
  { id: 17, name: 'Listicle', category: 'Poppin', description: '3 / 5 / 7 reasons stacked fast.', hdpc: { hook: 'Number one is the boldest.', demo: 'Rapid count up.', proof: 'Last reason is the gut-punch.', cta: 'Which one is yours?' } },
  { id: 18, name: 'Hot Take', category: 'Poppin', description: 'A confident, debatable opinion that sparks comments.', hdpc: { hook: 'Bold claim on screen.', demo: 'Defend it in 15 seconds.', proof: 'One piece of evidence.', cta: 'Agree or disagree?' } },
  { id: 19, name: 'Trend Jacking', category: 'Poppin', description: 'Adapt a trending format to the product.', hdpc: { hook: 'Use the trend audio.', demo: 'Fit the product to the meme.', proof: 'Land the punchline.', cta: 'Use this sound.' } },
  { id: 20, name: 'Tutorial Speedrun', category: 'Poppin', description: 'Teach something useful at 2x speed.', hdpc: { hook: 'The end result first.', demo: 'Rewind, then speedrun.', proof: 'Side-by-side comparison.', cta: 'Save the tutorial.' } },
  { id: 21, name: 'POV Narrative', category: 'Poppin', description: 'Put the viewer in the driver seat of a story.', hdpc: { hook: 'POV: you just got the call.', demo: 'You live the moment.', proof: 'The payoff is yours.', cta: 'What is your move?' } },
];

// ---------------------------------------------------------------------------
// 8 OTF Commercial Concepts
// ---------------------------------------------------------------------------

export interface OtfConcept {
  id: number;
  name: string;
  description: string;
  hdpc: { hook: string; demo: string; proof: string; cta: string };
}

export const OTF_COMMERCIAL_CONCEPTS: OtfConcept[] = [
  { id: 1, name: 'Wrong Briefcase', description: 'A high-stakes briefcase handoff, but it is the wrong one - the OTF piece inside steals the scene.', hdpc: { hook: 'Briefcase clicks open wrong.', demo: 'Inside: the OTF drop.', proof: 'The deal still goes through.', cta: 'Only The Finest.' } },
  { id: 2, name: 'Getaway Fit', description: 'A clean escape sequence where the getaway look is the real headline.', hdpc: { hook: 'Engine starts, hood up.', demo: 'The fit is the getaway.', proof: 'Gone, looking flawless.', cta: 'Get the getaway fit.' } },
  { id: 3, name: 'Package Decoy', description: 'A decoy package swap at a dead drop - the real prize is the tracksuit.', hdpc: { hook: 'Brown paper, taped shut.', demo: 'Swap reveals the OTF piece.', proof: 'The mark does not notice.', cta: 'Only The Finest.' } },
  { id: 4, name: 'Museum Heist', description: 'A gallery heist where the art is ignored for the OTF piece in the room.', hdpc: { hook: 'Laser grid, gloves on.', demo: 'Skip the masterpiece, take the fit.', proof: 'The case is empty, the closet is full.', cta: 'Only The Finest.' } },
  { id: 5, name: 'Emergency', description: 'A fire-alarm scramble where the only thing grabbed on the way out is the OTF jacket.', hdpc: { hook: 'Alarm blares.', demo: 'One grab off the rack.', proof: 'Out the door in the right piece.', cta: 'Only The Finest.' } },
  { id: 6, name: 'Breakup Pickup', description: 'A breakup turned into a glow-up pickup - the ex sees the new OTF fit first.', hdpc: { hook: 'Box of stuff on the curb.', demo: 'One piece stays. The OTF one.', proof: 'The ex sees it first.', cta: 'Only The Finest.' } },
  { id: 7, name: 'Suitcase Mix-Up', description: 'Two identical suitcases at baggage claim, one full of cash, one full of OTF - the hero picks the fit.', hdpc: { hook: 'Carousel spins.', demo: 'Two cases, one choice.', proof: 'The fit was the upgrade.', cta: 'Only The Finest.' } },
  { id: 8, name: 'Last Fit on Earth', description: 'Post-apocalyptic, one survivor, one surviving tracksuit - the only thing left worth wearing.', hdpc: { hook: 'Dust clears over the skyline.', demo: 'One rack left standing.', proof: 'The last fit is the best fit.', cta: 'Only The Finest.' } },
];

// ---------------------------------------------------------------------------
// Unified generate entry point
// ---------------------------------------------------------------------------

export type ScriptMode = 'commercial' | 'music-video' | 'social' | 'screenplay' | 'shot-list' | 'director';

export type AnyScript = CommercialScript | MusicVideoTreatment | SocialScript | Screenplay | ShotList | DirectorsTreatment;

export function generateScript(mode: ScriptMode, input: ScriptInput): AnyScript {
  switch (mode) {
    case 'commercial':
      return generateCommercial(input);
    case 'music-video':
      return generateMusicVideo(input);
    case 'social':
      return generateSocial(input);
    case 'screenplay':
      return generateScreenplay(input);
    case 'shot-list':
      return generateShotList(input);
    case 'director':
      return generateDirector(input);
  }
}

// ---------------------------------------------------------------------------
// Export helpers (plain text + PDF-ready)
// ---------------------------------------------------------------------------

export function scriptToText(script: AnyScript): string {
  switch (script.mode) {
    case 'commercial': {
      const lines: string[] = [];
      lines.push(`${script.brand.toUpperCase()} - ${script.duration}s COMMERCIAL (${script.platform})`);
      lines.push('');
      for (const v of script.variations) {
        lines.push(`### ${v.title.toUpperCase()}`);
        lines.push(`Angle: ${v.angle}`);
        lines.push('');
        lines.push('TIME | VISUAL | AUDIO | ON-SCREEN TEXT');
        for (const s of v.shots) {
          lines.push(`${s.time} | ${s.visual} | ${s.audio} | ${s.onScreenText || '-'}`);
        }
        lines.push('');
      }
      return lines.join('\n');
    }
    case 'music-video': {
      const lines: string[] = [];
      lines.push(`MUSIC VIDEO TREATMENT - ${script.title}`);
      lines.push(`Artist: ${script.artist}`);
      lines.push(`Visual style: ${script.visualStyle}`);
      lines.push(`Mood: ${script.mood} | Pacing: ${script.pacing}`);
      lines.push(`Color palette: ${script.colorPalette.join(' / ')}`);
      lines.push('');
      for (const s of script.scenes) {
        lines.push(`SCENE ${s.scene} - ${s.location}`);
        lines.push(`  ${s.description}`);
        lines.push(`  Shots: ${s.shotList.join(', ')}`);
        lines.push(`  Lighting: ${s.lighting} | Wardrobe: ${s.wardrobe}`);
        lines.push('');
      }
      return lines.join('\n');
    }
    case 'social': {
      const lines: string[] = [];
      lines.push(`SOCIAL SCRIPT - ${script.brand} (${script.platform})`);
      lines.push('');
      for (const v of script.variations) {
        lines.push(`### ${v.title} [${v.hookType}]`);
        lines.push(`HOOK: ${v.hook}`);
        lines.push(`BODY: ${v.body.join(' ')}`);
        lines.push(`CTA: ${v.cta}`);
        lines.push(`Captions: ${v.captions}`);
        lines.push(`Hashtags: ${v.hashtags}`);
        lines.push(`Audio: ${v.audioSuggestion}`);
        lines.push('');
      }
      return lines.join('\n');
    }
    case 'screenplay': {
      const lines: string[] = [];
      lines.push(`SCREENPLAY - ${script.title}`);
      lines.push(`Format: ${script.format}`);
      lines.push('');
      for (const s of script.scenes) {
        lines.push(s.heading);
        lines.push(s.action);
        lines.push('');
        for (const d of s.dialogue) {
          lines.push(d.character.toUpperCase());
          if (d.parenthetical) lines.push(`(${d.parenthetical})`);
          lines.push(d.line);
          lines.push('');
        }
        lines.push(s.transition);
        lines.push('');
      }
      return lines.join('\n');
    }
    case 'shot-list': {
      const lines: string[] = [];
      lines.push(`SHOT LIST - ${script.project}`);
      lines.push('');
      lines.push('SHOT | SCENE | TYPE | MOVEMENT | LENS | LIGHT | DUR | NOTES');
      for (const s of script.shots) {
        lines.push(`${s.shot} | ${s.scene} | ${s.shotType} | ${s.cameraMovement} | ${s.lens} | ${s.lighting} | ${s.duration} | ${s.notes}`);
      }
      return lines.join('\n');
    }
    case 'director': {
      const lines: string[] = [];
      lines.push(`DIRECTOR'S TREATMENT - ${script.brand}`);
      lines.push('');
      lines.push(`Visual style: ${script.visualStyle}`);
      lines.push(`Tone: ${script.tone}`);
      lines.push(`Mood: ${script.mood}`);
      lines.push(`Color grading: ${script.colorGrading}`);
      lines.push(`Pacing: ${script.pacing}`);
      lines.push(`Music: ${script.musicDirection}`);
      lines.push(`Lensing: ${script.lensing.join('; ')}`);
      lines.push(`Reference films: ${script.referenceFilms.join('; ')}`);
      return lines.join('\n');
    }
  }
}
