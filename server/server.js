<<<<<<< HEAD
/* Importera npm-paket sqlite3 med hjälp av require() och lagrar i variabeln sqlite */
const sqlite = require("sqlite3").verbose();
/* Skapar ny koppling till databas-fil som skapades tidigare. */
const db = new sqlite.Database("./gik339.db");

/* Importerar npm-paket express och lagrar i variabeln express */
const express = require("express");
/* Skapar server med hjälp av express */
=======
/* Importera moduler och instanser */
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./gik339.db");
const express = require("express");
>>>>>>> 718cb3d3c2692148a166c72b575d272bef726e19
const server = express();

/* Sätter konfiguration på servern */
server
  /* Data ska kommuniceras i JSON-format */
  .use(express.json())
  /* Sättet som data ska kodas och avkodas på */
  .use(express.urlencoded({ extended: false }))
  .use((req, res, next) => {
    /* Headers för alla förfrågningar. Hanterar regler för CORS (vilka klienter som får anropa vår server och hur.) */
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    /* Säger åt servern att fortsätta processa förfrågan */
    next();
  });

/* Startar servern på port 3000 */
server.listen(3000, () => {
  /* Meddelande för feedback att servern körs */
  console.log("Server running on http://localhost:3000");
});

/* Hämta alla kategorier */
server.get("/categories", (req, res) => {
  const sql = "SELECT * FROM categories";
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(rows);
    }
  });
});

//Hämta en specifik kategori
server.get("/categories/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM categories WHERE categoryId = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(row);
    }
  });
});

/* Hämta antalet produkter för en kategori */
server.get("/categories/:id/count", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT COUNT(*) as productCount FROM products WHERE categoryId = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).send("Fel vid hämtning av produktantal: " + err.message);
    } else {
      res.send(row);
    }
  });
});

/* Lägg till en ny kategori */
server.post("/categories", (req, res) => {
  const { categoryName, color } = req.body;
  const sql = "INSERT INTO categories (categoryName, color) VALUES (?, ?)";
  db.run(sql, [categoryName, color], function (err) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send({ id: this.lastID, categoryName, color });
    }
  });
});

/* Ta bort en kategori och dess relaterade produkter */
server.delete("/categories/:id", (req, res) => {
  const { id } = req.params;

  const deleteProductsSQL = `DELETE FROM products WHERE categoryId = ?`;
  const deleteCategorySQL = `DELETE FROM categories WHERE categoryId = ?`;

  db.serialize(() => {
    db.run(deleteProductsSQL, [id], function (err) {
<<<<<<< HEAD
      if (err) return res.status(500).send("Fel vid borttagning av produkter: " + err.message);

      db.run(deleteCategorySQL, [id], function (err) {
        if (err) return res.status(500).send("Fel vid borttagning av kategori: " + err.message);
=======
      if (err)
        return res
          .status(500)
          .send("Fel vid borttagning av produkter: " + err.message);

      db.run(deleteCategorySQL, [id], function (err) {
        if (err)
          return res
            .status(500)
            .send("Fel vid borttagning av kategori: " + err.message);
>>>>>>> 718cb3d3c2692148a166c72b575d272bef726e19
        res.send("Kategorin och dess produkter har tagits bort.");
      });
    });
  });
});

/* Uppdatera en kategori */
server.put("/categories/:id", (req, res) => {
  const { id } = req.params;
  const { categoryName, color } = req.body;
  const sql = `UPDATE categories SET categoryName = ?, color = ? WHERE categoryId = ?`;

  db.run(sql, [categoryName, color, id], function (err) {
<<<<<<< HEAD
    if (err) return res.status(500).send("Fel vid uppdatering av kategori: " + err.message);
=======
    if (err)
      return res
        .status(500)
        .send("Fel vid uppdatering av kategori: " + err.message);
>>>>>>> 718cb3d3c2692148a166c72b575d272bef726e19
    res.send("Kategorin har uppdaterats.");
  });
});

/* Hämta alla produkter */
server.get("/products", (req, res) => {
  const sql = `
    SELECT products.productId, products.productName, products.price, categories.categoryName, categories.color, categories.categoryId
    FROM products
    INNER JOIN categories ON products.categoryId = categories.categoryId
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(rows);
    }
  });
});

/* Hämta produkter baserat på kategori */
server.get("/products/category/:categoryId", (req, res) => {
  const { categoryId } = req.params;
  const sql = `
    SELECT products.productId, products.productName, products.price
    FROM products
    WHERE products.categoryId = ?
  `;
  db.all(sql, [categoryId], (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(rows);
    }
  });
});

// Hämta specifik produkt
server.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM products WHERE productId = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(row);
    }
  });
});

/* Lägg till en ny produkt */
server.post("/products", (req, res) => {
  const { productName, price, categoryId } = req.body;
  const sql = `INSERT INTO products (productName, price, categoryId) VALUES (?, ?, ?)`;
  db.run(sql, [productName, price, categoryId], function (err) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send({ id: this.lastID, productName, price, categoryId });
    }
  });
});

/* Uppdatera en produkt */
server.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { productName, price, categoryId } = req.body;
  // console.log(`PUT request received for product ID: ${id}`);
  // console.log("Request body:", req.body);

  const sql = `UPDATE products SET productName = ?, price = ?, categoryId = ? WHERE productId = ?`;
  // console.log("Executing SQL query:", sql);
  // console.log("Query parameters:", [productName, price, categoryId, id]);

  db.run(sql, [productName, price, categoryId, id], (err) => {
    if (err) {
      console.error("SQL Error:", err.message); // Logga SQL-fel
      res.status(500).send(err);
    } else {
      res.send("Produkten uppdaterades");
    }
  });
});

/* Ta bort en produkt */
server.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM products WHERE productId = ?`;

  db.run(sql, [id], (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send("Produkten togs bort");
    }
  });
});
