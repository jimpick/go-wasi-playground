module github.com/jimpick/go-wasi-playground/lotus-js-api-client-example-wasm

go 1.16

require (
	github.com/filecoin-project/go-jsonrpc v0.1.2
	github.com/filecoin-project/lotus v1.2.1
	github.com/shurcooL/go v0.0.0-20200502201357-93f07166e636 // indirect
	github.com/shurcooL/go-goon v0.0.0-20210110234559-7585751d9a17 // indirect
	github.com/shurcooL/goexec v0.0.0-20200425235707-36ff6d2d1adc // indirect
	golang.org/x/mod v0.4.2 // indirect
	golang.org/x/sys v0.0.0-20210403161142-5e06dd20ab57 // indirect
	golang.org/x/tools v0.1.0 // indirect
)

replace github.com/filecoin-project/lotus => ../extern/lotus-modified

replace github.com/filecoin-project/go-jsonrpc => github.com/jimpick/go-jsonrpc v0.0.0-20201109011442-669bac3b0e93
