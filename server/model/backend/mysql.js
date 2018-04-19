const LIMIT_RESULTS = 100;

const mysql= require('mysql'),
      YAML = require('yamljs'),
      Readable = require('stream').Readable;

function _connection(_params){
    const params = {
        host: _params.hostname,
        user: _params.username,
        password: _params.password,
        port: _params.port || 3306
    };
    if(_params.database){ params.database = _params.database; }
    return mysql.createConnection(params);
}

function _params(path, params){
    const tmp = path.split("/");
    return Object.assign(params || {}, {
        database: tmp[1] || null,
        table: tmp[2] || null,
        key: tmp[3] && tmp[3].split(":")[0] || null,
        label: tmp[3] && tmp[3].split(":")[1] || null,
    });
}


function _json_to_form(json){

}

function _info(conn, params){
    return new Promise((done, err) => {
        if(!params.table) return err({status: 405, message: "You can't do that"});

        conn.query("DESCRIBE ??", [params.table], function(error, results){
            if(error) return err(error);

            fields = results.reduce((acc, el) => {
                if(el.Key === "PRI"){
                    if(!acc.id) acc.id = el.Field;
                }else if(el.Type === 'datetime'){
                    let score = 0;
                    if(/modif/.test(el.Field) || /update/.test(el.Field)) score += 2;
                    else if(/create/.test(el.Field)) score += 1;
                    if(score > acc['_']['date']){
                        acc['_']['date'] = score;
                        acc['date'] = el.Field;
                    }
                }else if(/varchar/.test(el.Type) || /text/.test(el.Type)){
                    let score = 0;
                    if(el.Null === "NO") score += 1;
                    if(el.Key === "MUL") score += 1;
                    if(score > acc['_']['label']){
                        acc['_']['label'] = score;
                        acc['label'] = el.Field;
                    }
                }
                return acc;
            }, {id: null, label: null, date: null, _: {label: -10, date: -10}});
            delete fields._;
            done(fields);
        });
    });
}

module.exports = {
    test: function(_params){
        return this.ls("/", _params)
            .then(() => Promise.resolve(_params))
            .catch((err) => Promise.reject({status: 401, message: "Not Authorized"}));
    },
    cat: function(_path, _settings){
        const params = _params(_path, _settings),
              conn = _connection(params);

        return _info(conn, params)
            .then((fields) => {
                return new Promise((done, err) => {
                    if(!fields.id){
                        // Yes that's quite hacky but well if a table doesn't have a
                        // primary key, it's hacky as well :P
                        fields.id = fields.label;
                        params.key = params.label;

                        // TODO make it work!
                    }
                    conn.query("SELECT * FROM ?? WHERE ?? = ?", [params.table, fields.id, params.key], function(error, results){
                        if(error){
                            conn.end();
                            return err(error);
                        }
                        var s = new Readable();
                        s.push(YAML.stringify(results[0], 4));
                        s.push(null);
                        done(s);
                    });
                });
            }).catch((err) => {
                conn.end();
                return Promise.reject(err);
            });
    },
    ls: function(_path, _settings){
        const params = _params(_path, _settings),
              conn = _connection(params);

        return new Promise((done, err) => {
            if(params['database'] === null){
                conn.query("SHOW DATABASES", function(error, results, fields){
                    conn.end();
                    if(error) return err(error);
                    done(results.map((result) => {
                        return {name: result[fields[0].name], type: 'directory'}
                    }));
                });
            }else if(params['table'] === null){
                conn.query("SHOW TABLES", function(error, results, fields){
                    conn.end();
                    if(error) return err(error);
                    done(results.map((result, i) => {
                        return {name: result[fields[0].name], type: 'directory'};
                    }));
                });
            }else{
                _info(conn, params)
                    .then((fields) => {
                        if(fields['date']){
                            conn.query("SELECT * FROM ?? ORDER BY ?? DESC LIMIT ?", [params.table, fields.date, LIMIT_RESULTS], handler);
                        }else{
                            conn.query("SELECT * FROM ?? LIMIT ?", [params.table, LIMIT_RESULTS], handler);
                        }
                    })
                    .catch((err) => {
                        conn.end();
                        return Promise.reject(err);
                    });

                function handler(error, results){
                    conn.end();
                    if(error) return err(error);
                    done(results.map((result, i) => {
                        return {
                            can_rename: false,
                            name: filename(results, fields)+".yml",
                            type: 'file',
                            time: datetime(results, fields)
                        };

                        function filename(results, fields){
                            const id = result[fields['id']],
                                  field = result[fields['label']] || fields['label'];
                            let name = id? id+": " : "";
                            name += field.length > 43 ? field.substring(0, 30).trim()+"..." : field;
                            return name;
                        }
                        function datetime(results, fields){
                            return result[fields['date']];
                        }
                    }));
                }
            }
        });
    },
    write: function(_path, _content, _params){
        return Promise.resolve(_content);
    },
    rm: function(_path, _params){
        return Promise.resolve();
    },
    mv: function(_from, _to, _params){
        return Promise.reject({status: 405, message: "You can't do that"});
    },
    mkdir: function(_path, _params){
        return Promise.resolve();
    },
    touch: function(_path, _params){
        return Promise.resolve();
    }
}
