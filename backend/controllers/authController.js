const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const Register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword,phoneNumber } = req.body;

        if (!name || !email || !password || !confirmPassword || !phoneNumber) {
            return res.status(400).json({ error: 'Please fill all required fields to create your account' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const phone = /^(\+2519\d{8}|09\d{8})$/;

        if (!phone.test(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid phone number format.' });
        }

        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({ error: 'Phone already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUser = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            phoneNumber
        });

        if (!JWT_SECRET) {
            return res.status(201).json({
                message: 'Account created successfully',
                user: {
                    id: createdUser._id,
                    name: createdUser.name,
                    email: createdUser.email,
                    phoneNumber: createdUser.phoneNumber
                }
            });
        }

        const token = jwt.sign({ userId: createdUser._id }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                phoneNumber: createdUser.phoneNumber
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please fill all the required fields to login' });
        }

        if (!JWT_SECRET) {
            return res.status(500).json({ error: 'JWT secret is not configured' });
        }

        const user = await User
            .findOne({ email: email.toLowerCase() })
            .select('+password');

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successfully!',
            token,
            user: {
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber,
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { Register, Login };
