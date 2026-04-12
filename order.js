const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.get('/:product_id', async (req, res) => {
        if (!req.session.user) return res.redirect('/login');
        const { product_id } = req.params;
        const [results] = await db.execute(
            'SELECT * FROM products WHERE product_id = ?',
            [product_id]
        );
        if (results.length === 0) return res.status(404).send('상품을 찾을 수 없습니다.');
        res.render('order', {
            user: req.session.user,
            product: results[0],
            clientKey: process.env.TOSS_CLIENT_KEY
        });
    });

    router.post('/create', async (req, res) => {
        if (!req.session.user) return res.redirect('/login');
        const { product_id, quantity, total_price } = req.body;
        const user_num = req.session.user.user_num;
        const order_id = 'ORDER_' + Date.now();
        await db.execute(
            'INSERT INTO orders (order_id, quantity, total_price, product_id, user_num) VALUES (?,?,?,?,?)',
            [order_id, quantity, total_price, product_id, user_num]
        );
        res.json({ order_id });
    });

    router.get('/payment/success', async (req, res) => {
        const { paymentKey, orderId, amount } = req.query;
        try {
            const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ paymentKey, orderId, amount })
            });
            const data = await response.json();

            if (data.status === 'DONE') {
                const user_num = req.session.user.user_num;
                await db.execute(
                    'INSERT INTO payments (pay_method, pg_tx_id, paid_at, payment_status, order_id, user_num) VALUES (?,?,NOW(),?,?,?)',
                    [data.method, paymentKey, 'paid', orderId, user_num]
                );
                await db.execute(
                    'UPDATE orders SET ordered_at = NOW() WHERE order_id = ?',
                    [orderId]
                );
                res.render('payment-success', { user: req.session.user, data });
            }
        } catch (err) {
            console.error(err);
            res.redirect('/payment/fail');
        }
    });

    router.get('/payment/fail', (req, res) => {
        res.render('payment-fail', { user: req.session.user || null });
    });

    return router;
};
