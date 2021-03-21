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
const importObject = { wasi_snapshot_preview1: wasi.wasiImport };

const wasm = await WebAssembly.compile(fs.readFileSync('./demo.wasm'));
const instance = await WebAssembly.instantiate(wasm, importObject);

wasi.start(instance)
