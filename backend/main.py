from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Todo(BaseModel):
    id: str | None = None
    title: str
    priority: str
    due_date: str | None = None
    status: str

todos = []

@app.get("/todos")
async def get_todos():
    return todos

@app.post("/todos")
async def add_todo(todo: Todo):
    todo_dict = todo.dict()
    todo_dict["id"] = str(uuid4())
    todos.append(todo_dict)
    return todo_dict

# 👇 ADD YOUR CODE HERE (THIS IS THE PLACE)
@app.put("/todos/{todo_id}")
async def update_todo(todo_id: str, updated: dict):
    for todo in todos:
        if todo["id"] == todo_id:
            todo.update(updated)
            return todo
    return {"error": "Todo not found"}

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    global todos
    todos = [t for t in todos if t["id"] != todo_id]
    return {"message": "Deleted"}