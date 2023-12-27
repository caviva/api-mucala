const { json } = require('express');
const Bot = require('../models/botModel');
const User = require('../models/userModel');
const axios = require('axios');
const pm2 = require('pm2')

const index = (req, res) => {
    res.json({ "message": 'Bienvenido a la Bot API - Autenticado', "user": req.user });
};

const myList = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user.status) return res.status(401).send({
        status: "error",
        message: 'Status inactive'
    })
    else {
        try {
            const bots = await Bot.find({ user: req.user.id });
            res.status(200).send({
                status: "success",
                message: 'Bots retrieved successfully',
                bots
            });
        } catch (err) {
            res.status(500).send({
                status: "error",
                message: 'Error getting bots'
            });
        }
    }
};

const register = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(401).send({
        status: "error",
        message: 'Unauthorized'
    })
    else {
        try {
            let params = req.body;

            if (!params.name || !params.url) {
                return res.status(400).send({
                    status: "error",
                    message: 'All fields are required'
                });
            }

            let bot = new Bot(params);

            const existingBots = await Bot.find({ $or: [{ name: bot.name }, { botUrl: bot.url }] });

            if (existingBots && existingBots.length > 0) {
                return res.status(400).send({
                    status: "error",
                    message: 'Bot already exists'
                });
            }

            const botStored = await bot.save();

            if (botStored) {
                res.status(200).send({
                    status: "success",
                    message: 'Bot saved successfully'
                });
            } else {
                res.status(400).send({
                    status: "error",
                    message: 'Error saving bot'
                });
            }
        } catch (err) {
            res.status(500).send({
                status: "error",
                message: 'Error saving bot'
            });
        }
    }
}

const status = async (req, res) => {
    try {
        if (!req.params.botId) {
            return res.status(400).send({
                status: "error",
                message: 'All fields are required'
            });
        }

        let bot = await Bot.findById(req.params.botId);

        if (!bot) {
            return res.status(400).send({
                status: "error",
                message: 'Bot not found'
            });
        }

        if (req.user.id != bot.user) {
            return res.status(401).send({
                status: "error",
                message: 'Unauthorized'
            });
        }

        pm2.describe(bot.pm2, (err, description) => {
            if (err) {
                console.error(err);
            } else {
                const statuspm2 = description[0] ? description[0].pm2_env.status : 'No en ejecución';
                res.status(200).send({
                    status: "success",
                    message: 'Bot status retrieved successfully',
                    pm2: statuspm2
                });
            }
        });

    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error getting bot status'
        });
    }
}

const stop = async (req, res) => {
    try {
        if (!req.params.botId) {
            return res.status(400).send({
                status: "error",
                message: 'All fields are required'
            });
        }

        let bot = await Bot.findById(req.params.botId);

        if (!bot) {
            return res.status(400).send({
                status: "error",
                message: 'Bot not found'
            });
        }

        if (req.user.id != bot.user) {
            return res.status(401).send({
                status: "error",
                message: 'Unauthorized'
            });
        }

        if (bot.finishedAt < Date.now()) {
            return res.status(401).send({
                status: "error",
                message: 'Update your subscription'
            })
        }

        pm2.stop(bot.pm2, (err, description) => {
            if (err) {
                console.error(err);
            } else {
                res.status(200).send({
                    status: "success",
                    message: 'Bot stopped successfully'
                });
            }
        });

    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error stopping bot'
        });
    }
}

const start = async (req, res) => {
    try {
        if (!req.params.botId) {
            return res.status(400).send({
                status: "error",
                message: 'All fields are required'
            });
        }

        let bot = await Bot.findById(req.params.botId);

        if (!bot) {
            return res.status(400).send({
                status: "error",
                message: 'Bot not found'
            });
        }

        if (req.user.id != bot.user) {
            return res.status(401).send({
                status: "error",
                message: 'Unauthorized'
            });
        }

        if (bot.finishedAt < Date.now()) {
            return res.status(401).send({
                status: "error",
                message: 'Update your subscription'
            })
        }

        pm2.start(bot.pm2, (err, description) => {
            if (err) {
                console.error(err);
            } else {
                res.status(200).send({
                    status: "success",
                    message: 'Bot started successfully'
                });
            }
        });

    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error starting bot'
        });
    }
}

const qr = async (req, res) => {
    try {
        if (!req.params.botId) {
            return res.status(400).send({
                status: "error",
                message: 'All fields are required'
            });
        }

        let bot = await Bot.findById(req.params.botId);

        if (!bot) {
            return res.status(400).send({
                status: "error",
                message: 'Bot not found'
            });
        }

        if (req.user.id != bot.user) {
            return res.status(401).send({
                status: "error",
                message: 'Unauthorized'
            });
        }

        res.status(200).send({
            status: "success",
            message: 'Qr generated successfully',
            qr: bot.url.concat('/api/qr')
        });

    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error getting qr code'
        });
    }
}

module.exports = {
    index, register, status, qr, start, stop, myList
};