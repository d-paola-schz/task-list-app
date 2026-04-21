require("dotenv").config();
const express = require('express');
// const db = require('./db');
// const { app } = require('@azure/functions');
const mysql = require("mysql2/promise");
const initDatabase = require("./db/init");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  ssl: { rejectUnauthorized: false }
};

async function startApp() {
    await initDatabase(dbConfig);

    const pool = mysql.createPool(dbConfig);
    
    app.get('/api/tasks', async (req, res) => {
        try{
            const [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC;");
            res.json(rows);
        }catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to get tasks" });
        }
    });
    
    app.post('/api/tasks', async (req,res) => {
        try{
            const {title, completed, description, priority, due_date} = req.body;
            if (!title) {
                return res.status(400).json({ error: "Title is required" });
            }
    
            await pool.query(`INSERT INTO tasks  (title, completed, description, priority, due_date)
            VALUES (?, ?, ?, ?, ?)`,
            [
                title,
                completed ?? false,
                description ?? null,
                priority ?? 'Low',
                due_date ?? null
            ]);
    
            res.status(201).json({ message: "Created task" });
        }catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to post task" });
        }
    });
    
    app.delete('/api/tasks/:id', async (req, res) => {
        const [result] = await pool.query(`DELETE FROM tasks WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json({ message: "Task deleted" });
    });
    
    app.put('/api/tasks/:id/toggle', async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await pool.query(
                `UPDATE tasks SET completed = NOT completed WHERE id = ?`,
                [id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Task not found" });
            }
            res.json({ message: "Task toggled" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to toggle task" });
        }
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
}

startApp();