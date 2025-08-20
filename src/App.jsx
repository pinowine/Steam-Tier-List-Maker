import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import SteamImporter from './components/SteamImporter';
import TierList from './components/TierList';
import ProgressBar from './components/ProgressBar';
import AddGameModal from './components/AddGameModal';
import DlcModal from './components/DlcModal';
import './styles/globals.css';

function AppContent() {
  const { state } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDlcModal, setShowDlcModal] = useState(false); 

  return (
    <div className="min-h-screen bg-gray-950">
      {/* 进度条 */}
      <ProgressBar progress={state.progress} />

      {/* 头部 */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Steam Tier List Maker</h1>
              <p className="text-gray-400 mt-1">创建您的游戏评级列表</p>
            </div>
            {state.games.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDlcModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-xl mt-[-2px]">🎮</span>
                  浏览DLC
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-xl mt-[-4px]">+</span>
                  添加游戏
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {state.games.length === 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Steam导入器 */}
            <SteamImporter />
            
            {/* 快速开始说明 */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">快速开始</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">导入Steam游戏库</h3>
                    <p className="text-gray-400 text-sm">使用您的Steam ID和API密钥导入游戏</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">拖拽排序</h3>
                    <p className="text-gray-400 text-sm">将游戏拖拽到对应的评级层级</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">定制您的表单</h3>
                    <p className="text-gray-400 text-sm">编辑标题、表单头和色板并选择可显示的字段</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">添加DLC和更多游戏</h3>
                    <p className="text-gray-400 text-sm">点选合适的DLC并完善家庭库和非Steam游戏库</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">导出分享</h3>
                    <p className="text-gray-400 text-sm">将您的Tier List导出为图片分享</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-yellow-400 font-semibold mb-2">💡 提示</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 您的数据会自动保存在浏览器本地</li>
                  <li>• API密钥不会上传到任何服务器</li>
                  <li>• 读取需要时间，失败时请检查网络连接，必要时可挂梯</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tier List主界面 */}
            <TierList />
          </>
        )}
      </main>

      {/* 添加游戏模态框 */}
      <AddGameModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* DLC浏览模态框 */}
      <DlcModal isOpen={showDlcModal} onClose={() => setShowDlcModal(false)} />

      {/* 页脚 */}
      <footer className="mt-auto border-t border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-400 text-sm">
            Steam Tier List Maker - 数据保存在本地浏览器中 - 项目存储于 <a href='https://github.com/pinowine/Steam-Tier-List-Maker' className='text-blue-400'>Github</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;