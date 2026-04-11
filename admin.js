const express = require('express');
const router = express.Router();

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
        res.render('admin', { user: req.session.user, products, events, users });
    });

    router.post('/product/add', isAdmin, async (req, res) => {
        const { category, product_name, price, destination, duration, image } = req.body;
        await db.execute(
            'INSERT INTO products (category, product_name, price, destination, duration, availability, image) VALUES (?,?,?,?,?,1,?)',
            [category, product_name, price, destination, duration, image]
        );
        res.redirect('/admin');
    });

    router.post('/product/delete', isAdmin, async (req, res) => {
        const { product_id } = req.body;
        await db.execute('DELETE FROM products WHERE product_id = ?', [product_id]);
        res.redirect('/admin');
    });

    router.post('/product/edit', isAdmin, async (req, res) => {
        const { product_id, category, product_name, price, destination, duration, image } = req.body;
        await db.execute(
            'UPDATE products SET category=?, product_name=?, price=?, destination=?, duration=?, image=? WHERE product_id=?',
            [category, product_name, price, destination, duration, image, product_id]
        );
        res.redirect('/admin');
    });

    router.post('/event/add', isAdmin, async (req, res) => {
        const { title, description, image, start_date, end_date } = req.body;
        await db.execute(
            'INSERT INTO events (title, description, image, start_date, end_date) VALUES (?,?,?,?,?)',
            [title, description, image, start_date, end_date]
        );
        res.redirect('/admin');
    });

    router.post('/event/delete', isAdmin, async (req, res) => {
        const { event_id } = req.body;
        await db.execute('DELETE FROM events WHERE event_id = ?', [event_id]);
        res.redirect('/admin');
    });

    router.post('/event/edit', isAdmin, async (req, res) => {
        const { event_id, title, description, image, start_date, end_date } = req.body;
        await db.execute(
            'UPDATE events SET title=?, description=?, image=?, start_date=?, end_date=? WHERE event_id=?',
            [title, description, image, start_date, end_date, event_id]
        );
        res.redirect('/admin');
    });

    return router;
};
