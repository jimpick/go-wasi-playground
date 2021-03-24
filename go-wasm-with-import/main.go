package main

import (
	"fmt"
        "syscall/js"
	"time"
)

/*
func add(this js.Value, i []js.Value) interface{} {
        result := js.ValueOf(i[0].Int() + i[1].Int())
        println(result.String())
        return js.ValueOf(result)
}
*/

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

	// globalJimFunc.Invoke()
        // fmt.Printf("result %v %v\n", result.Type(), result.Int())

        fmt.Println("WASM Go Initialized with Sleep 6")

	counter := 0

	resultCb := func(this js.Value, i []js.Value) interface {} {
		result := i[0]
		fmt.Printf("result %v %v\n", result.Type(), result.Int())
		return nil
	}

	var innerLoop func(js.Value, []js.Value) interface {}
	innerLoop = func(js.Value, []js.Value) interface {} {
		println("Sleep 2s")
		time.Sleep(2000 * time.Millisecond)
		println("Awake, call JS")
		str := fmt.Sprintf("Jim%v", counter)
		counter++
		go globalJimFunc.Invoke(js.ValueOf(str), js.FuncOf(resultCb))
		// fmt.Printf("result %v %v\n", result.Type(), result.Int())
		innerLoop(js.ValueOf(nil), []js.Value{})
		return nil
	}

	go innerLoop(js.ValueOf(nil), []js.Value{})
        // <-c // wait forever
	for i := 0; i < 10; i++ {
		time.Sleep(1000 * time.Millisecond)
	}
}
