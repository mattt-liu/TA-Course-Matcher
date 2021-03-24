const jwt = require('jsonwebtoken');

const secret = "c5fbee81f66de269876ade1db24d7e9a"; /* testing purposes only */

function authenticateToken(req, res, next) {
    /* when a token is sent in the header
     */

    // parse token in header
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1]; // Bearer TOKEN

    // if there is no token then redirect
    if (!token) {
        return res.status(400).send("Bad token"); // TODO: redirect
    }

    // verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {

        // if token is invalid
        if (err) return res.status(400).send("Bad token"); // TODO: redirect 
        req.user = payload;
        next();
    })
}

function authenticateAdminToken(req, res, next) {
    /* when a token is sent in the header for admins
     */

    // parse token in header
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1]; // Bearer TOKEN

    // if there is no token then redirect to login
    if (!token) {
        return res.status(400).send("Bad token"); // TODO: redirect 
    }

    // verify token
    jwt.verify(token, process.env.ADMIN_TOKEN_SECRET, (err, payload) => {

        // if token is invalid
        if (err) return res.status(400).send("Bad token"); // TODO: redirect login

        req.user = payload;
        next();
    })
}

function signToken(user) {
    // creating jwt

    let userSign = {
        // TODO: figure out what to sign on the token 
        email: user.email
    }
    return jwt.sign(userSign, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" }); // TODO: create refresh token
}

module.exports = {
    authenticateToken: authenticateToken,
    authenticateAdminToken: authenticateAdminToken,
    signToken: signToken
}
