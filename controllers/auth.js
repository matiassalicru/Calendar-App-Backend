const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateJWT } = require('../helpers/jwt');

const createUser = async (req, res = response) => {
    const { email, password } = req.body;

    try {

        // Verifica si ya existe ese email.
        let user = await User.findOne({ email: email });

        // Si ya existe un usuario con ese mail, lanza un error.
        if (user) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario existe con ese correo.'
            });
        };

        // Asigna a 'user' un nuevo _modelo User_ con el body que le enviemos en la request.
        user = new User(req.body);

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt);

        // Guarda en la base de datos el 'user' con el body enviado.
        await user.save();

        // Generar JWT (JSON WEB TOKEN)
        const token = await generateJWT(user.id, user.name);

        // Respuesta si todo sale bien con el Name y el uid.
        res.status(201).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        });

    } catch (error) {
        // Devuelve el error si no se pudo guardar en la DB el nuevo user.
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
};

const loginUser = async (req, res = response) => {

    // Desestructura el email y password enviados.
    const { email, password } = req.body;


    try {

        // Verifica si existe.
        const user = await User.findOne({ email: email });

        // Si no existe muestra error de que el mail no está asociado a ningún user.
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese mail'
            });
        };

        // Confirmar los passwords
        const validPassword = bcrypt.compareSync(password, user.password);

        // Verifica si la password coincide con la enviada en el request.
        if (!validPassword) {
            // si no coincide muestra 'Contraseña incorrecta'.
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });
        };

        // Generar JWT (JSON WEB TOKEN)
        const token = await generateJWT(user.id, user.name);

        // Si todo sale bien responde con el uid y el nombre de usuario.
        res.json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        });

    } catch (error) {
        // En caso que haya algún error externo muestra un mensaje con un status 500
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el admin.'
        });
    }
};

const renewToken = async (req, res) => {

    const { uid, name } = req;

    // Generar un nuevo JWT y retornarlo en esta petición.
    const token = await generateJWT(uid, name);

    res.json({
        ok: true,
        uid,
        name,
        token
    });
};


module.exports = {
    createUser,
    loginUser,
    renewToken
};