import { http_get, http_post, http_delete, debounce } from '../helpers/';

class ConfigModel {
    constructor(){
        this.debounced_post = debounce(http_post.bind(this), 1500);
    }

    find(key){
        return this.all().then((data) => data[key]);
    }

    all(){
        return http_get("/admin/api/config").then((d) => d.result);
    }

    save(config, debounced = true){
        let url = "/admin/api/config";
        if(debounced){
            return this.debounced_post("/admin/api/config", config)
        }
        return http_post(url, config)
    }
}

class PluginModel {
    constructor(){}

    all(){
        return http_get("/admin/api/plugin").then((r) => r.results);
    }
}

class BackendModel {
    constructor(){}

    all(){
        return http_get("/admin/api/backend").then((r) => r.result);
    }
}

export const Plugin = new PluginModel();
export const Config = new ConfigModel();
export const Backend = new BackendModel();
