/* global fields, pages */

// get /lookupdept
// get /lookupempl
// get /lookupcounty
// any /department[/{id}]
// any /employee[/{id}]
// any /country[/{id}]
// get /hire[/{dept}]
// get /loan[/{dept}]

let rest = new Api('http://company.localhost/api.php/');


/*******************************************************************/

$(document).ready(function () {

    let pgStack = new PageStack();

    console.log('>>> Fields: ', fields);
    console.log('>>> Pages: ', pages);
    console.log('>>> PageStack: ', pgStack);

    // show the 1st page
    pgStack.next('menu');

});
/*******************************************************************/

