package main

import (
	"fmt"
	// "syscall/js"
	"time"
	// "github.com/filecoin-project/go-jsonrpc"
	// "github.com/filecoin-project/lotus/api/apistruct"
)

// https://docs.filecoin.io/build/lotus/go-json-rpc/#use-the-client

func main() {
	// requestsForLotusHandler := js.Global().Get("requestsForLotusHandler")
	/*
		var api apistruct.FullNodeStruct
		closer, err := jsonrpc.NewJSMergeClient(context.Background(), requestsForLotusHandler, "Filecoin",
			[]interface{}{
				&api.CommonStruct.Internal,
				&api.Internal,
			})
		if err != nil {
			fmt.Printf("connecting with lotus failed: %s\n", err)
			panic(err)
		}
		defer closer()
	*/

	fmt.Printf("Hello Jim5\n")
	for i := 0; i < 5; i++ {
		fmt.Printf(".\n")
		time.Sleep(1 * time.Second)
	}
}
