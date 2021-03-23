const fs = require('fs')
const { WASI } = require('wasi')
// const { lowerI64Imports } = require('@wasmer/wasm-transformer')
require('./wasm_exec_wasi.js')

async function run () {
  const go = new Go()
  const importObject = go.importObject
  const wasi = new WASI({
    args: process.argv,
    env: process.env,
    preopens: {
      '/': '/'
    }
  })
  importObject.wasi_snapshot_preview1 = wasi.wasiImport
  importObject.wasi_unstable = wasi.wasiImport
  const wasm = await WebAssembly.compile(fs.readFileSync('./main-wasi.wasm'))
  // const wasmFixed = await lowerI64Imports(wasm)
  const instance = await WebAssembly.instantiate(wasm, importObject)
  go.run(instance)
  /*
  setTimeout(() => {
    console.log('Test')
    const result = globalThis.add(1, 2)
    console.log('Result', result)
  }, 1000)
  */
  globalThis.jim = 'Hi'
  /*
  setInterval(() => {
    console.log('Tick')
  }, 1000)
  */
  let counter = 123
  globalThis.jimFunc = () => {
    console.log('jimFunc', counter)
    return counter++
  }
  wasi.start(instance)                      // Start the WASI instance
  setInterval(() => {}, 1 << 30)
}
run()
