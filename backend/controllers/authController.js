const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');

// Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
    try {
        // Generate Ethereal test account if credentials aren't provided
        let transporter;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            // Ethereal test account
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
        }

        const info = await transporter.sendMail({
            from: '"Happiness Campaign" <noreply@happinesscampaign.com>',
            to: email,
            subject: 'Welcome to the Happiness Campaign! 🎉',
            text: `Hello ${name},\n\nWelcome to the Happiness Campaign! We are excited to have you join our rides and spread happiness.\n\nBest,\nThe Happiness Team`,
            html: `<b>Hello ${name},</b><br><br>Welcome to the Happiness Campaign! We are excited to have you join our rides and spread happiness.<br><br>Best,<br>The Happiness Team`,
        });

        if (!process.env.EMAIL_USER) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Auto-assign admin role if email matches master admin
        const masterAdminEmail = (process.env.MASTER_ADMIN_EMAIL || '').toLowerCase().trim();
        const assignedRole = (email.toLowerCase().trim() === masterAdminEmail && masterAdminEmail) ? 'admin' : 'user';

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
        });

        if (user) {
            // Send async email without waiting for response
            sendWelcomeEmail(user.email, user.name);

            res.status(201).json({
                success: true,
                user: {
                    _id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isPublic: user.isPublic,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Auto-promote to admin if email matches master admin and user isn't already admin
            const masterAdminEmail = (process.env.MASTER_ADMIN_EMAIL || '').toLowerCase().trim();
            if (user.email === masterAdminEmail && masterAdminEmail && user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
            }

            res.json({
                success: true,
                user: {
                    _id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isPublic: user.isPublic,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
