const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
const { table } = require("console");
const { json } = require("stream/consumers");

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
    session({
        secret: "my-secret-key", // used to sign the session ID cookie
        resave: false, // don’t save if nothing changes
        saveUninitialized: true, // save new sessions
        cookie: { secure: false }, // set true if using HTTPS
    })
);

const db = new sqlite3.Database("RobuxDB.db", (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log("Database Connected");
});

app.get("/setup.html", (req, res) => {
    res.render("setup");
});

app.get("/api/menus", (req, res) => {
    const sql = "SELECT * FROM menu";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err.message);
        }
        res.json(rows);
    });
});

app.get("/api/waiting-order", (req, res) => {
    const sql = "SELECT * FROM waitingOrder";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err.message);
        }
        console.log(rows.length);
        console.log(rows);
        res.json(rows);
    });
});

app.post("/api/detail", (req, res) => {
    const ID = req.body.menuID;
    const sql = `SELECT * FROM menuOption
                JOIN OptionValue USING (option_id)
                JOIN CustomizableOption USING (option_id)
                WHERE menu_id = ?`;
    db.all(sql, [ID], (err, rows) => {
        if (err) {
            console.log(err.message);
        }
        res.json(rows);
    });
});

app.post("/api/get-cart", (req, res) => {
    const cart = req.session.cart || [];
    res.json(cart);
});

app.put("/api/update-status/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const status = req.body.status;
    console.log(id,status)
    const sql = `UPDATE menu
            SET status = ?
            WHERE menu_id = ?`;
    db.run(sql, [status, id], (err) => {
        if (err) {
            console.log(err.message);
            res.json({ message: "Menu updated failed!" });
        }
        console.log("here")
    });
    res.json({ message: "Menu updated successfully!" });
});

app.get("/add-to-cart", (req, res) => {
    const all = req.query;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    const options = [];
    for (const key in all) {
        if (!["menu_name", "menu_id", "totalPrice"].includes(key)) {
            if (["3", "4"].includes(key) && Array.isArray(all[key])) {
                all[key].forEach((v) => {
                    options.push(JSON.parse(v));
                });
            } else {
                options.push(JSON.parse(all[key]));
            }
        }
    }
    const menu_id = all.menu_id;
    const menu_name = all.menu_name;
    const totalPrice = all.totalPrice;
    req.session.cart.push({ menu_id, menu_name, totalPrice, options });
    res.redirect("/menus");
});

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/menus", (req, res) => {
    const endpoint = "http://localhost:3000/api/menus";
    fetch(endpoint)
        .then((response) => response.json())
        .then((menus) => {
            res.render("menus", { menuData: menus });
        })
        .catch((err) => console.log(err));
});

app.get("/payment", (req, res) => {
    res.render("payment");
});

app.get("/orders/:id", (req, res) => {
    const id = req.params.id
    let sql = `SELECT * FROM orders WHERE table_id = ${id}`

    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err)
        }
        console.log(rows)
        res.render("orders", {data : rows});
    })
})

app.get("/add-order/:table", (req, res) => {
    const cart = req.session.cart || [];
    const table = req.params.table;
    const menuData = JSON.stringify(cart);

    const sql = `INSERT INTO orders (table_id, menu) VALUES (?, ?);`;
    db.run(sql, [table, menuData], (err) => {
        if (err) {
            console.error(err.message);
            return res.redirect("/");
        }
        console.log(`Order placed for table ${table}`);
        req.session.cart = [];
        if (table === "0") {
            res.redirect("/emphome");
        } else {
            res.redirect("/");
        }
    });
});

app.get("/add-waiting-order/:table", (req, res) => {
    const cart = req.session.cart || [];
    const table = req.params.table;
    let price = 0;
    cart.forEach((item) => {
        price += parseInt(item.totalPrice);
    });
    const sql = `INSERT INTO waitingOrder (table_id, menu, price) VALUES (?, ?, ?);`;

    const menuData = JSON.stringify(cart);

    db.run(sql, [table, menuData, price], (err) => {
        if (err) {
            console.error(err.message);
            return res.redirect("/");
        }
        console.log(`Waiting Order placed for table ${table}`);
        req.session.cart = [];
        res.redirect("/");
    });
});

app.get("/emphome", (req, res) => {
    res.render("emphome");
});

app.get("/manageMenu", (req, res) => {
    const endpoint = "http://localhost:3000/api/menus";
    fetch(endpoint)
        .then((response) => response.json())
        .then((menus) => {
            res.render("menuManagement", { menuData: menus });
        })
        .catch((err) => console.log(err));
});

app.get("/confirm", (req, res) => {
    const endpoint = "http://localhost:3000/api/waiting-order";
    fetch(endpoint)
        .then((response) => response.json())
        .then((orders) => {
            res.render("confirm", { orders: orders });
        })
        .catch((err) => console.log(err));
});

app.get("/confirm/:id", (req, res) => {
    const id = req.params.id

    let add = `INSERT INTO orders (table_id, menu)
                SELECT table_id, menu
                FROM waitingOrder
                WHERE waiting_id = ?;`
    db.run(add, [id],(err) => {
        if (err) {
            console.log(err)
        }
    })

    let del = `DELETE FROM waitingOrder WHERE waiting_id = ?;`
    db.run(del, [id],(err) => {
        if (err) {
            console.log(err)
        }
    })
    res.redirect("/confirm")
});

app.get("/barista", (req, res) => {
    let sql = `SELECT * FROM orders`

    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err)
        }
        console.log(rows)
        res.render("barista", {data : rows});
    })
});

app.get("/delete/:id", (req, res) => {
    const id = req.params.id
    let del = `DELETE FROM orders WHERE orderid = ?;`
    db.run(del, [id], (err) => {
        if (err) {
            console.log(err)
        }
    })
    res.redirect("/barista")
});

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`Server is running at http://localhost:${port}`);
});
