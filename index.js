const app = require('./app');
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer(app);

// Inicializar WebSocket en el mismo servidor HTTP
const wss = new WebSocket.Server({ server });

app.set('wss', wss);

wss.on('connection', (ws) => {
    console.log('Cliente conectado a WebSocket');

    ws.on('close', () => {
        console.log('Cliente desconectado de WebSocket');
    });

    ws.on('error', (error) => {
        console.error('Error en WebSocket:', error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`SERVER is running at port: ${PORT}`);
});
