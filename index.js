const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const sqlite3 = require("sqlite3").verbose();

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

const db = new sqlite3.Database("RobuxDB.db", (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log("Database Connected");
});

app.get("/api/menus", (req, res) => {
    const sql = "SELECT * FROM menu";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err.message)
        }
        res.json(rows)
    });
});

app.post("/api/detail", (req, res) => {
    const ID = req.body.menuID;
    const sql = "SELECT * FROM menuOption JOIN OptionValue USING (option_id) WHERE menu_id = ?";
    console.log(sql)
    console.log(ID)

    db.all(sql, [ID], (err, rows) => {
        if (err) {
            console.log(err.message)
        }
        console.log(rows)
        res.json(rows)
    });
});


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/menus", (req, res) => {
    const endpoint = "http://localhost:3000/api/menus"
    fetch(endpoint)
    .then(response => response.json())
    .then(menus => {
        res.render("menus", {menuData: menus});
    })
    .catch(err => console.log(err))
});

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Successful.");
});
