const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/subjects', (req, res) => {
  db.all("SELECT * FROM subjects", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/calculate-gpa', (req, res) => {
  const { firstName, lastName, scores } = req.body; 

  if (!firstName || !lastName || !scores) {
    return res.status(400).json({ error: 'لطفاً تمامی اطلاعات و نمرات را وارد کنید.' });
  }

  db.all("SELECT * FROM subjects", [], (err, subjects) => {
    if (err) return res.status(500).json({ error: err.message });

    let totalWeightedScore = 0;
    let totalCoefficients = 0;
    let detailedScores = [];

    subjects.forEach(sub => {
      const score = parseFloat(scores[sub.id]) || 0;
      totalWeightedScore += score * sub.coefficient;
      totalCoefficients += sub.coefficient;
      
      detailedScores.push({
        subjectName: sub.name,
        coefficient: sub.coefficient,
        score: score
      });
    });

    const gpa = totalCoefficients > 0 ? parseFloat((totalWeightedScore / totalCoefficients).toFixed(2)) : 0;

    db.run("INSERT INTO students (firstName, lastName, gpa) VALUES (?, ?, ?)", [firstName, lastName, gpa], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      const studentId = this.lastID;
      const stmt = db.prepare("INSERT INTO student_scores (student_id, subject_id, score) VALUES (?, ?, ?)");
      Object.keys(scores).forEach(subId => {
        stmt.run(studentId, subId, parseFloat(scores[subId]) || 0);
      });
      stmt.finalize();

      res.status(201).json({
        id: studentId,
        firstName,
        lastName,
        gpa,
        detailedScores
      });
    });
  });
});

router.get('/records', (req, res) => {
  db.all("SELECT * FROM students", [], (err, students) => {
    if (err) return res.status(500).json({ error: err.message });
    if (students.length === 0) return res.json([]);

    let records = [];
    let completed = 0;

    students.forEach(student => {
      db.all(`
        SELECT s.name as subjectName, s.coefficient, sc.score 
        FROM student_scores sc 
        JOIN subjects s ON sc.subject_id = s.id 
        WHERE sc.student_id = ?
      `, [student.id], (err, scoresRows) => {
        records.push({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          gpa: student.gpa,
          detailedScores: scoresRows || []
        });

        completed++;
        if (completed === students.length) {
          res.json(records);
        }
      });
    });
  });
});

module.exports = router;