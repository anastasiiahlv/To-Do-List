const socket = new WebSocket('ws://localhost:8080');

function sendTask(action, taskData) {
    const message = { action, taskData };
    socket.send(JSON.stringify(message));
}

socket.addEventListener('message', function (event) {
  const updatedTodo = JSON.parse(event.data);
  todo = updatedTodo; 
  displayTasks(); 
});

socket.addEventListener('error', function (event) {
    console.error("WebSocket error:", event);
});


let todo = JSON.parse(localStorage.getItem("todo")) || [];
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const addButton = document.querySelector(".btn");
const deleteButton = document.getElementById("deleteButton");

document.addEventListener("DOMContentLoaded", function () {
    addButton.addEventListener("click", addTask);
    todoInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addTask();
        }
    });
    deleteButton.addEventListener("click", deleteAllTasks);
    displayTasks();

    const sortable = new Sortable(todoList, {
        animation: 150,
        onEnd: function () {
            updateTodoOrder();
        }
    });
});

function addTask() {
    const newTask = todoInput.value.trim();
    if (newTask !== "") {
        const task = { text: newTask, disabled: false };
        todo.push(task);
        saveToLocalStorage();
        sendTask('add', task); 
        todoInput.value = "";
        displayTasks();
    }
}

function displayTasks() {
    todoList.innerHTML = "";
    todo.forEach((item, index) => {
        const p = document.createElement("div");
        p.classList.add("todo-item");
        p.innerHTML = `
            <div class="todo-container">
                <input type="checkbox" class="todo-checkbox" id="input-${index}" ${item.disabled ? "checked" : ""}>
                <p id="todo-${index}" class="${item.disabled ? "disabled" : ""}" onclick="editTask(${index})">${item.text}</p>
            </div>
        `;
        p.querySelector(".todo-checkbox").addEventListener("change", () => toggleTask(index));
        todoList.appendChild(p);
    });
    todoCount.textContent = todo.length;
}

function editTask(index) {
    const todoItem = document.getElementById(`todo-${index}`);
    const existingText = todo[index].text;
    const inputElement = document.createElement("input");

    inputElement.value = existingText;
    todoItem.replaceWith(inputElement);
    inputElement.focus();

    inputElement.addEventListener("blur", function () {
        const updatedText = inputElement.value.trim();
        if (updatedText) {
            todo[index].text = updatedText;
            saveToLocalStorage();
            sendTask('update', { id: index, text: updatedText }); 
        }
        displayTasks();
    });
}

function toggleTask(index) {
    todo[index].disabled = !todo[index].disabled;
    saveToLocalStorage();
    sendTask('update', { id: index, disabled: todo[index].disabled }); 
    displayTasks();
}

function deleteAllTasks() {
    todo = [];
    saveToLocalStorage();
    sendTask('deleteAll', {}); 
    displayTasks();
}

function saveToLocalStorage() {
    localStorage.setItem("todo", JSON.stringify(todo));
}

function updateTodoOrder() {
  const newOrder = [];
  document.querySelectorAll('.todo-item').forEach((item, index) => {
      const text = item.querySelector('p').textContent;
      const isChecked = item.querySelector('.todo-checkbox').checked;
      newOrder.push({ text, disabled: isChecked });
  });
  todo = newOrder;
  saveToLocalStorage();
  sendTask('reorder', newOrder); 
}
