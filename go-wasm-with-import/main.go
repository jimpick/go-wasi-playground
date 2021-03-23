package main

import (
	"fmt"
        "syscall/js"
	"time"
)

func add(this js.Value, i []js.Value) interface{} {
        result := js.ValueOf(i[0].Int() + i[1].Int())
        println(result.String())
        return js.ValueOf(result)
}

func main() {
        // c := make(chan struct{}, 0)

	/*
        println("jim1")
	addFunc := js.FuncOf(add)
        println("jim2")
	global := js.Global()
        println("jim3")
        global.Set("add", addFunc)
	println("jim4")
	*/

	globalJim := js.Global().Get("jim")
        fmt.Printf("globalThis.jim %v %v\n", globalJim.Type(), globalJim.String())

	globalJimFunc := js.Global().Get("jimFunc")
        fmt.Printf("globalThis.jimFunc %v\n", globalJimFunc.Type())

	result := globalJimFunc.Invoke()
        fmt.Printf("result %v %v\n", result.Type(), result.Int())

        fmt.Println("WASM Go Initialized 2")
	for {
		println("Sleep")
		time.Sleep(3000 * time.Millisecond)
		result = globalJimFunc.Invoke()
		fmt.Printf("result %v %v\n", result.Type(), result.Int())

	}
        // <-c // wait forever
}
