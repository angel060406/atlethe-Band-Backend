const mqtt = require('mqtt');
const { processSensorData } = require('../controllers/sensorController');

// Configuración del broker MQTT
const brokerUrl = 'mqtt://broker.emqx.io';
const topic = 'testtopic/test';

const options = {
    port: 1883,
};

// Conectar al broker MQTT
const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
    console.log('Conectado al broker MQTT');
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Error al suscribirse al tema', err);
        } else {
            console.log(`Suscrito al tema: ${topic}`);
        }
    });
});

client.on('reconnect', () => {
    console.log('Reconectando al broker MQTT...');
});

client.on('error', (error) => {
    console.error('Error al conectar con el broker MQTT:', error);
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`Mensaje recibido en ${topic}:`, data);
        processSensorData(data);
    } catch (error) {
        console.error('Error al procesar el mensaje JSON:', error);
    }
});

module.exports = client;
