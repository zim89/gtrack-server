const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const { User } = require('./user.model');
const { Review } = require('../reviews/review.model');
const { Task } = require('../tasks/task.model');
const {
  HttpError,
  generateToken,
  generateRefreshToken,
} = require('../../helpers');

class UserController {
  // CREATE
  create = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const candidate = await User.findOne({ email });
    if (candidate) throw HttpError(409, 'Email already exist');

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...req.body,
      password: hash,
    });

    const payload = {
      id: user._id,
    };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.token = token;
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      code: 201,
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

  // CURRENT
  // FIXME: Not tested
  current = asyncHandler(async (req, res) => {
    const {
      email,
      username,
      avatar,
      birthday,
      skype,
      phone,
      isGoogleAuth = false,
    } = req.user;

    res.status(200).json({
      code: 200,
      data: { email, username, avatar, birthday, skype, phone, isGoogleAuth },
    });
  });

  // UPDATE
  // FIXME: Not tested load avatar
  update = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { email: newEmail } = req.body;
    const avatar = req.file ? req.file.path : '';

    const user = await User.findOne({ _id: { $ne: _id }, email: newEmail });

    if (user) {
      throw HttpError(409, 'Email already is use');
    }

    const newDataUser = avatar ? { ...req.body, avatar } : req.body;

    const editedUser = await User.findByIdAndUpdate(_id, newDataUser, {
      new: true,
    });

    if (!editedUser) {
      throw HttpError(404, "Not found user's id");
    }

    res.status(200).json({
      code: 200,
      data: {
        username: editedUser.username,
        email: editedUser.email,
        birthday: editedUser.birthday,
        phone: editedUser.phone,
        skype: editedUser.skype,
        avatar: editedUser.avatar,
      },
    });
  });

  // UPDATE PASSWORD
  updatePassword = asyncHandler(async (req, res) => {
    const { _id, password } = req.user;
    const { newPassword, oldPassword } = req.body;
    if (newPassword === oldPassword)
      throw HttpError(400, 'New and old password cant be equals');

    const isValidPassword = await bcrypt.compare(oldPassword, password);

    if (!isValidPassword) throw HttpError(401, 'Password invalid');

    const hash = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      _id,
      { password: hash },
      { new: true }
    );

    if (!user) throw HttpError(404);

    res
      .status(200)
      .json({ code: 200, message: 'Password changed successfuly' });
  });

  // REMOVE
  // FIXME: Not tested
  remove = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const user = await User.findById(_id);
    if (!user) {
      throw HttpError(404, "User with the ID doesn't exist.");
    }

    const { secretKey } = req.body;
    const isSecretKeyCompare = user._id.toString() === secretKey;
    if (!isSecretKeyCompare) {
      throw HttpError(401, 'Secret key is invalid');
    }

    await Review.deleteMany({ owner: user._id });
    await Task.deleteMany({ owner: user._id });
    await User.findByIdAndRemove(user._id);

    res
      .status(200)
      .json({ code: 200, message: 'Account successfully deleted.' });
  });
}

module.exports = new UserController();
