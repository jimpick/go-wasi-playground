package main

import (
	"fmt"
	"syscall/js"
	"time"
)

var a, b int

func main() {
        // c := make(chan struct{}, 0)
	document := js.Global().Get("document")
	fmt.Printf("Jim document %v\n", document)
	jim := document.Get("jim")
	fmt.Printf("Jim document.jim %v\n", jim)
	jimFunc := document.Get("jimFunc")
	fmt.Printf("Jim document.jimFunc %v\n", jimFunc)
	result := jimFunc.Invoke(123)
	fmt.Printf("Jim result %v\n", result)

	jimFuncWithCallback := document.Get("jimFuncWithCallback")
	fmt.Printf("Jim document.jimFuncWithCallback %v\n", jimFuncWithCallback)
	jimFuncWithCallback.Invoke(123, getCallback())

	jimFuncWithAsyncCallback := document.Get("jimFuncWithAsyncCallback")
	fmt.Printf("Jim document.jimFuncWithAsyncCallback %v\n", jimFuncWithAsyncCallback)
	// jimFuncWithAsyncCallback.Invoke(456, getCallback())
	/*
	document.Call("getElementById", "b").Set("oninput", updater(&b))
	update()
	*/
        // <-c // wait forever
	for i := 0; i < 10; i++ {
		time.Sleep(1000 * time.Millisecond)
	}
}

func getCallback() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		result := args[0]
		fmt.Printf("Jim callback result %v\n", result.String())
		return nil
	})
}

func update() {
	js.Global().Get("document").Call("getElementById", "result").Set("value", a+b)
}

