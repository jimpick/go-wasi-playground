#! /bin/bash

#go build hello.go
#GOOS=js GOARCH=wasm go build -o main.wasm
GOARCH=wasm GOOS=wasi go build -o main-wasi.wasm