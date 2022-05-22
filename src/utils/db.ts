import Database from "better-sqlite3"

export const db = new Database("PequodDB")

export function initDB () {
	// db.prepare("DROP TABLE member;").run()
	console.log("Creating sqlite database...")
	db.prepare("CREATE TABLE IF NOT EXISTS member (id TEXT PRIMARY KEY, quoiNb INT)").run()
	console.log("Database created !")
}
