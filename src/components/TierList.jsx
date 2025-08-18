import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../contexts/AppContext';
import GameCard from './GameCard';

// 默认层级配置
const DEFAULT_TIERS = [
  { id: 'S', name: 'S', color: 'bg-red-600', label: 'S Tier' },
  { id: 'A', name: 'A', color: 'bg-orange-500', label: 'A Tier' },
  { id: 'B', name: 'B', color: 'bg-yellow-500', label: 'B Tier' },
  { id: 'C', name: 'C', color: 'bg-green-500', label: 'C Tier' },
  { id: 'D', name: 'D', color: 'bg-blue-500', label: 'D Tier' },
];

// 颜色选项
const COLOR_OPTIONS = [
  'bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  'bg-gray-600', 'bg-teal-500', 'bg-cyan-500', 'bg-lime-500'
];

// Toggle 组件
function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center cursor-pointer">
      <span className="text-white mr-2 text-sm">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-600'
        }`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
          checked ? 'transform translate-x-4' : ''
        }`}></div>
      </div>
    </label>
  );
}

// 可排序的游戏卡片包装组件
function SortableGameCard({ game, showPlaytime, showGameName }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: game.appid,
    data: {
      type: 'game',
      game: game
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <GameCard 
        game={game} 
        showPlaytime={showPlaytime}
        showGameName={showGameName}
      />
    </div>
  );
}

// Droppable 层级容器
function DroppableTier({ tier, games, getGameById, onEditTier, onDeleteTier, isEditMode, showPlaytime, showGameName }) {
  const { setNodeRef, isOver } = useDroppable({
    id: tier.id,
    data: {
      type: 'tier',
      tier: tier.id
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tier.name);
  const [editLabel, setEditLabel] = useState(tier.label);
  const [editColor, setEditColor] = useState(tier.color);

  const handleSave = () => {
    onEditTier(tier.id, { name: editName, label: editLabel, color: editColor });
    setIsEditing(false);
  };

  return (
    <div className="flex border-b-2 border-gray-700 group">
      <div className={`w-24 ${tier.color} flex items-center justify-center py-8 font-bold text-2xl relative`}>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value.slice(0, 2))}
            className="w-16 text-center bg-white/20 rounded px-1 text-gray-900"
            maxLength={2}
          />
        ) : (
          <>
            <span className="text-gray-900">{tier.name}</span>
            {isEditMode && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs bg-white/20 rounded p-1 mr-1"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteTier(tier.id)}
                  className="text-xs bg-red-900/50 rounded p-1"
                  title="删除层级"
                >
                  ❌
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 bg-gray-800 p-4 min-h-[100px] transition-all ${
          isOver ? 'bg-gray-700 ring-2 ring-blue-400' : ''
        }`}
      >
        {isEditing && (
          <div className="mb-3 flex gap-2 items-center">
            <select
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="px-2 py-1 bg-gray-700 text-white rounded text-sm"
            >
              {COLOR_OPTIONS.map(color => (
                <option key={color} value={color}>{color.replace('bg-', '').replace('-', ' ')}</option>
              ))}
            </select>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              保存
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditName(tier.name);
                setEditLabel(tier.label);
                setEditColor(tier.color);
              }}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
            >
              取消
            </button>
          </div>
        )}
        
        <SortableContext
          items={games}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {games.map((gameId) => {
              const game = getGameById(gameId);
              if (!game) return null;
              return <SortableGameCard
                key={gameId} 
                game={game} 
                showPlaytime={showPlaytime}
                showGameName={showGameName}
              />;
            })}
            {games.length === 0 && (
              <div className="text-gray-500 text-sm italic py-6 px-4">
                拖拽游戏到此处
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// Droppable 未分级区域
function DroppableUnranked({ games, getGameById, showPlaytime, showGameName }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unranked',
    data: {
      type: 'tier',
      tier: 'unranked'
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-wrap gap-3 min-h-[100px] bg-gray-800 rounded-lg p-7 transition-all ${
        isOver ? 'bg-gray-700 ring-2 ring-blue-400' : ''
      }`}
    >
      <SortableContext
        items={games}
        strategy={horizontalListSortingStrategy}
      >
        {games.map((gameId) => {
          const game = getGameById(gameId);
          if (!game) return null;
          return <SortableGameCard 
            key={gameId} 
            game={game} 
            showPlaytime={showPlaytime}
            showGameName={showGameName}
          />;
        })}
        {games.length === 0 && (
          <div className="text-gray-500 text-center w-full py-8">
            暂无未分级的游戏
          </div>
        )}
      </SortableContext>
    </div>
  );
}

function TierList() {
  const { state, actions } = useApp();
  const [activeId, setActiveId] = useState(null);
  const [tierConfig, setTierConfig] = useState(DEFAULT_TIERS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [listTitle, setListTitle] = useState('游戏 Tier List');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [showPlaytime, setShowPlaytime] = useState(true);
  const [showGameName, setShowGameName] = useState(true);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 获取所有游戏的ID列表
  const getAllGameIds = () => {
    const ids = [];
    Object.values(state.tiers).forEach(tierGames => {
      ids.push(...tierGames);
    });
    return ids;
  };

  // 获取游戏对象
  const getGameById = (id) => {
    return state.games.find(game => game.appid === id);
  };

  // 获取游戏所在的层级
  const findGameTier = (gameId) => {
    for (const [tier, games] of Object.entries(state.tiers)) {
      if (games.includes(gameId)) {
        return tier;
      }
    }
    return null;
  };

  // 添加新层级
  const handleAddTier = () => {
    const newId = `T${Date.now()}`;
    const newTier = {
      id: newId,
      name: 'NEW',
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
      label: 'New Tier'
    };
    setTierConfig([...tierConfig, newTier]);
    
    // 在state.tiers中添加新层级
    const newTiers = { ...state.tiers, [newId]: [] };
    actions.updateTiers(newTiers);
  };

  // 删除层级
  const handleDeleteTier = (tierId) => {
    if (tierConfig.length <= 1) {
      alert('至少需要保留一个层级');
      return;
    }
    
    if (window.confirm('确定要删除这个层级吗？该层级的游戏将移至未分级区域')) {
      // 移动该层级的游戏到未分级
      const newTiers = { ...state.tiers };
      const gamesToMove = newTiers[tierId] || [];
      newTiers.unranked = [...(newTiers.unranked || []), ...gamesToMove];
      delete newTiers[tierId];
      actions.updateTiers(newTiers);
      
      // 更新层级配置
      setTierConfig(tierConfig.filter(t => t.id !== tierId));
    }
  };

  // 编辑层级
  const handleEditTier = (tierId, updates) => {
    setTierConfig(tierConfig.map(t => 
      t.id === tierId ? { ...t, ...updates } : t
    ));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    // 获取拖拽项和目标项的信息
    const activeTier = findGameTier(activeId);
    const overData = over.data?.current;
    
    if (!activeTier) return;
    
    // 跨层级拖拽到空白层级区域
    if (overData?.type === 'tier') {
      const targetTier = overData.tier;
      if (activeTier !== targetTier) {
        // 立即移动到目标层级，产生占位符效果
        const newTiers = { ...state.tiers };
        newTiers[activeTier] = newTiers[activeTier].filter(id => id !== activeId);
        newTiers[targetTier] = [...newTiers[targetTier], activeId];
        actions.updateTiers(newTiers);
      }
      return;
    }
    
    // // 如果目标是游戏
    const overTier = findGameTier(overId);
    if (!overTier) return;

    const newTiers = { ...state.tiers };
    
    // 同层级内排序
    if (activeTier === overTier) {
      const newTiers = { ...state.tiers };
      const games = [...newTiers[overTier]];
      const oldIndex = games.indexOf(activeId);
      const newIndex = games.indexOf(overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedGames = arrayMove(games, oldIndex, newIndex);
        newTiers[activeTier] = reorderedGames;
        actions.updateTiers(newTiers);
      } 
    } else {
      // 跨层级移动到具体位置
      // 从原层级移除
      newTiers[activeTier] = newTiers[activeTier].filter(id => id !== activeId);
      
      // 在目标层级的特定位置插入
      const targetGames = [...newTiers[overTier]];
      const targetIndex = targetGames.indexOf(overId);
      
      if (targetIndex !== -1) {
        // 插入到目标游戏的位置
        targetGames.splice(targetIndex, 0, activeId);
      } else {
        // 如果找不到目标位置，添加到末尾
        targetGames.push(activeId);
      }
      
      newTiers[overTier] = targetGames;
      actions.updateTiers(newTiers);
    }
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
  };

  const handleDragCancel = () => {
    // 如果拖拽被取消，重置到原始状态
    setActiveId(null);
    // 可以在这里添加恢复原始位置的逻辑
  };

  const exportAsImage = async () => {
    try {
      // 临时隐藏按钮和编辑控件
      const buttons = document.querySelectorAll('.export-hide');
      buttons.forEach(btn => btn.style.display = 'none');
      
      const element = document.querySelector('.tier-list-container');
      const canvas = await html2canvas(element, {
        backgroundColor: '#111827',
        scale: 2, // 提高图片质量
        useCORS: true, // 允许跨域图片
        allowTaint: true, // 允许污染canvas
        logging: false, // 关闭日志
        imageTimeout: 15000, // 图片加载超时时间
      });
      
      // 恢复按钮显示
      buttons.forEach(btn => btn.style.display = '');
      
      // 下载图片
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `${listTitle.replace(/\s+/g, '-')}-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出图片失败，请重试');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      // collisionDetection={closestCorners}
    >
      <SortableContext
        items={getAllGameIds()}
        strategy={horizontalListSortingStrategy}
      >
        <div className="max-w-7xl mx-auto">
          <div className='tier-sheet-container'>

            <div className='flex flex-wrap justify-between mb-4'>
              {/* 标题编辑 */}
              <div className="mt-3 flex items-center gap-4">
                {isEditingTitle ? (
                  <>
                    <input
                      type="text"
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      className="text-2xl font-bold bg-gray-800 text-white px-3 py-1 rounded"
                    />
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="export-hide bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                    >
                      确定
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">{listTitle}</h2>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="export-hide text-gray-400 hover:text-white"
                      title="编辑标题"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
              {/* 功能按钮 */}
              <div className="mt-3 flex gap-4 flex-wrap">
                <div className="export-hide flex gap-4 pr-4 py-2 rounded-lg w-full lg:w-auto">
                  <Toggle 
                    label="显示游戏时间"
                    checked={showPlaytime}
                    onChange={(e) => setShowPlaytime(e.target.checked)}
                  />
                  <Toggle 
                    label="显示游戏名称"
                    checked={showGameName}
                    onChange={(e) => setShowGameName(e.target.checked)}
                  />
                </div>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="export-hide bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {isEditMode ? '完成编辑' : '⚙️ 编辑层级'}
                </button>
                <button
                  onClick={exportAsImage}
                  className="export-hide bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  📸 导出为图片
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('确定要重置所有数据吗？')) {
                      actions.resetAll();
                      setTierConfig(DEFAULT_TIERS);
                      setListTitle('游戏 Tier List');
                    }
                  }}
                  className="export-hide bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  🔄 重置全部
                </button>
              </div>
            </div>
            
            {/* Tier列表 */}
            <div className="tier-list-container bg-gray-900 rounded-lg overflow-hidden shadow-2xl mb-6">
              {tierConfig.map((tier) => (
                <DroppableTier
                  key={tier.id}
                  tier={tier}
                  games={state.tiers[tier.id] || []}
                  getGameById={getGameById}
                  onEditTier={handleEditTier}
                  onDeleteTier={handleDeleteTier}
                  isEditMode={isEditMode}
                  showPlaytime={showPlaytime}
                  showGameName={showGameName}
                />
              ))}
              
              {/* 添加新层级按钮 */}
              {isEditMode && (
                <div className="bg-gray-800 p-4 border-b-2 border-gray-700">
                  <button
                    onClick={handleAddTier}
                    className="export-hide bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    + 添加新层级
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 未分级游戏区域 */}
          <div className="rounded-lg shadow-2xl mb-6">
            <h3 className="text-xl font-bold text-white mb-4">未分级游戏</h3>
            <DroppableUnranked 
              games={state.tiers.unranked || []}
              getGameById={getGameById}
            />
          </div>

          
        </div>
      </SortableContext>

      {/* 拖拽覆盖层 */}
      <DragOverlay>
        {activeId ? (
          <div style={{ cursor: 'grabbing' }}>
            <GameCard 
              game={getGameById(activeId)} 
              isDragging 
              showPlaytime={showPlaytime}
              showGameName={showGameName}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TierList;