import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  games: [],
  tiers: {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: [],
    unranked: []
  },
  loading: false,
  progress: null,
  error: null,
  steamId: '',
  apiKey: ''
};

const actionTypes = {
  SET_GAMES: 'SET_GAMES',
  ADD_GAME: 'ADD_GAME',
  REMOVE_GAME: 'REMOVE_GAME',
  UPDATE_TIERS: 'UPDATE_TIERS',
  MOVE_GAME: 'MOVE_GAME',
  SET_LOADING: 'SET_LOADING',
  SET_PROGRESS: 'SET_PROGRESS',
  SET_ERROR: 'SET_ERROR',
  SET_CREDENTIALS: 'SET_CREDENTIALS',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
  RESET_ALL: 'RESET_ALL'
};

function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_GAMES:
      const newGames = action.payload;
      // 将新游戏添加到unranked层级
      const unrankedGames = newGames.map(game => game.appid);
      return {
        ...state,
        games: newGames,
        tiers: {
          ...state.tiers,
          unranked: [...state.tiers.unranked, ...unrankedGames]
        }
      };

    case actionTypes.ADD_GAME:
      const gameToAdd = action.payload;
      // 检查游戏是否已存在
      if (state.games.find(g => g.appid === gameToAdd.appid)) {
        return state;
      }
      return {
        ...state,
        games: [...state.games, gameToAdd],
        tiers: {
          ...state.tiers,
          unranked: [...state.tiers.unranked, gameToAdd.appid]
        }
      };

    case actionTypes.REMOVE_GAME:
      const appidToRemove = action.payload;
      const newTiers = { ...state.tiers };
      // 从所有层级中移除游戏
      Object.keys(newTiers).forEach(tier => {
        newTiers[tier] = newTiers[tier].filter(id => id !== appidToRemove);
      });
      return {
        ...state,
        games: state.games.filter(g => g.appid !== appidToRemove),
        tiers: newTiers
      };

    case actionTypes.UPDATE_TIERS:
      return {
        ...state,
        tiers: action.payload
      };

    case actionTypes.MOVE_GAME:
      const { gameId, fromTier, toTier, toIndex } = action.payload;
      const updatedTiers = { ...state.tiers };
      
      // 从原层级移除
      if (fromTier) {
        updatedTiers[fromTier] = updatedTiers[fromTier].filter(id => id !== gameId);
      }
      
      // 添加到新层级
      if (toTier) {
        const targetTier = [...updatedTiers[toTier]];
        if (toIndex !== undefined) {
          targetTier.splice(toIndex, 0, gameId);
        } else {
          targetTier.push(gameId);
        }
        updatedTiers[toTier] = targetTier;
      }
      
      return {
        ...state,
        tiers: updatedTiers
      };

    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_PROGRESS:
      return { ...state, progress: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case actionTypes.SET_CREDENTIALS:
      return {
        ...state,
        steamId: action.payload.steamId,
        apiKey: action.payload.apiKey
      };

    case actionTypes.LOAD_FROM_STORAGE:
      return {
        ...state,
        ...action.payload
      };

    case actionTypes.RESET_ALL:
      return initialState;

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 从localStorage加载数据
  useEffect(() => {
    const savedState = localStorage.getItem('steamTierListState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: actionTypes.LOAD_FROM_STORAGE, payload: parsed });
      } catch (error) {
        console.error('加载保存的数据失败:', error);
      }
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    if (state.games.length > 0 || Object.values(state.tiers).some(tier => tier.length > 0)) {
      localStorage.setItem('steamTierListState', JSON.stringify({
        games: state.games,
        tiers: state.tiers,
        steamId: state.steamId,
        apiKey: state.apiKey
      }));
    }
  }, [state.games, state.tiers, state.steamId, state.apiKey]);

  const value = {
    state,
    dispatch,
    actions: {
      setGames: (games) => dispatch({ type: actionTypes.SET_GAMES, payload: games }),
      addGame: (game) => dispatch({ type: actionTypes.ADD_GAME, payload: game }),
      removeGame: (appid) => dispatch({ type: actionTypes.REMOVE_GAME, payload: appid }),
      updateTiers: (tiers) => dispatch({ type: actionTypes.UPDATE_TIERS, payload: tiers }),
      moveGame: (gameId, fromTier, toTier, toIndex) => 
        dispatch({ type: actionTypes.MOVE_GAME, payload: { gameId, fromTier, toTier, toIndex } }),
      setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
      setProgress: (progress) => dispatch({ type: actionTypes.SET_PROGRESS, payload: progress }),
      setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
      setCredentials: (steamId, apiKey) => 
        dispatch({ type: actionTypes.SET_CREDENTIALS, payload: { steamId, apiKey } }),
      resetAll: () => dispatch({ type: actionTypes.RESET_ALL })
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp必须在AppProvider内使用');
  }
  return context;
}