/* global Item, NO_IDENTIFIER */

// fields = collection of table definitions
// each table specifies an number of fields
// each field has the following properties:
//	type (field type)
//	label
//	value (inserted at creation time)
//	default value
//	attributes (readonly, required, or a class pointing to autocomplete functions)
//	  {readonly:'readonly'}
//    {required:'required'}
//    {class:''}
let fields = {
	menu: {
		id: { type:'number', default:NO_IDENTIFIER},
		title: { type:'string', label:'Title:', default:''},
		listString: '$title'
	},
	department: {
		id: { type:'number', label:'Id:', default:NO_IDENTIFIER, attribs:{required:'required'} },
		name: { type:'string', label:'Name:', default:'Department name', attribs:{required:'required'} },
		headdept: { type:'number', label:'HeadDept:', default:'ID of head department', attribs:{lookup:'lookupdept'} },
		manager: { type:'number', label:'Manager:', default:'ID of department manager', attribs:{lookup:'lookupempl'} },
		listString: '$id - $name'
	},
	employee: {
		id: { type:'number', label:'Id:', default:NO_IDENTIFIER, attribs:{required:'required'} },
		first: { type:'string', label:'First name:', default:'Employee given name', attribs:{required:'required'} },
		last: { type:'string', label:'Last name:', default:'Employee family name', attribs:{required:'required'} },
        age: { type:'number', input:'slider', label:'Age:', default:'20', options: {min:10, max:75, step:1} },
        gender: { type:'string', input:'radio', label:'Gender:', default:'M', options: {M:'Male', F:'Female', NA:'Unknown'} },
		hire: { type:'number', label:'On hire:', default:'ID of hire department', attribs:{lookup:'lookupdept'} },
		loan: { type:'number', label:'On loan:', default:'ID of loan department', attribs:{lookup:'lookupdept'} },
		listString: '$id - $first $last'
	}
};

// pages is a collection of possible pages to show in the application
// they a collected & tracked in 'PageStack'
// properties are:
//	source (either api, or local info)
//	type (list, or detail)
//	target (clicking on list-item will show 'target')
//	fields (table def as specified in 'fields', must match source)
let pages = {
	menu: {
		source: [
			{title: 'Departments', target: 'deptlist'},
			{title: 'Employees', target: 'empllist'},
			{title: 'Department/Employees on hire', target: 'depthire'},
			{title: 'Department/Employees on loan', target: 'deptloan'}
		],
		type: 'list',
		target: '',
		fields: fields.menu,
		mode: ''
	},
	deptlist: {
		source: 'department',
		type: 'list',
		target: 'deptdetail',
		fields: fields.department,
		mode: 'C'
	},
	deptdetail: {
		source: 'department',
		type: 'detail',
		fields: fields.department,
		mode: 'UD'
	},
	empllist: {
		source: 'employee',
		type: 'list',
		target: 'empldetail',
		fields: fields.employee,
		mode: 'C'
	},
	empldetail: {
		source: 'employee',
		type: 'detail',
		fields: fields.employee,
		mode: 'UD'
	},
	depthire: {
		source: 'department',
		type: 'list',
		target: 'emplhire',
		fields: fields.department,
		mode: ''
	},
	emplhire: {
		source: 'hire',
		type: 'list',
		target: 'empldetail',
		fields: fields.employee,
		mode: 'C'
	},
	deptloan: {
		source: 'department',
		type: 'list',
		target: 'emplloan',
		fields: fields.department,
		mode: ''
	},
	emplloan: {
		source: 'loan',
		type: 'list',
		target: 'empldetail',
		fields: fields.employee,
		mode: 'C'
	}
};

