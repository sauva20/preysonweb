import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2 } from 'lucide-react';

export function SortableBlock({ id, onRemove, onEdit, children }) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`wysiwyg-block ${isDragging ? 'dragging' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The actual live component */}
      <div className="wysiwyg-content">
        {children}
      </div>

      {/* Editor Overlay */}
      {(isHovered || isDragging) && (
        <div className="wysiwyg-overlay">
          <div className="wysiwyg-controls">
            <div className="control-btn drag-handle" {...attributes} {...listeners} title="Drag to reorder">
              <GripVertical size={20} />
            </div>
            <button className="control-btn edit-btn" onClick={() => onEdit(id)} title="Edit Configuration">
              <Edit2 size={20} />
            </button>
            <button className="control-btn delete-btn" onClick={() => onRemove(id)} title="Remove Block">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
