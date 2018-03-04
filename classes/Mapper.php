<?php

abstract class Mapper {

    protected $sqlSelectAll = "SELECT * FROM <table>;";
    protected $sqlSelectOne = "SELECT * FROM <table> WHERE id=:id;";
    protected $sqlInsert = "INSERT INTO <table> (name) VALUES (:name);";
    protected $sqlUpdate = "UPDATE <table> SET name=:name WHERE id=:id;";
    protected $sqlDelete = "DELETE FROM <table> WHERE id=:id;";

    protected $id;
    protected $autoincrement = true;
    protected $method;
    protected $body;

    public function __construct($request) {
        $this->id = $request->getAttribute("id");
        $this->method = $request->getMethod();
        $body  = $request->getParsedBody();
        if ($this->autoincrement) {
            unset($body["id"]);
        }
        foreach ($body as $k => $v) {
            if ($v == null) {
                $this->body[$k] = null;
                continue;
            }
            if (is_string($v)) {
                $this->body[$k] = filter_var($v, FILTER_SANITIZE_STRING);
            }
            if (is_integer($v)) {
                $this->body[$k] = filter_var($v, FILTER_SANITIZE_NUMBER_INT);
            }
        }
    }

    public function getSQL() {
        $hasId = !is_null($this->id);
        switch ($this->method) {
            case "GET":
                return $hasId ? $this->sqlSelectOne : $this->sqlSelectAll;
            case "DELETE":
                return $hasId ? $this->sqlDelete : "";
            case "POST": 
            case "PUT":
                return $hasId ? $this->sqlUpdate : $this->sqlInsert;
            default:
                return "";
        }
    }
    
    public function getQueryParams() {
        $hasId = !is_null($this->id);
        switch ($this->method) {
            case "GET":
                return $hasId ? ["id" => $this->id] : [];
            case "DELETE":
                return $hasId ? ["id" => $this->id] : [];
            case "POST": 
            case "PUT":
                if ($hasId) {
                    $this->body["id"] = $this->id;
                }
                return $this->body;
            default:
                return [];
        }
    }
    
    public function getResult($db, $stmt) {
        if ($this->method === "GET") {
            return $stmt->fetchAll(\PDO::FETCH_OBJ);
        } else {
            if ($this->method !== DELETE && is_null($this->id)) { // insert
                $this->id = $db->lastInsertId();
            }
            return [0 => ["id" => $this->id]];
        }
    }
}
