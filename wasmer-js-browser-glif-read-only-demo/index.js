import WasmTerminal, { fetchCommandFromWAPM } from '@jimpick/wasm-terminal'
import { lowerI64Imports } from '@wasmer/wasm-transformer'
import { BrowserProvider } from './browser-provider'
import pako from 'pako'

const wasmSize = 6037998

async function download (url, defaultLength, status) {
  // https://dev.to/samthor/progress-indicator-with-fetch-1loo
  const response = await fetch(url)
  let length = response.headers.get('Content-Length')
  if (!length) {
    length = defaultLength
    // something was wrong with response, just give up
    // return await response.arrayBuffer()
  }
  const array = new Uint8Array(length)
  let at = 0 // to index into the array
  const reader = response.body.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    status.textContent = `Fetching data... ${at} of ${length} bytes`
    array.set(value, at)
    at += value.length
  }
  return array
}

async function preloadLotusWasm () {
  const status = document.getElementById('status')
  status.textContent = 'Fetching data... (6MB compressed)'
  const compressed = await download('/lotus.wasm.gz', wasmSize, status)
  status.textContent = `Uncompressing data... (compressed size: ${compressed.byteLength} bytes)`
  const buffer = pako.ungzip(compressed)
  const size = +buffer.buffer.byteLength
  status.textContent = `WASM fetched: ${size} bytes`
  return buffer
}
const preloadedLotusPromise = preloadLotusWasm()

// Let's write handler for the fetchCommand property of the WasmTerminal Config.
let cachedLotus
const fetchCommandHandler = async ({ args }) => {
  console.log('Jim fetchCommand', args)
  let commandName = args[0]
  // Let's return a "CallbackCommand" if our command matches a special name
  if (commandName === 'lotus') {
    if (cachedLotus) return cachedLotus
    const options = {}
    const lotusUrl = 'https://api.node.glif.io/rpc/v0'
    const browserProvider = new BrowserProvider(lotusUrl, options)
    await browserProvider.connect()
    window.requestsForLotusHandler = async (req, responseHandler) => {
      const request = JSON.parse(req)
      console.log('JSON-RPC request => Lotus', JSON.stringify(request))
      async function waitForResult () {
        try {
          const result = await browserProvider.sendHttp(request)
          const resultWrapped = {
            jsonrpc: "2.0",
            result,
            id: request.id
          }
          console.log('Jim resultWrapped', JSON.stringify(resultWrapped))
          responseHandler(JSON.stringify(resultWrapped))
        } catch (e) {
          console.error('JSON-RPC error', e.message)
        }
      }
      waitForResult()
    }

    let wasmBinary = await preloadedLotusPromise
    cachedLotus = wasmBinary
    return wasmBinary
  }

  // Let's fetch a wasm Binary from WAPM for the command name.
  const wasmBinary = await fetchCommandFromWAPM({ args })

  // lower i64 imports from Wasi Modules, so that most Wasi modules
  // Can run in a Javascript context.
  return await lowerI64Imports(wasmBinary)
}

// Let's create our Wasm Terminal
const wasmTerminal = new WasmTerminal({
  // Function that is run whenever a command is fetched
  fetchCommand: fetchCommandHandler
})

// Let's print out our initial message
wasmTerminal.print("Type 'lotus' to run lotus.wasm\n")

// Let's bind our Wasm terminal to it's container
const containerElement = document.querySelector('#root')
wasmTerminal.open(containerElement)
wasmTerminal.fit()
wasmTerminal.focus()
