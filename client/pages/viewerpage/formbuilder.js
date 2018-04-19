import React from 'react';
import { Input, Textarea, Container, Button, NgIf } from '../../components/';
import './formbuilder.scss';

export class FormBuilder extends React.Component {
    constructor(props){
        super(props);

        // // FOR LDAP STUFF:
        // // person https://tools.ietf.org/html/rfc2798
        this.form = {
            mode: "readonly",
            templates: [
                ["default", "User Account"],
                ["group", "Posix Group"],
                ["unit", "Organisational Unit"]
            ],
            fields: [
                {label: "First Name", name: "givenname", type: "text"},
                {label: "Last Name", name: "sn", type: "text"},
                {label: "Common Name", name: "cn", type: "text", placeholder: "First name"},
                {label: "Distinguished Name", name: "dn", type: "text", autofill: "${givenname} ${sn}"},
                {label: "Home Directory Path", name: "homedirectory", type: "text", init: "/home/", autofill: "/home/${givenname | lower}-${sn | lower}"},
                {label: "Group Number", name: "gidnumber", type: "number"},
                {label: "Login Shell", name: "shell", type: "select", choices: [
                    {name: "bash", value: "/bin/bash"},
                    {name: "sh", value: "/bin/sh"}
                ]},
                {label: "Password", name: "password", type: "password"},
            ]
        };

        // EG of a mysql stuff
        // this.form = {
        //     mode: 'readwrite',
        //     fields: [
        //         {name: "uuid", type: "text", label: "ID"},
        //         {name: "category_id", label: "Category", type: "select", choices: [
        //             {name: "3", value: "News"},
        //             {name: "5", value: "Knowledge Base"},
        //             {name: "7", value: "Blog"},
        //         ]},
        //         {name: "content", label: "Content", type: "textarea"},
        //         {name: "publication_date", label: "Publication Date", type: "date"},
        //         {name: "update_date", label: "Update Date", type: "date", init: "2018-03-03"},
        //         {name: "status", label: "Status", type: "select", choices: [
        //             {name: 1, value: "UNPUBLISH"},
        //             {name: 2, value: "PUBLISH"},
        //             {name: 3, value: "DRAFT"}
        //         ]}
        //     ]
        // };

        this.state = {
            templates: this.form.templates,
            fields: this.initData(this.form.fields)
        };
    }

    initData(fields){
        return fields.map((field) => {
            if(field.hasOwnProperty('value') === false) field.value = field.init || "";
            return field;
        });
    }

    onChange(name, value){
        let fields = this.state.fields.map((field) => {
            if(field.name === name){
                field.value = value;
            };
            return field;
        });
        fields = fields.map((field) => {
            if(field.hasOwnProperty('autofill')){
                field.value = field.autofill
                    .match(/\$\{.*?\}/g)
                    .map((r) => r.replace(/^\$\{(.*)\}$/, "$1"))
                    .map((match) => {
                        const [name, filter] = match.split(" | ");
                        const tmp = fields.find((e) => e.name === name);
                        return [name, _filter(tmp && tmp.value || "", filter)];

                        function _filter(value, name){
                            if(!value) return value;
                            if(name === 'lower'){
                                return value.toLowerCase();
                            }
                            return value;
                        }
                    }).reduce((acc, el) => {
                        acc = acc.replace(/\$\{.*?\}/, el[1]);
                        return acc;
                    }, field.autofill);
            }
            return field;
        });
        this.setState({fields: fields});
    }

    render(){
        return (
            <div className="component_formbuilder">
              <Container>
                <form>
                  {
                      this.state.fields.map((field, index) => {
                          return (
                              <div key={index}>
                                <NgIf cond={["text", "number", "password", "date"].indexOf(field.type) !== -1}>
                                  <label> {field.label || field.name}:
                                    <Input type={field.type} placeholder={field.placeholder} value={field.value} onChange={(e) => this.onChange(field.name, e.target.value)}/>
                                  </label>
                                </NgIf>
                                <NgIf cond={field.type === "textarea"}>
                                  <label> {field.label || field.name}:
                                    <Textarea type={field.type} placeholder={field.placeholder} value={field.value} onChange={(e) => this.onChange(field.name, e.target.value)}/>
                                  </label>
                                </NgIf>
                                <NgIf cond={field.type === "select"}>
                                  <label> {field.label || field.name}:
                                    <select name={field.name}>
                                      {
                                          (field.choices || []).map((choice, index) => {
                                              return (
                                                  <option key={index}>{choice.value}</option>
                                              );
                                          })
                                      }
                                    </select>
                                  </label>
                                </NgIf>
                              </div>
                          );
                      })
                  }
                  <Button className="primary"> SAVE </Button>
                </form>
              </Container>
            </div>
        );
    }
}
