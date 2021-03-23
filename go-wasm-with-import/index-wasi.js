const { Worker, isMainThread, parentPort } = require('worker_threads')
const fs = require('fs')
const { WASI } = require('wasi')
// const { lowerI64Imports } = require('@wasmer/wasm-transformer')
require('./wasm_exec_wasi.js')

if (isMainThread) {
  const sharedUint32Array = new Uint32Array(new SharedArrayBuffer(8))
  sharedUint32Array[0] = 0
  sharedUint32Array[1] = 0
  setInterval(() => {
    sharedUint32Array[0]++
  }, 1000)
  const run = new Promise((resolve, reject) => {
    const worker = new Worker(__filename)
    // worker.on('message', resolve)
    worker.on('message', msg => {
      console.log('Message', msg)
      console.log('Shared', sharedUint32Array[1])
    })
    worker.postMessage(sharedUint32Array)
    worker.on('error', reject)
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
    })
  })
  run
    .then(msg => {
      console.log('Done.', msg)
    })
    .catch(e => {
      console.error('Error', e)
    })
} else {
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
      parentPort.postMessage({ tick: true, counter: counter++ })
    }, 1000)
    */
    // let counter = 123
    parentPort.on('message', sharedUint32Array => {
      globalThis.jimFunc = () => {
        console.log('jimFunc', sharedUint32Array[0])
        sharedUint32Array[1]++
        parentPort.postMessage({ counter: sharedUint32Array[1] })
        return sharedUint32Array[0]
      }
      wasi.start(instance) // Start the WASI instance
      setInterval(() => {}, 1 << 30)
    })
  }
  run()
}
