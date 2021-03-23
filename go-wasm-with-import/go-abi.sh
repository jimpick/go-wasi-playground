#! /bin/bash

make clean && make main.wasm && ./run-with-node-go.sh
