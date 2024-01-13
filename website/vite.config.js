import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../',
  plugins: [
    react({
      babel: {configFile: true}
    }),
    splitVendorChunkPlugin()
  ]
})
