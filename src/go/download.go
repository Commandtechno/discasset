package main

import (
	"io"
	"net/http"
	"os"
)

func download(url string, path string) {
	src, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	dst, _ := os.Create(path)
	io.Copy(dst, src.Body)
}