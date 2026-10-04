export const coderCategories = {
  development: { es: 'Desarrollo', en: 'Development' },
  web: { es: 'Web y diseño', en: 'Web & design' },
  data: { es: 'Datos', en: 'Data' },
  automation: { es: 'Automatización', en: 'Automation' },
  ai: { es: 'Inteligencia artificial', en: 'Artificial intelligence' },
  learning: { es: 'Aprendizaje', en: 'Learning' },
  infrastructure: { es: 'Infraestructura', en: 'Infrastructure' },
  security: { es: 'Seguridad', en: 'Security' },
  media: { es: 'Multimedia', en: 'Media' },
  business: { es: 'Negocios', en: 'Business' },
} as const

export type CoderCategory = keyof typeof coderCategories
export type CoderRepository = {
  url: string
  recommended?: boolean
  // Opcional: sobrescribe la categoría que se detecta automáticamente.
  category?: CoderCategory
}

// AÑADE LA URL AQUÍ. GitHub completa automáticamente todos los datos.
// recommended: true muestra el fueguito y coloca el repositorio primero.
export const coderRepositories: CoderRepository[] = [
  { url: 'https://github.com/excalidraw/excalidraw', recommended: true },
  { url: 'https://github.com/n8n-io/n8n', recommended: true },
  { url: 'https://github.com/multica-ai/multica' },
  { url: 'https://github.com/langwatch/langwatch'},
  { url: 'https://github.com/stablyai/orca'},
  { url: 'https://github.com/fleetbase/fleetbase'},
  { url: 'https://github.com/pullfrog/pullfrog'},
  { url: 'https://github.com/dagucloud/dagu'},
  { url: 'https://github.com/ollama/ollama'},
  { url: 'https://github.com/oblien/openship'},
  { url: 'https://github.com/polarsource/polar'},
  { url: 'https://github.com/pocketbase/pocketbase'},
  { url: 'https://github.com/appwrite/appwrite'},
  { url: 'https://github.com/usestrix/strix'},
  { url: 'https://github.com/bilawalsidhu/gods-eye-view'},
  { url: 'https://github.com/radioactivetobi/geo-recon' },
  { url: 'https://github.com/immich-app/immich' },
  { url: 'https://github.com/guillaumemeyer/watermarks-remover' },
  { url: 'https://github.com/jellyfin/jellyfin' },
  { url: 'https://github.com/tashfeenahmed/freellmapi' },
  { url: 'https://github.com/microsoft/vscode' },
  { url: 'https://github.com/astral-sh/uv' },
  { url: 'https://github.com/vercel/next.js' },
  { url: 'https://github.com/supabase/supabase' },
  { url: 'https://github.com/jqlang/jq' },
  { url: 'https://github.com/syncthing/syncthing' },
  { url: 'https://github.com/huggingface/transformers' },
  { url: 'https://github.com/freeCodeCamp/freeCodeCamp' },
  { url: 'https://github.com/nilbuild/developer-roadmap' },
  { url: 'https://github.com/harry0703/MoneyPrinterTurbo' },
  { url: 'https://github.com/openclaw/openclaw' },
  { url: 'https://github.com/Conway-Research/automaton', recommended: true },
]
