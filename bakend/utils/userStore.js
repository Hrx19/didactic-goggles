import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const inMemoryUsers = [];

export const isDbConnected = () => {
  if (process.env.MONGO_CONNECTED === 'false') return false;
  if (process.env.MONGO_CONNECTED === 'true') return true;
  return mongoose.connection.readyState === 1;
};

export const findUserByEmail = async (email) => {
  const normalized = email.toLowerCase();

  if (isDbConnected()) {
    return await User.findOne({ email: normalized }).select('+password');
  }

  return inMemoryUsers.find((u) => u.email === normalized);
};

export const findUserById = async (id) => {
  if (isDbConnected()) {
    return await User.findById(id);
  }
  return inMemoryUsers.find((u) => u._id === id);
};

export const createUser = async ({ name, email, password, role }) => {
  const normalized = email.toLowerCase();

  if (isDbConnected()) {
    return await User.create({ name, email: normalized, password, role });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    _id: `${Date.now()}-${Math.random()}`,
    name,
    email: normalized,
    password: passwordHash,
    role,
  };
  inMemoryUsers.push(user);
  return user;
};

export const matchPassword = async (user, enteredPassword) => {
  if (isDbConnected()) {
    return await user.matchPassword(enteredPassword);
  }
  return await bcrypt.compare(enteredPassword, user.password);
};

export const updateUserById = async (id, updates) => {
  if (isDbConnected()) {
    return await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  }

  const user = inMemoryUsers.find((u) => u._id === id);
  if (!user) return null;

  Object.assign(user, updates);
  return user;
};
