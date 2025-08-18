import React, { useState, useMemo, useCallback } from 'react';
import steamApi from '../services/steamApi';
import { useApp } from '../contexts/AppContext';

// DLC类型关键词，用于过滤
const DLC_FILTER_KEYWORDS = {
  ost: ['soundtrack', 'ost', 'music', 'audio', 'sound track'],
  cosmetic: ['skin', 'cosmetic', 'costume', 'outfit', 'appearance', 'customization', 'decoration'],
  artbook: ['artbook', 'art book', 'digital art', 'artwork', 'art collection', 'concept art'],
  currency: ['coins', 'points', 'currency', 'credit', 'gold', 'gems', 'diamonds'],
  booster: ['booster', 'boost', 'starter', 'upgrade pack', 'time saver'],
  dlcpack: ['season pass', 'expansion pass', 'dlc bundle', 'complete edition']
};

function DlcModal({ isOpen, onClose }) {
  const { state, actions } = useApp();
  const [dlcData, setDlcData] = useState({}); // 存储所有DLC信息
  const [selectedDlcs, setSelectedDlcs] = useState(new Set()); // 选中的DLC
  const [loading, setLoading] = useState(false);
  const [loadingGame, setLoadingGame] = useState(null); // 当前加载的游戏
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGames, setExpandedGames] = useState(new Set()); // 展开的游戏
  const [filters, setFilters] = useState({
    hideOst: true,
    hideCosmetic: true,
    hideArtbook: true,
    hideCurrency: true,
    hideBooster: false,
    hideDlcPack: false,
    showOnlyUnowned: true
  });
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 });

  // 获取已拥有的游戏ID列表（包括已在tier list中的）
  const ownedAppIds = useMemo(() => {
    return new Set(state.games.map(g => g.appid));
  }, [state.games]);

  // 获取有DLC的游戏列表
  const gamesWithDlc = useMemo(() => {
    return state.games.filter(game => game.dlc && game.dlc.length > 0);
  }, [state.games]);

  // 检查DLC是否应该被过滤
  const shouldFilterDlc = useCallback((dlcInfo) => {
    if (!dlcInfo || !dlcInfo.name) return false;
    
    const nameLower = dlcInfo.name.toLowerCase();
    
    // 检查各种过滤条件
    if (filters.hideOst && DLC_FILTER_KEYWORDS.ost.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
    if (filters.hideCosmetic && DLC_FILTER_KEYWORDS.cosmetic.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
    if (filters.hideArtbook && DLC_FILTER_KEYWORDS.artbook.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
    if (filters.hideCurrency && DLC_FILTER_KEYWORDS.currency.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
    if (filters.hideBooster && DLC_FILTER_KEYWORDS.booster.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
    if (filters.hideDlcPack && DLC_FILTER_KEYWORDS.dlcpack.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
    
    // 过滤已拥有的
    if (filters.showOnlyUnowned && ownedAppIds.has(dlcInfo.appid)) {
      return true;
    }
    
    // 搜索过滤
    if (searchTerm && !nameLower.includes(searchTerm.toLowerCase()) && 
        !(dlcInfo.name_cn && dlcInfo.name_cn.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return true;
    }
    
    return false;
  }, [filters, ownedAppIds, searchTerm]);

  // 获取单个游戏的所有DLC信息
  const fetchGameDlcs = async (game) => {
    if (!game.dlc || game.dlc.length === 0) return [];
    
    setLoadingGame(game.appid);
    const dlcInfos = [];
    
    // 分批获取DLC信息，避免请求过多
    const batchSize = 5;
    for (let i = 0; i < game.dlc.length; i += batchSize) {
      const batch = game.dlc.slice(i, Math.min(i + batchSize, game.dlc.length));
      
      const batchPromises = batch.map(async (dlcId) => {
        // 检查缓存
        const cacheKey = `dlc_info_${dlcId}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
              return data.info;
            }
          } catch (e) {
            console.error('缓存解析失败:', e);
          }
        }
        
        // 获取DLC详情
        try {
          const details = await steamApi.getGameDetails(dlcId);
          const dlcInfo = {
            appid: dlcId,
            name: details?.name_cn || details?.name || `DLC ${dlcId}`,
            name_cn: details?.name_cn,
            header_image: details?.header_image,
            capsule_image: details?.capsule_image,
            type: 'dlc',
            parentGame: game.appid,
            parentGameName: game.name
          };
          
          // 缓存结果
          localStorage.setItem(cacheKey, JSON.stringify({
            info: dlcInfo,
            timestamp: Date.now()
          }));
          
          return dlcInfo;
        } catch (error) {
          console.error(`获取DLC ${dlcId} 信息失败:`, error);
          return {
            appid: dlcId,
            name: `DLC ${dlcId}`,
            type: 'dlc',
            parentGame: game.appid,
            parentGameName: game.name
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      dlcInfos.push(...batchResults.filter(info => info !== null));
      
      // 更新进度
      setFetchProgress(prev => ({
        ...prev,
        current: Math.min(prev.current + batch.length, prev.total)
      }));
      
      // 添加延迟避免请求过快
      if (i + batchSize < game.dlc.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setLoadingGame(null);
    return dlcInfos;
  };

  // 加载单个游戏的DLC
  const loadGameDlcs = async (gameId) => {
    const game = state.games.find(g => g.appid === gameId);
    if (!game || dlcData[gameId]) return;
    
    setLoading(true);
    setFetchProgress({ current: 0, total: game.dlc?.length || 0 });
    
    const dlcs = await fetchGameDlcs(game);
    setDlcData(prev => ({ ...prev, [gameId]: dlcs }));
    
    setLoading(false);
    setFetchProgress({ current: 0, total: 0 });
  };

  // 切换游戏展开状态
  const toggleGameExpanded = async (gameId) => {
    const newExpanded = new Set(expandedGames);
    
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
      // 如果还没有加载DLC数据，则加载
      if (!dlcData[gameId]) {
        await loadGameDlcs(gameId);
      }
    }
    
    setExpandedGames(newExpanded);
  };

  // 切换DLC选择状态
  const toggleDlcSelection = (dlcId) => {
    const newSelection = new Set(selectedDlcs);
    if (newSelection.has(dlcId)) {
      newSelection.delete(dlcId);
    } else {
      newSelection.add(dlcId);
    }
    setSelectedDlcs(newSelection);
  };

  // 添加选中的DLC到游戏列表
  const addSelectedDlcs = () => {
    const dlcsToAdd = [];
    
    selectedDlcs.forEach(dlcId => {
      // 在所有DLC数据中查找
      Object.values(dlcData).forEach(gameDlcs => {
        const dlc = gameDlcs.find(d => d.appid === dlcId);
        if (dlc) {
          dlcsToAdd.push({
            ...dlc,
            playtime_forever: 0,
            dlc: [] // DLC本身没有子DLC
          });
        }
      });
    });
    
    // 批量添加到游戏列表
    dlcsToAdd.forEach(dlc => {
      actions.addGame(dlc);
    });
    
    if (dlcsToAdd.length > 0) {
      alert(`成功添加 ${dlcsToAdd.length} 个DLC！`);
      handleClose();
    }
  };

  // 关闭模态框
  const handleClose = () => {
    setSelectedDlcs(new Set());
    setSearchTerm('');
    setExpandedGames(new Set());
    onClose();
  };

  // 统计信息
  const stats = useMemo(() => {
    let totalDlcs = 0;
    let filteredDlcs = 0;
    
    Object.values(dlcData).forEach(gameDlcs => {
      totalDlcs += gameDlcs.length;
      filteredDlcs += gameDlcs.filter(dlc => !shouldFilterDlc(dlc)).length;
    });
    
    return { totalDlcs, filteredDlcs };
  }, [dlcData, shouldFilterDlc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-4">浏览DLC</h2>
        <div className='flex overflow-auto gap-5'>
          <div className='max-w-48'>
            {/* 搜索和过滤器 */}
            <div className="space-y-4 mb-4">
              {/* 搜索框 */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="搜索DLC名称..."
              />

              {/* 过滤选项 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">过滤选项</h3>
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hideOst}
                      onChange={(e) => setFilters({ ...filters, hideOst: e.target.checked })}
                      className="mr-2"
                    />
                    隐藏原声音轨
                  </label>
                  <label className="flex items-center text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hideArtbook}
                      onChange={(e) => setFilters({ ...filters, hideArtbook: e.target.checked })}
                      className="mr-2"
                    />
                    隐藏艺术集
                  </label>
                  <label className="flex items-center text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hideBooster}
                      onChange={(e) => setFilters({ ...filters, hideBooster: e.target.checked })}
                      className="mr-2"
                    />
                    隐藏加速包
                  </label>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="flex flex-col justify-between text-sm text-gray-400 flex-wrap">
                <span>共 {gamesWithDlc.length} 个游戏有DLC</span>
                <span>已选择 {selectedDlcs.size} 个DLC</span>
                {stats.totalDlcs > 0 && (
                  <span>显示 {stats.filteredDlcs} / {stats.totalDlcs} 个DLC</span>
                )}
                <p className='text-wrap'>注意：部分DLC可能因为tag不规范而被错误排除，如果没找到请尝试取消过滤选项。</p>
              </div>
            </div>

            {/* 加载进度 */}
            {loading && fetchProgress.total > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>正在加载DLC信息...</span>
                  <span>{fetchProgress.current} / {fetchProgress.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(fetchProgress.current / fetchProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* DLC列表 */}
          <div className="flex-1 overflow-y-auto space-y-2 bg-gray-900 rounded-lg p-4">
            {gamesWithDlc.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>没有找到含有DLC的游戏</p>
                <p className="text-sm mt-2">请先导入Steam游戏库</p>
              </div>
            ) : (
              gamesWithDlc.map((game) => {
                const gameDlcs = dlcData[game.appid] || [];
                const filteredDlcs = gameDlcs.filter(dlc => !shouldFilterDlc(dlc));
                const isExpanded = expandedGames.has(game.appid);
                const isLoading = loadingGame === game.appid;
                
                return (
                  <div key={game.appid} className="bg-gray-800 rounded-lg overflow-hidden">
                    {/* 游戏标题栏 */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => toggleGameExpanded(game.appid)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-lg">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <div>
                          <h3 className="text-white font-semibold">
                            {game.name_cn || game.name}
                          </h3>
                          <span className="text-gray-400 text-sm">
                            {game.dlc.length} 个DLC
                            {isExpanded && filteredDlcs.length !== game.dlc.length && 
                              ` (显示 ${filteredDlcs.length} 个)`}
                          </span>
                        </div>
                      </div>
                      {isLoading && (
                        <div className="text-blue-400 text-sm">加载中...</div>
                      )}
                    </div>

                    {/* DLC列表 */}
                    {isExpanded && (
                      <div className="border-t border-gray-700 max-h-96 overflow-y-auto">
                        {gameDlcs.length === 0 && !isLoading ? (
                          <div className="p-4 text-center text-gray-500">
                            点击加载DLC信息
                          </div>
                        ) : (
                          <div className="p-2 space-y-1">
                            {filteredDlcs.map((dlc) => (
                              <div
                                key={dlc.appid}
                                className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition-colors ${
                                  selectedDlcs.has(dlc.appid) ? 'bg-gray-700' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDlcs.has(dlc.appid)}
                                  onChange={() => toggleDlcSelection(dlc.appid)}
                                  className="flex-shrink-0"
                                />
                                {dlc.capsule_image && (
                                  <img
                                    src={dlc.capsule_image}
                                    alt={dlc.name}
                                    className="w-24 h-12 object-cover rounded"
                                    onError={(e) => e.target.style.display = 'none'}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm truncate">
                                    {dlc.name_cn || dlc.name}
                                  </p>
                                  {dlc.name_cn && dlc.name !== dlc.name_cn && (
                                    <p className="text-gray-500 text-xs truncate">
                                      {dlc.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {filteredDlcs.length === 0 && gameDlcs.length > 0 && (
                              <div className="text-center text-gray-500 py-4">
                                所有DLC都被过滤了
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* 按钮栏 */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setSelectedDlcs(new Set())}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={selectedDlcs.size === 0}
          >
            清除选择 ({selectedDlcs.size})
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              关闭
            </button>
            <button
              onClick={addSelectedDlcs}
              disabled={selectedDlcs.size === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加选中的DLC ({selectedDlcs.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DlcModal;