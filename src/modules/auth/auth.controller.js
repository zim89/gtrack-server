const asyncHandler = require('express-async-handler');
const { nanoid } = require('nanoid');
const queryString = require('querystring');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const url = require('url');

const { User } = require('../users/user.model');
const {
  HttpError,
  sendEmail,
  generateToken,
  generateRefreshToken,
} = require('../../helpers');

class AuthController {
  // LOGIN
  // FIXME: Tested
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) throw HttpError(401, 'Email or password is invalid');

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) throw HttpError(401, 'Email or password is invalid');

    const payload = {
      id: user._id,
    };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.token = token;
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      code: 200,
      data: {
        token: user.token,
        refreshToken: user.refreshToken,
        user: {
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          birthday: user.birthday,
          skype: user.skype,
          phone: user.phone,
        },
      },
    });
  });

  // LOGOUT
  // FIXME: Tested
  logout = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(
      _id,
      { token: '', refreshToken: '' },
      { new: true }
    );

    res.status(200).json({ code: 200, message: 'Logout success' });
  });

  // GOOGLE AUTH
  googleAuth = asyncHandler(async (req, res) => {
    const stringifiedParams = queryString.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.BASE_URL}/api/auth/google-redirect`,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
    );
  });

  // GOOGLE REDIRECT
  googleRedirect = asyncHandler(async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const urlObj = url.URL(fullUrl, true);
    const urlParams = urlObj.query;
    const code = urlParams.code;

    const tokenData = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: 'post',
      data: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BASE_URL}/api/auth/google-redirect`,
        grant_type: 'authorization_code',
        code,
      },
    });

    const userData = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${tokenData.data.access_token}`,
      },
    });

    const user = await User.findOne({ email: userData.data.email });
    if (user) {
      const payload = {
        id: user._id,
      };

      const refreshToken = jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY_REFRESH,
        {
          expiresIn: '23h',
        }
      );

      await User.findByIdAndUpdate(user._id, {
        refreshToken,
        isGoogleAuth: true,
      });

      return res.redirect(`${process.env.FRONTEND_URL}?token=${refreshToken}`);
    }

    const password = nanoid();
    const hash = await bcrypt.hash(password, 10);

    const userBody = {
      email: userData.data.email,
      username: userData.data.name,
      avatar: userData.data.picture,
      password: hash,
      isGoogleAuth: true,
    };

    const newUser = await User.create(userBody);

    const payload = {
      id: newUser._id,
    };

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY_REFRESH, {
      expiresIn: '23h',
    });

    await User.findByIdAndUpdate(newUser._id, {
      refreshToken,
    });

    return res.redirect(`${process.env.FRONTEND_URL}?token=${refreshToken}`);
  });

  // REFRESH TOCKEN
  // FIXME: Tested
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: tokenToRefresh } = req.body;

    try {
      const { id } = jwt.verify(
        tokenToRefresh,
        process.env.JWT_SECRET_KEY_REFRESH
      );
      const user = await User.findOne({ refreshToken: tokenToRefresh });

      if (!user) throw HttpError(403, 'Token is invalid');

      const payload = {
        id,
      };

      const token = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      user.token = token;
      user.refreshToken = refreshToken;
      await user.save();

      res.status(200).json({
        code: 200,
        data: {
          token: user.token,
          refreshToken: user.refreshToken,
          user: {
            email: user.email,
            username: user.username,
          },
        },
      });
    } catch (error) {
      throw HttpError(403, error.message);
    }
  });

  // SEND SECRET KEY
  sendSecretKey = asyncHandler(async (req, res) => {
    const { email, _id } = req.user;
    const user = await User.findById(_id);

    if (!user) throw HttpError(404, 'User does not exist');

    const secretKey = _id.toString();

    const msg = {
      // from: {
      //   name: 'GooseTrack',
      // },
      to: email,
      subject: 'GooseTrack account delete',
      html: `<p>Enter this secret key to permanently delete your account:</p> <h4>${secretKey}</h4>`,
    };

    sendEmail(msg);

    res.status(200).json({
      code: 200,
      message: `Secret key was sent on ${email} successfully`,
    });
  });

  // RESET PASSWORD
  // FIXME: Tested
  resetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) throw HttpError(404, 'User does not exist');

    const newPassword = nanoid();
    const hash = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, {
      password: hash,
    });

    const msg = {
      to: email,
      subject: 'GooseTrack password reset ',
      html: `<p>Your new password is </p> <h4>${newPassword}</h4>`,
    };

    sendEmail(msg);

    res
      .status(200)
      .json({ code: 200, message: 'Reset password sent successfully' });
  });
}

module.exports = new AuthController();
