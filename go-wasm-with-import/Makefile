main-wasi.wasm:
	GOOS=wasi GOARCH=wasm go build -o main-wasi.wasm

main.wasm:
	GOOS=js GOARCH=wasm go build -o main.wasm

clean:
	rm -f *.wasm
