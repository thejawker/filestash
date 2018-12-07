package ctrl

import (
	. "github.com/mickael-kerjean/nuage/server/common"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)


func FetchPluginsHandler(ctx App, res http.ResponseWriter, req *http.Request) {
	f, err := os.OpenFile(filepath.Join(GetCurrentDir(), PLUGIN_PATH), os.O_RDONLY, os.ModePerm)
	if err != nil {
		SendErrorResult(res, err)
		return
	}
	files, err := f.Readdir(0)
	if err != nil {
		SendErrorResult(res, err)
		return
	}
	plugins := make([]string, 0)
	for i := 0; i < len(files); i++ {
		plugins = append(plugins, files[i].Name())
	}
	SendSuccessResults(res, plugins)
}

func FetchLogHandler(ctx App, res http.ResponseWriter, req *http.Request) {
	file, err := os.OpenFile(filepath.Join(GetCurrentDir(), LOG_PATH, "access.log"), os.O_RDONLY, os.ModePerm)
	if err != nil {
		SendErrorResult(res, err)
		return
	}
	defer file.Close()
	maxSize := req.URL.Query().Get("maxSize")
	if maxSize != "" {
		cursor := func() int64 {
			tmp, err := strconv.Atoi(maxSize)
			if err != nil {
				return 0
			}
			return int64(tmp)
		}()
		for cursor > 0 {
			file.Seek(-cursor, io.SeekEnd)
			char := make([]byte, 1)
			file.Read(char)
			if char[0] == 10 || char[0] == 13 { // stop if we find a line
				break
			}
			cursor += 1
		}
	}
	io.Copy(res, file)
}

func PrivateConfigHandler(ctx App, res http.ResponseWriter, req *http.Request) {
	SendSuccessResult(res, Config)
}

func PrivateConfigUpdateHandler(ctx App, res http.ResponseWriter, req *http.Request) {
	b, _ := ioutil.ReadAll(req.Body)
	b = PrettyPrint(b)
	file, err := os.Create(filepath.Join(GetCurrentDir(), CONFIG_PATH, "config.json"))
	if err != nil {
		SendErrorResult(res, err)
		return
	}
	defer file.Close()
	if _, err := file.Write(b); err != nil {
		SendErrorResult(res, err)
		return
	}
	file.Close()
	Config.Load()
	Log.Stdout("ADMIN AUTH %s", Config.Get("auth.admin").String())
	SendSuccessResult(res, nil)
}

func PublicConfigHandler(ctx App, res http.ResponseWriter, req *http.Request) {
	c, err := Config.Export()
	if err != nil {
		res.Write([]byte("window.CONFIG = {}"))
		return
	}
	res.Write([]byte("window.CONFIG = "))
	res.Write([]byte(c))
}
