package main

import (
	"database/sql"
	"log"
	"os"
	"os/exec"

	s "strings"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type FileData struct {
	ID             int    `json:"id,omitempty"`
	DiaryNumber    string `json:"dairyNumber"`
	PetitionerName string `json:"petitionerName"`
	RespondentName string `json:"respondentName"`
	HrefText       string `json:"hrefText"`
	FileType       string `json:"fileType"`
	DateStr        string `json:"date"`
}

var db *sql.DB

func init() {
	var err error
	err = godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file")
	}
	postgresqlConn := os.Getenv("PGSQL_DEV_CONN")
	log.Println("PGSQL_DEV_CONN --> ", postgresqlConn)

	db, err = sql.Open("postgres", postgresqlConn)

	if err != nil {
		panic(err)
	}
	if err = db.Ping(); err != nil {
		panic(err)
	}
	log.Println("Postgresql connected Successfully")

}

func main() {
	log.Println("main")

	fileDataList, err := getListOfNotDownloadedFiles()
	if err != nil {
		log.Println("fileDataList err -> ", err)
	}
	log.Print("fileDataList -> ", fileDataList)

	// curl https://www.cyberciti.biz/files/sticker/sticker_book.pdf -o output.pdf
	// curl := exec.Command("curl", "https://www.cyberciti.biz/files/sticker/sticker_book.pdf", "-o", "downloads/sticker_book.pdf")
	// _, err = curl.Output()
	// if err != nil {
	// 	log.Println("curl err -> ", err)
	// }
	for i, singleFileData := range fileDataList {
		log.Println(" i -> ", i, "singleFileData -> ", singleFileData.ID)
		// curl get pdf file
		//curl https://www.cyberciti.biz/files/sticker/sticker_book.pdf -o output.pdf

		curl := exec.Command("curl", "-k", singleFileData.HrefText, "-o", "downloads/"+singleFileData.PetitionerName+" vs "+s.ReplaceAll(singleFileData.RespondentName, ".", "")+" "+singleFileData.DateStr+".pdf")
		_, err = curl.Output()
		if err != nil {
			log.Println("curl err -> ", err)
		}

		// updated Downloaded Flag to Y in db to avoid repeated downloads
		updatedId, err := updateDownloadFlag(singleFileData.ID)
		if err != nil {
			log.Println("Update failed/ -> ", err)
			return
		}
		log.Println("updatedId -> ", updatedId)
	}
	log.Println("program Completed.......")
	os.Exit(0)

}

// making select query for getting data of not downloaded File
func getListOfNotDownloadedFiles() ([]FileData, error) {
	sqlStmt := `select id, dairyNumber, petitionerName, respondentName, hrefText, fileType, date from filesdb where isDownloaded = 'N'`

	rows, err := db.Query(sqlStmt)
	if err != nil {
		log.Println("database select query err -> ", err)
		return nil, err
	}
	defer rows.Close()
	fileDataSlice := make([]FileData, 0)
	for rows.Next() {
		singleData := FileData{}
		err := rows.Scan(&singleData.ID, &singleData.DiaryNumber, &singleData.PetitionerName, &singleData.RespondentName, &singleData.HrefText, &singleData.FileType, &singleData.DateStr)
		if err != nil {
			log.Panicln("scan err -> ", err)
			return nil, err
		}
		fileDataSlice = append(fileDataSlice, singleData)
	}
	err = rows.Err()
	if err != nil {
		log.Panicln("Rows err -> ", err)
		return nil, err
	}
	return fileDataSlice, nil
}

// update the isDownloadFlag to Y
func updateDownloadFlag(id int) (int, error) {
	sqlStmt := `update filesdb set isDownloaded = 'Y' where id = $1 returning id`
	var returnId int
	err := db.QueryRow(sqlStmt, id).Scan(&returnId)
	if err != nil {
		log.Panicln("update Query err -> ", err)
		return 0, err
	}
	log.Println("updatedId -> ", returnId)
	return returnId, nil

}
