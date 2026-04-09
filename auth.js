const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

module.exports = (db) => {

    // [로그인]
    router.post('/login', async (req, res) => {
        console.log("로그인 요청 왔음", req.body);
        const { user_id, password } = req.body;
        const sql = "SELECT * FROM users WHERE user_id = ?";

        try {
            const [results] = await db.execute(sql, [user_id]);

            if (results.length > 0) {
                const user = results[0];
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    req.session.user = user;
                    return res.send("<script>alert('반갑습니다, " + user.name + "님!'); location.href='/';</script>");
                } else {
                    return res.send("<script>alert('아이디 또는 비밀번호가 틀렸습니다.'); history.back();</script>");
                }
            } else {
                return res.send("<script>alert('id not found'); history.back();</script>");
            }
        } catch (err) {
            console.error("로그인 에러:", err);
            return res.status(500).send("서버 오류");
        }
    });

    // [로그아웃]
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.send("<script>alert('로그아웃 되었습니다.'); location.href='/';</script>");
    });

    return router;
};
