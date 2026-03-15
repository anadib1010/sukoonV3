// This is your magic box of words
const subjects = ["Some days", "The heart", "This moment", "Your breath", "A quiet thought"];
const actions = ["need space", "move slowly", "find peace", "settle down", "simply exist"];
const endings = ["That is okay.", "Let it be.", "No rush.", ""];

export const getReflection = () => {
  // This picks one word from each list like a random game!
  const s = subjects[Math.floor(Math.random() * subjects.length)];
  const a = actions[Math.floor(Math.random() * actions.length)];
  const e = endings[Math.floor(Math.random() * endings.length)];
  
  return `${s} ${a}. ${e}`;
};