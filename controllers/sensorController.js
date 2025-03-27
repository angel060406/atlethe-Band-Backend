const Sensor = require('../models/sensor');
const { Worker } = require('worker_threads');

// Registrar una nueva lectura desde la API utilizando un worker
exports.registerRead = async (req, res) => {
  try {
    const { sensorType, value } = req.body;
    // Se delega al worker
    const worker = new Worker('./workers/worker.js');
    worker.postMessage({ type: 'registerRead', data: { sensorType, value } });
    
    worker.on('message', async (processedData) => {
      const sensor = await Sensor.create({
        sensorType: processedData.sensorType,
        value: processedData.value,
      });
      res.status(201).json(sensor);
      worker.terminate();
    });
    
    worker.on('error', (error) => {
      console.error(error);
      res.status(500).send('Error al procesar la lectura');
      worker.terminate();
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
};

// Obtener todas las lecturas
exports.getAllReadings = async (_, res) => {
  try {
    const sensors = await Sensor.find().sort({ timestamp: -1 });
    res.status(200).json(sensors);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener las lecturas");
  }
};

// Registrar datos desde MQTT
exports.saveSensorData = async (sensorType, data) => {
  try {
    const sensor = await Sensor.create({ sensorType, value: data });
    console.log(`Lectura guardada en la base de datos: ${sensor}`);
  } catch (error) {
    console.error('Error al guardar datos del sensor:', error);
  }
};

// Obtener resumen diario delegando el cálculo al worker
exports.getTemperatureSummary = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '1', 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const readings = await Sensor.find({
      sensorType: 'temperatura',
      'value.temp_corp': { $exists: true },
      timestamp: { $gte: since }
    }).sort({ timestamp: 1 });

    const temps = readings.map(r => r.value.temp_corp).filter(v => typeof v === 'number');

    const worker = new Worker('./workers/worker.js');
    worker.postMessage({ type: 'temperatureSummary', data: temps });

    worker.on('message', (result) => {
      if (!result) {
        res.status(200).json({ success: true, message: 'No hay datos en el periodo especificado', data: [] });
      } else {
        res.json({ success: true, days, stats: result });
      }
      worker.terminate();
    });

    worker.on('error', (error) => {
      console.error(error);
      res.status(500).send("Error al procesar el resumen de temperatura");
      worker.terminate();
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener el resumen de temperatura");
  }
};

// Obtener el histórico de temperatura delegando el procesamiento al worker
exports.getTemperatureHistory = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'start y end son requeridos en formato YYYY-MM-DD' });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const readings = await Sensor.find({
      sensorType: 'temperatura',
      'value.temp_corp': { $exists: true },
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });

    const data = readings.map(r => ({
      timestamp: r.timestamp,
      temp_corp: r.value.temp_corp
    }));

    const worker = new Worker('./workers/worker.js');
    worker.postMessage({ type: 'temperatureHistory', data: data });

    worker.on('message', (result) => {
      res.json({ success: true, start, end, data: result });
      worker.terminate();
    });

    worker.on('error', (error) => {
      console.error(error);
      res.status(500).send("Error al procesar el histórico de temperatura");
      worker.terminate();
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener el histórico de temperatura");
  }
};

// Calcular el modelo binomial delegando el cálculo al worker
exports.getTemperatureBinomial = async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold || '37.5');
    const days = parseInt(req.query.days || '1', 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const readings = await Sensor.find({
      sensorType: 'temperatura',
      'value.temp_corp': { $exists: true },
      timestamp: { $gte: since }
    });

    const temps = readings.map(r => r.value.temp_corp).filter(v => typeof v === 'number');

    if (temps.length === 0) {
      return res.json({ success: true, message: 'No hay datos', data: [] });
    }

    const worker = new Worker('./workers/worker.js');
    worker.postMessage({ type: 'temperatureBinomial', data: { temps, threshold } });

    worker.on('message', (result) => {
      res.json({ success: true, days, ...result });
      worker.terminate();
    });

    worker.on('error', (error) => {
      console.error(error);
      res.status(500).send("Error al procesar el modelo binomial");
      worker.terminate();
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener modelo binomial");
  }
};
