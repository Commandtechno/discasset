package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	for {
		var line string
		_, err := fmt.Scanln(&line)
		if err != nil {
			panic(err)
		}

		args := strings.Split(line, ";")
		switch args[0] {
		case "DOWNLOAD":
			download(args[1], args[2])

		case "RENDER_LOTTIE":
			renderLottie(args[1], args[2])

		case "EXIT":
			os.Exit(0)

		default:
			fmt.Println("Unknown command")
		}
	}
}