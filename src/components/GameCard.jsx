import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function GameCard({ game, isDragging }) {
  const [imageError, setImageError] = useState(false);
  const [imageType, setImageType] = useState('capsule'); // capsule or header

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: game.appid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 获取游戏图片URL
  const getImageUrl = () => {
    if (imageError) {
      // 如果图片加载失败，尝试使用header图片
      if (imageType === 'capsule') {
        return game.header_image || 
               `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`;
      }
      // 如果header也失败，使用占位图
      return `https://via.placeholder.com/184x69/1b2838/ffffff?text=${encodeURIComponent(game.name.slice(0, 10))}`;
    }

    // 优先使用capsule图片（poster风格）
    return game.capsule_image || 
           `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_184x69.jpg`;
  };

  const handleImageError = () => {
    if (imageType === 'capsule') {
      setImageType('header');
      setImageError(true);
    } else {
      // header也加载失败，使用占位图
      setImageError(true);
    }
  };

  // 获取显示名称（优先中文）
  const displayName = game.name_cn || game.name;

  // 格式化游戏时间
  const formatPlaytime = (minutes) => {
    if (!minutes) return '未玩过';
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return '< 1小时';
    return `${hours}小时`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="game-card relative group cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="relative">
          <img
            src={getImageUrl()}
            alt={displayName}
            onError={handleImageError}
            className="w-full h-[69px] object-cover"
            loading="lazy"
          />
          {/* 游戏时间标签 */}
          {game.playtime_forever > 0 && (
            <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
              {formatPlaytime(game.playtime_forever)}
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-900">
          <p className="text-white text-xs font-medium truncate" title={displayName}>
            {displayName}
          </p>
        </div>
      </div>
      
      {/* 删除按钮（悬停显示） */}
      <button
        className="absolute top-1 left-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 z-10"
        onClick={(e) => {
          e.stopPropagation();
          // 这里需要调用删除功能
        }}
        title="移除游戏"
      >
        ×
      </button>
    </div>
  );
}

export default GameCard;