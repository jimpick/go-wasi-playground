package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/filecoin-project/go-jsonrpc"
	"github.com/filecoin-project/lotus/api/apistruct"
)

// https://docs.filecoin.io/build/lotus/go-json-rpc/#use-the-client

func main() {
	// authToken := "<value found in ~/.lotus/token>"
	// headers := http.Header{"Authorization": []string{"Bearer " + authToken}}
	headers := http.Header{}
	addr := "144.217.11.204:1234"

	var api apistruct.FullNodeStruct
	closer, err := jsonrpc.NewMergeClient(context.Background(), "ws://" + addr + "/rpc/v0", "Filecoin", []interface{}{&api.Internal, &api.CommonStruct.Internal}, headers)
	if err != nil {
		log.Fatalf("connecting with lotus failed: %s", err)
	}
	defer closer()

	// Now you can call any API you're interested in.
	tipset, err := api.ChainHead(context.Background())
	if err != nil {
		log.Fatalf("calling chain head: %s", err)
	}
	fmt.Printf("Current chain head is: %s", tipset.String())
}
