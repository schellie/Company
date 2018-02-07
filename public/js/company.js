/* global Item, Department, Employee */

// https://github.com/jpillora/jquery.rest

/*
 I see this very simply. I think PUT got droped by the road side some time ago by mistake when the web went asynchronous. POST appeared to be more understandable to devs GET and POST - simple (although wrongly interpreted - which having read the specs is anyone really surprised?). Didn't some browsers in early days not even support PUT as well?
 
 SO....my personal approach. I make this decision to make life for devs using Apis I create...easier.
 
 I use POST for create and update. If it has an Id - update, else create. From a dev point of view its one point to do this work. I think its cleaner.
 
 ========
 
 Let me offer an alternative simplification.
 
 GET <resource_uri> <== Simply gets you the contents of the resources or list 
 PUT <resource_uri> <data> <== Replace the contents of a fully qualified resource uri [Implies the the resource item must exist before you can PUT
 POST <resource_uri> <action> [<data>] <= perform a action on a resource or a list of resources at the resource uri. if the action is omitted it creates the resource item with the data sent in the request. 
 DELETE <resoutce_uri> and PATCH <resource_uri> stands for the meaning of the respective verb. PATCH is a whole another discussion : Reference: http://tools.ietf.org/html/...
 
 Note that all other requests do not have an action while POST has an action to be performed on the resource with the default action being CREATE or ADD
 
 Hope this eases some confusions.
 
 To make it as convention in your design it might be worth while to use POST even when the action feels like it is a GET opertion (some thing like "get_status") . Since you are performing an action consider it is a POST
 
 */
let REFRESH_TIMEOUT = 100;
let NO_IDENTIFIER = -1;

let restClient = new $.RestClient('http://company.localhost/api.php/', {stripTrailingSlash: true, stringifyData: true});
let pgStack = init();

function checkAutocomplete(input, apiClass) {
    if ($(input).hasClass(apiClass)) {
		$(input).autocomplete({ 
			delay: 100,
			minLength: 1,
			source: function(request, response) {
				restClient[apiClass].read({term:request.term}).done(response);
			}
		});
	}
}
/*******************************************************************/
function init() {

    let ps = new PageStack();
    // main page
    let mn = new Page('main', {next: 'main', itemClass: Item});
    // add items to main page (manually)
    mn.addItem('Departments', 'deptlst');
    mn.addItem('Employees', 'emplst');
    mn.addItem('Department/Employees on hire', 'depthire');
    mn.addItem('Department/Employees on loan', 'deptloan');
    ps.addPage(mn);

    // add pages which will use REST
    restClient.add('department');
    ps.addPage(new Page('deptlst', {next: 'deptlst', api: restClient.department, itemClass: Department, detail: restClient.department, mode: 'CUD'}));

    restClient.add('employee');
    ps.addPage(new Page('emplst', {next: 'emplst', api: restClient.employee, itemClass: Employee, detail: restClient.employee, mode: 'CUD'}));

    restClient.add('hire');
    restClient.department.add('hire');
    ps.addPage(new Page('depthire', {next: 'emphire', api: restClient.department, itemClass: Department}));
    ps.addPage(new Page('emphire', {next: 'emphire', api: restClient.hire, itemClass: Employee, detail: restClient.employee, mode: 'CUD'}));

    restClient.add('loan');
    ps.addPage(new Page('deptloan', {next: 'emploan', api: restClient.department, itemClass: Department}));
    ps.addPage(new Page('emploan', {next: 'emploan', api: restClient.loan, itemClass: Employee, detail: restClient.employee, mode: 'CUD'}));

    restClient.add('autoempl');
    restClient.add('autodept');
    // debug
    console.log(ps);

    return ps;
}

$(document).ready(function () {

    // listeners
    $('#back-btn').on('vclick', '', function () {
        console.log('click: back bttn');
        pgStack.back();
    });
    $('#add-btn').on('vclick', '', function () {
        console.log('click: add bttn, for ' + pgStack.next);
        pgStack.addItem();
    });
    $('#save-btn').on('vclick', '', function () {
        let fields = $('#list-entities li input');
        let data = [];
        console.log('click: save bttn');
        $.each(fields, function (k, v) {
            data.push({label: $(v).prop('id'), value: $(v).val()});
        });
        pgStack.updItem(data);
    });
    $('#del-btn').on('vclick', '', function () {
        console.log('click: delete bttn');
        pgStack.delItem();
    });

    $('#list-entities').on('vclick', 'a', function () {
        let target = $(this).data('target');
        let identity = $(this).data('identity');
        console.log('click: ' + $(this).parents('ul').attr('id') + ', target: ' + target + ', id:' + identity);
        pgStack.forward(target, identity);
    });
    $('#list-entities').on('vclick', 'li', function (e) {
        //console.log('click divider: ' + $(this).text());
    });
    $('#list-entities').on('focus', 'input', function (e) {
        //checkAutocomplete(this, 'autoempl');
        //checkAutocomplete(this, 'autodept');
		if ($(this).hasClass('autoempl')) {
			$(this).autocomplete({ 
				delay: 100,
				minLength: 1,
				source: function(request, response) {
					restClient.autoempl.read({term:request.term}).done(response);
				}
			});
		}
        if ($(this).hasClass('autodept')) {
			$(this).autocomplete({ 
				delay: 100,
				minLength: 1,
				source: function(request, response) {
					restClient.autodept.read({term:request.term}).done(response);
				}
			});
		}
	});


    // show the 1st page
    pgStack.forward('main');

});
/*******************************************************************/

