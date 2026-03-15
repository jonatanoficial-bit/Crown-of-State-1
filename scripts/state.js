/*
 * Módulo de gerenciamento de estado do jogo.
 * Controla os valores dos indicadores centrais e persiste no localStorage.
 */

export const initialStats = {
  economy: 50,
  popularity: 50,
  stability: 50,
  relations: 50,
  military: 50,
  education: 50,
  corruption: 50,
  cash: 1000
};

export const state = {
  turn: 1,
  stats: { ...initialStats }
};

/**
 * Carrega o estado do jogo a partir do localStorage, se existir.
 */
export function loadState() {
  try {
    const stored = localStorage.getItem('gameState');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.stats) {
        state.turn = parsed.turn || 1;
        state.stats = { ...initialStats, ...parsed.stats };
      }
    }
  } catch (e) {
    console.warn('Falha ao carregar estado salvo:', e);
  }
}

/**
 * Salva o estado atual no localStorage.
 */
export function saveState() {
  try {
    const payload = {
      turn: state.turn,
      stats: state.stats
    };
    localStorage.setItem('gameState', JSON.stringify(payload));
  } catch (e) {
    console.warn('Falha ao salvar estado:', e);
  }
}

/**
 * Reinicia o estado do jogo para os valores iniciais.
 */
export function resetState() {
  state.turn = 1;
  state.stats = { ...initialStats };
  saveState();
}

/**
 * Atualiza os indicadores com os efeitos recebidos.
 * Cada valor é clamped entre 0 e 100, exceto cash que não possui limite superior.
 * @param {Object} effects - Mapa de efeitos (ex.: { economy: +5, corruption: -3 })
 */
export function applyEffects(effects) {
  Object.keys(effects).forEach(key => {
    if (key === 'cash') {
      state.stats.cash += effects[key];
    } else if (state.stats[key] !== undefined) {
      const value = state.stats[key] + effects[key];
      state.stats[key] = Math.max(0, Math.min(100, value));
    }
  });
  saveState();
}

/**
 * Avança o contador de turno e salva o estado.
 */
export function nextTurn() {
  state.turn += 1;
  saveState();
}