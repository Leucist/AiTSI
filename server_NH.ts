import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
// Allow all origins for simplicity in testing
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

const dbPath = path.join(__dirname, 'game.db');
export const db = new Database(dbPath);

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE,
        username TEXT
    );
    CREATE TABLE IF NOT EXISTS save_games (
        user_id INTEGER PRIMARY KEY,
        level_index INTEGER,
        score INTEGER,
        coins_collected TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

// Insert a dummy user
const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, token, username) VALUES (?, ?, ?)');
insertUser.run(1, 'mock-token-123', 'testuser');

// Auth middleware
interface AuthRequest extends express.Request {
    user?: any;
}

const requireAuth = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const user = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
};

app.post('/api/save', requireAuth, (req: AuthRequest, res) => {
    const { levelIndex, score, coinsCollected } = req.body;
    
    const stmt = db.prepare(`
        INSERT INTO save_games (user_id, level_index, score, coins_collected) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
            level_index=excluded.level_index, 
            score=excluded.score, 
            coins_collected=excluded.coins_collected
    `);
    
    stmt.run(req.user.id, levelIndex, score, JSON.stringify(coinsCollected));
    res.json({ success: true });
});

app.get('/api/load', requireAuth, (req: AuthRequest, res) => {
    const save = db.prepare('SELECT * FROM save_games WHERE user_id = ?').get(req.user.id);
    if (!save) {
        return res.json({ hasSave: false });
    }
    res.json({
        hasSave: true,
        data: {
            levelIndex: save.level_index,
            score: save.score,
            coinsCollected: JSON.parse(save.coins_collected)
        }
    });
});

// Database cleanup endpoint for tests
app.post('/api/test/reset', requireAuth, (req: AuthRequest, res) => {
    db.prepare('DELETE FROM save_games').run();
    res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
