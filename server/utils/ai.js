// Keyword-based "AI" engine. No API key needed. Swap these functions for an LLM call later.
export const CATEGORIES = {
  'Web Development': ['react', 'html', 'css', 'javascript', 'node', 'express', 'mongodb', 'frontend', 'backend', 'website', 'api', 'mern', 'tailwind', 'next.js', 'typescript'],
  'Data & AI': ['python', 'pandas', 'machine learning', 'ml', 'ai', 'data', 'tensorflow', 'neural', 'nlp', 'sql', 'statistics'],
  'Design': ['figma', 'ui', 'ux', 'design', 'logo', 'prototype', 'wireframe', 'photoshop', 'branding'],
  'Mobile': ['android', 'ios', 'flutter', 'react native', 'kotlin', 'swift'],
  'Career': ['resume', 'cv', 'interview', 'career', 'job', 'internship', 'portfolio', 'linkedin'],
  'Academics': ['exam', 'assignment', 'math', 'physics', 'chemistry', 'calculus', 'homework', 'thesis', 'study'],
  'DevOps & Cloud': ['docker', 'aws', 'deploy', 'linux', 'git', 'github', 'server', 'kubernetes', 'firebase'],
};
const URGENT = ['urgent', 'asap', 'deadline', 'tomorrow', 'today', 'immediately', 'emergency', 'tonight', 'due', 'exam', 'right now'];
const SOON = ['soon', 'this week', 'stuck', 'blocked', 'confused', 'not working', 'error', 'bug'];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (text, k) => new RegExp(`(^|[^a-z0-9])${esc(k)}([^a-z0-9]|$)`).test(text);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function categorize(text) {
  const t = text.toLowerCase();
  let best = 'Other', top = 0;
  for (const [cat, kws] of Object.entries(CATEGORIES)) {
    const score = kws.filter((k) => has(t, k)).length;
    if (score > top) { top = score; best = cat; }
  }
  return best;
}

export function suggestTags(text) {
  const t = text.toLowerCase();
  const found = [];
  for (const kws of Object.values(CATEGORIES)) for (const k of kws) if (has(t, k) && !found.includes(k)) found.push(k);
  return found.slice(0, 5);
}

export function detectUrgency(text) {
  const t = text.toLowerCase();
  if (URGENT.some((k) => has(t, k))) return 'High';
  if (SOON.some((k) => has(t, k))) return 'Medium';
  return 'Low';
}

export function summarize(description, category, urgency) {
  const clean = description.trim().replace(/\s+/g, ' ');
  const sentences = clean.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
  const short = sentences.length > 220 ? sentences.slice(0, 217) + '...' : sentences;
  return `${short} (${category}, ${urgency.toLowerCase()} urgency)`;
}

export function rewriteRequest(title, description) {
  const tips = [];
  if (description.trim().length < 60) tips.push('Add more detail: what you tried and what happened.');
  if (!/error|exception|fail|bug|not working|stuck/i.test(description)) tips.push('Mention the exact error message or where you are stuck.');
  if (!/today|tomorrow|deadline|due|this week|by /i.test(description)) tips.push('Add a deadline so helpers can prioritise.');
  const clean = description.trim().replace(/\s+/g, ' ');
  const first = clean.split(/(?<=[.!?])\s+/)[0] || clean;
  const cat = categorize(`${title} ${description}`);
  const t = title.trim();
  const betterTitle = t.length && t.length < 18 && cat !== 'Other' ? `${cat}: ${cap(t)}` : cap(t);
  const rewrite = `What I need: ${first}\nWhat I have tried: (add your attempts here)\nDeadline: (when do you need this by?)\nBest way to help: a quick call, a code review, or a good resource.`;
  return { rewrite, tips, betterTitle };
}

export function analyze(title = '', description = '') {
  const text = `${title} ${description}`;
  const category = categorize(text);
  const urgency = detectUrgency(text);
  return { category, urgency, tags: suggestTags(text), summary: summarize(description || title, category, urgency), ...rewriteRequest(title, description) };
}

const neighbors = (list) => {
  const lower = list.map((l) => l.toLowerCase());
  const out = new Set();
  for (const item of lower) {
    const cat = Object.entries(CATEGORIES).find(([, kws]) => kws.includes(item))?.[0];
    if (cat) CATEGORIES[cat].filter((k) => !lower.includes(k)).slice(0, 4).forEach((k) => out.add(k));
  }
  return [...out];
};

export function suggestForOnboarding(skills = [], interests = []) {
  let canHelp = neighbors(skills);
  let needHelp = neighbors(interests);
  if (!canHelp.length) canHelp = ['javascript', 'resume', 'figma', 'python'];
  if (!needHelp.length) needHelp = ['interview', 'portfolio', 'docker', 'react'];
  return { canHelp: canHelp.slice(0, 6), needHelp: needHelp.slice(0, 6) };
}
