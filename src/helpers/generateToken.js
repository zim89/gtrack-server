const jwt = require('jsonwebtoken');

const generateToken = data => {
  const payload = { ...data };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '23h' });
};

module.exports = generateToken;
