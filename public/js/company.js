/* global fields, pages, NO_IDENTIFIER */

// get /lookupdept
// get /lookupempl
// get /lookupcounty
// any /department[/{id}]
// any /employee[/{id}]
// any /country[/{id}]
// get /hire[/{dept}]
// get /loan[/{dept}]



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
        id: {type: 'number', default: NO_IDENTIFIER},
        title: {type: 'string', label: 'Title:', default: ''},
        listString: '$title'
    },
    department: {
        id: {type: 'number', label: 'Id:', default: NO_IDENTIFIER, attribs: {required: 'required'}},
        name: {type: 'string', label: 'Name:', default: 'Department name', attribs: {required: 'required'}},
        headdept: {type: 'number', label: 'HeadDept:', default: 'ID of head department', attribs: {lookup: 'lookupdept'}},
        manager: {type: 'number', label: 'Manager:', default: 'ID of department manager', attribs: {lookup: 'lookupempl'}},
        listString: '$id - $name'
    },
    employee: {
        id: {type: 'number', label: 'Id:', default: NO_IDENTIFIER, attribs: {required: 'required'}},
        first: {type: 'string', label: 'First name:', default: 'Employee given name', attribs: {required: 'required'}},
        last: {type: 'string', label: 'Last name:', default: 'Employee family name', attribs: {required: 'required'}},
        age: {type: 'number', input: 'slider', label: 'Age:', default: '20', options: {min: 10, max: 75, step: 1}},
        gender: {type: 'string', input: 'radio', label: 'Gender:', default: 'M', options: {M: 'Male', F: 'Female', NA: 'Unknown'}},
        nationality: {type: 'string', label: 'Nationality:', attribs: {lookup: 'lookupcountry'}},
        hire: {type: 'number', label: 'On hire:', default: 'ID of hire department', attribs: {lookup: 'lookupdept'}},
        loan: {type: 'number', label: 'On loan:', default: 'ID of loan department', attribs: {lookup: 'lookupdept'}},
        listString: '$id - $first $last'
    },
    country: {
        id: {type: 'string', label: 'Id:', default: '', attribs: {required: 'required'}},
        name: {type: 'string', label: 'Name:', default: '', attribs: {required: 'required'}},
        listString: '$name ($id)'
    }
};

// pages is a collection of possible pages to show in the application
// they a collected & tracked in 'PageStack'
// properties are:
//	source (either api, or local info)
//	type (list, or detail)
//	divider (collapsed, expanded)
//	target (clicking on list-item will show 'target')
//	fields (table def as specified in 'fields', must match source)
let pages = {
    menu: {
        source: [
            {title: 'Departments', target: 'deptlist'},
            {title: 'Employees', target: 'empllist'},
            {title: 'Country', target: 'countrylist'},
            {title: 'Department/Employees on hire', target: 'depthire'},
            {title: 'Department/Employees on loan', target: 'deptloan'}
        ],
        target: '',
        fields: fields.menu,
        mode: ''
    },
    deptlist: {
        source: 'department',
        filter: true,
        fields: fields.department,
        mode: 'CUD'
    },
    empllist: {
        source: 'employee',
        fields: fields.employee,
        mode: 'CUD'
    },
    depthire: {
        source: 'department',
        target: 'emplhire',
        fields: fields.department,
        mode: ''
    },
    emplhire: {
        source: 'hire',
        fields: fields.employee,
        mode: ''
    },
    deptloan: {
        source: 'department',
        target: 'emplloan',
        fields: fields.department,
        mode: ''
    },
    emplloan: {
        source: 'loan',
        fields: fields.employee,
        mode: ''
    },
    countrylist: {
        source: 'country',
        divider: 'collapsed', // collapsed, expanded
        fields: fields.country,
        mode: ''
    }
};


/*******************************************************************/

$(document).ready(function () {

    console.log('>>> Fields: ', fields);
    console.log('>>> Pages: ', pages);

    let pgStack = new PageStack(
        'http://company.localhost/api.php/',
        pages,
        fields,
        'menu'
    );

    console.log('>>> PageStack: ', pgStack);

});
/*******************************************************************/

