const BASE = "http://127.0.0.1:8000";

export async function fetchTodos() {
  const res = await fetch(`${BASE}/todos`);
  return await res.json();
}

export async function createTodo(todo) {
  const res = await fetch(`${BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo)
  });
  return await res.json();
}

export async function updateTodo(id, data) {
  await fetch(`${BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function deleteTodo(id) {
  await fetch(`${BASE}/todos/${id}`, {
    method: "DELETE"
  });
}