const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if(!token){return res.status(401).json({message : 'no token found!'})}

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(401).json({message : 'no user found!'});

        req.user = user;
        next();
    } catch (error) {
        res.json({message : 'error happend'});
    }
}


exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  next();
};