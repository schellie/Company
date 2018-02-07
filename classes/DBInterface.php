<?php

class DBInterface {

    protected $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getDepts() {
        $sql = "select d.id, d.name, d.headdept, d.manager from department d";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function saveDept($body) {
		$id = filter_var($body['id'], FILTER_SANITIZE_STRING);
		$name = filter_var($body['name'], FILTER_SANITIZE_STRING);
		$headdept = filter_var($body['headdept'], FILTER_SANITIZE_STRING);
 		$mgr = filter_var($body['manager'], FILTER_SANITIZE_STRING);
        $sql = "INSERT INTO department (id, name, headdept, manager) VALUES ($id, '$name', $headdept, $mgr) " .
                "ON DUPLICATE KEY UPDATE name='$name', headdept=$headdept, manager=$mgr;";
        $stmt = $this->db->query($sql);
        $lastid = $this->db->lastInsertId();
        return [0 => ["id" => "$lastid"]];
    }

    public function delDept($id) {
        $sql = "DELETE from department WHERE id=$id;";
        $stmt = $this->db->query($sql);
        return [0 => ["id" => "$id"]];
    }

    public function getDeptById($dept_id) {
        $sql = "select d.id, d.name, d.headdept, d.manager from department d where d.id = $dept_id";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function getEmpls() {
        $sql = "select e.id, e.first, e.last, e.hire, e.loan from employee e";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function saveEmpl($body) {
		$id = filter_var($body['id'], FILTER_SANITIZE_STRING);
		$first = filter_var($body['first'], FILTER_SANITIZE_STRING);
		$last = filter_var($body['last'], FILTER_SANITIZE_STRING);
		$hire = filter_var($body['hire'], FILTER_SANITIZE_STRING);
		$loan = filter_var($body['loan'], FILTER_SANITIZE_STRING);
        $sql = "INSERT INTO employee (id, first, last, hire, loan) VALUES ($id, '$first', '$last', $hire, $loan) " .
                "ON DUPLICATE KEY UPDATE first='$first', last='$last', hire=$hire, loan=$loan;";
        $stmt = $this->db->query($sql);
        $lastid = $this->db->lastInsertId();
        return [0 => ["id" => "$lastid"]];
    }

    public function delEmpl($id) {
        $sql = "DELETE from employee WHERE id=$id;";
        $stmt = $this->db->query($sql);
        return $id;
    }

    public function getEmplById($empl_id) {
        $sql = "select e.id, e.first, e.last, e.hire, e.loan from employee e where e.id = $empl_id";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function getEmplByHire($dept_id) {
        $sql = "select e.id, e.first, e.last, e.hire, e.loan from employee e where e.hire = $dept_id";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function getEmplByLoan($dept_id) {
        $sql = "select e.id, e.first, e.last, e.hire, e.loan from employee e where e.loan = $dept_id";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }
    
    public function getAutoEmpl($term) {
		$sql = "SELECT id as value, concat(first, ' ', last) as label FROM employee WHERE " .
                "first LIKE '%$term%' OR last LIKE '%$term%';";
		$stmt = $this->db->query($sql);
		return $stmt->fetchAll();
	}

	public function getAutoDept($term) {
		$sql = "SELECT id as value, name as label FROM department WHERE name LIKE '%$term%';";
		$stmt = $this->db->query($sql);
		return $stmt->fetchAll();
	}
}


