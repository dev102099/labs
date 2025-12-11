const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const postgres = require("postgres");
const dotenv = require("dotenv");
dotenv.config();
const connectionString = process.env.DATABASE_URL;
console.log("My Connection String is:", connectionString);
const sql = postgres(connectionString);

module.exports = sql;
