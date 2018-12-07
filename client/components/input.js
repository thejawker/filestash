import React from 'react';
import PropTypes from 'prop-types';
import './input.scss';

export class Input extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <input
              className="component_input"
              onChange={this.props.onChange}
              {...this.props}
              ref={(comp) => { this.ref = comp; }} />
        );
    }
}

Input.propTypes = {
    type: PropTypes.string,
    placeholder: PropTypes.string
};


export const Select = (props) => {
    const choices = props.choices || [];
    const id = props.id ? {id: props.id} : {};
    return (
        <select className="component_select" {...id} name={props.name} onChange={props.onChange} defaultValue={props.defaultValue}>
          <option hidden>{props.placeholder}</option>
          {
              choices.map((choice, index) => {
                  return (
                      <option key={index} name={choice}>{choice}</option>
                  );
              })
          }
        </select>
    );
};

export class Enabler extends React.Component {
    constructor(props){
        super(props);
    }

    componentWillMount(){
        requestAnimationFrame(() => {
            this.toggle(this.props.value || false);
        });
    }

    onChange(e){
        this.toggle(e.target.checked);
        this.props.onChange(e);
    }

    toggle(value){
        const target = this.props.target || [];
        target.map((t) => {
            let $el = document.getElementById(t+"_"+this.props.n);
            if(!$el) return;
            if(value === true){
                $el.parentElement.parentElement.parentElement.style.display = "block";
                $el.parentElement.parentElement.parentElement.style.opacity = "1";
            } else {
                $el.parentElement.parentElement.parentElement.style.display = "none";
                $el.parentElement.parentElement.parentElement.style.opacity = "0";
            }
        });
    }

    render(){
        return (
            <Input type="checkbox" onChange={this.onChange.bind(this)} defaultValue={this.props.value} />
        );
    }
};
