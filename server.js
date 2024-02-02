const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let tasks = [];

wss.on('connection', (ws) => {
  // Notificar por consola cuando un usuario se conecta
  console.log('Usuario conectado');

  // Enviar la lista de tareas actual a un nuevo cliente
  ws.send(JSON.stringify(tasks));

  // Evento cuando se recibe un mensaje desde un cliente
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // Manejar diferentes tipos de mensajes (agregar, editar, eliminar)
    switch (data.type) {
      case 'add':
        tasks.push({ id: tasks.length + 1, text: data.text });
        break;
      case 'edit':
        const taskToEdit = tasks.find((task) => task.id === data.id);
        if (taskToEdit) taskToEdit.text = data.text;
        break;
      case 'delete':
        tasks = tasks.filter((task) => task.id !== data.id);
        break;
      default:
        break;
    }

    // Enviar la lista actualizada a todos los clientes
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(tasks));
      }
    });
  });

  // Evento cuando un usuario se desconecta
  ws.on('close', () => {
    console.log('Usuario desconectado');
  });
});

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

// Iniciar el servidor en el puerto 3000
server.listen(3000, () => {
  console.log('Servidor WebSocket iniciado en http://localhost:3000');
});
