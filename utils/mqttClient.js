const mqtt = require('mqtt');
const WebSocket = require('ws');
const { processSensorData } = require('../controllers/sensorController');

const brokerUrl = 'mqtt://broker.emqx.io';
const topic = 'testtopic/test';

const options = {
    port: 1883,
};

// Conexion al broker MQTT
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

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`Mensaje recibido en ${topic}:`, data);

        // Obtiene la instancia de ws
        const wss = require('../app').get('wss');

        // Extraer la temperatura corporal y enviarla al front
        const { "temperatura del corporal": objectTemp } = data;
        if (objectTemp !== undefined) {
            console.log('Enviando temperatura corporal por WebSocket:', objectTemp);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ temperature: objectTemp }));
                }
            });
        }

        processSensorData(data);
    } catch (error) {
        console.error('Error al procesar el mensaje JSON:', error);
    }
});

client.on('reconnect', () => {
    console.log('Reconectando al broker MQTT...');
});

client.on('error', (error) => {
    console.error('Error al conectar con el broker MQTT:', error);
});

module.exports = client;
