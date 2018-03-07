<?php
class CountryMapper extends Mapper {

    protected $sqlSelectAll = "SELECT * FROM country ORDER BY name;";
    protected $sqlSelectOne = "SELECT * FROM country WHERE id=:id;";
    protected $sqlInsert = "INSERT INTO country (id, name) VALUES (:id, :name);";
    protected $sqlUpdate = "UPDATE country SET name=:name WHERE id=:id;";
    protected $sqlDelete = "DELETE FROM country WHERE id=:id;";

    protected $autoincrement = false;

}
