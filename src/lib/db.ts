import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "nextstore.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Member',
      profileImage TEXT NOT NULL DEFAULT '',
      balance REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS topup_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      reference TEXT NOT NULL,
      rawAmount REAL NOT NULL,
      fee REAL NOT NULL DEFAULT 0,
      finalAmount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'success',
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS topup_used_refs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS topup_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      maxUses INTEGER NOT NULL DEFAULT 1,
      usedCount INTEGER NOT NULL DEFAULT 0,
      expiresAt TEXT,
      maxUsesPerUser INTEGER NOT NULL DEFAULT 1,
      status INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS topup_code_uses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codeId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      usedAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (codeId) REFERENCES topup_codes(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      siteName TEXT NOT NULL DEFAULT 'NextStore',
      siteLogo TEXT NOT NULL DEFAULT '',
      textColor TEXT NOT NULL DEFAULT '',
      isOnline INTEGER NOT NULL DEFAULT 1,
      accessCode TEXT NOT NULL DEFAULT '',
      promptpayPhone TEXT NOT NULL DEFAULT '',
      promptpayFeeType TEXT NOT NULL DEFAULT 'percent',
      promptpayFeeValue REAL NOT NULL DEFAULT 0,
      promptpayFeeEnabled INTEGER NOT NULL DEFAULT 0,
      promptpayEnabled INTEGER NOT NULL DEFAULT 0,
      discordClientId TEXT NOT NULL DEFAULT '',
      discordClientSecret TEXT NOT NULL DEFAULT '',
      discordLoginEnabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS carousel_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageUrl TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS contact_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      senderId INTEGER NOT NULL,
      senderRole TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (sessionId) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    INSERT OR IGNORE INTO site_settings (id, siteName, siteLogo, textColor, isOnline, accessCode)
    VALUES (1, 'NextStore', '', '', 1, '');

    INSERT OR IGNORE INTO users (username, email, password, role, profileImage)
    VALUES ('administor', 'administor@nextstore.com', 'administor', 'Administor', '');

    INSERT OR IGNORE INTO users (username, email, password, role, profileImage)
    VALUES ('thanathip', 'thanathip@nextstore.com', 'thanathip', 'Founder & CEO, Lead Developer', '');
  `);

  // Migrate existing DB: add new columns if missing
  const cols = (db.prepare("PRAGMA table_info(site_settings)").all() as any[]).map((c) => c.name);
  const newCols: [string, string][] = [
    ["promptpayPhone", "TEXT NOT NULL DEFAULT ''"],
    ["promptpayFeeType", "TEXT NOT NULL DEFAULT 'percent'"],
    ["promptpayFeeValue", "REAL NOT NULL DEFAULT 0"],
    ["promptpayFeeEnabled", "INTEGER NOT NULL DEFAULT 0"],
    ["promptpayEnabled", "INTEGER NOT NULL DEFAULT 0"],
    ["discordClientId", "TEXT NOT NULL DEFAULT ''"],
    ["discordClientSecret", "TEXT NOT NULL DEFAULT ''"],
    ["discordLoginEnabled", "INTEGER NOT NULL DEFAULT 0"],
    ["bankRecipientName", "TEXT NOT NULL DEFAULT ''"],
    ["bankType", "TEXT NOT NULL DEFAULT ''"],
    ["bankAccountNumber", "TEXT NOT NULL DEFAULT ''"],
    ["bankFeeType", "TEXT NOT NULL DEFAULT 'percent'"],
    ["bankFeeValue", "REAL NOT NULL DEFAULT 0"],
    ["bankFeeEnabled", "INTEGER NOT NULL DEFAULT 0"],
    ["bankEnabled", "INTEGER NOT NULL DEFAULT 0"],
    ["ghostxApiKey", "TEXT NOT NULL DEFAULT ''"],
    ["primaryColor", "TEXT NOT NULL DEFAULT ''"],
    ["buttonColor", "TEXT NOT NULL DEFAULT ''"],
  ];
  for (const [col, def] of newCols) {
    if (!cols.includes(col)) {
      db.exec(`ALTER TABLE site_settings ADD COLUMN ${col} ${def}`);
    }
  }

  // Migrate users: add balance column if missing
  const userCols = (db.prepare("PRAGMA table_info(users)").all() as any[]).map((c) => c.name);
  if (!userCols.includes("balance")) {
    db.exec(`ALTER TABLE users ADD COLUMN balance REAL NOT NULL DEFAULT 0`);
  }
}
