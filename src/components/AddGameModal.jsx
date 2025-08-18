import React, { useState } from 'react';
import steamApi from '../services/steamApi';
import { useApp } from '../contexts/AppContext';

function AddGameModal({ isOpen, onClose }) {
  const { actions } = useApp();
  const [activeTab, setActiveTab] = useState('manual'); // manual, steamId, search
  const [formData, setFormData] = useState({
    name: '',
    name_cn: '',
    appid: '',
    imageUrl: '',
    playtimeForever: 0,
    type: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  const handleManualAdd = () => {
    if (!formData.name) {
      alert('请输入游戏名称');
      return;
    }

    const newGame = {
      appid: formData.appid || `custom_${Date.now()}`,
      name: formData.name,
      name_cn: formData.name_cn || formData.name,
      header_image: formData.imageUrl || `https://via.placeholder.com/460x215/1b2838/ffffff?text=${encodeURIComponent(formData.name)}`,
      capsule_image: formData.imageUrl || `https://via.placeholder.com/184x69/1b2838/ffffff?text=${encodeURIComponent(formData.name)}`,
      playtime_forever: formData.playtimeForever * 60,
      type: formData.type,
      parentGame: null
    };

    actions.addGame(newGame);
    handleClose();
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    setSearching(true);
    try {
      const results = await steamApi.searchGame(searchQuery);
      setSearchResults(results);
    } catch (error) {
      alert('搜索失败: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = async (game) => {
    setSearching(true);
    try {
      const details = await steamApi.getGameDetails(game.appid);
      console.log(details)
      const newGame = {
        appid: game.appid,
        name: game.name,
        name_cn: details?.name_cn || game.name,
        header_image: details?.header_image || game.tiny_image,
        capsule_image: details?.capsule_image || game.tiny_image,
        playtime_forever: '非本机',
        type: details?.type || 'game',
        dlc: details?.dlc
      };
      actions.addGame(newGame);
      handleClose();
    } catch (error) {
      alert('添加游戏失败: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', name_cn: '', appid: '', imageUrl: '' });
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">添加游戏</h2>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'manual' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            手动添加
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'search' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            搜索Steam
          </button>
        </div>

        {/* 手动添加 */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">游戏名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: Cyberpunk 2077"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">图片URL（可选）</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="游戏封面图片链接"
              />
            </div>
            <button
              onClick={handleManualAdd}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              添加游戏
            </button>
          </div>
        )}

        {/* 搜索Steam */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入游戏名称搜索"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {searching ? '搜索中...' : '搜索'}
              </button>
            </div>

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((game) => (
                  <div
                    key={game.appid}
                    onClick={() => handleSelectSearchResult(game)}
                    className="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                  >
                    {game.tiny_image && (
                      <img src={game.tiny_image} alt={game.name} className="w-16 h-8 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-medium">{game.name}</p>
                      <p className="text-gray-400 text-sm">ID: {game.appid}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 关闭按钮 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddGameModal;