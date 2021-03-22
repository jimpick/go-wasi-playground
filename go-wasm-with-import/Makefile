main-wasi.wasm:
	#GOOS=wasi GOARCH=wasm go build -v -x -work -o main-wasi.wasm
	GOOS=wasi GOARCH=wasm go build -v -x -o main-wasi.wasm

main.wasm:
	GOOS=js GOARCH=wasm go build -o main.wasm

clean:
	./clean-cache.sh
	rm -f *.wasm
