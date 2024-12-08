const Sensor = require('../models/sensor');
const mongoose = require('mongoose');

// Función auxiliar para estadísticas
function calcStats(values) {
    values.sort((a,b)=>a-b);
    const n = values.length;
    if(n===0) return null;

    const mean = values.reduce((acc,v)=>acc+v,0)/n;
    const median = n%2!==0 ? values[Math.floor(n/2)] : (values[Math.floor(n/2)-1]+values[Math.floor(n/2)])/2;

    // Moda
    const freq = {};
    let maxFreq = 0;
    let mode = [];
    for(const val of values){
        freq[val] = (freq[val]||0)+1;
        if(freq[val]>maxFreq) maxFreq=freq[val];
    }
    for(const k in freq){
        if(freq[k]===maxFreq) mode.push(Number(k));
    }
    mode = (mode.length===values.length) ? 'No hay moda' : mode.join(', ');

    const diffs = values.map(v=>(v-mean)**2);
    const std = Math.sqrt(diffs.reduce((a,b)=>a+b,0)/n);

    const min = values[0];
    const max = values[n-1];

    return {mean, median, mode, std, min, max};
}

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

// Procesar datos del sensor recibidos por MQTT
exports.processSensorData = (data) => {
    try {
        console.log('Procesando datos del sensor:');
        console.log('Datos recibidos:', data);
    } catch (error) {
        console.error('Error al procesar la lectura del sensor:', error);
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

// Obtener resumen diario
exports.getTemperatureSummary = async (req, res) => {
    try {
        const days = parseInt(req.query.days||'1',10);
        const since = new Date(Date.now()-days*24*60*60*1000);

        const readings = await Sensor.find({
            sensorType: 'temperatura',
            'value.temp_corp': {$exists:true},
            timestamp: {$gte: since}
        }).sort({timestamp:1});

        const temps = readings.map(r=>r.value.temp_corp).filter(v=>typeof v==='number');

        const stats = calcStats(temps);
        if(!stats) {
            return res.status(200).json({success:true, message:'No hay datos en el periodo especificado', data:[]});
        }

        res.json({success:true, days, stats});
    } catch(error){
        console.error(error);
        res.status(500).send("Error al obtener el resumen de temperatura");
    }
};

// Historial por rango de fechas
exports.getTemperatureHistory = async (req, res) => {
    try {
        const {start, end} = req.query;
        if(!start || !end){
            return res.status(400).json({success:false,message:'start y end son requeridos en formato YYYY-MM-DD'});
        }
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23,59,59,999);

        const readings = await Sensor.find({
            sensorType:'temperatura',
            'value.temp_corp':{$exists:true},
            timestamp: {$gte:startDate, $lte:endDate}
        }).sort({timestamp:1});

        const data = readings.map(r=>({
            timestamp:r.timestamp,
            temp_corp:r.value.temp_corp
        }));

        res.json({success:true, start, end, data});
    } catch(error){
        console.error(error);
        res.status(500).send("Error al obtener el historial de temperatura");
    }
};

// Modelo binomial
// Calculamos la probabilidad de k éxitos en n muestras según la binomial.
exports.getTemperatureBinomial = async (req,res)=>{
    try{
        const threshold = parseFloat(req.query.threshold||'37.5');
        const days = parseInt(req.query.days||'1',10);
        const since = new Date(Date.now()-days*24*60*60*1000);

        const readings = await Sensor.find({
            sensorType:'temperatura',
            'value.temp_corp':{$exists:true},
            timestamp: {$gte: since}
        });

        const temps = readings.map(r=>r.value.temp_corp).filter(v=>typeof v==='number');

        const n = temps.length;
        if(n===0){
            return res.json({success:true, message:'No hay datos', data:[]});
        }

        // Calculamos p = frecuencia de "éxitos"
        const successes = temps.filter(t=>t>threshold).length;
        const p = successes/n;

        // Calculamos la distribución binomial para k=0 hasta k=n
        // binomial(k;n,p) = C(n,k) * p^k * (1-p)^(n-k)
        const factorial = (x)=> (x<=1)?1:Array.from({length:x},(_,i)=>i+1).reduce((a,b)=>a*b,1);
        const combination = (n,k)=> factorial(n)/(factorial(k)*factorial(n-k));

        const distribution = [];
        for(let k=0; k<=n; k++){
            const prob = combination(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);
            distribution.push({k,prob});
        }

        res.json({success:true,days,threshold,n,p,distribution});
    }catch(error){
        console.error(error);
        res.status(500).send("Error al obtener modelo binomial");
    }
};
