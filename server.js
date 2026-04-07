const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

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
res.sedFile(path.join(__dirname,'/views' ,'package.html'));
});

app.listen(PORT, ()=> console.log('web is started'));





