import React, { useState, useEffect } from 'react';
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
import { useProducts } from '../../context/ProductContext';

export default function Campaign() {
  const [blocks, setBlocks] = useState(() => {
    const saved = localStorage.getItem('storefrontLayout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse layout from local storage');
      }
    }
    return [
      { id: '1', type: 'hero', config: {} },
      { id: '2', type: 'catalog', config: { title: 'REKOMENDASI PREYSON', subtitle: 'Pilihan terbaik untuk gaya berkendara Anda', columns: 4 } },
      { id: '3', type: 'catalog', config: { title: 'NEW RELEASE', subtitle: 'Koleksi terbaru dari Preyson Moto', columns: 4 } },
      { id: '4', type: 'banner', config: { imageUrl1: '/images/hero_bg.png', imageUrl2: '/images/cat_jacket.png' } },
      { id: '5', type: 'collab', config: { visible: true } },
      { id: '6', type: 'catalog', config: { title: 'KATALOG PRODUK', subtitle: 'Jelajahi seluruh koleksi Preyson', columns: 4 } },
    ];
  });

  const [editingBlock, setEditingBlock] = useState(null);
  const { products } = useProducts();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories', err));
  }, []);

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
    localStorage.setItem('storefrontLayout', JSON.stringify(blocks));
    alert('Layout saved successfully! The storefront homepage will now reflect these changes.');
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please check server connection.');
      return null;
    }
  };

  const renderLiveComponent = (block) => {
    switch (block.type) {
      case 'hero':
        return <Hero images={block.config.images} />;
      case 'catalog':
        return (
          <ProductGrid 
            title={block.config.title} 
            subtitle={block.config.subtitle} 
            columns={block.config.columns} 
            categoryId={block.config.categoryId} 
            productIds={block.config.productIds} 
            viewAllLink={block.config.viewAllLink} 
          />
        );
      case 'banner':
        return <Banner images={block.config.images} imageUrl1={block.config.imageUrl1} imageUrl2={block.config.imageUrl2} />;
      case 'collab':
        return block.config.visible !== false ? <CollabGrid collabs={block.config.collabs} /> : <div style={{padding: '50px', textAlign: 'center'}}>Collab Grid (Hidden)</div>;
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
                <div className="config-form">
                  <div className="form-group">
                    <label>Number of Images</label>
                    <select 
                      value={editingBlock.config.imageCount || (editingBlock.config.images ? editingBlock.config.images.length : 1)}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        let currentImages = editingBlock.config.images || ['/images/hero_bg.png'];
                        
                        let newImages = [...currentImages];
                        while(newImages.length < count) newImages.push('');
                        newImages = newImages.slice(0, count);

                        setEditingBlock({...editingBlock, config: {...editingBlock.config, imageCount: count, images: newImages}});
                      }}
                    >
                      <option value={1}>1 Image</option>
                      <option value={2}>2 Images</option>
                      <option value={3}>3 Images</option>
                      <option value={4}>4 Images</option>
                    </select>
                  </div>
                  
                  {(() => {
                    const images = editingBlock.config.images || ['/images/hero_bg.png'];
                    
                    return images.map((img, index) => (
                      <div className="form-group" key={index}>
                        <label>Image {index + 1}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div 
                            style={{ 
                              width: '60px', 
                              height: '40px', 
                              backgroundImage: `url(${img || '/images/hero_bg.png'})`, 
                              backgroundSize: 'cover', 
                              borderRadius: '4px',
                              border: '1px solid var(--admin-border)'
                            }}
                          ></div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const url = await uploadImage(e.target.files[0]);
                                if (url) {
                                  const newImages = [...images];
                                  newImages[index] = url;
                                  setEditingBlock({...editingBlock, config: {...editingBlock.config, images: newImages}});
                                }
                              }
                            }} 
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
              {editingBlock.type === 'banner' && (
                <div className="config-form">
                  <div className="form-group">
                    <label>Number of Images</label>
                    <select 
                      value={editingBlock.config.imageCount || (editingBlock.config.images ? editingBlock.config.images.length : (editingBlock.config.imageUrl2 ? 2 : 1))}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        let currentImages = editingBlock.config.images || [editingBlock.config.imageUrl1, editingBlock.config.imageUrl2].filter(Boolean);
                        
                        let newImages = [...currentImages];
                        while(newImages.length < count) newImages.push('');
                        newImages = newImages.slice(0, count);

                        setEditingBlock({...editingBlock, config: {...editingBlock.config, imageCount: count, images: newImages}});
                      }}
                    >
                      <option value={1}>1 Image</option>
                      <option value={2}>2 Images</option>
                      <option value={3}>3 Images</option>
                    </select>
                  </div>
                  
                  {(() => {
                    const images = editingBlock.config.images || [editingBlock.config.imageUrl1, editingBlock.config.imageUrl2].filter(Boolean);
                    if (images.length === 0) images.push(''); // Ensure at least one input if empty
                    
                    return images.map((img, index) => (
                      <div className="form-group" key={index}>
                        <label>Image {index + 1}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div 
                            style={{ 
                              width: '60px', 
                              height: '40px', 
                              backgroundImage: `url(${img || '/images/hero_bg.png'})`, 
                              backgroundSize: 'cover', 
                              borderRadius: '4px',
                              border: '1px solid var(--admin-border)'
                            }}
                          ></div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const url = await uploadImage(e.target.files[0]);
                                if (url) {
                                  const newImages = [...images];
                                  newImages[index] = url;
                                  setEditingBlock({...editingBlock, config: {...editingBlock.config, images: newImages}});
                                }
                              }
                            }} 
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
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
                  <div className="form-group">
                    <label>Selection Type</label>
                    <select 
                      value={editingBlock.config.selectionType || 'manual'} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, selectionType: e.target.value, productIds: [], categoryId: ''}})}
                    >
                      <option value="manual">Manual Products</option>
                      <option value="category">By Category</option>
                    </select>
                  </div>
                  
                  {editingBlock.config.selectionType === 'category' ? (
                    <div className="form-group">
                      <label>Select Category</label>
                      <select 
                        value={editingBlock.config.categoryId || ''} 
                        onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, categoryId: e.target.value}})}
                      >
                        <option value="">-- All Categories --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Select Products (Check to add)</label>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--admin-border)', padding: '8px', borderRadius: '4px' }}>
                        {products.map(p => {
                          const isSelected = (editingBlock.config.productIds || []).includes(p.id);
                          return (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={(e) => {
                                  let newIds = editingBlock.config.productIds || [];
                                  if (e.target.checked) newIds = [...newIds, p.id];
                                  else newIds = newIds.filter(id => id !== p.id);
                                  setEditingBlock({...editingBlock, config: {...editingBlock.config, productIds: newIds}});
                                }}
                              />
                              <div style={{ width: '24px', height: '24px', backgroundImage: `url(${p.image})`, backgroundSize: 'cover', borderRadius: '2px', backgroundColor: '#eee' }}></div>
                              <span style={{ fontSize: '12px', color: 'var(--admin-text)' }}>{p.name} - Rp {p.price}</span>
                            </div>
                          );
                        })}
                        {products.length === 0 && <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>No products found in database.</p>}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>View All Link (URL)</label>
                    <input 
                      type="text" 
                      placeholder="/catalog"
                      value={editingBlock.config.viewAllLink || ''} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, viewAllLink: e.target.value}})} 
                    />
                  </div>
                </div>
              )}
              {editingBlock.type === 'collab' && (
                <div className="config-form">
                  <div className="form-group row-align" style={{ marginBottom: '16px' }}>
                    <label>Show Section</label>
                    <input 
                      type="checkbox" 
                      checked={editingBlock.config.visible !== false} 
                      onChange={(e) => setEditingBlock({...editingBlock, config: {...editingBlock.config, visible: e.target.checked}})} 
                    />
                  </div>
                  
                  {(() => {
                    const defaultCollabs = [
                      { id: 'c1', name: "ADIPATI BERTIGA", image: "/images/cat_jacket.png", logo: "ADIPATI BERTIGA", logoStyle: 'text', link: '', isComingSoon: false },
                      { id: 'c2', name: "QUEENLEKHA", image: "/images/cat_tees.png", logo: "QUEEN LEKHA", logoStyle: 'text', link: '', isComingSoon: true },
                      { id: 'c3', name: "BRAP HELMET", image: "/images/placeholder.png", logo: "BRAP HELMET", logoStyle: 'text', link: '', isComingSoon: false },
                      { id: 'c4', name: "SUZZY HELMET", image: "/images/hero_bg.png", logo: "SUZZY", logoStyle: 'text', link: '', isComingSoon: false }
                    ];
                    
                    const collabs = editingBlock.config.collabs || defaultCollabs;
                    
                    return (
                      <div>
                        <h4 style={{ fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '4px' }}>Collab Cards</h4>
                        {collabs.map((collab, index) => (
                          <div key={collab.id || index} style={{ border: '1px solid var(--admin-border)', padding: '12px', borderRadius: '6px', marginBottom: '12px', position: 'relative' }}>
                            <button 
                              onClick={() => {
                                const newCollabs = collabs.filter((_, i) => i !== index);
                                setEditingBlock({...editingBlock, config: {...editingBlock.config, collabs: newCollabs}});
                              }}
                              style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              title="Remove Collab"
                            >
                              <X size={16} />
                            </button>
                            
                            <div className="form-group" style={{ marginBottom: '8px' }}>
                              <label>Collab Name</label>
                              <input 
                                type="text" 
                                value={collab.name || ''} 
                                onChange={(e) => {
                                  const newCollabs = [...collabs];
                                  newCollabs[index] = { ...newCollabs[index], name: e.target.value, logo: e.target.value };
                                  setEditingBlock({...editingBlock, config: {...editingBlock.config, collabs: newCollabs}});
                                }} 
                              />
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: '8px' }}>
                              <label>Image (Upload)</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundImage: `url(${collab.image || '/images/hero_bg.png'})`, backgroundSize: 'cover', borderRadius: '4px', border: '1px solid var(--admin-border)' }}></div>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const url = await uploadImage(e.target.files[0]);
                                      if (url) {
                                        const newCollabs = [...collabs];
                                        newCollabs[index] = { ...newCollabs[index], image: url };
                                        setEditingBlock({...editingBlock, config: {...editingBlock.config, collabs: newCollabs}});
                                      }
                                    }
                                  }} 
                                  style={{ flex: 1 }}
                                />
                              </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '8px' }}>
                              <label>Link / URL (Destination)</label>
                              <input 
                                type="text" 
                                placeholder="/catalog"
                                value={collab.link || ''} 
                                onChange={(e) => {
                                  const newCollabs = [...collabs];
                                  newCollabs[index] = { ...newCollabs[index], link: e.target.value };
                                  setEditingBlock({...editingBlock, config: {...editingBlock.config, collabs: newCollabs}});
                                }} 
                              />
                            </div>

                            <div className="form-group row-align">
                              <label>Coming Soon?</label>
                              <input 
                                type="checkbox" 
                                checked={collab.isComingSoon || false} 
                                onChange={(e) => {
                                  const newCollabs = [...collabs];
                                  newCollabs[index] = { ...newCollabs[index], isComingSoon: e.target.checked };
                                  setEditingBlock({...editingBlock, config: {...editingBlock.config, collabs: newCollabs}});
                                }} 
                              />
                            </div>
                          </div>
                        ))}
                        
                        <button 
                          className="add-mini-btn" 
                          style={{ width: '100%', padding: '10px', marginTop: '4px' }}
                          onClick={() => {
                            const newCollabs = [...collabs, { id: Date.now().toString(), name: "New Collab", image: "", logo: "New Collab", logoStyle: 'text', link: '', isComingSoon: false }];
                            setEditingBlock({...editingBlock, config: {...editingBlock.config, collabs: newCollabs}});
                          }}
                        >
                          + Add New Collab Card
                        </button>
                      </div>
                    );
                  })()}
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
