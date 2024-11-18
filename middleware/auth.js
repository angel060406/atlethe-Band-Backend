const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token; // Lee el token de las cookies
    if (!token) {
      return res.status(401).json({ error: 'No token provided. Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Almacena la información decodificada en req.user
    next();
  } catch (error) {
    console.error('Error en autenticación:', error.message);
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
};

module.exports = auth;
