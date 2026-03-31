const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

const PORT=5000

//메인 홈 페이지

app.get('/' , (req,res) => {
	 res.sendFile(path.join(__dirname, '/views', 'index2.html'))
});

//여행 상품 목혹
app.get('/introduce' , (req,res) => { 
res.sendFile(path.join(__dirname, '/views' , 'introduce.html'));
});

app.get('/event' ,(req,res) => {

res.sendFile(path.join

(__dirname,'/views' , 'event.html'));

});

app.listen(PORT, ()=> console.log('web is started'));



