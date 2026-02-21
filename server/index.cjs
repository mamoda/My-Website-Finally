const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'arabic_teacher.db');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH);

// Initialize database tables
db.serialize(() => {
  // Users table (teacher authentication)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Students table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    level TEXT DEFAULT 'beginner',
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Lessons table
  db.run(`CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT NOT NULL,
    content TEXT,
    duration INTEGER DEFAULT 60,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Assignments table
  db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    student_id INTEGER,
    lesson_id INTEGER,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    grade REAL,
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (lesson_id) REFERENCES lessons (id)
  )`);

  // Classes table (scheduled sessions)
  db.run(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    student_id INTEGER,
    lesson_id INTEGER,
    scheduled_date DATETIME NOT NULL,
    duration INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (lesson_id) REFERENCES lessons (id)
  )`);

  // Resources table
  db.run(`CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    file_path TEXT,
    description TEXT,
    level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create default admin user
  const adminEmail = 'admin@arabicteacher.com';
  const adminPassword = bcrypt.hashSync('admin123', 10);
  
  db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, row) => {
    if (!row) {
      db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', 
        [adminEmail, adminPassword, 'Arabic Teacher']);
    }
  });

  // Create default demo student if none exist
  const demoStudentEmail = 'student@example.com';
  db.get('SELECT id FROM students WHERE email = ?', [demoStudentEmail], (err, row) => {
    if (err) {
      console.error('Error checking demo student:', err);
    } else if (!row) {
      db.run('INSERT INTO students (name, email, phone, level, status) VALUES (?, ?, ?, ?, ?)',
        ['Demo Student', demoStudentEmail, '', 'beginner', 'active'], function(err) {
          if (err) console.error('Failed to insert demo student:', err);
        });
    }
  });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Authentication routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// Students routes
app.get('/api/students', authenticateToken, (req, res) => {
  db.all('SELECT * FROM students ORDER BY created_at DESC', (err, students) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(students);
  });
});

// Student login route
app.post('/api/student/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM students WHERE email = ? AND status = "active"', [email], (err, student) => {
    if (err) {
      console.error('DB error in /api/student/login:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, we'll use a simple password check
    // In production, you should hash passwords
    if (password !== 'student123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ studentId: student.id, email: student.email, type: 'student' }, JWT_SECRET);
    res.json({ 
      token, 
      student: { 
        id: student.id, 
        email: student.email, 
        name: student.name,
        level: student.level,
        enrollment_date: student.enrollment_date
      } 
    });
  });
});

// Student dashboard routes
app.get('/api/student/dashboard', authenticateToken, (req, res) => {
  if (req.user.type !== 'student') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const studentId = req.user.studentId;
  const stats = {};

  // Get student assignments
  db.all(`
    SELECT a.*, l.title as lesson_title 
    FROM assignments a 
    LEFT JOIN lessons l ON a.lesson_id = l.id 
    WHERE a.student_id = ?
    ORDER BY a.due_date ASC
  `, [studentId], (err, assignments) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    stats.totalAssignments = assignments.length;
    stats.pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    stats.completedAssignments = assignments.filter(a => a.status === 'completed' || a.status === 'graded').length;
    
    // Calculate average grade
    const gradedAssignments = assignments.filter(a => a.grade !== null);
    stats.averageGrade = gradedAssignments.length > 0 
      ? Math.round(gradedAssignments.reduce((sum, a) => sum + a.grade, 0) / gradedAssignments.length)
      : 0;

    // Get upcoming classes
    db.all(`
      SELECT c.*, l.title as lesson_title 
      FROM classes c 
      LEFT JOIN lessons l ON c.lesson_id = l.id 
      WHERE c.student_id = ? AND c.scheduled_date >= datetime('now')
      ORDER BY c.scheduled_date ASC
      LIMIT 5
    `, [studentId], (err, upcomingClasses) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      stats.upcomingClasses = upcomingClasses.length;
      
      res.json({
        stats,
        recentAssignments: assignments.slice(0, 5),
        upcomingClasses: upcomingClasses
      });
    });
  });
});

// Student assignments
app.get('/api/student/assignments', authenticateToken, (req, res) => {
  if (req.user.type !== 'student') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = `
    SELECT a.*, l.title as lesson_title 
    FROM assignments a 
    LEFT JOIN lessons l ON a.lesson_id = l.id 
    WHERE a.student_id = ?
    ORDER BY a.due_date DESC
  `;
  
  db.all(query, [req.user.studentId], (err, assignments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(assignments);
  });
});

// Student classes
app.get('/api/student/classes', authenticateToken, (req, res) => {
  if (req.user.type !== 'student') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = `
    SELECT c.*, l.title as lesson_title 
    FROM classes c 
    LEFT JOIN lessons l ON c.lesson_id = l.id 
    WHERE c.student_id = ?
    ORDER BY c.scheduled_date DESC
  `;
  
  db.all(query, [req.user.studentId], (err, classes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(classes);
  });
});

// Student lessons (based on their level)
app.get('/api/student/lessons', authenticateToken, (req, res) => {
  if (req.user.type !== 'student') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Get student level first
  db.get('SELECT level FROM students WHERE id = ?', [req.user.studentId], (err, student) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    db.all('SELECT * FROM lessons WHERE level = ? ORDER BY created_at DESC', [student.level], (err, lessons) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(lessons);
    });
  });
});

app.post('/api/students', authenticateToken, (req, res) => {
  const { name, email, phone, level, notes } = req.body;
  
  db.run('INSERT INTO students (name, email, phone, level, notes) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, level, notes], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Student added successfully' });
    });
});

app.put('/api/students/:id', authenticateToken, (req, res) => {
  const { name, email, phone, level, notes, status } = req.body;
  const { id } = req.params;
  
  db.run('UPDATE students SET name = ?, email = ?, phone = ?, level = ?, notes = ?, status = ? WHERE id = ?',
    [name, email, phone, level, notes, status, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Student updated successfully' });
    });
});

app.delete('/api/students/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

// Lessons routes
app.get('/api/lessons', authenticateToken, (req, res) => {
  db.all('SELECT * FROM lessons ORDER BY created_at DESC', (err, lessons) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(lessons);
  });
});

app.post('/api/lessons', authenticateToken, (req, res) => {
  const { title, description, level, content, duration } = req.body;
  
  db.run('INSERT INTO lessons (title, description, level, content, duration) VALUES (?, ?, ?, ?, ?)',
    [title, description, level, content, duration], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Lesson created successfully' });
    });
});

// Assignments routes
app.get('/api/assignments', authenticateToken, (req, res) => {
  const query = `
    SELECT a.*, s.name as student_name, l.title as lesson_title 
    FROM assignments a 
    LEFT JOIN students s ON a.student_id = s.id 
    LEFT JOIN lessons l ON a.lesson_id = l.id 
    ORDER BY a.created_at DESC
  `;
  
  db.all(query, (err, assignments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(assignments);
  });
});

app.post('/api/assignments', authenticateToken, (req, res) => {
  const { title, description, student_id, lesson_id, due_date } = req.body;
  
  db.run('INSERT INTO assignments (title, description, student_id, lesson_id, due_date) VALUES (?, ?, ?, ?, ?)',
    [title, description, student_id, lesson_id, due_date], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Assignment created successfully' });
    });
});

app.put('/api/assignments/:id', authenticateToken, (req, res) => {
  const { status, grade, feedback } = req.body;
  const { id } = req.params;
  
  db.run('UPDATE assignments SET status = ?, grade = ?, feedback = ? WHERE id = ?',
    [status, grade, feedback, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Assignment updated successfully' });
    });
});

// Classes routes
app.get('/api/classes', authenticateToken, (req, res) => {
  const query = `
    SELECT c.*, s.name as student_name, l.title as lesson_title 
    FROM classes c 
    LEFT JOIN students s ON c.student_id = s.id 
    LEFT JOIN lessons l ON c.lesson_id = l.id 
    ORDER BY c.scheduled_date ASC
  `;
  
  db.all(query, (err, classes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(classes);
  });
});

app.post('/api/classes', authenticateToken, (req, res) => {
  const { title, student_id, lesson_id, scheduled_date, duration, notes } = req.body;
  
  db.run('INSERT INTO classes (title, student_id, lesson_id, scheduled_date, duration, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [title, student_id, lesson_id, scheduled_date, duration, notes], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Class scheduled successfully' });
    });
});

// Resources routes
app.get('/api/resources', authenticateToken, (req, res) => {
  db.all('SELECT * FROM resources ORDER BY created_at DESC', (err, resources) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(resources);
  });
});

app.post('/api/resources', authenticateToken, upload.single('file'), (req, res) => {
  const { title, type, description, level } = req.body;
  const file_path = req.file ? req.file.path : null;
  
  db.run('INSERT INTO resources (title, type, file_path, description, level) VALUES (?, ?, ?, ?, ?)',
    [title, type, file_path, description, level], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Resource added successfully' });
    });
});

// Dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const stats = {
    totalStudents: 0,
    activeStudents: 0,
    totalLessons: 0,
    pendingAssignments: 0
  };
  
  let completed = 0;
  const total = 4;
  
  // Count total students
  db.all('SELECT id FROM students', (err, rows) => {
    if (err) {
      console.error('DB error in /api/dashboard/stats (total students):', err);
    } else {
      stats.totalStudents = rows ? rows.length : 0;
    }
    completed++;
    if (completed === total) res.json(stats);
  });
  
  // Count active students
  db.all('SELECT id FROM students WHERE status = ?', ['active'], (err, rows) => {
    if (err) {
      console.error('DB error in /api/dashboard/stats (active students):', err);
    } else {
      stats.activeStudents = rows ? rows.length : 0;
    }
    completed++;
    if (completed === total) res.json(stats);
  });
  
  // Count total lessons
  db.all('SELECT id FROM lessons', (err, rows) => {
    if (err) {
      console.error('DB error in /api/dashboard/stats (lessons):', err);
    } else {
      stats.totalLessons = rows ? rows.length : 0;
    }
    completed++;
    if (completed === total) res.json(stats);
  });
  
  // Count pending assignments
  db.all('SELECT id FROM assignments WHERE status = ?', ['pending'], (err, rows) => {
    if (err) {
      console.error('DB error in /api/dashboard/stats (pending assignments):', err);
    } else {
      stats.pendingAssignments = rows ? rows.length : 0;
    }
    completed++;
    if (completed === total) res.json(stats);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});