/* global Item, Department, Employee, fields, pages */


// get("/lookupdept", function (Request $request, Response $response) {
// get("/lookupempl", function (Request $request, Response $response) {
// any("/department[/{id}]", function (Request $request, Response $response) {
// any("/employee[/{id}]", function (Request $request, Response $response) {
// get("/hire[/{dept}]", function (Request $request, Response $response) {
// get("/loan[/{dept}]", function (Request $request, Response $response) {



//console.log(fields.department);
//console.log(fields.employee);
/*
let dept = {id:5, name: 'ICT', headdept: 1, manager:null};
let empl = {id:13, first:'Paul', last:'Smith', hire:5, loan:null};

console.log('>>item dept, no value');
let dept0 = new Item2(fields.department);
console.log('>>item dept, value');
let dept1 = new Item2(fields.department,dept);
console.log('>>item empl, no value');
let empl0 = new Item2(fields.employee);
console.log('>>item empl, value');
let empl1 = new Item2(fields.employee,empl);

console.log(dept0, dept1);
console.log(empl0, empl1);
console.log(dept1._fields.id.htmlInput,dept1._fields.name.htmlInput);
*/

let rest = new Api('http://company.localhost/api.php/');
rest.addEndpoint('lookupdept');
rest.addEndpoint('lookupempl');
    
let pgStack = init();
console.log('>>> Fields: ', fields);
console.log('>>> Pages: ', pages);
console.log('>>> PageStack: ', pgStack);


/*******************************************************************/
function init() {
	let ps = new PageStack();
	for (let page in pages) {
		ps.addPage(page, pages[page]);
	}
	return ps;
}

$(document).ready(function () {

    // listeners
    $('#back-btn').on('vclick', '', function () {
        pgStack.back();
    });
    $('#add-btn').on('vclick', '', function () {
        pgStack.addItem();
    });
    $('#save-btn').on('vclick', '', function () {
//        let fields = $('#list-entities li input');
//        let data = [];
//        $.each(fields, function (k, v) {
//            data.push({label: $(v).prop('id'), value: $(v).val()});
//        });
        pgStack.updItem();
    });
    $('#del-btn').on('vclick', '', function () {
        pgStack.delItem();
    });

    $('#list-entities').on('vclick', 'a', function () {
        let target = $(this).data('target');
        let identity = $(this).data('identity');
        console.log('click: ' + $(this).parents('ul').attr('id') + ', target: ' + target + ', id:' + identity);
        pgStack.next(target, identity);
    });
    $('#list-entities').on('vclick', 'li', function (e) {
        //console.log('click divider: ' + $(this).text());
    });
    $('#list-entities').on('focus', 'input', function (e) {
        //checkAutocomplete(this, 'autoempl');
        //checkAutocomplete(this, 'autodept');
		//if ($(this).hasClass('lookupempl')) {
		if ($(this).attr('lookup') === 'lookupempl') {
			$(this).autocomplete({ 
				delay: 100,
				minLength: 1,
				source: function(request, response) {
					rest.lookupempl.get({term:request.term}).done(response);
				}
			});
		}
        //if ($(this).hasClass('lookupdept')) {
        if ($(this).attr('lookup') === 'lookupdept') {
			$(this).autocomplete({ 
				delay: 100,
				minLength: 1,
				source: function(request, response) {
					rest.lookupdept.get({term:request.term}).done(response);
				}
			});
		}
	});


    // show the 1st page
    //pgStack.forward('main');
	pgStack.next('menu');

});
/*******************************************************************/

