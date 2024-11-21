const Sensor = require('../models/sensor');

// Registrar una nueva lectura desde la API (para pruebas)
exports.registerRead = async (req, res) => {
    try {
        const { sensorType, value } = req.body;

        const sensor = await Sensor.create({
            sensorType,
            value,
        });

        res.status(201).json(sensor);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error interno del servidor');
    }
};

// Obtener todas las lecturas (opcional, para otras rutas)
exports.getAllReadings = async (_, res) => {
    try {
        const sensors = await Sensor.find();
        res.status(200).json(sensors);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener las lecturas");
    }
};

// Procesar datos del sensor recibidos por MQTT y mostrar en consola
exports.processSensorData = (data) => {
    try {
        console.log('Procesando datos del sensor:');
        console.log('Datos recibidos:', data);

        // Extraer datos del mensaje JSON recibido
        const { temp_corp, ambient_temp } = data;

        if (temp_corp !== undefined) {
            console.log('Temperatura corporal recibida:', temp_corp);
        } else {
            console.log('Temperatura corporal no incluida en los datos.');
        }

        if (ambient_temp !== undefined) {
            console.log('Temperatura ambiente recibida:', ambient_temp);
        } else {
            console.log('Temperatura ambiente no incluida en los datos.');
        }
    } catch (error) {
        console.error('Error al procesar la lectura del sensor:', error);
    }
};

// Registrar datos desde MQTT
exports.saveSensorData = async (sensorType, value) => {
    try {
        const sensor = await Sensor.create({ sensorType, value });
        console.log(`Lectura guardada en la base de datos: ${sensor}`);
    } catch (error) {
        console.error('Error al guardar datos del sensor:', error);
    }
};