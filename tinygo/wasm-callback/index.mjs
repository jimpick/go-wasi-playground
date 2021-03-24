import fs from 'fs';
import './wasm_exec.js';

globalThis.document = {
  jim: 1,
  jimFunc: function (value) {
    return "abcd: " + value
  },
  jimFuncWithCallback: function (value, cb) {
    cb("abcd: " + value)
  },
  jimFuncWithAsyncCallback: function (value, cb) {
    setTimeout(() => {
      cb("abcd: " + value)
    }, 1000)
  }
}

const go = new Go()
const importObject = {
  ...go.importObject
}
const wasm = await WebAssembly.compile(fs.readFileSync('./main.wasm'));
const instance = await WebAssembly.instantiate(wasm, importObject);

go.run(instance)
