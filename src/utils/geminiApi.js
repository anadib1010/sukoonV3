export const askTheGuide = async (userInput) => {
  try {
    const response = await fetch('/api/gemini', { // Replace with your actual endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput }),
    });
    const data = await response.json();
    return data.reflection || "The Guide is silent right now. Take a deep breath and try again.";
  } catch (error) {
    return "I am here, but my voice is faint. Check your connection, dear soul.";
  }
};