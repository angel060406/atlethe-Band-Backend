const mqtt = require('mqtt');
const WebSocket = require('ws');

const brokerUrl = 'mqtt://broker.emqx.io';

// Temas
const topics = {
    temperatura: 'athleteBand/temperatura',
    giroscopio: 'athleteBand/Giroscopio',
    gps: 'athleteBand/Gps',
    ritmoCardiaco: 'athleteBand/RitmoC',
};

const options = {
    port: 1883,
};

// Conectar al broker MQTT
const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
    console.log('Conectado al broker MQTT');
    Object.values(topics).forEach(topic => {
        client.subscribe(topic, (err) => {
            if (err) {
                console.error(`Error al suscribirse al tema ${topic}:`, err);
            } else {
                console.log(`Suscrito al tema: ${topic}`);
            }
        });
    });
});

client.on('message', (topic, message) => {
    try {
        const rawMessage = message.toString();
        console.log(`Mensaje recibido en ${topic}: ${rawMessage}`);

        // Parsear el mensaje JSON
        const data = JSON.parse(rawMessage);

        console.log(`Datos procesados en ${topic}:`, data);

        // Obtener la instancia de WebSocket
        const wss = require('../app').get('wss');

        // Enviar datos por WebSocket según el tema
        if (topic === topics.temperatura) {
            console.log('Enviando temperatura corporal por WebSocket:', data.temp_corp);
            broadcast(wss, { type: 'temperatura', data: data.temp_corp });
        } else if (topic === topics.giroscopio) {
            console.log('Enviando datos del giroscopio:', data);
            broadcast(wss, { type: 'giroscopio', data });
        } else if (topic === topics.gps) {
            console.log('Enviando datos GPS:', data);
            broadcast(wss, { type: 'gps', data });
        } else if (topic === topics.ritmoCardiaco) {
            console.log('Enviando ritmo cardiaco:', data);
            broadcast(wss, { type: 'ritmoCardiaco', data });
        }
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

// Función para enviar datos a todos los clientes conectados
function broadcast(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

module.exports = client;
