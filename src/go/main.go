package main

import (
	"fmt"
	"os"
	"strings"
	"sync"
)

func main() {
	lottieWg := &sync.WaitGroup{}

	for {
		var line string
		_, err := fmt.Scanln(&line)
		if err != nil {
			panic(err)
		}

		args := strings.Split(line, ";")
		fmt.Println(args[0])

		switch args[0] {
		case "DOWNLOAD":
			download(args[1], args[2])

		case "RENDER_LOTTIE":
			lottieWg.Wait()
			lottieWg.Add(1)
			fmt.Println("start", args[1])
			renderLottie(args[1], args[2])
			fmt.Println("end", args[2])
			lottieWg.Done()

		case "EXIT":
			os.Exit(0)

		default:
			fmt.Println("Unknown command")
		}
	}
}