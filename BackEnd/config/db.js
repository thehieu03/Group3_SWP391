import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",           
  password: "123",           
  database: "swp_group3", 
});

export default db;
