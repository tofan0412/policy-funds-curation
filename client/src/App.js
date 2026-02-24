import React, { useState, useEffect, useCallback } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterBar from './components/FilterBar';
import './App.css';

const API = '/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ priority: '', completed: '', sort: 'created_at' });
  const [editingTodo, setEditingTodo] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.priority) params.set('priority', filter.priority);
    if (filter.completed !== '') params.set('completed', filter.completed);
    if (filter.sort) params.set('sort', filter.sort);
    const res = await fetch(`${API}?${params}`);
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  // 마감일 알림 체크
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    todos.forEach(todo => {
      if (!todo.completed && todo.due_date && todo.due_date <= today) {
        if (Notification.permission === 'granted') {
          new Notification(`마감 알림: ${todo.title}`, {
            body: todo.due_date === today ? '오늘이 마감일입니다!' : '마감일이 지났습니다!',
          });
        }
      }
    });
  }, [todos]);

  const handleCreate = async (data) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) { await fetchTodos(); setShowForm(false); }
  };

  const handleUpdate = async (id, data) => {
    const res = await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) { await fetchTodos(); setEditingTodo(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    await fetchTodos();
  };

  const handleToggle = (id, completed) => handleUpdate(id, { completed: !completed });

  const stats = {
    total: todos.length,
    done: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => {
      if (!t.due_date || t.completed) return false;
      return t.due_date < new Date().toISOString().split('T')[0];
    }).length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">TODO</h1>
          <div className="header-stats">
            <span className="stat">{stats.done}/{stats.total} 완료</span>
            {stats.overdue > 0 && (
              <span className="stat overdue">{stats.overdue}개 기한 초과</span>
            )}
          </div>
          <button className="btn-add" onClick={() => { setShowForm(true); setEditingTodo(null); }}>
            + 새 할 일
          </button>
        </div>
      </header>

      <main className="app-main">
        {(showForm && !editingTodo) && (
          <TodoForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

        <FilterBar filter={filter} onChange={setFilter} />

        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : todos.length === 0 ? (
          <div className="empty">
            <p>할 일이 없습니다.</p>
            <button className="btn-link" onClick={() => setShowForm(true)}>새 할 일 추가하기</button>
          </div>
        ) : (
          <TodoList
            todos={todos}
            editingTodo={editingTodo}
            onToggle={handleToggle}
            onEdit={setEditingTodo}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onCancelEdit={() => setEditingTodo(null)}
          />
        )}
      </main>
    </div>
  );
}
