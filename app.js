var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/sqlite.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the notes database.');
    }
});

// 若Iphone系列 table 不存在，則建立 table
db.run('CREATE TABLE IF NOT EXISTS iphone (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER, price INTEGER)', (err) => {
    if (err) {
        console.error('Create table failed', err.message);
    } else {
        console.log('Create table successfully.');
    }
});

// 撰寫 /api/price 路由，使用 SQLite 查詢Iphone所有的價格資料
app.get('/api/price', (req, res) => {
    db.all('SELECT * FROM Iphone', (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        res.json(rows);
    });
});

// 撰寫 get /api?year= 路由，使用 SQLite 查詢 year 提供的所有資料
app.get('/api', (req, res) => {
    const year = req.query.year;
    db.all('SELECT * FROM Iphone WHERE year = ?', [year], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.send(rows);
    });
});

// 撰寫 /price POST 路由，處理前端發送的年份查詢請求
app.post('/price', (req, res) => {
    const year = req.body.year;
    db.get('SELECT price FROM Iphone WHERE year = ?', [year], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(row ? { price: row.price } : { price: null });
    });
});

module.exports = app;
