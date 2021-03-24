import fs from 'fs';
import './wasm_exec.js';

const go = new Go()
const importObject = {
  ...go.importObject,
  env: {
    'main.add': function(x, y) {
        return x + y
    }
  }
}
const wasm = await WebAssembly.compile(fs.readFileSync('./main.wasm'));
const instance = await WebAssembly.instantiate(wasm, importObject);
console.log('Exports', instance.exports)

go.run(instance)

console.log('multiplied two numbers:', instance.exports.multiply(5, 3));
