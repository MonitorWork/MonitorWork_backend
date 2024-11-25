const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

// Rota de exemplo
router.get('/example', exampleController.getExample);

module.exports = router;
