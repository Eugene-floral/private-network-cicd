const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const NaverStrategy = require('passport-naver-v2').Strategy;

module.exports = (db) => {

    passport.use(new NaverStrategy({
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        callbackURL: process.env.NAVER_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const [results] = await db.execute(
                'SELECT * FROM users WHERE user_id = ?',
                ['naver_' + profile.id]
            );

            if (results.length > 0) {
                return done(null, results[0]);
            } else {
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
        const { user_id, password } = req.body;
        const sql = "SELECT * FROM users WHERE user_id = ?";

        try {
            const [results] = await db.execute(sql, [user_id]);

            if (results.length > 0) {
                const user = results[0];
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    req.session.user = user;
                    req.session.save((err) => {
                        if (err) {
                            console.error("세션 저장 에러:", err);
                            return res.status(500).send("세션 오류");
                        }
                        return res.send(`<script>alert('반갑습니다, ${user.name}님!'); location.href='/';</script>`);
                    });
                } else {
                    return res.send("<script>alert('아이디 또는 비밀번호가 틀렸습니다.'); history.back();</script>");
                }
            } else {
                return res.send("<script>alert('아이디를 찾을 수 없습니다.'); history.back();</script>");
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
            req.session.save((err) => {
                if (err) {
                    console.error("네이버 세션 저장 에러:", err);
                    return res.redirect('/login');
                }
                res.redirect('/');
            });
        }
    );

    // [로그아웃]
    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("로그아웃 에러:", err);
                return res.status(500).send("로그아웃 오류");
            }
            res.send("<script>alert('로그아웃 되었습니다.'); location.href='/';</script>");
        });
    });

    return router;
};
