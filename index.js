const express = require("express")
const path = require("path")
const app = express()
const port = 3000
const sqlite3 = require("sqlite3").verbose();

app.use(express.static("public"))
app.set("view engine", "ejs")

const db = new sqlite3.Database("RobuxDB.db", (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log("Database Connected");
});

app.get("/", (req, res) => {
    sql = `SELECT * FROM menu;`
    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err.message)
        }
        res.render("menus",{menuData: rows})
    })
})

app.listen(port, (err) => {
    if (err) {
        console.log(err)
    }
    console.log("Successful.")
})


