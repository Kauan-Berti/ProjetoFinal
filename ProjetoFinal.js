document.addEventListener("DOMContentLoaded", () => {
    const taskModal = document.getElementById("taskModal");
    const optionsModal = document.getElementById("optionsModal");
    const closeModal = document.getElementsByClassName("close");
    const cancelButton = document.getElementById("cancelButton");

    
    window.openTaskModal = function () {
        document.getElementById("taskForm").reset();
        taskModal.style.display = "block";
    }

    
    loadTasksFromLocalStorage();

    
    for (let i = 0; i < closeModal.length; i++) {
        closeModal[i].onclick = function () {
            taskModal.style.display = "none";
            optionsModal.style.display = "none";
        }
    }

    
    cancelButton.onclick = function () {
        document.getElementById("taskForm").reset();
        taskModal.style.display = "none";
    }

    
    window.onclick = function (event) {
        if (event.target === taskModal) {
            taskModal.style.display = "none";
        } else if (event.target === optionsModal) {
            optionsModal.style.display = "none";
        }
    }

    
    document.getElementById("taskForm").onsubmit = function (event) {
        event.preventDefault();
        const taskData = new FormData(this);
        const taskId = document.getElementById("taskId").value;
        const taskStatus = taskData.get("taskStatus");

        let columnId;
        if (taskStatus === "Pendente") {
            columnId = "pending-tasks";
        } else if (taskStatus === "Em Andamento") {
            columnId = "in-progress-tasks";
        } else if (taskStatus === "Concluída") {
            columnId = "completed-tasks";
        }

        const column = document.getElementById(columnId);
        if (column) {
            const newTask = createTask(taskData);
            column.appendChild(newTask);

            
            saveTaskToLocalStorage(newTask.id, taskData);
        } else {
            console.error("Column not found:", columnId);
        }

        this.reset();
        taskModal.style.display = "none";
    }
    
    function createTask(taskData) {
        const taskId = "task-" + Date.now();
        const task = document.createElement("div");
        task.id = taskId;
        task.className = `task ${getPriorityClass(taskData.get("taskPriority"))}`;
        task.draggable = true;
        task.ondragstart = drag;
        task.innerHTML = `
        <h3>${taskData.get("taskTitle")}</h3>
        <p>${taskData.get("taskDescription")}</p>
        <p>Prioridade: ${taskData.get("taskPriority")}</p>
        <p>Responsável: ${taskData.get("taskResponsable")}</p>
        <p>Data: ${taskData.get("taskDueDate")}</p>
    `;
        return task;
    }

    
    function saveTaskToLocalStorage(taskId, taskData) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({
            id: taskId,
            title: taskData.get("taskTitle"),
            description: taskData.get("taskDescription"),
            priority: taskData.get("taskPriority"),
            responsable: taskData.get("taskResponsable"),
            dueDate: taskData.get("taskDueDate"),
            status: taskData.get("taskStatus")
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    
    function getPriorityClass(priority) {
        if (priority === "Alta") return "high-priority";
        if (priority === "Média") return "medium-priority";
        if (priority === "Baixa") return "low-priority";
        return "";
    }

    
    const columns = document.getElementsByClassName("task-list");
    for (const column of columns) {
        column.ondragover = allowDrop;
        column.ondrop = drop;
    }

   
    function allowDrop(event) {
        event.preventDefault();
    }

    
    function drag(event) {
        event.dataTransfer.setData("text", event.target.id);
    }

    
    function drop(event) {
        event.preventDefault();
        const data = event.dataTransfer.getData("text");
        event.target.appendChild(document.getElementById(data));
    }

   
    window.showOptions = function (columnId) {
        const taskList = document.getElementById(`${columnId}-tasks`);
        const tasks = taskList.getElementsByClassName("task");

        const optionsContainer = document.getElementById("taskOptions");
        optionsContainer.innerHTML = "";

        for (const task of tasks) {
            const taskTitle = task.getElementsByTagName("h3")[0].innerText;
            const optionDiv = document.createElement("div");
            optionDiv.className = "task-options";
            optionDiv.innerHTML = `
            <span>${taskTitle}</span>
            <button onclick="editTask('${task.id}')">Editar</button>
            <button onclick="deleteTask('${task.id}')">Excluir</button>
        `;
            optionsContainer.appendChild(optionDiv);
        }

        optionsModal.style.display = "block";
    }

   
    window.editTask = function (taskId) {
        const taskElement = document.getElementById(taskId);
        const taskTitle = taskElement.getElementsByTagName("h3")[0].innerText;
        const taskDescription = taskElement.getElementsByTagName("p")[0].innerText;
        const taskPriority = taskElement.getElementsByTagName("p")[1].innerText.split(": ")[1];
        const taskResponsable = taskElement.getElementsByTagName("p")[2].innerText.split(": ")[1];
        const taskDueDate = taskElement.getElementsByTagName("p")[3].innerText.split(": ")[1];

        document.getElementById("taskId").value = taskId;
        document.getElementById("taskTitle").value = taskTitle;
        document.getElementById("taskDescription").value = taskDescription;
        document.getElementById("taskPriority").value = taskPriority;
        document.getElementById("taskResponsable").value = taskResponsable;
        document.getElementById("taskDueDate").value = taskDueDate;

        taskModal.style.display = "block";
        optionsModal.style.display = "none";
    }

    
    window.deleteTask = function (taskId) {
        const taskElement = document.getElementById(taskId);
        taskElement.parentNode.removeChild(taskElement);

        
        deleteTaskFromLocalStorage(taskId);

        optionsModal.style.display = "none";
    }

   
    function updateTask(taskId, taskData) {
        const taskElement = document.getElementById(taskId);
        taskElement.className = `task ${getPriorityClass(taskData.get("taskPriority"))}`;
        taskElement.innerHTML = `
        <h3>${taskData.get("taskTitle")}</h3>
        <p>${taskData.get("taskDescription")}</p>
        <p>Prioridade: ${taskData.get("taskPriority")}</p>
        <p>Responsável: ${taskData.get("taskResponsable")}</p>
        <p>Data: ${taskData.get("taskDueDate")}</p>
    `;

       
        updateTaskInLocalStorage(taskId, taskData);
    }

    function loadTasksFromLocalStorage() {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        tasks.forEach(task => {
            const newTask = createTaskElement(task);
            const columnId = `${task.status.toLowerCase().replace(" ", "-")}-tasks`;
            const column = document.getElementById(columnId);
            if (column) {
                column.appendChild(newTask);
            }
        });
    }

    function createTaskElement(task) {
        const taskElement = document.createElement("div");
        taskElement.id = task.id;
        taskElement.className = `task ${getPriorityClass(task.priority)}`;
        taskElement.draggable = true;
        taskElement.ondragstart = drag;
        taskElement.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Prioridade: ${task.priority}</p>
        <p>Responsável: ${task.responsable}</p>
        <p>Data: ${task.dueDate}</p>
    `;
        return taskElement;
    }
});
