const mqtt = require('mqtt');
const WebSocket = require('ws');
const { saveSensorData } = require('../controllers/sensorController');

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

client.on('message', async (topic, message) => {
    try {
        const rawMessage = message.toString();
        console.log(`Mensaje recibido en ${topic}: ${rawMessage}`);

        // Parsear el mensaje JSON
        const data = JSON.parse(rawMessage);

        console.log(`Datos procesados en ${topic}:`, data);

        // Obtener la instancia de WebSocket
        const wss = require('../app').get('wss');

        // Procesar mensajes según el tema
        if (topic === topics.temperatura) {
            const tempCorp = data.temp_corp;
            console.log('Enviando temperatura corporal por WebSocket:', tempCorp);

            // Guardar en la base de datos
            await saveSensorData('temperatura', tempCorp);

            broadcast(wss, { type: 'temperatura', data: tempCorp });
        } else if (topic === topics.giroscopio) {
            console.log('Procesando datos del giroscopio:', data);

            const isEncorvado = checkPosture(data.aceleracion);
            const postura = isEncorvado ? 'encorvado' : 'correcta';

            // Guardar estado de la postura en la base de datos
            await saveSensorData('giroscopio', postura === 'encorvado' ? 1 : 0);

            console.log(`Postura detectada: ${postura}`);
            broadcast(wss, { type: 'postura', data: postura });
        } else if (topic === topics.gps) {
            console.log('Enviando datos GPS:', data);

            // Guardar coordenadas GPS como un string en la base de datos
            const gpsData = `${data.latitud},${data.longitud}`;
            await saveSensorData('gps', gpsData);

            broadcast(wss, { type: 'gps', data });
        } else if (topic === topics.ritmoCardiaco) {
            const ritmo = data.ritmo;
            console.log('Enviando ritmo cardiaco:', ritmo);

            // Guardar ritmo cardiaco en la base de datos
            await saveSensorData('ritmoCardiaco', ritmo);

            broadcast(wss, { type: 'ritmoCardiaco', data: ritmo });
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

// Función para determinar si el usuario está encorvado
function checkPosture(aceleracion) {
    const posturaCorrecta = {
        x: 2,
        y: 9,
        z: -3,
    };

    const rangoAceptable = {
        x: 2, // ±2 en la dirección x
        y: 2, // ±2 en la dirección y
        z: 2, // ±2 en la dirección z
    };

    const dentroDeRango = (valor, objetivo, rango) =>
        Math.abs(valor - objetivo) <= rango;

    const esCorrecta =
        dentroDeRango(aceleracion.x, posturaCorrecta.x, rangoAceptable.x) &&
        dentroDeRango(aceleracion.y, posturaCorrecta.y, rangoAceptable.y) &&
        dentroDeRango(aceleracion.z, posturaCorrecta.z, rangoAceptable.z);

    return !esCorrecta; // Devuelve true si no está en rango (encorvado)
}

module.exports = client;
