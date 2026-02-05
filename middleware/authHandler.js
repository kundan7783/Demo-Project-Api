const jwt = require("jsonwebtoken");

function verifyAuthToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token missing"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // 🔥 VERY IMPORTANT
        return res.status(401).json({
            message: "Access token expired or invalid"
        });
    }
}

module.exports = verifyAuthToken;
