const jwt = require("jwt-simple");
const moment = require("moment");

const secret = process.env.SECRET_KEY;

const auth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: 'Missing authorization header'
        });
    }

    const token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        let payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: 'Token has expired'
            });
        }

        req.user = payload;
        next();
        
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: 'Invalid token'
        });
    }
}

module.exports = {
    auth
};