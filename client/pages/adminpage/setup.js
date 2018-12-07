import React from 'react';
import bcrypt from 'bcryptjs';

import { Input, Button, Container } from '../../components/';
import { Config, Admin } from '../../model/';
import { notify, FormObjToJSON } from '../../helpers';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import "./setup.scss";

export class SetupPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            stage: 0,
            password: "",
            enable_telemetry: false
        };
    }

    createPassword(e){
        e.preventDefault();
        Config.all().then((config) => {
            bcrypt.hash(this.state.password, 10, (err, hash) => {
                if(err){
                    notify.send("Hash error: " + JSON.stringify(err), "error");
                    return;
                }
                console.log(config);
                config.auth.admin.value = hash;
                config = FormObjToJSON(config);
                config.connections = window.CONFIG.connections;
                Config.save(config, false)
                    .then(() => Admin.login(this.state.password))
                    .then(() => {
                        this.setState({stage: 1});
                        return Promise.resolve();
                    })
                    .catch((err) => notify.send(err && err.message, "error"));
            });
        });
    }

    enableLog(value){
        Config.all().then((config) => {
            config.log.telemetry.value = value;
            config = FormObjToJSON(config);
            config.connections = window.CONFIG.connections;
            Config.save(config);
        });
    }

    start(e){
        e.preventDefault();
        this.props.history.push("/");
    }

    renderStage(stage){
        if(stage === 0){
            return (
                <div>
                  <h2>You made it chief!</h2>
                  <p>
                    Let's start by protecting the admin area with a password:
                  </p>
                  <form onSubmit={this.createPassword.bind(this)} style={{maxWidth: '350px'}}>
                    <Input type="password" placeholder="Create your admin password" defaultValue="" onChange={(e) => this.setState({password: e.target.value})} autoComplete="new-password"/>
                    <Button className="primary">Create Password</Button>
                  </form>
                  <style dangerouslySetInnerHTML={{__html: ".component_menu_sidebar{transform: translateX(-300px)}"}} />
                </div>
            );
        }
        return (
            <div>
              <h2>Welcome to the engine room</h2>
              <p>
                The engine room is where you can configure things to your liking, you can access it from your browser at <a href="/admin">`{window.location.origin + "/admin"}`</a>. Feel free to poke around and make
                changes.<br/><br/>
                We hope you appreciate Nuage. It would help the project a lot if we could receive crash report and anonymous usage statistic from your instance to contribute in making nuage better for everyone
              </p>
              <form onSubmit={this.start.bind(this)} style={{marginTop: '-10px'}}>
                <label>
                  <Input type="checkbox" style={{marginRight: '10px', width: 'inherit'}} onChange={(e) => this.enableLog(e.target.checked)}/>
                    I accept but this data isn't to be share with anyone else and only for the purpose of making this software better
                </label>
                <Button className="primary completed">DONE</Button>
              </form>
            </div>
        );
    }

    render(){
        return (
            <div className="component_setup">
              { this.renderStage(this.state.stage) }
            </div>
        );
    }
}
