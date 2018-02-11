let self_closers = ['input', 'img', 'hr', 'br', 'meta', 'link'];
function element(type, content, attribs = {}) {
    let html = '<' + type;
    //add attributes
    $.each(attribs, function (key, value) {
        html += ' ' + key + '="' + value + '"';
    });
    if (self_closers.indexOf(type) === -1) {
        html += '>' + content + '</' + type + '>';
    } else {
        html += ' />';
    }
    return html;
}

class Field {
    // object, member, label, default, attributes
    constructor(obj, member, label, defvalue, attr, readonly = false) {
        if (typeof obj !== 'undefined') {
            this._val = obj[member];
        } else {
            this._val = defvalue;
        }
        this._label = label;
        this._attr = attr || {};
        this._ro = readonly;
        this._ident = 'label' + label.replace(/\W/g, ''); // get only word chars (a-Z,0-9,_);
    }
    get value() {
        return this._val;
    }
    get update() {
        this._val = $('input[id="' + this._ident + '"]').val();
        if (this._val.length === 0)
            this._val = 'null';
        return this._val;
    }
    get inputField() {
        let label = element('label', this._label, {'for': this._ident});
        this._attr = Object.assign({}, this._attr, {type:'text', 'data-mini':'true', id:this._ident, value:this._val});
		if (this._ro) this._attr['readonly'] = 'readonly';
		let input = element('input', '', this._attr);
        return element('li', label + input, {'class': 'ui-field-contain ui-btn'});
    }
    set readonly(readonly) {
        this._ro = readonly;
    }
    listItem(string, target) {
        let link = element('a', string, {'href': '#', 'data-identity': this._val, 'data-target': target});
        return element('li', link, {'class': 'ui-btn'});
    }
}
