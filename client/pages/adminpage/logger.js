import React from 'react';
import { FormBuilder, Loader, Button } from '../../components/';
import { Config, Log } from '../../model/';

import "./logger.scss";

export class LogPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            form: {},
            log: ""
        };
    }

    componentWillMount(){
        Config.find("log").then((log) => {
            this.setState({form: {"":{"params":log}}});
        });
        Log.get(1024*100).then((log) => { // The server will only give the last 500kb of log :)
            this.setState({log: log}, () => {
                this.refs.$log.scrollTop = this.refs.$log.scrollHeight;
            });
        });
    }

    onChange(){
    }

    render(){
        return (
            <div className="component_logpage">
              <h2>Logging</h2>
              <div style={{minHeight: '150px'}}>
                <FormBuilder form={this.state.form} onChange={this.onChange.bind(this)} />
              </div>

              <pre style={{height: '350px'}} ref="$log">
                {
                    this.state.log === "" ? <Loader/> : this.state.log + "\n\n\n\n\n"
                }
              </pre>
              <div>
                <a href={Log.url()} download="access.log"><Button className="primary">Download</Button></a>
              </div>
            </div>
        );
    }
}
