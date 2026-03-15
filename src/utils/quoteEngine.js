// quoteEngine.js - Your upgraded magic box of words!

// ─── MACHINE 1: CORE REFLECTIONS ───
// Hand-written thoughts that speak directly to the user.
const CORE_REFLECTIONS = [
  "You are allowed to take things slowly.",
  "Not everything will make sense today, and it does not need to.",
  "You have done enough for today.",
  "You are safe in this quiet space.",
  "Today can begin slowly.",
  "You do not have to rush this morning.",
  "Rest is also part of living.",
  "Growth can be quiet."
];

// ─── MACHINE 2: SENTENCE TEMPLATES ───
// Fills in the blanks to create dozens of variations from one idea.
const TEMPLATES = [
  { 
    text: "Some days {x}. That is okay.", 
    fill: ["move slowly", "feel unclear", "ask for patience", "simply pass", "are for resting"] 
  },
  { 
    text: "You are allowed to {x} right now.", 
    fill: ["breathe deeply", "let go", "be still", "feel uncertain", "start again"] 
  },
  {
    text: "A quiet moment can {x} the rhythm of a day.", 
    fill: ["change", "shift", "soften", "reset", "gently change"] 
  }
];

// ─── MACHINE 3: RANDOM PAIRING ───
// Mixes and matches subjects and actions to create hundreds of unique sentences instantly.
const SUBJECTS = [
  "Some thoughts", "Some moments", "Some days", "Some feelings", 
  "The heart", "This moment", "Your breath", "A quiet thought", "Small steps"
];

const ACTIONS = [
  "need space", "pass quietly", "take time", "soften slowly", 
  "move slowly", "find peace", "settle down", "simply exist", "find their own way"
];

const ENDINGS = [
  "That is okay.", "Let it be.", "No rush.", ""
];

/**
 * Main function to get a reflection.
 * This acts as the "manager" that picks which machine to use.
 */
export const getReflection = () => {
  // Pick a random number between 0 and 1 to decide the method
  const method = Math.random();

  // 33% chance: Use Machine 3 (Random Pairing)
  if (method < 0.33) {
    const s = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    const a = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const e = ENDINGS[Math.floor(Math.random() * ENDINGS.length)];
    return `${s} ${a}. ${e}`.trim();
  } 
  
  // 33% chance: Use Machine 2 (Sentence Templates)
  if (method < 0.66) {
    const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    const fill = tpl.fill[Math.floor(Math.random() * tpl.fill.length)];
    return tpl.text.replace("{x}", fill);
  }

  // 34% chance: Use Machine 1 (Core Reflections)
  return CORE_REFLECTIONS[Math.floor(Math.random() * CORE_REFLECTIONS.length)];
};