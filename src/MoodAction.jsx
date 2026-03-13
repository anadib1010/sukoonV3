import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

// 1. The Mood Dictionary (Your exact logic)
const moodLibrary = {
  Heavy: {
    theme: "bg-maroon-900 text-white", 
    message: "You're carrying something heavy.",
    cta: "A 2-minute breath might help.",
    primaryLabel: "Quick Return · 2 min",
    primaryRoute: "/practice",
    secondaryLabel: "Or burn it in Reflection",
    secondaryRoute: "/reflection"
  },
  Frustrated: {
    theme: "bg-blue-900 text-white", // Adjusted for standard Tailwind OceanBlue
    message: "Let the frustration have somewhere to go.",
    cta: "Burn it or write it out.",
    primaryLabel: "Open Reflection",
    primaryRoute: "/reflection",
    secondaryLabel: "Or write in your journal",
    secondaryRoute: "/journal"
  },
  Exhausted: {
    theme: "bg-emerald-900 text-white", // Adjusted for standard Tailwind DeepSage
    message: "Acknowledging exhaustion takes courage.",
    cta: "A sleep meditation might be what you need.",
    primaryLabel: "Meditation Clips",
    primaryRoute: "/audio",
    secondaryLabel: "Or just rest",
    secondaryRoute: "/bench"
  },
  Okay: {
    theme: "bg-green-100 text-gray-900", // Adjusted for standard Tailwind SageSanctuary
    message: "Steady is a good place to be.",
    cta: "Write a little — it helps.",
    primaryLabel: "Open your journal",
    primaryRoute: "/journal",
    secondaryLabel: "Or explore practices",
    secondaryRoute: "/practice"
  },
  Warm: {
    theme: "bg-rose-100 text-gray-900", // Adjusted for standard Tailwind PinkChampagne
    message: "A warm feeling — hold it gently.",
    cta: "Write a little, or send warmth.",
    primaryLabel: "Send Warmth",
    primaryRoute: "/warmth", 
    secondaryLabel: "Or write in your journal",
    secondaryRoute: "/journal"
  },
  Sad: {
    theme: "bg-teal-800 text-white", // Adjusted for standard Tailwind SageGreen
    message: "Let go of it and be a witness.",
    cta: "Let it sink.",
    primaryLabel: "Write a message and let it sink in water",
    primaryRoute: "/sink", 
    secondaryLabel: "Or write your Journal",
    secondaryRoute: "/journal"
  }
};

export default function MoodAction({ selectedMood }) {
  const navigate = useNavigate();
  const [aiTip, setAiTip] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const activeMood = moodLibrary[selectedMood];

  // 2. Fetch the lightweight AI tip when the component loads
  useEffect(() => {
    const fetchAiTip = async () => {
      if (!selectedMood) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: selectedMood })
        });
        
        const data = await response.json();
        setAiTip(data.tip);
      } catch (error) {
        console.error("Failed to fetch AI tip", error);
        setAiTip("Take a gentle breath. You are in a safe space.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiTip();
  }, [selectedMood]);

  if (!activeMood) return <div className="p-8 text-center">Mood not found.</div>;

  return (
    <div className={`min-h-screen p-8 flex flex-col items-center justify-center transition-colors duration-500 ${activeMood.theme}`}>
      
      {/* Core Message */}
      <h1 className="text-3xl font-light text-center mb-2">
        {activeMood.message}
      </h1>
      
      {/* The AI Comfort Tip */}
      <div className="h-16 flex items-center justify-center mb-8 px-4 text-center">
        {isLoading ? (
          <p className="text-sm italic opacity-70 animate-pulse">Gathering a gentle thought...</p>
        ) : (
          <p className="text-sm italic opacity-90">"{aiTip}"</p>
        )}
      </div>

      {/* Call to Action */}
      <p className="text-lg mb-8">{activeMood.cta}</p>

      {/* Routing Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={() => navigate(activeMood.primaryRoute)}
          className="bg-white text-black py-3 px-6 rounded-2xl shadow-md hover:scale-105 transition-transform"
        >
          {activeMood.primaryLabel}
        </button>
        
        <button 
          onClick={() => navigate(activeMood.secondaryRoute)}
          className="bg-transparent border border-current py-3 px-6 rounded-2xl opacity-80 hover:opacity-100 transition-opacity"
        >
          {activeMood.secondaryLabel}
        </button>
      </div>
    </div>
  );
}