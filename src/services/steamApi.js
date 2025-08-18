import axios from 'axios';

// 使用公共CORS代理
const CORS_PROXY = 'https://corsproxy.io/?';
const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_API = 'https://store.steampowered.com/api';

// 工具类软件的AppID列表（需要过滤的）
const TOOL_APP_IDS = [
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
];

class SteamAPI {
  constructor() {
    this.apiKey = null;
    this.steamId = null;
  }

  setCredentials(apiKey, steamId) {
    this.apiKey = apiKey;
    this.steamId = steamId;
  }

  async fetchWithProxy(url) {
    try {
      const response = await axios.get(CORS_PROXY + encodeURIComponent(url));
      return response.data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  async getOwnedGames(onProgress) {
    if (!this.apiKey || !this.steamId) {
      throw new Error('请先设置API密钥和Steam ID');
    }

    const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${this.apiKey}&steamid=${this.steamId}&include_appinfo=1&include_played_free_games=1`;

    onProgress?.({ phase: '获取游戏列表', percent: 10 });
    const data = await this.fetchWithProxy(url);

    if (!data.response || !data.response.games) {
      throw new Error('无法获取游戏列表');
    }

    const games = data.response.games.filter(game =>
      !TOOL_APP_IDS.includes(game.appid)
    );

    onProgress?.({ phase: '过滤游戏列表', percent: 20 });

    // 获取每个游戏的详细信息
    const detailedGames = [];
    const totalGames = games.length;

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const progress = 20 + (i / totalGames) * 70;
      onProgress?.({
        phase: `获取游戏详情 (${i + 1}/${totalGames})`,
        percent: Math.round(progress),
        current: game.name
      });

      try {
        const details = await this.getGameDetails(game.appid);

        // 合并基本信息和详细信息
        detailedGames.push({
          appid: game.appid,
          name: game.name,
          playtime_forever: game.playtime_forever,
          img_icon_url: game.img_icon_url,
          // 从详细信息中获取
          name_cn: details?.name_cn || game.name,
          header_image: details?.header_image,
          capsule_image: details?.capsule_image,
          type: details?.type || 'game',
          categories: details?.categories || [],
          genres: details?.genres || [],
          dlc: details?.dlc || []
        });

        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`获取游戏 ${game.name} 详情失败:`, error);
        // 即使失败也保留基本信息
        detailedGames.push({
          appid: game.appid,
          name: game.name,
          name_cn: game.name,
          playtime_forever: game.playtime_forever,
          img_icon_url: game.img_icon_url,
          header_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
          capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_184x69.jpg`,
          type: 'game'
        });
      }
    }

    onProgress?.({ phase: '完成', percent: 100 });
    return detailedGames;
  }

  async getGameDetails(appid) {
    const cacheKey = `game_details_${appid}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const data = JSON.parse(cached);
        // 缓存7天
        if (Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return data.details;
        }
      } catch (e) {
        console.error('缓存解析失败:', e);
      }
    }

    try {
      const url = `${STEAM_STORE_API}/appdetails?appids=${appid}&cc=cn&l=schinese`;
      const data = await this.fetchWithProxy(url);

      if (data[appid] && data[appid].success && data[appid].data) {
        const gameData = data[appid].data;

        const details = {
          appid: parseInt(appid),
          name: gameData.name || '',
          name_cn: gameData.name || '',
          header_image: gameData.header_image || '',
          capsule_image: gameData.capsule_image || '',
          type: gameData.type || 'game',
          categories: gameData.categories || [],
          genres: gameData.genres || [],
          dlc: gameData.dlc || [],
          price_overview: gameData.price_overview || null,
          release_date: gameData.release_date || null,
          short_description: gameData.short_description || ''
        };

        // 缓存结果
        localStorage.setItem(cacheKey, JSON.stringify({
          details,
          timestamp: Date.now()
        }));

        return details;
      }
    } catch (error) {
      console.error(`获取游戏 ${appid} 详情失败:`, error);
    }

    return null;
  }

  async searchGame(query) {
    // 使用Steam Store搜索API（非官方）
    try {
      const url = `${STEAM_STORE_API}/storesearch?term=${encodeURIComponent(query)}&cc=cn&l=schinese`;
      const data = await this.fetchWithProxy(url);

      if (data.items && data.items.length > 0) {
        return data.items.map(item => ({
          appid: item.id,
          name: item.name,
          tiny_image: item.tiny_image
        }));
      }
    } catch (error) {
      console.error('搜索游戏失败:', error);
    }

    return [];
  }
}

const steamApi = new SteamAPI();

export default steamApi;