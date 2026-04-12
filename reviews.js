const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.get('/', async (req, res) => {
        const [reviews] = await db.execute(
            `SELECT r.*, u.name, p.product_name
             FROM reviews r
             JOIN users u ON r.user_num = u.user_num
             JOIN payments pay ON r.payment_id = pay.payment_id
             JOIN orders o ON pay.order_id = o.order_id
             JOIN products p ON o.product_id = p.product_id
             ORDER BY r.reviewed_at DESC`
        );

        let myPayments = [];
        if (req.session.user) {
            const [payments] = await db.execute(
                `SELECT pay.payment_id, p.product_name
                 FROM payments pay
                 JOIN orders o ON pay.order_id = o.order_id
                 JOIN products p ON o.product_id = p.product_id
                 WHERE pay.user_num = ? AND pay.payment_status = 'paid'`,
                [req.session.user.user_num]
            );
            myPayments = payments;
        }

        res.render('reviews', {
            user: req.session.user || null,
            reviews,
            myPayments
        });
    });

    router.post('/write', async (req, res) => {
        if (!req.session.user) return res.redirect('/login');
        const { payment_id, rate, contents } = req.body;
        const user_num = req.session.user.user_num;
        await db.execute(
            'INSERT INTO reviews (user_num, payment_id, reviewed_at, rate, contents) VALUES (?,?,NOW(),?,?)',
            [user_num, payment_id, rate, contents]
        );
        res.redirect('/reviews');
    });

    return router;
};
