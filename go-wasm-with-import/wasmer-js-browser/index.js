import { WASI } from '@wasmer/wasi'
import browserBindings from '@wasmer/wasi/lib/bindings/browser'
import { WasmFs } from '@wasmer/wasmfs'
import { lowerI64Imports } from '@wasmer/wasm-transformer'
import './wasm_exec.js'

const go = new Go()
const importObject = go.importObject

const wasmFilePath = '/main-wasi.wasm'  // Path to our WASI module
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
    let wasmFixed = await lowerI64Imports(wasmModule)
    console.log('Jim importObject 1', importObject)
    console.log('Jim importObject 2', {
       ...wasi.getImports(wasmModule),
    }) 
    console.log('Jim importObject 3', {
       ...wasi.getImports(wasmModule),
       ...importObject
    }) 
    let instance = await WebAssembly.instantiate(wasmFixed, {
       ...wasi.getImports(wasmModule),
       ...importObject
    });
    go.run(instance)
    wasi.start(instance)                      // Start the WASI instance
    let stdout = await wasmFs.getStdOut()     // Get the contents of stdout
    document.write(`Standard Output: ${stdout}`) // Write stdout data to the DOM
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)

/*
import WasmTerminal, { fetchCommandFromWAPM } from '@wasmer/wasm-terminal'
import { lowerI64Imports } from '@wasmer/wasm-transformer'

// Let's write handler for the fetchCommand property of the WasmTerminal Config.
const fetchCommandHandler = async ({ args }) => {
  console.log('Jim fetchCommand', args)
  let commandName = args[0]
  // Let's return a "CallbackCommand" if our command matches a special name
  if (commandName === 'main-wasi') {
    let response  = await fetch('/main-wasi.wasm')
    let wasmBinary = new Uint8Array(await response.arrayBuffer())
    return wasmBinary
    return callbackCommand
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
wasmTerminal.print("Type 'main-wasi' to run main-wasi.wasm")

// Let's bind our Wasm terminal to it's container
const containerElement = document.querySelector('#root')
wasmTerminal.open(containerElement)
wasmTerminal.fit()
wasmTerminal.focus()
*/