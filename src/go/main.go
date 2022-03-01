package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
)

func getBaseUrl() *url.URL {
	baseUrl, err := url.Parse("https://canary.discord.com")
	if err != nil {
		panic(err)
	}

	return baseUrl
}

func getHtml() string {
	baseUrl := getBaseUrl()
	loginUrl, err := baseUrl.Parse("/login")
	if err != nil {
		panic(err)
	}

	res, err := http.Get(loginUrl.String())
	if err != nil {
		panic(err)
	}

	defer res.Body.Close()
	html, err := ioutil.ReadAll(res.Body)
	if err != nil {
		panic(err)
	}

	return string(html)
}

func main() {
	html := getHtml()
	fmt.Println(html)
}