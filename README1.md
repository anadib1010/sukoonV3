A **README.md** is like the "Manual" or the "Cover Story" for your project. In the professional world, every great piece of software on GitHub has one. It tells other developers (and your future self) exactly what this app does and how to wake it up.

Here is a professional-grade `README.md` for **Sukoon V3**. You can create a new file in your project folder named `README.md` and paste this in.

---

# 🌿 Sukoon (v3.0) 
### *An International-Level Mindfulness Sanctuary*

**Sukoon** is a high-quality, professional-grade mindfulness application designed to help users find peace, track their journey, and celebrate their growth through an interactive "Sukoon Tree" and a cloud-powered rewards system.

---

## 🚀 Core Features
* **The Sukoon Tree:** A visual representation of your progress. Watch your tree grow leaves and branches as you complete sessions.
* **Cloud-Powered Progress:** All stats, credits, and journal entries are securely stored in the **Supabase Vault**, ensuring your data is safe and accessible from anywhere.
* **Mindfulness Rewards:** Earn **Sukoon Credits** for every interaction—from opening the app to writing deep reflections.
* **Celebration System:** Experience a "Grand Finale" confetti explosion when reaching major milestones.
* **Journaling & History:** A private, encrypted space to log moods and thoughts.

---

## 🛠️ The Tech Stack
| Tool | Purpose |
| :--- | :--- |
| **React & Vite** | The fast, modern engine that runs the app. |
| **Supabase** | The high-security cloud database (The "Vault"). |
| **Canvas-Confetti** | Professional-grade animation for celebrations. |
| **CSS Modules** | Clean, organized styling for a "Zen" look. |

---

## 🏗️ Getting Started (For Developers)

To run this project on your local machine, follow these steps:

### 1. Install the "Building Blocks"
Open your terminal in the project folder and run:
```bash
npm install
```
*This will recreate the `node_modules` folder and download all the necessary tools.*

### 2. Set Up the "Secret Keys"
Create a file named `.env` in the root folder and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Launch the App
Run the following command to start the development server:
```bash
npm run dev
```

---

## 🏛️ Database Architecture
The app relies on three primary tables in the `public` schema:
1.  **`progress_user_stats`**: Tracks credits, total sessions, and streaks. (Primary Key: `user_id`)
2.  **`journal_entries`**: Stores encrypted mood logs and reflections.
3.  **`daily_activity`**: Records daily timestamps for the weekly view.

---

## 📜 Mission Statement
> "Sukoon is built on the belief that technology should serve our peace, not our stress. By combining professional-grade architecture with mindful design, we create a space where every small step counts."

---

### 🧐 Why this README is "Professional"
* **Scannable:** It uses tables and bullet points so a busy architect can read it in 30 seconds.
* **Clear Instructions:** It tells the next person exactly how to fix the "missing node_modules" problem.
* **Visionary:** It explains *why* the app exists, not just *what* code it uses.

**Would you like me to help you add a "Contributors" section to this file where we can list your name as the Lead Architect?** 🌳📜✨