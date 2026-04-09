const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

module.exports = (db) => {

    router.post('/login', (req, res) => {
        const { id, pw } = req.body;
        const sql = "SELECT * FROM users WHERE user_id = ?";

        db.query(sql, [id], (err, results) => {
            if (err) return res.status(500).send("데이터베이스 오류");


            if (results.length > 0) {
		const user = results[0];

		try{

			const match = await bcypt.compare(pw, user.password);
			if(match){
               			req.session.user = user;
                		return res.send("<script>alert('반갑습니다, " + results[0].name + "님!'); location.href='/';</script>");
            		} else 	{
               			return res.send("<script>alert('아이디 또는 비밀번호가 틀렸습니다.'); history.back();</script>");
            		}
		} catch (compareErr) {
			console.error("비교에러" ,compareErr);
			return re.status(500).send("서버오류");
		}
	    } else {
			res.send("<script>alert('id not found'); history.back();</script>");
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
