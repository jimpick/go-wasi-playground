/*
import { WASI } from '@wasmer/wasi'
import browserBindings from '@wasmer/wasi/lib/bindings/browser'
import { WasmFs } from '@wasmer/wasmfs'

const wasmFilePath = '/demo.wasm'  // Path to our WASI module
//const echoStr      = 'Hello World!'    // Text string to echo

// Instantiate new WASI and WasmFs Instances
// IMPORTANT:
// Instantiating WasmFs is only needed when running in a browser.
// When running on the server, NodeJS's native FS module is assigned by default
const wasmFs = new WasmFs()

let wasi = new WASI({
  // Arguments passed to the Wasm Module
  // The first argument is usually the filepath to the executable WASI module
  // we want to run.
  // args: [wasmFilePath, echoStr],
  args: [wasmFilePath],

  // Environment variables that are accesible to the WASI module
  env: {},

  // Bindings that are used by the WASI Instance (fs, path, etc...)
  bindings: {
    ...browserBindings,
    fs: wasmFs.fs
  }
})

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Async function to run our WASI module/instance
const startWasiTask =
  async pathToWasmFile => {
    // Fetch our Wasm File
    let response  = await fetch(pathToWasmFile)
    let wasmBytes = new Uint8Array(await response.arrayBuffer())

    // IMPORTANT:
    // Some WASI module interfaces use datatypes that cannot yet be transferred
    // between environments (for example, you can't yet send a JavaScript BigInt
    // to a WebAssembly i64).  Therefore, the interface to such modules has to
    // be transformed using `@wasmer/wasm-transformer`, which we will cover in
    // a later example

    // Instantiate the WebAssembly file
    let wasmModule = await WebAssembly.compile(wasmBytes);
    let instance = await WebAssembly.instantiate(wasmModule, {
       ...wasi.getImports(wasmModule)
    });

    wasi.start(instance)                      // Start the WASI instance
    let stdout = await wasmFs.getStdOut()     // Get the contents of stdout
    document.write(`Standard Output: ${stdout}`) // Write stdout data to the DOM
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)
*/

import WasmTerminal, { fetchCommandFromWAPM } from '@jimpick/wasm-terminal'
import { lowerI64Imports } from '@wasmer/wasm-transformer'
import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { mainnet } from '@filecoin-shipyard/lotus-client-schema'
import { BrowserProvider } from './browser-provider'

// Let's write handler for the fetchCommand property of the WasmTerminal Config.
const fetchCommandHandler = async ({ args }) => {
  console.log('Jim fetchCommand', args)
  let commandName = args[0]
  // Let's return a "CallbackCommand" if our command matches a special name
  if (commandName === 'demo') {
    let response = await fetch('/demo.wasm')
    let wasmBinary = new Uint8Array(await response.arrayBuffer())
    return wasmBinary
  }
  if (commandName === 'demo-wasi') {
    let response = await fetch('/demo-wasi.wasm')
    let wasmBinary = new Uint8Array(await response.arrayBuffer())
    return wasmBinary
  }
  if (commandName === 'demo-go') {
    let response = await fetch('/demo-go.wasm')
    let wasmBinary = new Uint8Array(await response.arrayBuffer())
    return wasmBinary
  }
  if (commandName === 'api-client') {
    // const wsUrl = 'wss://lotus.jimpick.com/mainnet_api/0/node/rpc/v0'
    const wsUrl = 'ws://127.0.0.1:7777/rpc/v0'
    const browserProvider = new BrowserProvider(wsUrl)
    await browserProvider.connect()
    window.requestsForLotusHandler = async (req, responseHandler) => {
      const request = JSON.parse(req)
      console.log('JSON-RPC request => Lotus', JSON.stringify(request))
      async function waitForResult () {
        try {
          const result = await browserProvider.sendWs(request)
          console.log('Jim result', JSON.stringify(result))
          // Ganache fixups
          if (request.method === 'Filecoin.ChainHead') {
            console.log('Jim2')
            for (const block of result.result.Blocks) {
              console.log('Jim ts1', block.Timestamp)
              block.Timestamp = Math.floor(block.Timestamp)
              console.log('Jim ts2', block.Timestamp)
            }
          }
          responseHandler(JSON.stringify(result))
        } catch (e) {
          console.error('JSON-RPC error', e.message)
        }
      }
      waitForResult()
    }

    let response = await fetch('/api-client.wasm')
    let wasmBinary = new Uint8Array(await response.arrayBuffer())
    return wasmBinary
  }
  if (commandName === 'lotus') {
    const options = {}
    const wsUrl = 'ws://127.0.0.1:7777/rpc/v0'
    // const wsUrl = 'wss://lotus.jimpick.com/mainnet_api/0/node/rpc/v0'
    const ganache = !!wsUrl.match(/127\.0\.0\.1/)
    if (!ganache) {
      options.token = localStorage.getItem('token')
    }
    const browserProvider = new BrowserProvider(wsUrl, options)
    await browserProvider.connect()
    window.requestsForLotusHandler = async (req, responseHandler) => {
      const request = JSON.parse(req)
      console.log('JSON-RPC request => Lotus', JSON.stringify(request))
      async function waitForResult () {
        try {
          // Ganache fixups
          if (ganache) {
            if (request.method === 'Filecoin.WalletBalance') {
              request.params[0] = request.params[0].replace(/^f/, 't')
            }
            if (request.method === 'Filecoin.MpoolPushMessage') {
              request.params[0].From = request.params[0].From.replace(/^f/, 't')
              request.params[0].To = request.params[0].To.replace(/^f/, 't')
            }
          }
          const result = await browserProvider.sendWs(request)
          console.log('Jim result', ganache, JSON.stringify(result))
          if (ganache) {
            if (
              request.method === 'Filecoin.ChainHead' ||
              request.method === 'Filecoin.ChainGetTipSet'
            ) {
              for (const block of result.result.Blocks) {
                block.Timestamp = Math.floor(block.Timestamp)
              }
            }
            if (request.method === 'Filecoin.Version') {
              result.result.BlockDelay = Number(result.result.BlockDelay)
            }
          }
          console.log('Jim fixed result', JSON.stringify(result))
          responseHandler(JSON.stringify(result))
        } catch (e) {
          console.error('JSON-RPC error', e.message)
          const errorResult = {
            jsonrpc: "2.0",
            id: request.id,
            error: { message: e.message }
          }
          responseHandler(JSON.stringify(errorResult))
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
// wasmTerminal.print("Type 'demo' to run demo.wasm\n")
// wasmTerminal.print("Type 'demo-wasi' to run demo-wasi.wasm\n")
// wasmTerminal.print("Type 'demo-go' to run demo-go.wasm\n")
// wasmTerminal.print("Type 'api-client' to run api-client.wasm\n")
wasmTerminal.print("Type 'lotus' to run lotus.wasm\n")

// Let's bind our Wasm terminal to it's container
const containerElement = document.querySelector('#root')
wasmTerminal.open(containerElement)
wasmTerminal.fit()
wasmTerminal.focus()
