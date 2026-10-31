const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('خطا در اتصال به دیتابیس:', err.message);
  } else {
    console.log('با موفقیت به دیتابیس SQLite متصل شد.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      coefficient REAL NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      gpa REAL NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS student_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      subject_id INTEGER,
      score REAL NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    )`);

    db.get("SELECT COUNT(*) as count FROM subjects", (err, row) => {
      if (row && row.count === 0) {
        const defaultSubjects = [
          ['کودک', 1],
          ['داخلی', 1],
          ['روان', 1],
          ['مادر', 1],
          ['بهداشت', 1],
          ['زبان', 1]
        ];
        const stmt = db.prepare("INSERT INTO subjects (name, coefficient) VALUES (?, ?)");
        defaultSubjects.forEach(sub => stmt.run(sub));
        stmt.finalize();
        console.log('دروس پیش‌فرض به دیتابیس اضافه شدند.');
      }
    });
  });
}

module.exports = db;