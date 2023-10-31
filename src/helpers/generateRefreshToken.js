const jwt = require('jsonwebtoken');

const generateRefreshToken = data => {
  const payload = { ...data };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY_REFRESH, {
    expiresIn: '7d',
  });
};

module.exports = generateRefreshToken;
