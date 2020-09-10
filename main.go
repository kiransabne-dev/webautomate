package main

import (
	"log"
	"os/exec"
)

func main() {
	log.Println("main")
	// curl https://www.cyberciti.biz/files/sticker/sticker_book.pdf -o output.pdf
	curl := exec.Command("curl", "https://www.cyberciti.biz/files/sticker/sticker_book.pdf", "-o", "downloads/sticker_book.pdf")
	_, err := curl.Output()
	if err != nil {
		log.Println("curl err -> ", err)
	}

}
