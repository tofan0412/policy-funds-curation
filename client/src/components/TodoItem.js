import React from 'react';
import TodoForm from './TodoForm';
import './TodoItem.css';

const PRIORITY_MAP = {
  high: { label: '높음', color: '#e53e3e' },
  medium: { label: '보통', color: '#dd6b20' },
  low: { label: '낮음', color: '#38a169' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${y}.${m}.${d}`;
}

function getDueDateStatus(due_date, completed) {
  if (!due_date || completed) return null;
  const today = new Date().toISOString().split('T')[0];
  if (due_date < today) return 'overdue';
  if (due_date === today) return 'today';
  const diff = Math.ceil((new Date(due_date) - new Date(today)) / 86400000);
  if (diff <= 3) return 'soon';
  return 'normal';
}

export default function TodoItem({ todo, isEditing, onToggle, onEdit, onUpdate, onDelete, onCancelEdit }) {
  const priority = PRIORITY_MAP[todo.priority] || PRIORITY_MAP.medium;
  const dueDateStatus = getDueDateStatus(todo.due_date, todo.completed);

  if (isEditing) {
    return (
      <div className="todo-item todo-item--editing">
        <TodoForm
          initialData={todo}
          onSubmit={onUpdate}
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'todo-item--done' : ''}`}>
      <button
        className={`todo-check ${todo.completed ? 'checked' : ''}`}
        onClick={onToggle}
        aria-label={todo.completed ? '완료 취소' : '완료'}
      >
        {todo.completed && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className="todo-content">
        <div className="todo-top">
          <span className="todo-title">{todo.title}</span>
          <span
            className="todo-priority"
            style={{ color: priority.color, background: `${priority.color}18` }}
          >
            {priority.label}
          </span>
        </div>

        {todo.description && (
          <p className="todo-desc">{todo.description}</p>
        )}

        <div className="todo-meta">
          {todo.due_date && (
            <span className={`todo-due todo-due--${dueDateStatus}`}>
              {dueDateStatus === 'overdue' && '⚠ '}
              {dueDateStatus === 'today' && '오늘 · '}
              마감 {formatDate(todo.due_date)}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button className="action-btn" onClick={onEdit} aria-label="수정">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M11.5 1.5L13.5 3.5L5 12H3V10L11.5 1.5Z" stroke="#999" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="action-btn action-btn--delete" onClick={onDelete} aria-label="삭제">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 4H13M5 4V2.5C5 2.22 5.22 2 5.5 2H9.5C9.78 2 10 2.22 10 2.5V4M6 7V11M9 7V11M3 4L3.5 12.5C3.5 12.78 3.72 13 4 13H11C11.28 13 11.5 12.78 11.5 12.5L12 4" stroke="#999" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
