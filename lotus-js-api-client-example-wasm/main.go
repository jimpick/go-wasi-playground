package main

import (
	"context"
	"fmt"
	"log"
	"syscall/js"

	"github.com/filecoin-project/go-jsonrpc"
	"github.com/filecoin-project/lotus/api/apistruct"
)

// https://docs.filecoin.io/build/lotus/go-json-rpc/#use-the-client

func main() {
	requestsForLotusHandler := js.Global().Get("requestsForLotusHandler")
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

	tipset, err := api.ChainHead(context.Background())
	if err != nil {
		log.Fatalf("calling chain head: %s", err)
	}
	fmt.Printf("Current chain head is: %s\n", tipset.String())

}
