<?php
class EmployeeMapper extends Mapper {

    protected $sqlSelectAll = "SELECT * FROM employee;";
    protected $sqlSelectOne = "SELECT * FROM employee WHERE id=:id;";
    protected $sqlInsert = "INSERT INTO employee (id, first, last, age, gender, hire, loan) VALUES (:id, :first, :last, :age, :gender, :hire, :loan);";
    protected $sqlUpdate = "UPDATE employee SET first=:first, last=:last, age=:age, gender=:gender, hire=:hire, loan=:loan WHERE id=:id;";
    protected $sqlDelete = "DELETE FROM employee WHERE id=:id;";

    protected $autoincrement = false;

}
