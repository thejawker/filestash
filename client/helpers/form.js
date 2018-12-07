export const FormObjToJSON = function(o){
    let obj = Object.assign({}, o);
    Object.keys(obj).map((key) => {
        let t = obj[key];
        if("label" in t && "type" in t && "default" in t && "value" in t){
            obj[key] = obj[key].value;
        } else {
            obj[key] = FormObjToJSON(obj[key]);
        }
    });
    return obj
};
