/*******************************************************************/
/* global REFRESH_TIMEOUT, NO_IDENTIFIER, restClient */

/**
 * 
 * name	name of page, must be a string value
 * options {
 *   next: name of target page
 *   api: REST client for list view
 *   detail:  REST client for detail view
 *   itemClass: class name of object handler (inherits from 'Item')
 *   mode: any of 'CUD'
 * }
 */
class Page {
    constructor(name, options) {
        if (typeof name !== 'string') {
            console.log('Page name must be a string');
            return;
        }
        this._pageName = name;
        this._target = ('next' in options) ? options.next : '';
        this._detail = false;
        this._apil = ('api' in options) ? options.api : undefined;
        this._apid = ('detail' in options) ? options.detail : undefined;
        this._class = options.itemClass;
        if ('mode' in options) {
            let str = options.mode.toUpperCase();
            this._create = (str.indexOf('C') !== -1);
            this._update = (str.indexOf('U') !== -1);
            this._delete = (str.indexOf('D') !== -1);
        } else {
            this._create = this._update = this._delete = false;
        }
        this._top = false;
        this._item;
        this._itemList = [];
    }
    get name() {
        return this._pageName;
    }
    get target() {
        return this._target;
    }
    set topPage(main) {
        this._top = main;
    }
    addItem(item, target) {
        this._itemList.push({id: 0, _descr: item, _target: target});
    }
    create() {
        // show default item on the 'next' page - check whether 'next' is not 'list'
        this.show();
    }
    read(id, detail) {
        this._detail = detail;
        let callback = this.show.bind(this);
        if (this._detail) { // show details of record (existing or new)
            if (id === -1) {
                this.create();
            } else {
                // read just one (identied by id) record
                this._apid.read(id).done(callback); // provide variable id's ....
            }
        } else { // show all records
            if (this._itemList.length === 0) { // no list, get the data from db
                if (id === 0)
                    this._apil.read().done(callback);
                else
                    this._apil.read(id).done(callback);
            } else {
                this.show(this._itemList);
            }
        }
        this.paint();
    }
    update(id, data) {
        // read values from current page (must not be 'list')
        // create or update and show previous page ('back')
        let record = this._item.update();
        this._apil.create(id, record); //id === -1 ??
    }
    del(id) {
        this._apil.destroy(id);
        // 'delete' current item, identified by id, current page must not be 'list'
        // show previous page ('back')
    }
    paint() {
        if (this._create && !this._detail)
            $('#add-btn').show();
        else
            $('#add-btn').hide();
        if ((this._update || this._create) && this._detail)
            $('#save-btn').show();
        else
            $('#save-btn').hide();
        if (this._delete && this._detail)
            $('#del-btn').show();
        else
            $('#del-btn').hide();
        if (!this._top)
            $('#back-btn').show();
        else
            $('#back-btn').hide();
    }
    show(obj) {
        let html = '', item;
        let target = this._target;
        let currClass = this._class;
        if (this._detail) { // we expect 1 item (show for update or delete), or none (when creating)
            item = (typeof obj !== 'undefined') ? new currClass(obj[0]) : new currClass();
            this._item = item; // save item
            html = item.fields;
        } else { // we expect 1 or more object (or none if the list is empty)
            $.each(obj, function (k, v) {
                if (!('_target' in v))
                    v._target = target;
                item = new currClass(v);
                html += item.listItem;
            });
        }
        $('#list-entities').html(html).listview('refresh').trigger('create');
    }
    toString() {
        return '(page class)';
    }
}


/**
 * PageStack
 * Keep track of defined pages and the order in which they are loaded
 * 
 * _stack: names & ids of pages (index in _pages):  {_page, _id}
 * _pages: map of valid pages, links to Page objects
 */
class PageStack {
    constructor() {
        this._stack = [];
        this._pages = [];
    }
    addPage(page) { // add a valid page (only those will be on the stack)
        this._pages[page.name] = page;
    }
    get currentPage() {
        return this._stack[this._stack.length - 1]._page;
    }
    get previousPage() {
        return this._stack[this._stack.length - 2]._page;
    }
    get currentId() {
        return this._stack[this._stack.length - 1]._id;
    }
    forward(target, id) {
        console.log('forward: target=' + target + ' id=' + id);
        let showDetail = false;
        if (target in this._pages) {
            this._stack.push({_page: target, _id: id});
            if (this._stack.length === 1) { // 1st page
                this._pages[target].topPage = true;
            } else {
                if (this.currentPage === this.previousPage)
                    showDetail = true;
            }
            this.showPage(showDetail);
        } else {
            console.log('PageStack Error: ' + target + ' is not a valid page');
        }
    }
    back() {
        this._stack.pop();
        let that = this;
        setTimeout(function () {
            that.showPage(false); // back is never a detail page
        }
        , REFRESH_TIMEOUT);
    }
    addItem() { // show empty (default) page for current object
        this._stack.push({_page: this.currentPage, _id: NO_IDENTIFIER});
        this.showPage(true); // show detail
    }
    updItem(data) { // update or create new object
        // launched from detail page, so current stack holds all info
        let id = this.currentId;
        //update
        this._pages[this.currentPage].update(this.currentId, data);
        this.back();
    }
    delItem() { // delete current object
        // launched from detail page, so current stack holds all info
        //let id = this.currentId;
        let answer = confirm("Are you sure you want to delete?");
        if (answer) {
            //delete
            this._pages[this.currentPage].del(this.currentId);
            this.back();
        }
    }
    showPage(detail) {
        this._pages[this.currentPage].read(this.currentId, detail);
    }
}
