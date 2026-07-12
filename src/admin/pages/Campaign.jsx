import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlusCircle, Save, X } from 'lucide-react';
import { SortableBlock } from '../components/SortableBlock';
import './Campaign.css';

// Import Storefront Components for WYSIWYG
import Hero from '../../components/Hero';
import ProductGrid from '../../components/ProductGrid';
import Banner from '../../components/Banner';
import CollabGrid from '../../components/CollabGrid';

export default function Campaign() {
  const [blocks, setBlocks] = useState([
    { id: '1', type: 'hero', config: {} },
    { id: '2', type: 'catalog', config: { title: 'REKOMENDASI PREYSON', subtitle: 'Pilihan terbaik untuk gaya berkendara Anda', columns: 4 } },
    { id: '3', type: 'catalog', config: { title: 'NEW RELEASE', subtitle: 'Koleksi terbaru dari Preyson Moto', columns: 4 } },
    { id: '4', type: 'banner', config: { imageUrl1: '/images/hero_bg.png', imageUrl2: '/images/cat_jacket.png' } },
    { id: '5', type: 'collab', config: { visible: true } },
    { id: '6', type: 'catalog', config: { title: 'KATALOG PRODUK', subtitle: 'Jelajahi seluruh koleksi Preyson', columns: 4 } },
  ]);

  const [editingBlock, setEditingBlock] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires a 5px drag to start (prevents accidental drags on click)
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUpdateBlock = (id, newConfig) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, config: newConfig } : block
    ));
  };

  const handleRemoveBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleAddBlock = (type) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      config: type === 'catalog' ? { title: 'NEW SECTION', columns: 4 } : {}
    };
    setBlocks([...blocks, newBlock]);
  };

  const openEditModal = (id) => {
    const block = blocks.find(b => b.id === id);
    if (block) setEditingBlock({ ...block });
  };

  const saveEditModal = () => {
    if (editingBlock) {
      handleUpdateBlock(editingBlock.id, editingBlock.config);
      setEditingBlock(null);
    }
  };

  const handleSave = () => {
    alert('Layout saved successfully! (Frontend Only)');
    console.log('Saved Layout:', blocks);
  };

  const renderLiveComponent = (block) => {
    switch (block.type) {
      case 'hero':
        return <Hero />;
      case 'catalog':
        return <ProductGrid title={block.config.title} subtitle={block.config.subtitle} columns={block.config.columns} />;
      case 'banner':
        return <Banner imageUrl1={block.config.imageUrl1} imageUrl2={block.config.imageUrl2} />;
      case 'collab':
        return block.config.visible !== false ? <CollabGrid /> : <div style={{padding: '50px', textAlign: 'center'}}>Collab Grid (Hidden)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="campaign-page">
      <div className="campaign-header">
        <div className="campaign-titles">
          <h2>Storefront WYSIWYG Builder</h2>
          <p>Drag, drop, and edit your live components to build the perfect landing page.</p>
        </div>
        <div className="header-actions">
          <div className="add-block-menu">
            <span>Add Section:</span>
            <button className="add-mini-btn" onClick={() => handleAddBlock('hero')}>Hero</button>
            <button className="add-mini-btn" onClick={() => handleAddBlock('catalog')}>Catalog</button>
            <button className="add-mini-btn" onClick={() => handleAddBlock('banner')}>Banner</button>
            <button className="add-mini-btn" onClick={() => handleAddBlock('collab')}>Collab</button>
          </div>
          <button className="save-btn" onClick={handleSave}>
            <Save size={18} />
            PUBLISH
          </button>
        </div>
      </div>

      <div className="campaign-layout">
        {/* Main Canvas: Drag & Drop Area */}
        <div className="builder-canvas">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="blocks-container">
                {blocks.map(block => (
                  <SortableBlock 
                    key={block.id} 
                    id={block.id} 
                    onRemove={handleRemoveBlock}
                    onEdit={openEditModal}
                  >
                    {renderLiveComponent(block)}
                  </SortableBlock>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {blocks.length === 0 && (
            <div className="empty-canvas">
              <p>Your homepage is currently empty.</p>
              <p>Add a section from the top menu to start building.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingBlock && (
        <div className="modal-backdrop">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>Edit {editingBlock.type.toUpperCase()} Section</h3>
              <button className="close-modal-btn" onClick={() => setEditingBlock(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {editingBlock.type === 'hero' && (
                <p className="help-text">Hero section currently has no configurable parameters. It automatically pulls the latest campaign data.</p>
              )}
              {editingBlock.type === 'banner' && (
                <div className="config-form">
                  <div className="form-group">
                    <label>Main Image URL</label>
                    <input 
                      type="text" 
                      value={editingBlock.config.imageUrl1 || ''} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, imageUrl1: e.target.value}})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Secondary Image URL (Optional)</label>
                    <input 
                      type="text" 
                      value={editingBlock.config.imageUrl2 || ''} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, imageUrl2: e.target.value}})} 
                    />
                  </div>
                </div>
              )}
              {editingBlock.type === 'catalog' && (
                <div className="config-form">
                  <div className="form-group">
                    <label>Section Title</label>
                    <input 
                      type="text" 
                      value={editingBlock.config.title || ''} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, title: e.target.value}})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtitle</label>
                    <input 
                      type="text" 
                      value={editingBlock.config.subtitle || ''} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, subtitle: e.target.value}})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Items to Show</label>
                    <select 
                      value={editingBlock.config.columns || 4} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, columns: parseInt(e.target.value)}})}
                    >
                      <option value={4}>4 Items (1 Row)</option>
                      <option value={8}>8 Items (2 Rows)</option>
                      <option value={12}>12 Items (3 Rows)</option>
                    </select>
                  </div>
                </div>
              )}
              {editingBlock.type === 'collab' && (
                <div className="config-form">
                  <div className="form-group row-align">
                    <label>Show Section</label>
                    <input 
                      type="checkbox" 
                      checked={editingBlock.config.visible !== false} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, visible: e.target.checked}})} 
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEditingBlock(null)}>Cancel</button>
              <button className="save-modal-btn" onClick={saveEditModal}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
