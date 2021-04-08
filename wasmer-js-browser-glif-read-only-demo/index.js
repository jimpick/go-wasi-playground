import WasmTerminal, { fetchCommandFromWAPM } from '@jimpick/wasm-terminal'
import { lowerI64Imports } from '@wasmer/wasm-transformer'
import { BrowserProvider } from './browser-provider'

// Let's write handler for the fetchCommand property of the WasmTerminal Config.
const fetchCommandHandler = async ({ args }) => {
  console.log('Jim fetchCommand', args)
  let commandName = args[0]
  // Let's return a "CallbackCommand" if our command matches a special name
  if (commandName === 'lotus') {
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

    let response = await fetch('/lotus.wasm')
    let wasmBinary = new Uint8Array(await response.arrayBuffer())
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
