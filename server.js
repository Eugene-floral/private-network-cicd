const express = require('express');
const PORT = 5000;
const app = express();
const path = require('path');
app.set('trust proxy', 1);
const db = require('./db');
const bcrypt = require('bcrypt');
const session =  require('express-session');
const MYSQLStore = require('express-mysql-session')(session);

const sessionStore = new MYSQLStore({
	expiration: 3600000,
	createDatabaseTable: true,
	clearExpired: true,
	checkExpirationInterval: 900000
}, db);
app.set('view engine' , 'ejs');
app.set('views',path.join(__dirname, '/views'));

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session(
{
secret:'ghdrldud10',
resave:false,
saveUninitialized: false,
store: sessionStore,
cookie: {
	maxAge:3600000,
	sameSite: 'lax',
	domain: 'eugene.io.kr',
	secure: true
	
}
			
}
)
);
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const authRouter = require('./auth')(db);
app.use('/auth' ,authRouter);



app.get('/', (req, res) => { res.render('index', {user:req.session.user || null}); });
app.get('/introduce', (req, res) => { res.sendFile(path.join(__dirname, '/views', 'introduce.html')); });
app.get('/event', (req, res) => { res.sendFile(path.join(__dirname, '/views', 'event.html')); });
app.get('/honeymoon-resort', (req, res) => { res.sendFile(path.join(__dirname, '/views', 'honeymoon-resort.html')); });

app.get('/honeymoon-europe', (req, res) => { res.render('honeymoon-europe', { user: req.session.user || null }) });

app.get('/group', (req, res) => { res.sendFile(path.join(__dirname, '/views', 'group.html')); });
app.get('/package', (req, res) => { res.sendFile(path.join(__dirname, '/views', 'package.html')); });
app.get('/signup-page', (req, res) => { res.sendFile(path.join(__dirname, '/views', 'signup.html')); });
app.get('/login', (req,res) => { res.sendFile(path.join(__dirname,'/views','login.html'));});
app.get('/mypage', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
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
        res.render('mypage', {
            user: req.session.user,
            payments: payments
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("서버 오류");
    }
});

// 상세 페이지
app.get('/honeymoon-europe/paris', (req, res) => { res.sendFile(path.join(__dirname, '/views/detail', 'paris.html')); });
app.get('/honeymoon-europe/venice', (req, res) => { res.sendFile(path.join(__dirname, '/views/detail', 'venice.html')); });
app.get('/honeymoon-europe/portugal', (req, res) => { res.sendFile(path.join(__dirname, '/views/detail', 'portugal.html')); });
app.get('/honeymoon-resort/australia', (req, res) => { res.sendFile(path.join(__dirname, '/views/detail', 'australia.html')); });
app.get('/honeymoon-resort/mauritius', (req, res) => { res.sendFile(path.join(__dirname, '/views/detail', 'mauritius.html')); });
app.get('/honeymoon-resort/koh-samui', (req, res) => { res.sendFile(path.join(__dirname, '/views/detail', 'koh-samui.html')); });

// 회원가입
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

// 서버 대기
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
