import React from 'react';
import { Input, Select, Enabler } from './';
import { FormObjToJSON } from '../helpers/';

import "./formbuilder.scss";

export class FormBuilder extends React.Component {
    constructor(props){
        super(props);
    }

    section(struct, key, level = 0){
        if(struct == null) struct = "";
        const isALeaf = function(struct){
            if("label" in struct && "type" in struct &&
               "value" in struct && "default" in struct){
                return true;
            }
            return false;
        };

        if(Array.isArray(struct)) return null;
        else if(isALeaf(struct) === false){
            if(level <= 1){
                return (
                    <div className="formbuilder">
                      {
                          key ? <h2 className="no-select">{format(key)}</h2> : ""
                      }
                      {
                          Object.keys(struct).map((key, index) => {
                              return (
                                  <div key={key+"-"+index}>
                                    { this.section(struct[key], key, level + 1) }
                                  </div>
                              );
                          })
                      }
                    </div>
                );
            }
            return (
                <div>
                  <fieldset>
                    <legend className="no-select">{format(key)}</legend>
                    {
                        Object.keys(struct).map((key, index) => {
                            return (
                                <div key={key+"-"+index}>
                                  { this.section(struct[key], key, level + 1) }
                                </div>
                            );
                        })
                    }
                  </fieldset>
                </div>
            );
        }
        let id = struct.id ? {id: struct.id} : {};
        const onChange = function(e){
            struct.value = e;
            this.props.onChange.call(
                this,
                FormObjToJSON(this.props.form)
            );
        };
        return ( <FormElement n={this.props.id + 1} onChange={onChange.bind(this)} {...id} params={struct} name={(struct.label || "").toLowerCase().replace(/ /g, '_')} /> );
    }

    render(){
        return this.section(this.props.form || {});
    }
}


const FormElement = (props) => {
    let struct = props.params;
    let id = props.id ? {id: props.id + (props.n ? "_" + props.n : "")} : {};
    let $input = ( <Input onChange={(e) => props.onChange(e.target.value)} {...id} name={props.name} type="text" defaultValue={struct.value} placeholder={struct.placeholder} /> );
    switch(props.params["type"]){
    case "text":
        $input = ( <Input onChange={(e) => props.onChange(e.target.value)} {...id} name={props.name} type="text" defaultValue={struct.value} placeholder={struct.placeholder}/> );
        break;
    case "number":
        $input = ( <Input onChange={(e) => props.onChange(parseInt(e.target.value))} {...id} name={props.name} type="number" defaultValue={struct.value} placeholder={struct.placeholder} /> );
        break;
    case "password":
        $input = ( <Input onChange={(e) => props.onChange(e.target.value)} {...id} name={props.name} type="password" defaultValue={struct.value} placeholder={struct.placeholder} /> );
        break;
    case "hidden":
        $input = ( <Input name={props.name} type="hidden" defaultValue={struct.value} /> );
        break;
    case "boolean":
        $input = ( <Input onChange={(e) => props.onChange(e.target.checked)} {...id} name={props.name} type="checkbox" defaultValue={struct.value} /> );
        break;
    case "select":
        $input = ( <Select onChange={(e) => props.onChange(e.target.value)} {...id} name={props.name} choices={struct.options} defaultValue={struct.value} placeholder={struct.placeholder} />);
        break;
    case "enable":
        $input = ( <Enabler n={props.n} onChange={(e) => props.onChange(e.target.checked)} {...id} name={props.name} target={struct.target} defaultValue={struct.value} /> );
        break;
    case "image":
        $input = ( <img src={props.value} /> );
        break;
    }

    const description = struct.description ? (<div className="description">{struct.description}</div>) : null;

    return (
        <label className={"no-select input_type_" + props.params["type"]}>
          <div>
            <span>{format(struct.label)}:</span>
            <div style={{width: '100%'}}>
              { $input }
            </div>
          </div>
          <div>
            <span className="nothing"></span>
            <div style={{width: '100%'}}>
              { description }
            </div>
          </div>
        </label>
    );
};


function format(str = ""){
    if(str.length === 0) return str;
    return str.split("_")
        .map((word, index) => {

            if(index != 0) return word;
            return word[0].toUpperCase() + word.substring(1);
        })
        .join(" ");
}
