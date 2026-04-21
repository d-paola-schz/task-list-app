async function loadTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();

  const list = document.getElementById('taskList');
  list.innerHTML = '';

  tasks.forEach(task => {
    const div = document.createElement('div');

    div.className = `card p-2 mb-2 ${task.completed ? 'bg-light text-muted' : ''}`;

    // I had some help investigating, I wanted it to look prettieeeer (I made most myself tho, only help with bootstrap and some conditions)
    div.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
        <div style="width: 100%">

        <h5 style="${task.completed ? 'text-decoration: line-through' : ''}">${task.title}</h5>

        <p class="mb-1">${task.description || 'No description'}</p>

        <div class="mb-2">

            <span class="badge bg-${task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}">
            ${task.priority || 'Low'}
            </span>

            <span class="badge bg-secondary ms-1">
            ${task.completed ? 'Completed' : 'Pending'}
            </span>

        </div>

        <small class="text-muted d-block">
            Created: ${new Date(task.created_at).toLocaleString()}
        </small>

        <small class="text-muted d-block">
            Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
        </small>

        </div>

        <div class="ms-3">

        <button class="btn btn-success btn-sm mb-1" onclick="toggleTask(${task.id})">
            ${task.completed ? 'Undo' : 'Done'}
        </button>

        <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
            Delete
        </button>

        </div>

    </div>
    `;

    list.appendChild(div);
  });
}

async function createTask() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const priority = document.getElementById('priority').value;
  const due_date = document.getElementById('due_date').value;

  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description,
      priority,
      due_date: due_date || null
    })
  });

  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('due_date').value = '';

  loadTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  });

  loadTasks();
}

async function toggleTask(id) {
  await fetch(`/api/tasks/${id}/toggle`, {
    method: 'PUT'
  });

  loadTasks();
}

loadTasks();