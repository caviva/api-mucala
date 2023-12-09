const { json } = require('express');
const Bot = require('../models/botModel');
const Docker = require('dockerode');
const axios = require('axios');

const docker = new Docker({ host: process.env.DOCKER_HOST, port: 2375 });

const index = (req, res) => {
    res.json({ "message": 'Bienvenido a la Bot API - Autenticado', "user": req.user });
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

        const containerId = bot.containerId;

        try {
            const container = docker.getContainer(containerId);
            const containerInfo = await container.inspect();
            let jsonContainerInfo = JSON.stringify(containerInfo);
            jsonContainerInfo = JSON.parse(jsonContainerInfo);

            res.status(200).send({
                status: "success",
                message: 'Container found successfully',
                container: {
                    id: containerId,
                    status: jsonContainerInfo.State.Status,
                    running: jsonContainerInfo.State.Running,
                    paused: jsonContainerInfo.State.Paused,
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(400).send({
                status: "error",
                message: 'Container not found'
            });
        }

    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error getting bot status'
        });
    }
};

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

        const containerId = bot.containerId;

        try {
            const container = docker.getContainer(containerId);
            await container.stop();
            const containerInfo = await container.inspect();
            let jsonContainerInfo = JSON.stringify(containerInfo);
            jsonContainerInfo = JSON.parse(jsonContainerInfo);

            res.status(200).send({
                status: "success",
                message: 'Container stopped successfully',
                container: {
                    id: containerId,
                    status: jsonContainerInfo.State.Status,
                    running: jsonContainerInfo.State.Running,
                    paused: jsonContainerInfo.State.Paused,
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(400).send({
                status: "error",
                message: 'Container not found'
            });
        }

    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error getting bot status'
        });
    }
};

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

        const containerId = bot.containerId;

        try {
            const container = docker.getContainer(containerId);
            await container.start();
            const containerInfo = await container.inspect();
            let jsonContainerInfo = JSON.stringify(containerInfo);
            jsonContainerInfo = JSON.parse(jsonContainerInfo);

            res.status(200).send({
                status: "success",
                message: 'Container started successfully',
                container: {
                    id: containerId,
                    status: jsonContainerInfo.State.Status,
                    running: jsonContainerInfo.State.Running,
                    paused: jsonContainerInfo.State.Paused,
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(400).send({
                status: "error",
                message: 'Container not found'
            });
        }

    } catch (err) {
        res.status(500).send({
            status: "error",
            message: 'Error getting bot status'
        });
    }
};

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
    index, register, status, stop, start, qr
};