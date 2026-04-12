const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const isAdmin = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    if (req.session.user.role !== 'admin') return res.status(403).send('접근 권한이 없습니다.');
    next();
};

module.exports = (db) => {

    router.get('/', isAdmin, async (req, res) => {
        const [products] = await db.execute('SELECT * FROM products');
        const [events] = await db.execute('SELECT * FROM events');
        const [users] = await db.execute('SELECT user_num, user_id, name, email, role FROM users');
        const [payments] = await db.execute(
            `SELECT pay.*, u.name, u.user_id, p.product_name, o.quantity, o.total_price
             FROM payments pay
             JOIN users u ON pay.user_num = u.user_num
             JOIN orders o ON pay.order_id = o.order_id
             JOIN products p ON o.product_id = p.product_id
             ORDER BY pay.paid_at DESC`
        );
        res.render('admin', { user: req.session.user, products, events, users, payments });
    });

    router.get('/product/edit/:product_id', isAdmin, async (req, res) => {
        const { product_id } = req.params;
        const [results] = await db.execute(
            'SELECT * FROM products WHERE product_id = ?',
            [product_id]
        );
        if (results.length === 0) return res.status(404).send('상품을 찾을 수 없습니다.');
        res.render('admin-product-edit', { user: req.session.user, product: results[0] });
    });

    router.post('/product/add', isAdmin, upload.single('image'), async (req, res) => {
        const { category, product_name, price, destination, duration } = req.body;
        const image = req.file ? req.file.filename : '';
        const product_id = 'P' + Date.now();
        await db.execute(
            'INSERT INTO products (product_id, category, product_name, price, destination, duration, availability, image) VALUES (?,?,?,?,?,?,1,?)',
            [product_id, category, product_name, price, destination, duration, image]
        );
        res.redirect('/admin');
    });

    router.post('/product/edit', isAdmin, upload.single('image'), async (req, res) => {
        const { product_id, category, product_name, price, destination, duration, description, highlights, included, schedule, current_image } = req.body;
        const image = req.file ? req.file.filename : current_image;
        await db.execute(
            `UPDATE products SET category=?, product_name=?, price=?, destination=?,
             duration=?, image=?, description=?, highlights=?, included=?, schedule=?
             WHERE product_id=?`,
            [category, product_name, price, destination, duration, image, description, highlights, included, schedule, product_id]
        );
        res.redirect('/admin');
    });

    router.post('/product/delete', isAdmin, async (req, res) => {
        const { product_id } = req.body;
        await db.execute('DELETE FROM products WHERE product_id = ?', [product_id]);
        res.redirect('/admin');
    });

    router.post('/event/add', isAdmin, upload.single('image'), async (req, res) => {
        const { title, description, start_date, end_date, discount_type, discount_value } = req.body;
        const image = req.file ? req.file.filename : '';
        await db.execute(
            'INSERT INTO events (title, description, image, start_date, end_date, discount_type, discount_value) VALUES (?,?,?,?,?,?,?)',
            [title, description, image, start_date, end_date, discount_type, discount_value]
        );
        res.redirect('/admin');
    });

    router.post('/event/delete', isAdmin, async (req, res) => {
        const { event_id } = req.body;
        await db.execute('DELETE FROM events WHERE event_id = ?', [event_id]);
        res.redirect('/admin');
    });

    router.post('/event/edit', isAdmin, upload.single('image'), async (req, res) => {
        const { event_id, title, description, start_date, end_date, discount_type, discount_value, current_image } = req.body;
        const image = req.file ? req.file.filename : current_image;
        await db.execute(
            'UPDATE events SET title=?, description=?, image=?, start_date=?, end_date=?, discount_type=?, discount_value=? WHERE event_id=?',
            [title, description, image, start_date, end_date, discount_type, discount_value, event_id]
        );
        res.redirect('/admin');
    });

    return router;
};
