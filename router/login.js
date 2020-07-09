const Datastore = require('nedb-promises');
let userInfo = Datastore.create('./userInfo.db')
let sessionDB = Datastore.create('./session.db');
const encryption = require('../api/register/encryption.js');

const { insertSessionID } = require('../api/register/database.js');

async function loginCallback(req, res) {

    const ERR_ID = "아이디가 맞지 않습니다."
    const ERR_PASSWORD = "비밀번호가 맞지 않습니다."


    const id = req.body.id;
    const password = req.body.password;

    await userInfo.load()
    const user = await userInfo.find({ id: id })

    console.log(user)

    if (!user.length) return res.status(400).json({
        mes: ERR_ID,
    })

    const encryptedPassword = encryption(password);
    if (user[0].password !== encryptedPassword) return res.status(400).json({
        mes: ERR_PASSWORD,
    })

    const randomNum = String(Math.floor(Math.random() * 1000000));
    const sessionID = String(encryption(randomNum));
    const session = await insertSessionID(id, sessionID);

    res.cookie('id', id, { httpOnly: true, secure: false })
        .cookie('sessionID', sessionID, { expires: new Date(Date.now() + 900000), httpOnly: true, secure: false })

    if (req.body.register) {
        res.status(200).json({ success: true })
    } else res.redirect('/mypage')
}

module.exports = loginCallback;