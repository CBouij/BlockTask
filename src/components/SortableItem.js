import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ id, task, onToggle, onStatusChange, isDragging }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo':
        return <span className="badge bg-danger">À faire</span>;
      case 'progress':
        return <span className="badge bg-warning">En cours</span>;
      case 'done':
        return <span className="badge bg-success">Terminé</span>;
      default:
        return null;
    }
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleStatusChange = (newStatus) => {
    setIsDropdownOpen(false);
    if (task.status !== newStatus) {
      onStatusChange(id, newStatus);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${task.status === 'done' ? 'completed' : ''} ${task.status === 'progress' ? 'in-progress' : ''}`}
    >
      <div className="task-content">{task.content}</div>
      <div className="task-status mb-2 dropdown">
        <div onClick={handleStatusClick} style={{ cursor: 'pointer' }}>
          {getStatusLabel(task.status)}
        </div>
        {isDropdownOpen && (
          <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 1000 }}>
            <button 
              className="dropdown-item" 
              onClick={() => handleStatusChange('todo')}
            >
              À faire
            </button>
            <button 
              className="dropdown-item" 
              onClick={() => handleStatusChange('progress')}
            >
              En cours
            </button>
            <button 
              className="dropdown-item" 
              onClick={() => handleStatusChange('done')}
            >
              Terminé
            </button>
          </div>
        )}
      </div>
      <div className="task-actions">
        <button
          className={`btn btn-sm ${task.completed ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => onToggle(task.id)}
        >
          {task.completed ? '✓' : '○'}
        </button>
      </div>
    </div>
  );
}