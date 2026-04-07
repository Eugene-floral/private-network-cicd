const db = require('./db');
const bcrypt = require('bcrypt');

async function registerUser(userData) {
	try{
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(userData.password,saltRounds);
	
		const sql = `
			insert into users(user_id,password,name,gender,birth_date,email,phonenum,address)`
;

		const [result] = await db.execute(sql,[
			userData.user_id,
			hashedPassword,
			userData.name,
			userData.birth_date,
			userData.email,
			userData.phonenum,
			userData.address
			]);
			
			console.log("회원가입 성공! 유저 번호: "  ,result.insertId);
			return result;
}catch (error){
console.error("회원가입 중 에러 발생: ", error.message);
}
}
