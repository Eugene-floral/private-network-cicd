const express = require('express');
const app = express();
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
const PORT=5000

//메인 홈 페이지

app.get('/' , (req,res) => {
	 res.sendFile(path.join(__dirname, '/views', 'index.html'))
});

//여행 상품 목혹
app.get('/introduce' , (req,res) => {
res.sendFile(path.join(__dirname, '/views' , 'introduce.html'));
});
//이벤트 목록
app.get('/event' ,(req,res) => {
res.sendFile(path.join(__dirname,'/views' , 'event.html'));
});

//허니문 - 휴양지 목록

app.get('/honeymoon-resort', (req,res) => {
res.sendFile(path.join(__dirname,'/views' , 'honeymoon-resort.html'));
});

//허니문 - 유럽 목록

app.get('/honeymoon-europe' , (req,res) => {
res.sendFile(path.join(__dirname,'/views' , 'honeymoon-europe.html'));
});

//단체 투어 목록

app.get('/group' ,(req,res) => {
res.sendFile(path.join(__dirname, '/views' ,'group.html'));
});

//패키지 투어 목록
app.get('/package' ,(req,res) => {
res.sendFile(path.join(__dirname,'/views' ,'package.html'));
});


app.get('/signup-page', (req,res) => {
res.sendFile(path.join(__dirname, '/views' , 'signup.html'));
});

//상세 페이지.
//honey moon detail
app.get('/honeymoon-europe/paris', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'paris.html'));
});
app.get('/honeymoon-europe/venice', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'venice.html'));
});
app.get('/honeymoon-europe/portugal', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'portugal.html'));
});


app.get('/honeymoon-resort/australia', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'australia.html'));
});
app.get('/honeymoon-resort/mauritius', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'mauritius.html'));
});
app.get('/honeymoon-resort/koh-samui', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'koh-samui.html'));
});

app.post('/signup', async (req, res) => {
    try {

        const { user_id, password, name, gender, birth_date, email, phonenum, address } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = `
            INSERT INTO users (user_id, password, name, gender, birth_date, email, phonenum, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [user_id, hashedPassword, name, gender, birth_date, email, phonenum, address];

        await db.execute(sql, values);

        res.status(201).send(`
		<script>
			alert("signup complete!");
			location.href =  "/login";
		</script>
	`);
    } catch (error) {
        console.error("signup error details :" , error);
        res.status(500).json({ error: "error detected!! " , details: error.message });
    }
});



