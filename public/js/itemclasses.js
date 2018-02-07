
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
        if (typeof obj !== 'undefined') {
            this._id = new Field("Id:", obj.id, true); // id field is readonly
            this._create = false;
            this._target = obj._target || '';
            this._descr = ('_descr' in obj) ? obj._descr : '';
        } else {
            this._id = new Field("Id:", 0, true);
            this._create = true;
            this._target = '';
            this._descr = '';
        }
    }
    get listItem() {
        return this._id.listItem(this.toString(), this._target);
    }
    toString() {
        return this._descr;
    }
}
class Department extends Item {
    constructor(obj) {
        super(obj);
        this._id.readonly = false;
        if (typeof obj !== 'undefined') {
            this._name = new Field('Name:', obj.name);
            this._headdept = new Field('HeadDept:', obj.headdept, {class:'autodept'});
            this._manager = new Field('Manager:', obj.manager, {class:'autoempl'});
        } else {
            this._name = new Field('Name:', 'Department name');
            this._headdept = new Field('HeadDept:', 'ID of head department', {class:'autodept'});
            this._manager = new Field('Manager:', 'ID of department manager', {class:'autoempl'});
        }
    }
    get fields() {
        return (this._id.inputField +
            this._name.inputField +
            this._headdept.inputField +
            this._manager.inputField);
    }
    update() {
        return {id: this._id.update,
            name: this._name.update,
            headdept: this._headdept.update,
            manager: this._manager.update
        };
    }
    toString() {
        return this._name.value;
    }
}
class Employee extends Item {
    constructor(obj) {
        super(obj);
        this._id.readonly = false;
        if (typeof obj !== 'undefined') {
            this._first = new Field('First name:', obj.first);
            this._last = new Field('Last name:', obj.last);
            this._hire = new Field('On hire:', obj.hire, {class:'autodept'});
            this._loan = new Field('On loan:', obj.loan, {class:'autodept'});
        } else {
            this._first = new Field('First name:', 'Employee given name');
            this._last = new Field('Last name:', 'Employee family name');
            this._hire = new Field('On hire:', 'ID of hire department', {class:'autodept'});
            this._loan = new Field('On loan:', 'ID of loan department', {class:'autodept'});
        }
    }
    get fields() {
        return (this._id.inputField +
            this._first.inputField +
            this._last.inputField +
            this._hire.inputField +
            this._loan.inputField);
    }
    update() {
        return {
            id: this._id.update,
            first: this._first.update,
            last: this._last.update,
            hire: this._hire.update,
            loan: this._loan.update
        };
    }
    toString() {
        return this._first.value + ' ' + this._last.value;
    }
}
