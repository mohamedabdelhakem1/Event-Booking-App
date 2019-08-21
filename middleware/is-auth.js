const jwt = require('jsonwebtoken')
module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]; // bearer  token
    if (!token || token == "") {
        req.isAuth = false;
        return next();
    }
    try {
        const decodedToken = jwt.verify(token, 'secretkey');
        if (!decodedToken) {
            req.isAuth = false;
            return next();
        }
        req.isAuth = true;
        req.userId = decodedToken.userId;
        next();
    } catch (e) {
        req.isAuth = false;
        return next();
    }
}