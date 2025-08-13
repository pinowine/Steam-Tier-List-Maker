import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useApp } from '../contexts/AppContext';
import GameCard from './GameCard';

const TIER_CONFIG = [
  { name: 'S', color: 'bg-tier-s', label: 'S Tier - 神作' },
  { name: 'A', color: 'bg-tier-a', label: 'A Tier - 优秀' },
  { name: 'B', color: 'bg-tier-b', label: 'B Tier - 良好' },
  { name: 'C', color: 'bg-tier-c', label: 'C Tier - 一般' },
  { name: 'D', color: 'bg-tier-d', label: 'D Tier - 较差' },
  { name: 'E', color: 'bg-tier-e', label: 'E Tier - 差劲' },
  { name: 'F', color: 'bg-tier-f', label: 'F Tier - 糟糕' },
];

function TierList() {
  const { state, actions } = useApp();
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over) {
      const activeId = active.id;
      const overId = over.id;
      
      // 如果拖到了层级容器上
      if (typeof overId === 'string' && (TIER_CONFIG.find(t => t.name === overId) || overId === 'unranked')) {
        const fromTier = findGameTier(activeId);
        const toTier = overId;
        
        if (fromTier !== toTier) {
          actions.moveGame(activeId, fromTier, toTier);
        }
      } 
      // 如果拖到了另一个游戏上
      else {
        const fromTier = findGameTier(activeId);
        const toTier = findGameTier(overId);
        
        if (fromTier && toTier) {
          const fromGames = [...state.tiers[fromTier]];
          const toGames = fromTier === toTier ? fromGames : [...state.tiers[toTier]];
          
          const oldIndex = fromGames.indexOf(activeId);
          const newIndex = toGames.indexOf(overId);
          
          if (fromTier === toTier) {
            // 同层级内移动
            fromGames.splice(oldIndex, 1);
            fromGames.splice(newIndex, 0, activeId);
            actions.updateTiers({ ...state.tiers, [fromTier]: fromGames });
          } else {
            // 跨层级移动
            fromGames.splice(oldIndex, 1);
            toGames.splice(newIndex, 0, activeId);
            actions.updateTiers({
              ...state.tiers,
              [fromTier]: fromGames,
              [toTier]: toGames
            });
          }
        }
      }
    }
    
    setActiveId(null);
  };

  const TierRow = ({ tier, color, label, games }) => {
    return (
      <div className="flex border-b-2 border-gray-700">
        <div className={`w-24 ${color} flex items-center justify-center py-8 font-bold text-2xl text-gray-900`}>
          {tier}
        </div>
        <div className="flex-1 bg-gray-800 p-4 min-h-[120px]">
          <SortableContext
            id={tier}
            items={games}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-wrap gap-2">
              {games.map((gameId) => {
                const game = getGameById(gameId);
                if (!game) return null;
                return <GameCard key={gameId} game={game} />;
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
  };

  const exportAsImage = async () => {
    const element = document.querySelector('.tier-list-container');
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'steam-tier-list.png';
    link.href = data;
    link.click();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-white mb-6">游戏 Tier List</h2>
        
        {/* Tier列表 */}
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl mb-8">
          {TIER_CONFIG.map(({ name, color, label }) => (
            <TierRow
              key={name}
              tier={name}
              color={color}
              label={label}
              games={state.tiers[name] || []}
            />
          ))}
        </div>

        {/* 未分级游戏区域 */}
        <div className="bg-gray-900 rounded-lg p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4">未分级游戏</h3>
          <SortableContext
            id="unranked"
            items={state.tiers.unranked || []}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-wrap gap-3 min-h-[100px] bg-gray-800 rounded-lg p-4">
              {(state.tiers.unranked || []).map((gameId) => {
                const game = getGameById(gameId);
                if (!game) return null;
                return <GameCard key={gameId} game={game} />;
              })}
              {(!state.tiers.unranked || state.tiers.unranked.length === 0) && (
                <div className="text-gray-500 text-center w-full py-8">
                  暂无未分级的游戏
                </div>
              )}
            </div>
          </SortableContext>
        </div>

        {/* 导出功能按钮 */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => {
              // 实现导出为图片功能
              alert('导出功能开发中...');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            导出为图片
          </button>
          <button
            onClick={exportAsImage}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            保存进度
          </button>
          <button
            onClick={() => {
              if (window.confirm('确定要重置所有数据吗？')) {
                actions.resetAll();
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            重置全部
          </button>
        </div>
      </div>

      {/* 拖拽覆盖层 */}
      <DragOverlay>
        {activeId ? (
          <GameCard game={getGameById(activeId)} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TierList;