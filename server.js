const express = require('express');
const PORT = 5000;
const app = express();
const path = require('path');
app.set('trust proxy', 1);
const db = require('./db');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MYSQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const sessionStore = new MYSQLStore({
    expiration: 3600000,
    createDatabaseTable: true,
    clearExpired: true,
    checkExpirationInterval: 900000
}, db);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'ghdrldud10',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 3600000,
        sameSite: 'lax',
        domain: 'eugene.io.kr',
        secure: true
    }
}));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const authRouter = require('./auth')(db);
app.use('/auth', authRouter);

const adminRouter = require('./admin')(db);
app.use('/admin', adminRouter);

const orderRouter = require('./order')(db);
app.use('/order', orderRouter);


app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});

app.get('/introduce', (req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'introduce.html'));
});

app.get('/event', async (req, res) => {
    const [events] = await db.execute('SELECT * FROM events ORDER BY start_date DESC');
    res.render('event', { user: req.session.user || null, events });
});

app.get('/honeymoon-europe', async (req, res) => {
    const [products] = await db.execute(
        "SELECT * FROM products WHERE category = 'honeymoon-europe' AND availability = 1"
    );
    res.render('honeymoon-europe', { user: req.session.user || null, products });
});

app.get('/honeymoon-resort', async (req, res) => {
    const [products] = await db.execute(
        "SELECT * FROM products WHERE category = 'honeymoon-resort' AND availability = 1"
    );
    res.render('honeymoon-resort', { user: req.session.user || null, products });
});

app.get('/group', async (req, res) => {
    const [products] = await db.execute(
        "SELECT * FROM products WHERE category = 'group-tour' AND availability = 1"
    );
    res.render('group', { user: req.session.user || null, products });
});

app.get('/package', async (req, res) => {
    const [products] = await db.execute(
        "SELECT * FROM products WHERE category = 'package' AND availability = 1"
    );
    res.render('package', { user: req.session.user || null, products });
});

app.get('/reviews', async (req, res) => {
    const [reviews] = await db.execute(
        `SELECT r.*, u.name, p.product_name
         FROM reviews r
         JOIN users u ON r.user_num = u.user_num
         JOIN payments pay ON r.payment_id = pay.payment_id
         JOIN orders o ON pay.order_id = o.order_id
         JOIN products p ON o.product_id = p.product_id
         ORDER BY r.reviewed_at DESC`
    );
    res.render('reviews', { user: req.session.user || null, reviews });
});

app.get('/contact', (req, res) => {
    res.render('contact', { user: req.session.user || null });
});

app.get('/signup-page', (req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'login.html'));
});

app.get('/mypage', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    try {
        const user_num = req.session.user.user_num;
        const [payments] = await db.execute(
            `SELECT p.paid_at, p.pay_method, p.payment_status,
                    o.total_price, o.quantity
             FROM payments p
             JOIN orders o ON p.order_id = o.order_id
             WHERE p.user_num = ?`,
            [user_num]
        );
        res.render('mypage', { user: req.session.user, payments });
    } catch (err) {
        console.error(err);
        res.status(500).send("서버 오류");
    }
});

app.get('/product/:product_id', async (req, res) => {
    const { product_id } = req.params;
    const [results] = await db.execute(
        "SELECT * FROM products WHERE product_id = ?",
        [product_id]
    );
    if (results.length === 0) return res.status(404).send('상품을 찾을 수 없습니다.');
    res.render('detail', { user: req.session.user || null, product: results[0] });
});

app.post('/signup', async (req, res) => {
    try {
        const { user_id, password, name, gender, birth_date, email, phonenum, address } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (user_id, password, name, gender, birth_date, email, phonenum, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [user_id, hashedPassword, name, gender, birth_date, email, phonenum, address];
        await db.execute(sql, values);
        res.status(201).send("<script>alert('signup success'); location.href='/';</script>");
    } catch (error) {
        console.error("error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
