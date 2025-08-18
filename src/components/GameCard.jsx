import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function GameCard({ game, isDragging, showPlaytime = true, showGameName = true }) {
  const [imageError, setImageError] = useState(false);
  const [currentImageType, setCurrentImageType] = useState('header'); // library, header, or fallback
  const [imageLoaded, setImageLoaded] = useState(false);

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

  // 重置图片状态当游戏改变时
  useEffect(() => {
    setImageError(false);
    setCurrentImageType('header');
    setImageLoaded(false);
  }, [game.appid]);

  // 获取游戏图片URL - 修复图片选择逻辑
  const getImageUrl = () => {
    // 使用分层降级策略
    if (currentImageType === 'header') {
      // 首选：header 图片
      return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`;
    } else if (currentImageType === 'header_alt') {
      return game.header_image;
    } else if (currentImageType === 'capsule') {
      // 备选1：capsule 图片
      return game.capsule_image;
    } else if (currentImageType === 'library') {
      // 备选2：library_600x900 图片（竖版封面）
      return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/library_600x900.jpg`;
    } else {
      // 最终备选：占位图
      return `https://via.placeholder.com/184x69/1b2838/ffffff?text=${encodeURIComponent(game.name.slice(0, 10))}`;
    }
  };

  // 处理图片加载错误 - 改进的降级策略
  const handleImageError = () => {
    console.log(`Image load failed for ${game.name}, type: ${currentImageType}`);
    
    if (currentImageType === 'header') {
      setCurrentImageType('header_alt');
    } else if (currentImageType === "header_alt") {
      setCurrentImageType('capsule')
    } else if (currentImageType === 'capsule') {
      setCurrentImageType('library');
    } else if (currentImageType === 'library') {
      setCurrentImageType('fallback');
      setImageError(true);
    }
  };

  // 处理图片加载成功
  const handleImageLoad = () => {
    setImageLoaded(true);
    console.log(`Image loaded successfully for ${game.name}, type: ${currentImageType}`);
  };

  // 获取显示名称（优先中文）
  const displayName = game.name_cn || game.name;

  // 格式化游戏时间
  const formatPlaytime = (minutes) => {
    if (!minutes) return '未玩过';
    else {
      const hours = Math.floor(minutes / 60);
      if (hours < 1) return '< 1小时';
      else return `${hours}小时`;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="game-card relative group cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 w-[138px]">
        <div className="relative h-[64.5px]">
          {/* 添加一个加载占位符 */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse" />
          )}
          
          <img
            src={getImageUrl()}
            alt={displayName}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={`w-full h-full object-cover ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            crossOrigin="anonymous"
            loading="lazy"
            // 添加 referrerPolicy 来帮助处理某些 CDN 的限制
            referrerPolicy="no-referrer"
          />
          
          {/* 游戏时间标签 */}
          {showPlaytime && game.playtime_forever >= 0 && game.type !== 'dlc' && (
            <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
              {formatPlaytime(game.playtime_forever)}
            </div>
          )}
          
          {/* DLC标记 */}
          {game.type === 'dlc' && (
            <div className="absolute top-1 left-1 bg-purple-600 bg-opacity-90 text-white text-xs px-1.5 py-0.5 rounded">
              DLC
            </div>
          )}
        </div>
        
        {/* 文字容器 - 添加固定高度和overflow控制 */}
        {showGameName && (
          <div className="p-2 bg-gray-900 flex flex-col">
          <p className="text-white text-xs font-medium leading-tight text-left" title={displayName}>
            {displayName}
          </p>
          {/* 显示所属游戏 */}
          {game.parentGameName && (
            <p className="text-gray-500 text-xs truncate mt-0.5 leading-tight text-left" title={game.parentGameName}>
              {game.parentGameName}
            </p>
          )}
          </div>
        )}
      </div>
      
    </div>
  );
}

export default GameCard;