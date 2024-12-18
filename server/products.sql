DROP TABLE IF EXISTS categories;
CREATE TABLE IF NOT EXISTS categories (
    categoryId INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryName TEXT NOT NULL,
    color TEXT NOT NULL
);

DROP TABLE IF EXISTS products;
CREATE TABLE IF NOT EXISTS products (
    productId INTEGER PRIMARY KEY AUTOINCREMENT,
    productName TEXT NOT NULL,
    price REAL NOT NULL,
    categoryId INTEGER NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(categoryId)
);