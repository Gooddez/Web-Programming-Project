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
    res.send('<h1><a href="/menu">MENU</a></h1>')
})

app.get("/menu", (req, res) => {
    let sql = `SELECT menu_id,menu_image,menu_name,menu_price FROM menu;`
    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err.message)
        }
        console.log(rows)
        res.render("menus",{menuData: rows})
    })
})

app.get("/menu/:id", (req, res) => {
    let sql = `SELECT menu_id, menu_image, menu_name, menu_price FROM menu
            WHERE category_id = '${req.params.id}';`
    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err.message)
        }
        console.log(rows)
        res.render("menus",{menuData: rows})
    })
})

app.get("/detail", (req, res) => {
    let id = req.query.id
    // Use LEFT JOIN so menus without options still return, and use parameter binding
    
    let sql = `SELECT m.menu_id,
                       m.menu_name,
                       m.menu_image,
                       m.menu_description,
                       mo.option_id,
                       co.option_name,
                       ov.value_name,
                       ov.extra_price
                FROM menu m
                LEFT JOIN MenuOption mo ON m.menu_id = mo.menu_id
                LEFT JOIN CustomizableOption co ON mo.option_id = co.option_id
                LEFT JOIN OptionValue ov ON co.option_id = ov.option_id
                WHERE m.menu_id = '${id}';`

    db.all(sql, (err, rows) => {
        if (err) {
            console.error('DB error on /detail:', err.message)
            return res.status(500).send('Database error')
        }
        console.log('Detail rows:', rows);
        // If no rows found, render details with empty array (template can handle it)
        res.render("details", { detailData: rows || [] })
    })
})

app.listen(port, (err) => {
    if (err) {
        console.log(err)
    }
    console.log("Successful.")
})