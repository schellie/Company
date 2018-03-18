<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require "../vendor/autoload.php";
require "../classes/DBsecurity.php";

function debug_to_console($data) {
    $output = $data;
    if (is_array($output)) {
        $output = implode(",", $output);
    }
    echo "<script>console.log( \"Debug Objects: \" . $output . \"\" );</script>";
}

// important in develop-mode
$config["displayErrorDetails"] = true;
$config["addContentLengthHeader"] = false;
$config["outputBuffering"] = false;

$config["db"]["host"] = $host;
$config["db"]["user"] = $user;
$config["db"]["pass"] = $pass;
$config["db"]["dbname"] = $db;
$config["logger"]["name"] = "cy_log";
$config["logger"]["file"] = "../logs/company.log";

$app = new \Slim\App(["settings" => $config]);
$container = $app->getContainer();

$container["db"] = function ($c) {
    $db = $c["settings"]["db"];
    $pdo = new PDO("mysql:host=" . $db["host"] . ";dbname=" . $db["dbname"] . ";charset=utf8mb4", $db["user"], $db["pass"]);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
};
$container["logger"] = function($c) {
    $log = $c["settings"]["logger"];
    $logger = new \Monolog\Logger($log["name"]);
    $file_handler = new \Monolog\Handler\StreamHandler($log["file"]);
    $logger->pushHandler($file_handler);
    return $logger;
};

/*
 * Lookups
 */
$app->get("/lookupdept", function (Request $request, Response $response) {
    $sql = "SELECT id as value, name as label FROM department WHERE name LIKE :term;";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(["term" => "%" . $request->getParam("term") . "%"]);
    return $response->withJson($stmt->fetchAll(\PDO::FETCH_OBJ));
});

$app->get("/lookupcountry", function (Request $request, Response $response) {
    $sql = "SELECT id as value, name as label FROM country WHERE name LIKE :term;";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(["term" => "%" . $request->getParam("term") . "%"]);
    return $response->withJson($stmt->fetchAll(\PDO::FETCH_OBJ));
});

$app->get("/lookupempl", function (Request $request, Response $response) {
    $sql = "SELECT id as value, concat(first, ' ', last) as label FROM employee WHERE "
            . "first LIKE :term1 OR last LIKE :term2;";
    $stmt = $this->db->prepare($sql);
    $term = "%" . $request->getParam("term") . "%";
    $stmt->execute(["term1" => $term, "term2" => $term]);
    return $response->withJson($stmt->fetchAll(\PDO::FETCH_OBJ));
});

/*
 * Department
 */
$app->any("/department[/{id}]", function (Request $request, Response $response) {
    $mapper = new DepartmentMapper($request);
    $sql = $mapper->getSql();
    $params = $mapper->getQueryParams();
    $body = $request->getParsedBody();

//    foreach ($body as $k => $v) {
//        $this->logger->info($k . ' => ' . $v);
//        $this->logger->info($k . ' => ' . $params[$k]);
//    }

    $stmt = $this->db->prepare($sql);
    $stmt->execute($params);

    $result = $mapper->getResult($this->db, $stmt);
    return $response->withJson($result);
});

/*
 * Employee
 */
$app->any("/employee[/{id}]", function (Request $request, Response $response) {
    $mapper = new EmployeeMapper($request);
    $sql = $mapper->getSql();
    $params = $mapper->getQueryParams();

    $stmt = $this->db->prepare($sql);
    $stmt->execute($params);

    $result = $mapper->getResult($this->db, $stmt);
    return $response->withJson($result);
});

/*
 * Country
 */
$app->any("/country[/{id}]", function (Request $request, Response $response) {
    $mapper = new CountryMapper($request);
    $sql = $mapper->getSql();
    $params = $mapper->getQueryParams();

    $stmt = $this->db->prepare($sql);
    $stmt->execute($params);

    $result = $mapper->getResult($this->db, $stmt);
    return $response->withJson($result);
});

/*
 * Employee on hire
 */
$app->get("/hire[/{dept}]", function (Request $request, Response $response) {
    $sql = "SELECT * FROM employee WHERE employee.hire = :dept";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(["dept" => $request->getAttribute("dept")]);
    return $response->withJson($stmt->fetchAll(\PDO::FETCH_OBJ));
});

/*
 * Employee on loan
 */
$app->get("/loan[/{dept}]", function (Request $request, Response $response) {
    $sql = "SELECT * FROM employee WHERE employee.loan = :dept";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(["dept" => $request->getAttribute("dept")]);
    return $response->withJson($stmt->fetchAll(\PDO::FETCH_OBJ));
});

/*
 * Run !
 */
$app->run();

