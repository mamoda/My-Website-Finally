const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./arabic_teacher.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
});

console.log('Students:');
db.all('SELECT id, name, email, status, enrollment_date FROM students ORDER BY id', (err, rows) => {
  if (err) {
    console.error('Query error:', err.message);
    db.close();
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('  (no students found)');
  } else {
    rows.forEach(r => console.log(`  id=${r.id} name=${r.name} email=${r.email} status=${r.status} enrollment_date=${r.enrollment_date}`));
  }

  db.close();
});
