import React from 'react';
import TodoItem from './TodoItem';
import './TodoList.css';

export default function TodoList({ todos, editingTodo, onToggle, onEdit, onUpdate, onDelete, onCancelEdit }) {
  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isEditing={editingTodo?.id === todo.id}
          onToggle={() => onToggle(todo.id, todo.completed)}
          onEdit={() => onEdit(todo)}
          onUpdate={(data) => onUpdate(todo.id, data)}
          onDelete={() => onDelete(todo.id)}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </div>
  );
}
