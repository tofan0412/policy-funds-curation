import React, { useState, useEffect } from 'react';
import './TodoForm.css';

const PRIORITY_OPTIONS = [
  { value: 'high', label: '높음', color: '#e53e3e' },
  { value: 'medium', label: '보통', color: '#dd6b20' },
  { value: 'low', label: '낮음', color: '#38a169' },
];

export default function TodoForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        due_date: initialData.due_date || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...form, due_date: form.due_date || null });
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <input
          className="form-input"
          type="text"
          placeholder="할 일을 입력하세요"
          value={form.title}
          onChange={set('title')}
          autoFocus
          required
        />
      </div>

      <div className="form-field">
        <textarea
          className="form-textarea"
          placeholder="설명 (선택)"
          value={form.description}
          onChange={set('description')}
          rows={2}
        />
      </div>

      <div className="form-row">
        <div className="form-field form-field--half">
          <label className="form-label">우선순위</label>
          <div className="priority-buttons">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`priority-btn ${form.priority === opt.value ? 'active' : ''}`}
                style={{ '--color': opt.color }}
                onClick={() => setForm(f => ({ ...f, priority: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field form-field--half">
          <label className="form-label">마감일</label>
          <input
            className="form-input"
            type="date"
            value={form.due_date}
            onChange={set('due_date')}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>취소</button>
        <button type="submit" className="btn-submit">
          {initialData ? '수정 완료' : '추가'}
        </button>
      </div>
    </form>
  );
}
