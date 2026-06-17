let pipeline: any = null
let env: any = null
let generator: any = null

// Define self context for typing safety
const ctx: Worker = self as any

const progressCallback = (data: any) => {
  if (data.status === 'progress' || data.status === 'downloading') {
    ctx.postMessage({
      type: 'progress',
      progress: data.progress || 0,
      file: data.file
    })
  }
}

async function initAI() {
  if (pipeline && env) return

  // Trick Transformers.js into believing it is running in a browser environment,
  // preventing it from dynamically requiring Node.js 'fs' module.
  if (typeof self !== 'undefined' && (self as any).process) {
    try {
      const processMock = { ...((self as any).process || {}) }
      processMock.release = { name: 'browser' }
      Object.defineProperty(self, 'process', {
        value: processMock,
        writable: true,
        configurable: true
      })
    } catch (e) {
      console.warn('Failed to mock process.release.name:', e)
    }
  }

  // Dynamically import @xenova/transformers after mocking the process object
  const module = await import('@xenova/transformers')
  pipeline = module.pipeline
  env = module.env

  // Disable loading of local models (since we fetch and cache them from Hugging Face)
  env.allowLocalModels = false

  // Explicitly set WASM paths to point to jsDelivr CDN to prevent WASM resolution errors in Electron workers
  env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/'
}

ctx.addEventListener('message', async (event: MessageEvent) => {
  const { type, text, taskId } = event.data

  if (type === 'init') {
    try {
      if (!generator) {
        ctx.postMessage({ type: 'status', status: 'loading' })
        
        await initAI()
        
        // Initialize text2text generation pipeline with LaMini-Flan-T5-248M
        generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-248M', {
          progress_callback: progressCallback
        })
        
        ctx.postMessage({ type: 'status', status: 'ready' })
      } else {
        ctx.postMessage({ type: 'status', status: 'ready' })
      }
    } catch (error: any) {
      console.error('AI Worker Init Error:', error)
      ctx.postMessage({ type: 'error', error: error.message || 'Gagal memuat model AI.' })
    }
  }

  if (type === 'formalize') {
    try {
      if (!generator) {
        ctx.postMessage({ type: 'status', status: 'loading' })
        
        await initAI()
        
        generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-248M', {
          progress_callback: progressCallback
        })
        
        ctx.postMessage({ type: 'status', status: 'ready' })
      }

      // Prompt specifically optimized for LaMini-Flan-T5 for formal paraphrasing
      const prompt = `paraphrase this task description into a formal professional work log description: "${text}"`
      
      const response = await generator(prompt, {
        max_new_tokens: 120,
        temperature: 0.3,
        repetition_penalty: 1.2,
      })

      let output = response[0].generated_text
      
      // Sanitasi hasil output: hapus tanda kutip di awal/akhir jika ada
      output = output.replace(/^["'“”‘`]|["'“”’`]$/g, '').trim()

      ctx.postMessage({ type: 'result', taskId, text: output })
    } catch (error: any) {
      console.error('AI Worker Formalize Error:', error)
      ctx.postMessage({ type: 'error', taskId, error: error.message || 'Gagal formalisasi teks.' })
    }
  }
})
