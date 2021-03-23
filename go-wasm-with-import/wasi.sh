#! /bin/bash

. ../SETENV

set -e

make clean
make
cp main-wasi.wasm ./wasmer-js-browser/static/main-wasi.wasm
./run-with-node-wasi.sh 

