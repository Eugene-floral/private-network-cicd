const db = require('./db');
const bcrypt = require('bcrypt');

async function registerUser(userData) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // SQL 문을 정확하게 작성 (끝에 VALUES (?, ?, ... ) 가 꼭 있어야 함)
        const sql = `
            INSERT INTO users (user_id, password, name, gender, birth_date, email, phonenum, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // DB에 넣을 값들 (순서가 SQL문의 컬럼 순서와 똑같아야 함!)
        const [result] = await db.execute(sql, [
            userData.user_id,
            hashedPassword,
            userData.name,
            userData.gender,     // 아까 빠져있던 성별 추가!
            userData.birth_date,
            userData.email,
            userData.phonenum,
            userData.address
        ]);

        console.log("회원가입 성공! 유저 번호:", result.insertId);
        return result;

    } catch (error) {
        console.error("회원가입 로직 에러:", error.message);
        throw error; // 에러를 던져야 server.js에서 catch할 수 있음
    }
}

// 중요: server.js에서 쓸 수 있게 내보내기
module.exports = { registerUser };
