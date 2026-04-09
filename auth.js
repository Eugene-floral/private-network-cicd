const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const NaverStrategy = require('passport-naver-v2').Strategy;

module.exports = (db) => {

        passport.use(new NaverStrategy({
        clientID: '_nLLf4J5_C4sEy37BMAH',
        clientSecret: 'BtF6Ouc_la',
        callbackURL: 'http://localhost:5000/auth/naver/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // DB에서 네이버 유저 조회
            const [results] = await db.execute(
                'SELECT * FROM users WHERE user_id = ?',
                ['naver_' + profile.id]
            );

            if (results.length > 0) {
                // 이미 가입된 유저
                return done(null, results[0]);
            } else {
                // 신규 유저 → DB에 저장
                await db.execute(
                    'INSERT INTO users (user_id, password, name, email) VALUES (?, ?, ?, ?)',
                    ['naver_' + profile.id, 'social_login', profile.displayName, profile.email || '']
                );
                const [newUser] = await db.execute(
                    'SELECT * FROM users WHERE user_id = ?',
                    ['naver_' + profile.id]
                );
                return done(null, newUser[0]);
            }
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.user_num);
    });

    passport.deserializeUser(async (user_num, done) => {
        try {
            const [results] = await db.execute(
                'SELECT * FROM users WHERE user_num = ?',
                [user_num]
            );
            done(null, results[0]);
        } catch (err) {
            done(err);
        }
    });

    // [일반 로그인]
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

    // [네이버 로그인]
    router.get('/naver', passport.authenticate('naver'));

    router.get('/naver/callback',
        passport.authenticate('naver', { failureRedirect: '/login' }),
        (req, res) => {
            req.session.user = req.user;
            res.redirect('/');
        }
    );

    // [로그아웃]
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.send("<script>alert('로그아웃 되었습니다.'); location.href='/';</script>");
    });

    return router;
};
