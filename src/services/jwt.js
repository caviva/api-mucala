const jwt = require("jwt-simple");
const moment = require("moment");

const secret = process.env.SECRET_KEY;

const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    }

    return jwt.encode(payload, secret);
};

module.exports = createToken;