
/* global NO_IDENTIFIER */

/**
 * obj supplied by 'Page':
 *   id	identifier of the record
 *   field1	additional field
 *   field2	additional field
 *   field3	additional field
 *
 * to build the list-item a target is needed - the page to visit when clicked
 *   target	page to visit - supplied by 'Page'
 *
 * to create the listItem we need:
 *   id (identifier)
 *   label (fixed in the item object & inherited classes)
 *   target (will be injected in the object)
 *
 * to create the detail (input) fields we need:
 *   field-label (fixed in the item object & inherited classes)
 *   field-value
 *   no target, as we can't continue (delete will go back, save will update (new or current) and go back)
 *
 *   for 'id' all is supplied by the 'Item' class
 *   other fields are defined in inherited classes
 *
 *
 *
 * line: <li><a href="#" data-identity="VALUE" + data-target="TARGET">LABEL</a></li>
 *
 * input: 
 * <li class="ui-field-contain ui-btn">
 *   <label for="LABEL+MEMBER">LABEL</label>
 *   <input type="text" data-mini="true" id="LABEL+MEMBER" value="VALUE" readonly="readonly">
 * </li>
 *
 */
class Item {
    constructor(obj) {
        // object, member, label, default, attributes
        this.id = new Field(obj, 'id', "Id:", NO_IDENTIFIER, {}, true); // id field is readonly
        if (typeof obj !== 'undefined') {
            this._create = false;
            this._target = obj._target || '';
            this._descr = ('_descr' in obj) ? obj._descr : '';
        } else {
            this._create = true;
            this._target = '';
            this._descr = '';
        }
    }
    get listItem() {
        return this.id.listItem(this.toString(), this._target);
    }
    toString() {
        return this._descr;
    }
}
class Department extends Item {
    constructor(obj) {
        super(obj);
        this.id.readonly = false;
        // object, member, label, default, attributes
        this.name = new Field(obj, 'name', 'Name:', 'Department name');
        this.headdept = new Field(obj, 'headdept', 'HeadDept:', 'ID of head department', {class: 'autodept'});
        this.manager = new Field(obj, 'manager', 'Manager:', 'ID of department manager', {class: 'autoempl'});
    }
    get fields() {
        return (this.id.inputField +
            this.name.inputField +
            this.headdept.inputField +
            this.manager.inputField);
    }
    update() {
        return {id: this.id.update,
            name: this.name.update,
            headdept: this.headdept.update,
            manager: this.manager.update
        };
    }
    toString() {
        return this.name.value;
    }
}
class Employee extends Item {
    constructor(obj) {
        super(obj);
        this.id.readonly = false;
        // object, member, label, default, attributes
        this.first = new Field(obj, 'first', 'First name:', 'Employee given name');
        this.last = new Field(obj, 'last', 'Last name:', 'Employee family name');
        this.hire = new Field(obj, 'hire', 'On hire:', 'ID of hire department', {class: 'autodept'});
        this.loan = new Field(obj, 'loan', 'On loan:', 'ID of loan department', {class: 'autodept'});
    }
    get fields() {
        return (this.id.inputField +
            this.first.inputField +
            this.last.inputField +
            this.hire.inputField +
            this.loan.inputField);
    }
    update() {
        return {
            id: this.id.update,
            first: this.first.update,
            last: this.last.update,
            hire: this.hire.update,
            loan: this.loan.update
        };
    }
    toString() {
        return this.first.value + ' ' + this.last.value;
    }
}
