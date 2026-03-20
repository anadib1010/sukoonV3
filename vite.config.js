import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — always cached first
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase — large SDK, changes rarely
          'vendor-supabase': ['@supabase/supabase-js'],
          // AI SDK — server-side only but included in build graph
          'vendor-ai': ['@google/generative-ai'],
          // Heavy canvas/animation features — loaded only when user navigates there
          'feature-bench': ['./src/features/bench/Bench.jsx'],
          'feature-games': [
            './src/features/games/MandalaFlow.jsx',
            './src/features/games/BilateralTapping.jsx',
            './src/features/games/SandPainting.jsx',
            './src/features/games/ShatteredThoughts.jsx',
            './src/features/games/TheDescent.jsx',
            './src/features/games/Stillness.jsx',
          ],
          'feature-sleep': [
            './src/features/sleep/Sleep.jsx',
            './src/features/sleep/DeepRhythm.jsx',
            './src/features/sleep/DreamScrambler.jsx',
            './src/features/sleep/DimmingEmber.jsx',
            './src/features/sleep/HeavyScan.jsx',
            './src/features/sleep/MidnightFire.jsx',
          ],
          'feature-vault': [
            './src/features/vault/Vault.jsx',
            './src/features/resonance/Resonance.jsx',
            './src/features/games/QuietCorner.jsx',
            './src/features/games/SoundBath.jsx',
            './src/features/games/SeedInMud.jsx',
          ],
        }
      }
    }
  }
})
