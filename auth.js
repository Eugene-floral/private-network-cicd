const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // [로그인 처리]
    router.post('/login', (req, res) => {
        const { id, pw } = req.body;
        const sql = "SELECT * FROM user WHERE id = ? AND pw = ?";

        db.query(sql, [id, pw], (err, results) => {
            if (err) return res.status(500).send("데이터베이스 오류");

            if (results.length > 0) {
                // 세션에 유저 정보 저장 (로그인 유지용)
                req.session.user = results[0]; 
                res.send("<script>alert('반갑습니다, " + results[0].name + "님!'); location.href='/';</script>");
            } else {
                res.send("<script>alert('아이디 또는 비밀번호가 틀렸습니다.'); history.back();</script>");
            }
        });
    });

    // [로그아웃]
    router.get('/logout', (req, res) => {
        req.session.destroy(); // 세션 삭제
        res.send("<script>alert('로그아웃 되었습니다.'); location.href='/';</script>");
    });

    return router;
};
