const fs = require('fs')
require('./wasm_exec.js')

async function run () {
  const go = new Go()
  const importObject = go.importObject
  const wasm = await WebAssembly.compile(fs.readFileSync('./main.wasm'))
  const instance = await WebAssembly.instantiate(wasm, importObject)
  go.run(instance)
  setInterval(() => {}, 1 << 30)
  //setTimeout(() => {
  //  console.log('Test')
    // const result = globalThis.add(1, 2)
    // console.log('Result', result)
  //}, 1000)
}
run()
