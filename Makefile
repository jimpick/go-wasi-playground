checkout:
	mkdir -p extern
	cd extern; git clone -b jim-lotus-for-wasm-terminal git@github.com:jimpick/lotus.git lotus-modified
	cd extern; git clone -b jim-wasm-quiet git@github.com:jimpick/go-jsonrpc.git go-jsonrpc-wasm

