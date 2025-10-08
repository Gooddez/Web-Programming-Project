const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

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


app.get("/add-to-cart", (req, res) => {
    const all = req.query;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    const options = []
    for (const key in all) {
        if (key !== "menu_id") {
            if (key === "4" && Array.isArray(all[key])) {
                all[key].forEach(v => {
                    options.push(JSON.parse(v))
                })
            } else {
                options.push(JSON.parse(all[key]))
            }
        }
    }
    const menu_id = all.menu_id;
    req.session.cart.push({ menu_id, options });
    console.log(req.session.cart, "added item to cart");
    res.redirect("/menus");
});


// app.get("/add-to-cart", (req, res) => {
//     console.log(req.query)

//     const id = req.query;

//     if (!req.session.cart) {
//         req.session.cart = [];
//     }
//     req.session.cart.push(id);
//     console.log(req.session.id, req.session.cart, "added item to cart")
//     res.redirect("/menus")
// });

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

app.get("/menu/:id", (req, res) => {
    const menuID = req.params.id;
    const endpoint = "http://localhost:3000/api/menus";
    fetch(endpoint)
        .then((response) => response.json())
        .then((menus) => {
            const menu = menus.filter((item) =>
                `${item.menu_id}`.startsWith(`${menuID}`)
            );
            console.log(menuID);
            console.log(menu);
            if (menu) {
                res.render("menus", { menuData: menu });
            } else {
                res.status(404).send("Menu not found");
            }
        })
        .catch((err) => console.log(err));
});


app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`Server is running at http://localhost:${port}`);
});
