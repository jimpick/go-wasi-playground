const fs = require('fs')
const { WASI } = require('wasi')
require('./wasm_exec.js')

async function run () {
  const go = new Go()
  const importObject = go.importObject
  const wasi = new WASI({
    args: process.argv,
    env: process.env,
    /*
    preopens: {
      '/sandbox': '/some/real/path/that/wasm/can/access'
    }
    */
  })
  importObject.wasi_snapshot_preview1 = wasi.wasiImport
  const wasm = await WebAssembly.compile(fs.readFileSync('./main-wasi.wasm'))
  const instance = await WebAssembly.instantiate(wasm, importObject)
  go.run(instance)
  //setTimeout(() => {
  //  console.log('Test')
    const result = globalThis.add(1, 2)
    console.log('Result', result)
  //}, 1000)
}
run()
