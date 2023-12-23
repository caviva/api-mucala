const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');
const createToken = require('../services/jwt');
const mongoosePaginate = require('mongoose-pagination');

const index = (req, res) => {
    res.json({ "message": 'Bienvenido a la User API - Autenticado', "user": req.user });
}

const register = async (req, res) => {
    try {
        let params = req.body;

        if (!params.name || !params.username || !params.email || !params.phone || !params.password) {
            return res.status(400).send({
                status: "error",
                message: 'All fields are required'
            });
        }

        let user = new User(params);

        const existingUsers = await User.find({ $or: [{ email: user.email }, { username: user.username }] });

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).send({
                status: "error",
                message: 'User already exists'
            });
        }

        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;

        const userStored = await user.save();

        if (userStored) {
            res.status(200).send({
                status: "success",
                message: 'User saved successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    role: user.role,
                    status: user.status,
                    createdAt: user.createdAt
                }
            });
        } else {
            res.status(400).send({
                status: "error",
                message: 'Error saving user'
            });
        }
    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error saving user'
        });
    }
};

const login = async (req, res) => {
    try {
        let params = req.body;

        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error",
                message: 'All fields are required'
            });
        }

        const user = await User.findOne({ email: params.email });

        if (!user) {
            return res.status(400).send({
                status: "error",
                message: 'User does not exist'
            });
        }

        const match = await bcrypt.compare(params.password, user.password);

        if (match) {
            const token = createToken(user);

            res.status(200).send({
                status: "success",
                message: 'User logged in successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    role: user.role,
                    status: user.status,
                    createdAt: user.createdAt,
                    token: token
                }
            });
        } else {
            res.status(400).send({
                status: "error",
                message: 'Invalid credentials'
            });
        }
    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error logging in'
        });
    }
};

const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(400).send({
                status: "error",
                message: 'User does not exist'
            });
        }

        res.status(200).send({
            status: "success",
            message: 'User profile',
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error getting user profile'
        });
    }
};

const update = async (req, res) => {
    let params = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(400).send({
                status: "error",
                message: 'User does not exist'
            });
        }

        if (params.name && params.name != user.name) {
            user.name = params.name;
        }

        if (params.email && params.email != user.email) {
            user.email = params.email;
        }

        if (params.phone && params.phone != user.phone) {
            user.phone = params.phone;
        }

        if (params.password) {
            const hash = await bcrypt.hash(params.password, 10);
            user.password = hash;
        }

        const userUpdated = await user.save();

        if (userUpdated) {
            res.status(200).send({
                status: "success",
                message: 'User updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    role: user.role,
                    status: user.status,
                    createdAt: user.createdAt
                }
            });
        } else {
            res.status(400).send({
                status: "error",
                message: 'Error updating user'
            });
        }
    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error updating user'
        });
    }
};

const uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({
            status: "error",
            message: 'No files to upload'
        });
    }

    let fileName = req.file.filename;
    let extension = fileName.split('\.');
    let fileExt = extension[1];

    if (fileExt != 'png' && fileExt != 'jpg' && fileExt != 'jpeg' && fileExt != 'gif') {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                return res.status(500).send({
                    status: "error",
                    message: 'Error deleting file'
                });
            }
        }
        );
        return res.status(400).send({
            status: "error",
            message: 'Invalid extension',
        });
    }

    try {
        const userUpdated = await User.findOneAndUpdate({ _id: req.user.id }, { avatar: fileName }, { new: true });

        if (!userUpdated) {
            return res.status(400).send({
                status: "error",
                message: 'Error uploading avatar'
            });
        }
        return res.status(200).send({
            status: "success",
            message: 'Avatar uploaded successfully',
            user: {
                id: userUpdated._id,
                name: userUpdated.name,
                username: userUpdated.username,
                email: userUpdated.email,
                phone: userUpdated.phone,
                avatar: userUpdated.avatar,
                role: userUpdated.role,
                status: userUpdated.status,
                createdAt: userUpdated.createdAt
            }
        });
    } catch (err) {
        return res.status(500).send({
            status: "error",
            message: 'Error uploading avatar'
        });
    }
};

const sendAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || !user.avatar) {
            return res.status(400).send({
                status: "error",
                message: 'User does not exist'
            });
        }

        let avatarPath = path.resolve(__dirname, `../uploads/avatar/${user.avatar}`);

        if (fs.existsSync(avatarPath)) {
            return res.sendFile(avatarPath);
        } else {
            return res.status(400).send({
                status: "error",
                message: 'Avatar does not exist'
            });
        }
    } catch (err) {
        return res.status(500).send({
            status: "error",
            message: 'Error getting avatar'
        });
    }
};

const changeStatus = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(401).send({
        status: "error",
        message: 'Unauthorized'
    })
    else {
        try {
            if (!req.params.userId) {
                return res.status(400).send({
                    status: "error",
                    message: 'All fields are required'
                });
            }

            const user = await User.findById(req.params.userId);

            if (!user) {
                return res.status(400).send({
                    status: "error",
                    message: 'User does not exist'
                });
            }

            user.status = !user.status;

            const userUpdated = await user.save();

            if (userUpdated) {
                res.status(200).send({
                    status: "success",
                    message: 'User status updated successfully',
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        avatar: user.avatar,
                        role: user.role,
                        status: user.status,
                        createdAt: user.createdAt
                    }
                });
            } else {
                res.status(400).send({
                    status: "error",
                    message: 'Error updating user'
                });
            }
        } catch (err) {
            res.status(500).send({
                status: "error",
                message: 'Error updating user'
            });
        }
    }
}

module.exports = {
    index, register, login, profile, update, uploadAvatar, sendAvatar, changeStatus
};