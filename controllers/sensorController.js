const Sensor = require('../models/sensor');

//Registrar una nueva lectura
exports.registerRead = async (req, res) => {
    try{
        const { sensorType, value } = req.body;

        const sensor = await Sensor.create({
            sensorType,
            value,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error interno del servidor');
    }
};

//Obtener todas las lecturas
exports.getAllReadings = async (_, res) => {
    try{
        const sensors = await Sensor.find();
        res.status(200).json(sensors);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener las lecturas");
    }
};