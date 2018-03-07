/* global rest, pages */

/**
 * Global variables
 */
let REFRESH_TIMEOUT = 100;
let NO_IDENTIFIER = -1;
let SELF_CLOSERS = ['input', 'img', 'hr', 'br', 'meta', 'link'];
/**
 * Helper functions
 */

/**
 * element
 * wrap content in a html tag of 'type', supplying attributes
 * 
 * @param {string} type
 * @param {string} content
 * @param {object} attribs
 * @returns {string}
 */
function element(type, content, attribs = {}) {
    let html = '<' + type;
    //add attributes
    $.each(attribs, function (key, value) {
        html += ' ' + key + '="' + value + '"';
    });
    if (SELF_CLOSERS.indexOf(type) === -1) {
        html += '>' + content + '</' + type + '>';
    } else {
        html += ' />';
    }
    return html;
}

/**
 * 
 * @param {string} input
 * @param {string} apiClass
 * @returns {undefined}
 */
function checkAutocomplete(input, apiClass) {
    if ($(input).hasClass(apiClass)) {
        $(input).autocomplete({
            delay: 100,
            minLength: 1,
            source: function (request, response) {
                rest[apiClass].read({term: request.term}).done(response);
            }
        });
    }
}

/**
 * Classes
 */

/**
 * Api class
 * provides a way to communicate with a php backend
 * the class is instantiated by suppling an URL: the base for the REST service
 * 
 *   addEndpoint will add a node (endpoint) to the base URL (thus creating a new service)
 *   get, save, del: perform AJAX operations (GET, POST, DELETE) on the endpoint
 */
class Api {
    constructor(base) {
        this.apibase = base;
    }
    addEndpoint(endpoint) {
        this[endpoint] = new Api(this.apibase + endpoint);
    }
    get() { // id is optional, check arguments
        let url = this.apibase;
        if (arguments.length > 0) {
            if (typeof arguments[0] !== 'object') {
                url += '/' + arguments[0];
            } else {
                url += '?term=' + arguments[0].term;
            }
        }
        return $.ajax({
            method: 'GET', url: url, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded;charset=UTF-8'
        });
    }
    save() { // id is optional, payload mandatory, check arguments
        let payload, url = this.apibase;
        if (arguments.length > 1) {
            url += '/' + arguments[0];
            payload = arguments[1];
        } else {
            payload = arguments[0];
        }
        return $.ajax({
            method: 'POST', url: url, dataType: 'json', data: payload,
            contentType: 'application/x-www-form-urlencoded;charset=UTF-8'
        });
    }
    del(id) { // id is mandatory
        let url = this.apibase + '/' + id;
        return $.ajax({
            method: 'DELETE', url: url, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded;charset=UTF-8'
        });
    }
}

/**
 * Field class
 * create a 'field' from a table-column
 * the constructor must be supplied with an object holding specifics on the field definition:
 *   label: the string to show as label
 *   type: type of variable (number, string, boolean, object)
 *   default: default value for the field (in case no value was supplied)
 *   attribs: object holding (html)attributes for the field like:
 *     readonly:'readonly' - useful for autoincrement fields (show, no modify)
 *     class:'lookupfield' - the 'lookupfield' must have a corresponding api-enpoint
 * the value is optional
 * 
 *   htmlInput: creates an jquery input field
 *   value: reads the value from the page
 */
class Field {
    // _label: string
    // _type: string
    // _val: string
    // _id: string
    // _attr: object
    constructor(obj = {}, value) {
        this._label = obj.label || '';
        this._type = obj.type || 'string';
        this._input = obj.input || 'text';
        this._options = obj.options || {};
        this._attr = obj.attribs || {};
        this._val = value || obj.default;
        this._id = 'label' + this._label.replace(/\W/g, ''); // get only word chars (a-Z,0-9,_);
    }
    toString() {
        return this._val;
    }
    get htmlInput() {
        let html = '<li class="ui-field-contain ui-btn">';
        this._attr['id'] = this._id;
        this._attr['value'] = this._val;
        this._attr['data-mini'] = 'true';
        switch (this._input) {
            case 'text':
                if ('lookup' in this._attr) // lookup defined
                    this._attr['type'] = 'search';
                else
                    this._attr['type'] = 'text';
                html += this.makeInput(this._id, this._label, this._attr);
                break;
            case 'slider':
                this._attr['type'] = 'range';
                this._attr['min'] = this._options.min;
                this._attr['max'] = this._options.max;
                this._attr['step'] = this._options.step;
                html += this.makeInput(this._id, this._label, this._attr);
                break;
            case 'radio':
                this._attr['type'] = 'radio';
                this._attr['name'] = this._id;
                html += '<fieldset data-role="controlgroup" data-type="horizontal"><legend>' + this._label + '</legend>';
                for (let key in this._options) {
                    this._attr['value'] = key;
                    if (this._val === key)
                        this._attr['checked'] = 'checked';
                    else
                        delete this._attr['checked'];
                    html += this.makeInput('radio' + key, this._options[key], this._attr);
                }
                html += '</fieldset>';
                break;
            default:
        }
        return html + '</li>';
    }
    makeInput(id, label, attribs) {
        let attr = '';
        let html = '<label for="' + id + '">' + label + '</label>';
        attribs['id'] = id;
        for (let key in attribs) {
            attr += ' ' + key + '="' + attribs[key] + '"';
        }
        return html + '<input' + attr + ' />';
    }
    get value() {
        if (this._input === 'radio') {
            this._val = $('input[name="' + this._id + '"]:checked').val();
        } else
            this._val = $('input[id="' + this._id + '"]').val();
        if (this._val.length === 0) {
            if ('required' in this._attr) {
                alert('Field \'' + this._label.replace(/:$/, '') + '\' is mandatory');
                return;
            }
        } else {
            if (this._type === 'number' && !$.isNumeric(this._val)) {
                alert('Field \'' + this._label.replace(/:$/, '') + '\' must be a number');
                return;
            }
        }
        return this._val;
    }
}

/**
 * Item class
 * create an 'item' from a table/view
 * the constructor must be supplied with an object 'fields' which holds specifics on 
 * the fields and their definition. For each field a 'Field' will be instantiated.
 * An optional object can be supplied with the value for each field - names must match 
 * with those in 'fields'.
 *   optional '_target', injected in obj to supply the next page to load (on click)
 * 
 *   fields: returns listview containing all fields
 *   listString: returns string to show in a listview
 */
class Item {
    // _fields: array of Field objects
    // _listString: string
    // _target: string
    // _create: boolean
    constructor(fields, obj = {}) {
        this._fields = {};
        this._listString = 'listString not defined';
        this._target = obj._target || '';
        for (let key in fields) {
            if (key === 'listString') {
                this._listString = fields.listString.replace(/\$\w+/g, function (x) {
                    return obj[x.substr(1)];
                });
            } else {
                this._fields[key] = new Field(fields[key], obj[key]);
            }
        }
        if (typeof obj !== 'undefined')
            this._create = false;
        else
            this._create = true;
    }
    get fields() {
        let html = '';
        for (let key in this._fields) {
            html += this._fields[key].htmlInput;
        }
        return html;
    }
    get listString() {
        let link = element('a', this.toString(), {'href': '#', 'data-identity': this._fields.id, 'data-target': this._target});
        return element('li', link, {'class': 'ui-btn'});
    }
    get payload() {
        let payload = {};
        for (let key in this._fields) {
            payload[key] = this._fields[key].value;
            if (typeof payload[key] === 'undefined') // something was not right
                return;
        }
        return payload;
    }
    toString() {
        return this._listString;
    }
}

/**
 * Page class
 * The variable page holds:
 *   source: 
 *     - string specifying api endnode
 *     - array of entries (title, target)
 *   type: pagetype, can be 'list' or 'detail'
 *   divider: indicates whether the list uses dividers, and what the initial state is
 *   target: default target (next page) for all items
 *   fields: points to table/view def. in 'fields'
 *   mode: 
 *     - for list: 'C' - add button will be shown
 *     - for detail: 'U' - save button, 'D' - delete button
 */
class Page {
    // _source:
    //     array of {title, _target}
    //     Api object
    // _fields: array of 'field' object definitions
    // _item: Item (only for detail page - used to read values)
    // _type: string
    // _divider: boolean
    //      _dividercollapsed: boolean
    // _target: string
    // _create: boolean
    // _update: boolean
    // _delete: boolean
    constructor(page) {
        this._create = this._update = this._delete = false;
        this._top = false;
        if (typeof page.source !== 'string') { // source is local defined entries 
            this._source = [];
            for (let i in page.source) {
                //this._source.push(new Item2(fields.menu, page.source[i]));
                this._source.push({title: page.source[i].title, _target: page.source[i].target});
            }
            //if (Array.isArray) console.log(Array.isArray(this._source));
            //console.log(this._source instanceof Array);
        } else {
            if (typeof rest[page.source] !== 'object') { // create rest entity
                rest.addEndpoint(page.source);
            }
            this._source = rest[page.source];
        }
        this._fields = page.fields;
        this._filter = page.filter || false;
        this._type = page.type;
        if (this._type !== 'list' && this._type !== 'detail')
            console.log('Invalid type for page!');
        if (this._type === 'list') {
            this._target = page.target;
            if (typeof page.mode === 'string') {
                this._create = (page.mode.toUpperCase().indexOf('C') !== -1);
            }
        } else { // detail
            if (typeof page.mode === 'string') {
                this._update = (page.mode.toUpperCase().indexOf('U') !== -1);
                this._delete = (page.mode.toUpperCase().indexOf('D') !== -1);
            }
        }
        this._divider = (page.divider === 'collapsed' || page.divider === 'expanded') || false;
        if (this._divider)
            this._dividercollapsed = (page.divider === 'collapsed');
    }
    get target() {
        return this._target;
    }
    setTop() {
        this._top = true;
    }
    createDivider() {
        if (!this._divider)
            return;
        let icon = '<span class="ui-btn-icon-notext inlineIcon"></span>';
        let btngrp = '<li><div class="ui-grid-a ui-mini">'
            + '<div class="ui-block-a"><span id="btnE" class="ui-btn ui-corner-all collapseExpand">Expand All</span></div>'
            + '<div class="ui-block-b"><span id="btnC" class="ui-btn ui-corner-all collapseExpand">Collapse All</span></div>'
            + '</div></li>';
        $('.ui-li-divider').prepend(icon);
        if (this._dividercollapsed) {
            $('.ui-li-divider .inlineIcon').addClass('ui-icon-plus');
            let li = $('.ui-li-divider').next(':not(.ui-li-divider)');
            while (li.length > 0) {
                li.hide();
                li = li.next(':not(.ui-li-divider)');
            }
        } else
            $('.ui-li-divider .inlineIcon').addClass('ui-icon-minus');
        // add button group
        $('#list-entities').prepend(btngrp);
        // add handlers
        $('.collapseExpand').on('vclick', function () {
            var collapseAll = this.id === "btnC";
            if (collapseAll) {
                $(".ui-li-divider .ui-icon-minus").click();
            } else {
                $(".ui-li-divider .ui-icon-plus").click();
            }
        });
    }
    toggleDivider(divider) {
        let li = $(divider).next(':not(.ui-li-divider)');
        let collapsed = li.css('display') === 'none';
        while (li.length > 0) {
            li.slideToggle(300);
            li = li.next(':not(.ui-li-divider)');
        }
        let icon = $(divider).find('.inlineIcon');
        if (!collapsed) {
            icon.removeClass('ui-icon-minus').addClass('ui-icon-plus');
        } else {
            icon.removeClass('ui-icon-plus').addClass('ui-icon-minus');
        }
    }
    paint() {
        if (this._create && this._type === 'list') {
            $('#add-btn').show();
        } else {
            $('#add-btn').hide();
        }
        if ((this._update || this._create) && this._type === 'detail') {
            $('#save-btn').show();
        } else {
            $('#save-btn').hide();
        }
        if (this._delete && this._type === 'detail') {
            $('#del-btn').show();
        } else {
            $('#del-btn').hide();
        }
        if (!this._top) {
            $('#back-btn').show();
        } else {
            $('#back-btn').hide();
        }
    }
    show(data, textStatus, jqXHR) { // callback function for ajax calls
        let html = '', item;
        if (this._type === 'detail') { // we expect 1 item (show for update or delete), or none (when creating)
            item = (typeof data !== 'undefined') ? new Item(this._fields, data[0]) : new Item(this._fields);
            this._item = item; // save item for updates
            html = item.fields;
        } else { // we expect 1 or more objects (or none if the list is empty)
            for (item in data) {
                if (!('_target' in data[item]))
                    data[item]._target = this._target; // inject target
                html += new Item(this._fields, data[item]).listString;
            }
        }
        // create entries (& dividers)
        $('#list-entities').html(html).listview({
            autodividers: this._divider ? true : false
        }).listview('refresh').trigger('create');
        if (this._filter)
            $('form.ui-filterable').show();
        else
            $('form.ui-filterable').hide();
        this.createDivider();
    }
    getREST(id) { // get the data (from ajax call, or locally)
        // GET /url
        // GET /url/id
        let callback = this.show.bind(this); // define the callback function

        if (this._type === 'detail') { // show details of record (existing or new)
            if (id === NO_IDENTIFIER) { // new record
                this.show();
            } else {
                // read just one (identied by id) record
                this._source.get(id).done(callback); // provide variable id's ....
            }
        } else { // show all records
            if (this._source instanceof Array) { // we have a local list
                this.show(this._source);
            } else {
                if (id === NO_IDENTIFIER)
                    this._source.get().done(callback);
                else
                    this._source.get(id).done(callback);
            }
        }
        this.paint();
    }
    putREST(id) {
        // POST /url, supply payload
        // POST /url/id, supply payload

        // read values from item on current page
        let payload = this._item.payload;
        if (typeof payload !== 'undefined') {
            // create or update and show previous page ('back')
            if (id === NO_IDENTIFIER)
                this._source.save(payload).done();
            else
                this._source.save(id, payload).done();
            this.paint();
            return true;
        }
        return false;
    }
    delREST(id) {
        // DELETE /url/id
        this._source.del(id).done();
        this.paint();
    }
}

/**
 * PageStack class
 * Keep track of defined pages and the order in which they are loaded
 * 
 * _stack: names & ids of pages (index in _pages):  {_page, _id}
 * _pages: map of valid pages, links to Page objects
 * _lookups: links to lookups (API get)
 */
class PageStack {
    // _stack: array of {_page, _id}
    // _pages: array of Page objects
    // _lookups: array of Api objects
    constructor() {
        let that = this;
        this._stack = [];
        this._pages = [];
        this._lookups = [];
        for (let page in pages) {
            this.addPage(page, pages[page]);
            this.checkForLookup(pages[page].fields);
        }

        // setup listeners
        $('#back-btn').on('vclick', '', function () {
            that.back();
        });
        $('#add-btn').on('vclick', '', function () {
            that.addItem();
        });
        $('#save-btn').on('vclick', '', function () {
            that.updItem();
        });
        $('#del-btn').on('vclick', '', function () {
            that.delItem();
        });
        $('#list-entities').on('vclick', 'a', function (e) {
            let target = $(this).data('target');
            let identity = $(this).data('identity');
            console.log('click: ' + $(this).parents('ul').attr('id') + ', target: ' + target + ', id:' + identity);
            that.next(target, identity);
            e.stopPropagation();
        });
        $('#list-entities').on('focus', 'input', function (e) {
            that.checkLookup(this);
            e.stopPropagation();
        });
        $('#list-entities').on('vclick', 'li', function (e) {
            that._pages[that.currentPage].toggleDivider(this);
            e.stopPropagation();
        });
    }
    get currentPage() {
        return this._stack[this._stack.length - 1]._page;
    }
    get currentId() {
        return this._stack[this._stack.length - 1]._id;
    }
    next(target, id = NO_IDENTIFIER) { // load next page & show
        if (target in this._pages) {
            if (this._stack.length === 0)
                this._pages[target].setTop();
            this._stack.push({_page: target, _id: id});
            this.showPage();
        } else
            console.log('PageStack Error: ' + target + ' is not a valid page');
    }
    back() { // go back one page & show after a while, or else we're too soon with the async data
        if (this._stack.length > 0)
            this._stack.pop();
        let that = this;
        setTimeout(function () {
            that.showPage();
        }, REFRESH_TIMEOUT);
    }
    addPage(name, page) { // add a valid page (only those will be on the stack)
        this._pages[name] = new Page(page);
    }
    checkForLookup(fields) {
        for (let field in fields) {
            if (field === 'listString')
                continue;
            if ('attribs' in fields[field] && 'lookup' in fields[field].attribs)
                this.addLookup(fields[field].attribs['lookup']);
        }
    }
    addLookup(lookup) {
        if (typeof this._lookups[lookup] !== 'object') { // create rest entity
            rest.addEndpoint(lookup);
        }
        this._lookups[lookup] = rest[lookup];
    }
    checkLookup(input) {
        let lookup = $(input).attr('lookup');
        if (lookup in this._lookups) {
            $(input).autocomplete({
                delay: 100,
                minLength: 1,
                source: function (request, response) {
                    rest[lookup].get({term: request.term}).done(response);
                }
            });
        }
    }
    showPage() {
        this._pages[this.currentPage].getREST(this.currentId);
    }
    addItem() { // create new item
        this.next(this._pages[this.currentPage].target);
    }
    updItem() { // save the item (changed or new)
        let id = this.currentId;
        if (this._pages[this.currentPage].putREST(this.currentId))
            this.back();
    }
    delItem() { // delete current object
        let answer = confirm("Are you sure you want to delete?");
        if (answer) {
            //delete
            this._pages[this.currentPage].delREST(this.currentId);
            this.back();
        }
    }
}
