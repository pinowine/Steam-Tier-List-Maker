import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import steamApi from '../services/steamApi';

function SteamImporter() {
  const { state, actions } = useApp();
  const [steamId, setSteamId] = useState(state.steamId || '');
  const [apiKey, setApiKey] = useState(state.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleImport = async () => {
    if (!steamId || !apiKey) {
      alert('请输入Steam ID和API密钥');
      return;
    }

    // 保存凭据
    actions.setCredentials(steamId, apiKey);
    steamApi.setCredentials(apiKey, steamId);

    // 开始导入
    actions.setLoading(true);
    actions.setError(null);

    try {
      const games = await steamApi.getOwnedGames((progress) => {
        actions.setProgress(progress);
      });

      actions.setGames(games);
      actions.setProgress(null);
      
      alert(`成功导入 ${games.length} 个游戏！`);
    } catch (error) {
      console.error('导入失败:', error);
      actions.setError(error.message);
      alert('导入失败: ' + error.message);
    } finally {
      actions.setLoading(false);
      actions.setProgress(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">导入Steam游戏库</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">
            Steam ID
            <a 
              href="https://steamcommunity.com/discussions/forum/1/364039785160857002/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-400 text-sm hover:underline"
            >
              如何获取?
            </a>
          </label>
          <input
            type="text"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            placeholder="76561198000000000"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            Steam Web API Key
            <a 
              href="https://steamcommunity.com/dev/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-400 text-sm hover:underline"
            >
              获取API Key
            </a>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入您的Steam API密钥"
              className="w-full bg-gray-700 text-white px-4 py-2 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showApiKey ? '隐藏' : '显示'}
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            您的API密钥仅保存在本地浏览器中，不会上传到任何服务器
          </p>
        </div>

        <button
          onClick={handleImport}
          disabled={state.loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.loading ? '导入中...' : '开始导入'}
        </button>

        {state.error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-600 text-red-200 p-3 rounded-lg">
            错误: {state.error}
          </div>
        )}

        {state.games.length > 0 && (
          <div className="bg-green-900 bg-opacity-50 border border-green-600 text-green-200 p-3 rounded-lg">
            已导入 {state.games.length} 个游戏
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">使用说明</h3>
        <ol className="text-gray-300 space-y-2 text-sm">
          <li>1. 确保您的Steam个人资料设置为公开</li>
          <li>2. 在 <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Steam API页面</a> 获取API密钥</li>
          <li>3. 输入您的Steam ID（17位数字）</li>
          <li>4. 点击"开始导入"按钮</li>
          <li>5. 等待导入完成后，即可开始制作Tier List</li>
        </ol>
      </div>
    </div>
  );
}

export default SteamImporter;