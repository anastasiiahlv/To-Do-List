const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let todoList = []; 

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.send(JSON.stringify(todoList));

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        try {
            const { action, taskData } = JSON.parse(message);
            console.log(`Parsed action: ${action}, data: ${JSON.stringify(taskData)}`);

            switch (action) {
                case 'add':
                    todoList.push(taskData);
                    console.log(`Adding new task: ${taskData.text}`);
                    break;
                case 'update':
                    const { id, text, disabled } = taskData;
                    if (text !== undefined) {
                        todoList[id].text = text;
                        console.log(`Updating task: ${id}, new text: ${text}`);
                    }
                    if (disabled !== undefined) {
                        todoList[id].disabled = disabled;
                        console.log(`Updating task state: ${id}, checked: ${disabled}`);
                    }
                    break;
                case 'deleteAll':
                    todoList = [];
                    console.log(`Deleting all tasks`);
                    break;
                case 'reorder':
                    todoList = taskData; 
                    console.log(`Reordering tasks: ${JSON.stringify(taskData)}`);
                    break;
                default:
                    console.error(`Unknown action: ${action}`);
                    return;
            }

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(todoList));
                }
            });
        } catch (e) {
            console.error("Failed to parse message from client:", e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
