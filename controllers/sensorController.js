const Sensor = require('../models/sensor');

// Registrar una nueva lectura desde la API (opcional, para otras rutas)
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
        // Extraer datos del mensaje JSON recibido
        const { "temperatura del corporal": objectTemp, "temperantura ambiente": ambientTemp } = data;

        // Mostrar las lecturas en consola
        console.log('Lectura recibida:');
        console.log('Temperatura del corporal:', objectTemp);
        console.log('Temperatura ambiente:', ambientTemp);
    } catch (error) {
        console.error('Error al procesar la lectura del sensor:', error);
    }
};
