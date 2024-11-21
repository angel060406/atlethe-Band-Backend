const User = require('../models/user');
const Activity = require('../models/activity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!(name && email && password)) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).send('Ya existe un usuario con ese correo');
        }

        const myEncpassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: myEncpassword
        });

        const token = jwt.sign(
            { id: user._id, email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        user.token = token;
        user.password = undefined;

        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error interno del servidor');
    }
};

// Login de usuario
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).send('Por favor envía todos los datos necesarios');
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Credenciales inválidas');
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 3 días
            httpOnly: true,
        };

        res.cookie('token', token, options);

        res.status(200).json({
            success: true,
            user: { name: user.name, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};


// Cierre de sesión de usuario
exports.logout = async (_, res) => {
    try {
        res.clearCookie('token', { path: '/' }); // Limpia la cookie 'token'
        res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// Devuelve los datos del usuario autenticado
exports.getProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('name email');
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
  
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error('Error al obtener el perfil:', error.message);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  };
  

// Devuelve las actividades realizadas por el usuario autenticado
exports.getActivities = async (req, res) => {
    try {
      const userId = req.user.id;
      const activities = await Activity.find({ userId })
        .sort({ date: -1 }) // Ordena por fecha descendente
        .limit(10); // Limita a las últimas 10 actividades
  
      res.status(200).json({ success: true, activities });
    } catch (error) {
      console.error('Error al obtener actividades:', error.message);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  };
  

// Registrar una actividad manualmente
exports.registerActivity = async (req, res) => {
    try {
        const userId = req.user.id; // Obtén el userId del middleware auth
        const activities = req.body; // Supongamos que el cuerpo de la solicitud es un array de actividades

        if (!Array.isArray(activities) || activities.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debes proporcionar al menos una actividad',
            });
        }

        // Validar cada actividad y agregar userId
        const activitiesWithUserId = activities.map((activity) => ({
            ...activity,
            userId,
        }));

        // Crear actividades en la base de datos
        await Activity.insertMany(activitiesWithUserId);

        res.status(201).json({
            success: true,
            message: 'Actividades registradas exitosamente',
        });
    } catch (error) {
        console.error('Error al registrar actividades:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};
