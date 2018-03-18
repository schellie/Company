/**
 * Global variables
 */
let REFRESH_TIMEOUT = 100;
let DETAIL_PAGE = 'detail';
let NO_IDENTIFIER = -1;
let SELF_CLOSERS = ['input', 'img', 'hr', 'br', 'meta', 'link'];
// Messages
let DEL_MESSAGE = 'Are you sure you want to delete?';
let LISTNOTDEFINED = 'listString not defined';

// Selectors
let BACKBUTTON = '#back-btn';
let ADDBUTTON = '#add-btn';
let SAVEBUTTON = '#save-btn';
let DELBUTTON = '#del-btn';
let COLPSGROUP = '#collapse-group';
let COLPSBUTTON = '#colps-btn';
let EXPNDBUTTON = '#expnd-btn';
let LISTCONTAINER = '#list-entities';
let LISTCONTAINERN = '#list-entities:not(.ui-input-clear)';
let LISTDIVIDER = '.ui-li-divider';
let NOTLISTDIVIDER = ':not(.ui-li-divider)';

/**
 * Helper functions
 */

/**
 * 
 * @returns {undefined}
 */
function error() {
    let mssg = '';
    for (let arg in arguments) {
        mssg += arguments[arg];
    }
    console.log(mssg);
    return;
}
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
        this._listString = LISTNOTDEFINED;
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
    constructor(page, source) {
        this._create = this._update = this._delete = false;
        this._top = false;
        this._detail = false; // 'list'
        this._source = source;
        this._fields = page.fields;
        this._filter = page.filter || false;
        this._target = page.target || DETAIL_PAGE;
        if (typeof page.mode === 'string') {
            this._create = (page.mode.toUpperCase().indexOf('C') !== -1);
            this._update = (page.mode.toUpperCase().indexOf('U') !== -1);
            this._delete = (page.mode.toUpperCase().indexOf('D') !== -1);
        }
        this._divider = (page.divider === 'collapsed' || page.divider === 'expanded') || false;
        if (this._divider)
            this._initialcollapsed = (page.divider === 'collapsed');
    }
    /**
     * Define this as the top-most page, called from the PageStack
     * @returns {undefined}
     */
    setTop() {
        this._top = true;
        return;
    }
    /**
     * Create a list divider
     * @returns {undefined}
     */
    createDivider() {
        if (!this._divider || this._detail) {
            $(COLPSGROUP).hide();
            return;
        }
        // show collapse/expand buttons
        $(COLPSGROUP).show();
        // create an icon and insert it into the divider
        let icon = '<span class="ui-btn-icon-notext inlineIcon"></span>';
        $(LISTDIVIDER).prepend(icon);
        // if initially collapsed (list is expanded by default)
        if (this._initialcollapsed) {
            //$('.ui-li-divider .inlineIcon').addClass('ui-icon-plus');
            $(LISTDIVIDER).find('.inlineIcon').addClass('ui-icon-plus');
            let li = $(LISTDIVIDER).next(NOTLISTDIVIDER);
            while (li.length > 0) {
                li.hide();
                li = li.next(NOTLISTDIVIDER);
            }
        } else
            $(LISTDIVIDER).find('.inlineIcon').addClass('ui-icon-minus');
        return;
    }
    /**
     * Expand/Collapse clicked divider (called from listener)
     * @param {DOM object} divider
     * @returns {undefined}
     */
    toggleDivider(divider) {
        if (!this._divider)
            return;
        let li = $(divider).next(NOTLISTDIVIDER);
        let collapsed = li.css('display') === 'none';
        while (li.length > 0) {
            li.slideToggle(300);
            li = li.next(NOTLISTDIVIDER);
        }
        let icon = $(divider).find('.inlineIcon');
        if (!collapsed) {
            icon.removeClass('ui-icon-minus').addClass('ui-icon-plus');
        } else {
            icon.removeClass('ui-icon-plus').addClass('ui-icon-minus');
        }
        return;
    }
    /**
     * Show buttons (back, add, save, delete) depending on state of page
     * @returns {undefined}
     */
    paint() {
        if (this._create && !this._detail) {
            $(ADDBUTTON).show();
        } else {
            $(ADDBUTTON).hide();
        }
        if ((this._update || this._create) && this._detail) {
            $(SAVEBUTTON).show();
        } else {
            $(SAVEBUTTON).hide();
        }
        if (this._delete && this._detail) {
            $(DELBUTTON).show();
        } else {
            $(DELBUTTON).hide();
        }
        if (!this._top) {
            $(BACKBUTTON).show();
        } else {
            $(BACKBUTTON).hide();
        }
        return;
    }
    /**
     * Callback function for AJAX GET request
     * @param {JSON object} data
     * @param {string} textStatus
     * @param {jQuery XMLHttpRequest object} jqXHR
     * @returns {undefined}
     */
    show(data, textStatus, jqXHR) {
        let html = '', item;
        if (this._detail) { // we expect 1 item (show for update or delete), or none (when creating)
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
            autodividers: this._divider && !this._detail
        }).listview('refresh').trigger('create');
        if (this._filter && !this._detail)
            $('form.ui-filterable').show();
        else
            $('form.ui-filterable').hide();
        this.createDivider();
        return;
    }
    /**
     * Get the data from the DB (or from local array)
     * @param {integer} id
     * @param {boolean} detail
     * @returns {boolean}
     */
    getREST(id, detail) {
        // GET /url
        // GET /url/id
        let callback = this.show.bind(this); // define the callback function
        this._detail = detail || false;

        if (this._detail) { // show details of record (existing or new)
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
        return true;
    }
    /**
     * Saves item to DB (create or update)
     * @param {integer} id
     * @returns {boolean}
     */
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
    /**
     * Delete item <id> from DB
     * @param {integer} id
     * @returns {boolean}
     */
    delREST(id) {
        // DELETE /url/id
        this._source.del(id).done();
        this.paint();
        return true;
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
    constructor(url, pages, fields, startpage) {
        let that = this;
        this._stack = [];
        this._pages = [];
        this._lookups = [];
        this._rest = new Api(url);
        for (let page in pages) {
            this.addPage(page, pages[page]);
            this.addLookup(pages[page].fields);
        }

        $(COLPSGROUP).hide(); // not visible by default

        // setup listeners
        $(BACKBUTTON).on('vclick', '', function () { // click back-button
            if (that._stack.length > 0)
                that._stack.pop();
            setTimeout(function () {
                // back is always to a list page, so detail === false
                that._pages[that.currentPage].getREST(that.currentId, false);
            }, REFRESH_TIMEOUT);
        });
        $(ADDBUTTON).on('vclick', '', function () { // click add-button
            that.next(DETAIL_PAGE, NO_IDENTIFIER);
        });
        $(SAVEBUTTON).on('vclick', '', function () { // click save-button
            if (that._pages[that.currentPage].putREST(that.currentId))
                $(BACKBUTTON).click();
        });
        $(DELBUTTON).on('vclick', '', function () { // click delete-button
            let answer = confirm(DEL_MESSAGE);
            if (answer) { // ok delete to delete
                that._pages[this.currentPage].delREST(that.currentId);
                $(BACKBUTTON).click();
            }
        });
        $(COLPSBUTTON).on('vclick', '', function () { // click collapse-button
            $('.ui-li-divider .ui-icon-minus').click();
        });
        $(EXPNDBUTTON).on('vclick', '', function () { // click expand-button
            $('.ui-li-divider .ui-icon-plus').click();
        });
        $(LISTCONTAINER).on('vclick', 'a:not(.ui-input-clear)', function (e) { // click in the list
            let target = $(this).data('target');
            let identity = $(this).data('identity');
            that.next(target, identity);
            e.stopPropagation();
        });
        $(LISTCONTAINER).on('input', 'input[lookup]:not(.ui-input-clear)', function (e) {
            that.checkLookup(this);
            e.stopPropagation();
        });
        $(LISTCONTAINER).on('vclick', LISTDIVIDER, function (e) { // click on a divider
            that._pages[that.currentPage].toggleDivider(this);
            e.stopPropagation();
        });

        // load the first page
        this._pages[startpage].setTop();
        this.next(startpage);
    }
    /**
     * Gets the page from the top of the stack
     * @returns {string}
     */
    get currentPage() {
        return this._stack[this._stack.length - 1]._page;
    }
    /**
     * Gets the id from the top of the stack
     * @returns {integer}
     */
    get currentId() {
        return this._stack[this._stack.length - 1]._id;
    }
    /**
     * Add a page object to the _pages array, create a rest endpoint if needed
     * @param {string} name
     * @param {object} page
     * @returns {undefined}
     */
    addPage(name, page) { // add a valid page (only those will be on the stack)
        let source = [];
        if (typeof page.source === 'string') {
            if (typeof this._rest[page.source] !== 'object') // not defined yet
                this._rest.addEndpoint(page.source);
            source = this._rest[page.source];
        } else {
            for (let i in page.source) {
                source.push({title: page.source[i].title, _target: page.source[i].target});
            }
        }
        this._pages[name] = new Page(page, source);
        return;
    }
    /**
     * Add an api object to _lookups array, loop over the fields to check
     * @param {object} fields
     * @returns {undefined}
     */
    addLookup(fields) {
        for (let field in fields) {
            if (field === 'listString') // skip this one
                continue;
            if ('attribs' in fields[field] && 'lookup' in fields[field].attribs) {
                // found an attribute that qualifies
                let lookup = fields[field].attribs['lookup'];
                if (typeof this._lookups[lookup] !== 'object') { // create rest entity
                    this._rest.addEndpoint(lookup);
                }
                this._lookups[lookup] = this._rest[lookup];
            }
        }
        return;
    }
    /**
     * 
     * @param {DOM object} input
     * @returns {undefined}
     */
    checkLookup(input) {
        let lookup = $(input).attr('lookup');
        if (lookup in this._lookups) {
            let that = this;
            $(input).autocomplete({
                delay: 100,
                minLength: 1,
                source: function (request, response) {
                    that._rest[lookup].get({term: request.term}).done(response);
                }
            });
        }
        return;
    }
    /**
     * Show the next page: push data on the stack & retrieve the data
     * @param {string} target
     * @param {integer} id
     * @returns {undefined}
     */
    next(target, id = NO_IDENTIFIER) { // load next page & show
        let detail = false;
        if (target === DETAIL_PAGE) {
            target = this.currentPage;
            detail = true;
        }
        if (target in this._pages) {
            this._stack.push({_page: target, _id: id});
            this._pages[this.currentPage].getREST(this.currentId, detail);
        } else
            error('PageStack Error: ', target, ' is not a valid page');
        // show stack
//        console.log('>> Stack:');
//        for (let i in this._stack) {
//            console.log(this._stack[i]._page, this._stack[i]._id);
//        }
        return;
    }
}

// click on back: load previous page
// 
// list pages:
// click on list-item: load page specified by item (read item): target & identifier
// (if target === 'detail' then show the details for this item (identifier)
//      options for list: filter, divider
//      expand all: expand all dividers
//      collapse all: collapse dividers
// click on add: present an empty detail page for this page-type
// 
// detail pages:
// click on delete: delete current item (identifier)
// click on save: read the details from this item and:
//      - create new item
//      - update current
//      options for the details (list of input-fields)
//      - slider
//      - select (radio-button)
//      - lookup field (present list with possible values)


