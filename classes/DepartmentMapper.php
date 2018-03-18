<?php
class DepartmentMapper extends Mapper {

    protected $sqlSelectAll = "SELECT * FROM department;";
    protected $sqlSelectOne = "SELECT * FROM department WHERE id=:id;";
    protected $sqlInsert = "INSERT INTO department (id, name, headdept, manager) VALUES (:id, :name, :headdept, :manager);";
    protected $sqlUpdate = "UPDATE department SET name=:name, headdept=:headdept, manager=:manager WHERE id=:id;";
    protected $sqlDelete = "DELETE FROM department WHERE id=:id;";

    protected $autoincrement = false;
}
