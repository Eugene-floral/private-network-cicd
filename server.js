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

//로그인창.

app.get('/signup-page', (req,res) => {
res.sendFile(path.join(__dirname, '/views' , 'signup.html'));
});

//상세 페이지.
// 허니문-유럽 상세
app.get('/honeymoon-europe/paris', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'paris.html'));
});
app.get('/honeymoon-europe/venice', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'venice.html'));
});
app.get('/honeymoon-europe/portugal', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/detail', 'portugal.html'));
});

// 허니문-휴양지 상세
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
        // 1. 브라우저가 보낸 데이터 꺼내기 (HTML의 name 값들과 일치해야 함)
        const { user_id, password, name, gender, birth_date, email, phonenum, address } = req.body;  
                                                                                                     
        // 2. 비밀번호 암호화                                                                        
        const saltRounds = 10;                                                                       
        const hashedPassword = await bcrypt.hash(password, saltRounds);                              
                                                                                                     
        // 3. DB에 저장 (서연님의 DB 컬럼명이 'passward'라면 그대로, 'password'로 고치셨다면 수정!)
        // 주의: 마지막에 닫는 괄호 )와 세미콜론 ; 을 확인하세요.
        const sql = `                                                                                
            INSERT INTO users (user_id, password, name, gender, birth_date, email, phonenum, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;                                                                                            
        
        const values = [user_id, hashedPassword, name, gender, birth_date, email, phonenum, address];
                                                                                                     
        await db.execute(sql, values);                                                               
                                                                                                     
        // 4. 성공 응답                                                                              
        res.status(201).json({ message: "회원가입이 완료되었습니다!" });                             
                                                                                                     
    } catch (error) {                                                                                
        console.error("회원가입 에러 상세:", error);                                                                        
        res.status(500).json({ error: "회원가입 중 오류가 발생했습니다.", details: error.message });                         
    }                                                                                                
});



