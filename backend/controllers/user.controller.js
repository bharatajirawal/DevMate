import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createUserController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await userService.createUser(req.body);
    const token = await user.generateJWT();
    delete user._doc.password;

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const loginController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ errors: 'Invalid credentials' });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ errors: 'Invalid credentials' });
    }

    const token = await user.generateJWT();
    delete user._doc.password;

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 * Get the current user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const profileController = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 * Logout a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser  = await userModel.findOne({ email: req.user.email });
    const allUsers = await userService.getAllUsers({ userId: loggedInUser ._id });

    res.status(200).json({ users: allUsers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};