import React from 'react';
import './FilterBar.css';

export default function FilterBar({ filter, onChange }) {
  const set = (field) => (e) => onChange(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="filter-bar">
      <select className="filter-select" value={filter.completed} onChange={set('completed')}>
        <option value="">전체</option>
        <option value="false">미완료</option>
        <option value="true">완료</option>
      </select>

      <select className="filter-select" value={filter.priority} onChange={set('priority')}>
        <option value="">모든 우선순위</option>
        <option value="high">높음</option>
        <option value="medium">보통</option>
        <option value="low">낮음</option>
      </select>

      <select className="filter-select" value={filter.sort} onChange={set('sort')}>
        <option value="created_at">최신순</option>
        <option value="due_date">마감일순</option>
        <option value="priority">우선순위순</option>
      </select>
    </div>
  );
}
