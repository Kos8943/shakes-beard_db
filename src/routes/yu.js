const express = require('express');
const router= express.Router();

const db = require(__dirname + '/../db_connect2');
const upload = require(__dirname + '/../upload-module');

router.get('/', (req, res) => {
    res.send('yu')
});