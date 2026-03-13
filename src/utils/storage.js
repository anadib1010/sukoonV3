export const getJournalHistory = () => {
  return JSON.parse(localStorage.getItem('jsukoon_history') || '[]');
};

export const saveJournalEntry = (content, reflection) => {
  const history = getJournalHistory();
  const newEntry = {
    id: Date.now(),
    date: new Date().toLocaleDateString(),
    content,
    reflection
  };
  localStorage.setItem('jsukoon_history', JSON.stringify([newEntry, ...history]));
  updateStreak();
};

const updateStreak = () => {
  const lastDate = localStorage.getItem('jsukoon_last_date');
  const today = new Date().toLocaleDateString();
  let streak = parseInt(localStorage.getItem('jsukoon_streak') || '0');

  if (lastDate !== today) {
    streak += 1;
    localStorage.setItem('jsukoon_streak', streak);
    localStorage.setItem('jsukoon_last_date', today);
  }
};