<?php

// further: https://www.simplifiedcoding.net/php-restful-api-framework-slim-tutorial-1/
// CanJS (?)

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';

function debug_to_console($data) {
    $output = $data;
    if (is_array($output)) {
        $output = implode(',', $output);
    }

    echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
}

// important in develop-mode
$config['displayErrorDetails'] = true;
$config['addContentLengthHeader'] = false;
$config['outputBuffering'] = false;

$config['db']['host'] = "localhost";
$config['db']['user'] = "root";
$config['db']['pass'] = "";
$config['db']['dbname'] = "company";

$app = new \Slim\App(["settings" => $config]);
$container = $app->getContainer();

$container['db'] = function ($c) {
    $db = $c['settings']['db'];
    $pdo = new PDO("mysql:host=" . $db['host'] . ";dbname=" . $db['dbname'] . ";charset=utf8", $db['user'], $db['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
};

$app->get('/hello/{name}/', function (Request $request, Response $response) {
    //debug_to_console ("hello");
    $name = $request->getAttribute('name');
    $narr = str_split($name);
    for ($i = 0; $i < 10; $i++) {
        shuffle($narr);
        $array[] = array('id' => $i, 'hello' => implode('', $narr));
    }
    return $response->withJson($array);
});

$app->get('/echo/{name}/', function (Request $request, Response $response) {
    $name = $request->getAttribute('name');
    $narr = str_split($name);
    for ($i = 0; $i < 20; $i++) {
        shuffle($narr);
        $array[] = array('id' => $i, 'echo' => implode('', $narr));
    }
    return $response->withJson($array);
});

$app->post('/ticket/new', function (Request $request, Response $response) {
    $data = $request->getParsedBody();
    $ticket_data = [];
    $ticket_data['title'] = filter_var($data['title'], FILTER_SANITIZE_STRING);
    $ticket_data['description'] = filter_var($data['description'], FILTER_SANITIZE_STRING);
    // ...
    return $response;
});


// It is possible to get all the query parameters from a request by doing $request->getQueryParams() 
// which will return an associative array. So for the URL /tickets?sort=date&order=desc we�d get an associative array like:
// ["sort" => "date", "order" => "desc"]


$app->any('/department[/{id}]', function (Request $request, Response $response) {
    $mapper = new DBInterface($this->db);
    $id = $request->getAttribute('id');
    if ($request->isGet()) {
        if (is_null($id)) {
            $depts = $mapper->getDepts();
        } else {
            $depts = $mapper->getDeptById($id);
        }
    }
    if ($request->isPut() || $request->isPost()) {
        $depts = $mapper->saveDept($request->getParsedBody());
    }
    if ($request->isDelete()) {
        $depts = $mapper->delDept($id);
    }
    return $response->withJson($depts);
});

$app->any('/employee[/{id}]', function (Request $request, Response $response) {
    $mapper = new DBInterface($this->db);
    $id = $request->getAttribute('id');
    if ($request->isGet()) {
        if (is_null($id)) {
            $empls = $mapper->getEmpls();
        } else {
            $empls = $mapper->getEmplById($id);
        }
    }
    if ($request->isPut() || $request->isPost()) {
        $empls = $mapper->saveEmpl($request->getParsedBody());
    }
    if ($request->isDelete()) {
        $empls = $mapper->delEmpl($id);
    }
    return $response->withJson($empls);
});

$app->get('/department/{did}/hire[/{eid}]', function (Request $request, Response $response) {
    $mapper = new DBInterface($this->db);
    $did = $request->getAttribute('did');
    $eid = $request->getAttribute('eid');
    if (is_null($eid)) {
        $empls = $mapper->getEmplByHire($did);
    } else {
        $empls = $mapper->getEmplById($eid);
    }
    return $response->withJson($empls);
});

$app->get('/hire[/{id}]', function (Request $request, Response $response) {
    $mapper = new DBInterface($this->db);
    $id = $request->getAttribute('id');
    $empls = $mapper->getEmplByHire($id);
    return $response->withJson($empls);
});

$app->get('/loan[/{id}]', function (Request $request, Response $response) {
    $mapper = new DBInterface($this->db);
    $id = $request->getAttribute('id');
    $empls = $mapper->getEmplByLoan($id);
    return $response->withJson($empls);
});

$app->get('/autoempl', function (Request $request, Response $response) {
    $mapper = new DBInterface($this->db);
    $term = $request->getParam('term');
    $values = $mapper->getAutoEmpl($term);
    return $response->withJson($values);
});

$app->get('/autodept', function (Request $request, Response $response) {
    $mapper = new DBInterface($this->db);
    $term = $request->getParam('term');
    $values = $mapper->getAutoDept($term);
    return $response->withJson($values);
});    

$app->run();

