"use client";

import { useState } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

type TodoPageProps = {
  initialTodos: Todo[];
};

export function TodoPage({ initialTodos }: TodoPageProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddTodo(event: React.FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        console.error("Failed to create todo");
        return;
      }

      const created: Todo = await response.json();
      setTodos((current) => [created, ...current]);
      setNewTitle("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleTodo(id: number) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/todos/${id}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) {
        console.error("Failed to toggle todo");
        return;
      }

      const updated: Todo = await response.json();
      setTodos((current) =>
        current.map((todo) => (todo.id === id ? updated : todo)),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTodo(id: number) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        console.error("Failed to delete todo");
        return;
      }

      setTodos((current) => current.filter((todo) => todo.id !== id));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="todo-container">
      <section className="todo-card">
        <h1 className="todo-title">Todo App</h1>

        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Add a new task..."
            className="todo-input"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="todo-add-button"
            disabled={isSubmitting || !newTitle.trim()}
          >
            Add
          </button>
        </form>

        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <button
                type="button"
                className={`todo-toggle ${todo.completed ? "completed" : ""}`}
                onClick={() => handleToggleTodo(todo.id)}
                disabled={isSubmitting}
              >
                {todo.completed ? "✓" : ""}
              </button>
              <span
                className={`todo-text ${todo.completed ? "completed" : ""}`}
              >
                {todo.title}
              </span>
              <button
                type="button"
                className="todo-delete"
                onClick={() => handleDeleteTodo(todo.id)}
                disabled={isSubmitting}
              >
                ✕
              </button>
            </li>
          ))}

          {todos.length === 0 && (
            <li className="todo-empty">No todos yet. Add your first task!</li>
          )}
        </ul>
      </section>
    </main>
  );
}

