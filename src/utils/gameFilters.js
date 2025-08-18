// 工具类软件的AppID列表
export const TOOL_APP_IDS = new Set([
  607380, // Fences 3
  365670,  // Blender
  1173770, // Wallpaper Engine: Wallpaper Editor
  431960,  // Wallpaper Engine
  1070560, // Wallpaper Engine: Workshop Tool
  1493710, // Proton Experimental
  1420170, // Proton 6.3-8
  1887720, // Proton 7.0-6
  2230260, // Proton 8.0-5
  1391110, // Steam Linux Runtime
  1628350, // Steam Linux Runtime - Soldier
  228980,  // Steamworks Common Redistributables
  1391110, // Steam Linux Runtime 2.0
  250820,  // SteamVR
  323910,  // SteamVR Performance Test
  431730, // Aesprite
  616720, // Live2DViewerEX
]);

// 工具类软件的关键词
export const TOOL_KEYWORDS = [
  'redistributable',
  'runtime',
  'sdk',
  'server',
  'dedicated',
  'benchmark',
  'performance test',
  'workshop tool',
  'development',
  'proton',
  'compatibility tool'
];

/**
 * 判断是否为工具类软件
 * @param {Object} game - 游戏对象
 * @returns {boolean}
 */
export function isToolSoftware(game) {
  // 检查AppID
  if (TOOL_APP_IDS.has(game.appid)) {
    return true;
  }

  // 检查类型
  if (game.type && game.type !== 'game') {
    return true;
  }

  // 检查分类
  if (game.categories) {
    const toolCategories = ['Software', 'Video Production', 'Audio Production', 'Design & Illustration'];
    if (game.categories.some(cat => toolCategories.includes(cat.description))) {
      return true;
    }
  }

  // 检查名称关键词
  if (game.name) {
    const nameLower = game.name.toLowerCase();
    if (TOOL_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
  }

  return false;
}

/**
 * 过滤游戏列表
 * @param {Array} games - 游戏列表
 * @returns {Array} 过滤后的游戏列表
 */
export function filterGames(games) {
  return games.filter(game => !isToolSoftware(game));
}

/**
 * 格式化游戏时间
 * @param {number} minutes - 游戏时间（分钟）
 * @returns {string}
 */
export function formatPlaytime(minutes) {
  if (!minutes || minutes === 0) {
    return '未玩过';
  }

  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天 ${hours % 24}小时`;
  } else if (hours > 0) {
    return `${hours}小时`;
  } else {
    return `${minutes}分钟`;
  }
}

/**
 * 获取游戏显示名称
 * @param {Object} game - 游戏对象
 * @returns {string}
 */
export function getGameDisplayName(game) {
  return game.name_cn || game.name || 'Unknown Game';
}

/**
 * 获取游戏图片URL
 * @param {Object} game - 游戏对象
 * @param {string} type - 图片类型 (capsule, header, hero)
 * @returns {string}
 */
export function getGameImageUrl(game, type = 'capsule') {
  const baseUrl = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

  switch (type) {
    case 'capsule':
      return game.capsule_image || `${baseUrl}/${game.appid}/capsule_184x69.jpg`;
    case 'header':
      return game.header_image || `${baseUrl}/${game.appid}/header.jpg`;
    case 'hero':
      return game.hero_image || `${baseUrl}/${game.appid}/hero_capsule.jpg`;
    case 'library':
      return `${baseUrl}/${game.appid}/library_600x900.jpg`;
    default:
      return game.capsule_image || `${baseUrl}/${game.appid}/capsule_184x69.jpg`;
  }
}

/**
 * 排序游戏列表
 * @param {Array} games - 游戏列表
 * @param {string} sortBy - 排序方式 (name, playtime, recent)
 * @returns {Array}
 */
export function sortGames(games, sortBy = 'name') {
  const sorted = [...games];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) =>
        getGameDisplayName(a).localeCompare(getGameDisplayName(b), 'zh-CN')
      );
    case 'playtime':
      return sorted.sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0));
    case 'recent':
      return sorted.sort((a, b) => (b.rtime_last_played || 0) - (a.rtime_last_played || 0));
    default:
      return sorted;
  }
}

/**
 * 导出Tier List为JSON
 * @param {Object} tiers - Tier数据
 * @param {Array} games - 游戏列表
 * @returns {string}
 */
export function exportToJSON(tiers, games) {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tiers: {},
    games: {}
  };

  // 构建tier数据
  Object.keys(tiers).forEach(tier => {
    exportData.tiers[tier] = tiers[tier];
  });

  // 构建游戏数据（只保留必要信息）
  games.forEach(game => {
    exportData.games[game.appid] = {
      appid: game.appid,
      name: game.name,
      name_cn: game.name_cn,
      playtime_forever: game.playtime_forever
    };
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * 从JSON导入Tier List
 * @param {string} jsonString - JSON字符串
 * @returns {Object}
 */
export function importFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data.version || !data.tiers || !data.games) {
      throw new Error('无效的导入文件格式');
    }

    // 重建游戏列表
    const games = Object.values(data.games);

    return {
      tiers: data.tiers,
      games: games
    };
  } catch (error) {
    console.error('导入失败:', error);
    throw new Error('导入文件解析失败');
  }
}