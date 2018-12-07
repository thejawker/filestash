import React from 'react';
import { FormBuilder, Icon } from "../../components/";
import { Backend, Config } from "../../model/";
import { FormObjToJSON } from "../../helpers/";

import "./dashboard.scss";

export class DashboardPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            backend_enabled: [],
            backend_available: [],
            config: null
        };
    }

    componentWillMount(){
        Promise.all([
            Backend.all(),
            Config.all()
        ]).then((data) => {
            let [backend, config] = data;
            this.setState({
                backend_available: backend,
                backend_enabled: window.CONFIG.connections,
                config: config
            });
        });
    }

    onChange(e){
        // recreate the config object
        let json = FormObjToJSON(this.state.config);
        json.connections = this.state.backend_enabled;

        // update the config object with the newly received data
        if(e){
            let key = Object.keys(e[""])[0];
            json.connections = json.connections.map((conn) => {
                if(conn.type === key){
                    conn = e[""][key];
                }
                return conn;
            });
        }

        // persist config object in the backend
        Config.save(json);
        console.log(json);
    }


    addBackend(backend_id){
        this.setState({
            backend_enabled: this.state.backend_enabled.concat([
                {
                    type: backend_id,
                    label: backend_id.toUpperCase()
                }
            ])
        }, this.onChange.bind(this));
    }

    removeBackend(n){
        this.setState({
            backend_enabled: this.state.backend_enabled.filter((_, i) => i !== n)
        }, this.onChange.bind(this));
    }

    render(){
        const backendForm = function(backend_enabled){
            let backend_current = Object.assign({}, this.state.backend_available[backend_enabled.type]);
            for(let key in backend_enabled){
                if(key in backend_current){
                    backend_current[key].value = backend_enabled[key];
                } else {
                    let obj = {};
                    obj[key] = {
                        label: key,
                        type: "text",
                        value: null,
                        default: backend_enabled[key]
                    };
                    if(key === "label"){
                        obj[key].placeholder = "Name as shown on the login screen. Default: " + backend_enabled[key];
                    }
                    backend_current = Object.assign(obj, backend_current);
                }
            }
            let obj = {};
            obj[backend_enabled.type] = backend_current;
            return obj;
        };
        return (
            <div className="component_dashboard">
              <h2>Dashboard</h2>
              <div className="box-element">
                {
                    Object.keys(this.state.backend_available).map((backend_available, index) => {
                        return (
                            <div key={index} className="backend">
                              <div>
                                {backend_available}
                                <span className="no-select" onClick={this.addBackend.bind(this, backend_available)}>
                                  +
                                </span>
                              </div>
                            </div>
                        );
                    })
                }
              </div>
              <form>
                {
                    this.state.backend_enabled.map((backend_enable, index) => {
                        return (
                            <div key={index}>
                              <div className="icons no-select" onClick={this.removeBackend.bind(this, index)}>
                                <Icon name="delete" />
                              </div>
                              <FormBuilder onChange={this.onChange.bind(this)} id={index} key={index} form={{"": backendForm.call(this, backend_enable)}} />
                            </div>
                        );
                    })
                }
              </form>
            </div>
        );
    }
}
