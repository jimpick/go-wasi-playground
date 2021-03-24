import fs from 'fs';
import { WASI } from 'wasi';

const wasi = new WASI({
  args: process.argv,
  env: process.env,
  /*
  preopens: {
    '/sandbox': '/some/real/path/that/wasm/can/access'
  }
  */
});
const importObject = {
  wasi_snapshot_preview1: wasi.wasiImport,
  wasi_unstable: wasi.wasiImport,
  env: {
    'main.add': function(x, y) {
        return x + y
    }
  }
}
const wasm = await WebAssembly.compile(fs.readFileSync('./main.wasm'));
const instance = await WebAssembly.instantiate(wasm, importObject);
console.log('Exports', instance.exports)

wasi.start(instance)

console.log('multiplied two numbers:', instance.exports.multiply(5, 3));
