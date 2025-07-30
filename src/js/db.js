// db.js
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db;

export const CategoryEnum = Object.freeze({
  VIANDE: 1,
  POISSON: 2,
  LEGUMES: 3,
  PLAT: 4,
  AUTRE: 5
});

export function getIdCategByType(type){
  const normalizedType = type.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
  const key = CategoryEnum[normalizedType];

  if(key === undefined){
      alert("Erreur ! Cette catégorie n'existe pas en base...");
      throw new Error("Catégorie inconnue au bataillon ...");
  }

  return key;
}

export async function initDB() {
  const dbName = 'inventory9.db';
  const dbConn = await sqlite.createConnection(dbName, false, 'no-encryption', 1);
  await dbConn.open();

  // Créer la table categories si elle n'existe pas
  await dbConn.execute(`
    CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
    );
    `);

  // Créer la table products si elle n'existe pas
  await dbConn.execute(`
    CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    qr_code TEXT,
    quantity INTEGER DEFAULT 0,
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    `);

  // Vérifie si la table categories existe
  const result = await dbConn.query('SELECT name FROM sqlite_master WHERE type="table" AND name="categories"');
  const tableExists = result.values.length > 0;

  // Vérifie si la table est vide pour déterminer si c'est une première initialisation
  const countResult = await dbConn.query('SELECT COUNT(*) AS count FROM categories');
  const isFirstInit = countResult.values[0].count === 0;

  db = dbConn;

  if(isFirstInit){
    await addCategory("Viande");
    await addCategory("Poisson");
    await addCategory("Légumes");
    await addCategory("Plat");
    await addCategory("Autre");
  }
}

export async function productExistsByQRCode(qrCode) {
  const result = await db.query(
    'SELECT COUNT(*) AS count FROM products WHERE qr_code = ?',
    [qrCode]
  );

  return result.values[0].count > 0;
}


async function addCategory(name) {
  // Ajout d'une catégorie
  await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
}

export async function addProduct(name, qrCode, quantity, categoryId) {
  await db.run(
    'INSERT INTO products (name, qr_code, quantity, category_id) VALUES (?, ?, ?, ?)',
    [name, qrCode, quantity, categoryId]
    );
}

export async function getAllProducts() {
  const res = await db.query(`
    SELECT p.id, p.name, p.qr_code, p.quantity, c.name as category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.quantity > 0
    `);
  return res.values;
}

export async function addQuantityByQrCode(qrCode) {
  try {
    const result = await db.execute("UPDATE products SET quantity = quantity + 1 WHERE qr_code = '"+qrCode+"'");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la quantité :", error);
  }
}

export async function removeQuantityByQrCode(qrCode) {
  try {
    const result = await db.execute("UPDATE products SET quantity = quantity - 1 WHERE qr_code = '"+qrCode+"' AND quantity > 0");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la quantité :", error);
  }
}

export async function checkTitleExists(title) {
  console.log("hehoooo c'est la popo");

  try{
    const query = "SELECT COUNT(*) AS count FROM products WHERE name = ?";
    const res = await db.query(query, [title]);

    console.log(res);

console.log(res.values[0].count > 0);

    return res.values[0].count > 0;
  }catch(error){
    console.error("Erreur lors de la vérification de l'existance du nom du produit :", error);
  }
  return true;
}
