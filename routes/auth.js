/*
    Rutas de Usuarios / Auth
    host + /api/auth
*/

const { createUser, loginUser, renewToken } = require('../controllers/auth');
const { fieldValidator } = require('../middlewares/field-validator');
const { jwtValidator } = require('../middlewares/jwt-validator');
const { Router } = require('express');
const { check } = require('express-validator');

const router = Router();

router.post(
    '/new',
    [   // Middlewares
        check('name', 'El nombre es obligatorio.').not().isEmpty(),
        check('email', 'El email es obligatorio.').isEmail(),
        check('password', 'El password debe de ser de 6 caracteres.').isLength({ min: 6 }),
        fieldValidator,
    ],
    createUser
);

router.post(
    '/',
    [ // Middlewares
        check('email', 'El Email debe ser un email').isEmail(),
        check('password', 'El password debe de tener un mínimo de 6 carácteres').isLength({ min: 6 }),
        fieldValidator,
    ],
    loginUser
);

router.get('/renew', jwtValidator, renewToken);


module.exports = router;