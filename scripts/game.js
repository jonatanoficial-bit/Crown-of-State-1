/*
 * Módulo principal do jogo.
 * Responsável por carregar dados, exibir telas, gerenciar decisões e eventos.
 */

// === Estado e funções de utilidade ===
// O módulo state.js não é importado aqui para evitar problemas com o carregamento de ES Modules
// em páginas servidas via file://. Em vez disso, as funções e estado são declarados diretamente.

const initialStats = {
  economy: 50,
  popularity: 50,
  stability: 50,
  relations: 50,
  military: 50,
  education: 50,
  corruption: 50,
  cash: 1000
};

const state = {
  turn: 1,
  stats: { ...initialStats }
};

function loadState() {
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

function saveState() {
  try {
    const payload = { turn: state.turn, stats: state.stats };
    localStorage.setItem('gameState', JSON.stringify(payload));
  } catch (e) {
    console.warn('Falha ao salvar estado:', e);
  }
}

function applyEffects(effects) {
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

function nextTurn() {
  state.turn += 1;
  saveState();
}

// Seletores de elementos da interface
const statsContainer = document.getElementById('statsContainer');
const screenContainer = document.getElementById('screenContainer');
const navButtons = document.querySelectorAll('.nav-btn');
const decisionModal = document.getElementById('decisionModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalEffects = document.getElementById('modalEffects');
const applyDecisionBtn = document.getElementById('applyDecision');
const closeModalBtn = document.getElementById('closeModal');
const toast = document.getElementById('eventToast');

// Arrays de fallback contendo o conteúdo padrão de decisões e eventos. Em ambientes "file://"
// o fetch de arquivos JSON pode falhar por restrições de CORS. Estes valores garantem
// funcionamento offline. Eles são equivalentes aos arquivos em data/decisions.json e data/events.json.
const fallbackDecisions = [
  { id: 'president_1', screen: 'president', title: 'Reforma Educacional', description: 'Investir fortemente em educação básica e superior para melhorar a qualificação da população.', effects: { education: 10, economy: -5, popularity: 5, cash: -200 } },
  { id: 'president_2', screen: 'president', title: 'Privatizar Empresas Públicas', description: 'Vender empresas estatais para o setor privado como forma de captar recursos rápidos.', effects: { economy: 8, popularity: -6, corruption: 3, cash: 300 } },
  { id: 'meeting_1', screen: 'meeting', title: 'Criar Programa Social', description: 'Lançar um novo programa de assistência social para famílias de baixa renda.', effects: { popularity: 8, economy: -4, cash: -150 } },
  { id: 'meeting_2', screen: 'meeting', title: 'Nomear Aliado Político', description: 'Substituir um ministro técnico por um aliado político fiel.', effects: { corruption: 7, relations: -2, popularity: 2 } },
  { id: 'finance_1', screen: 'finance', title: 'Reduzir Impostos', description: 'Reduzir a carga tributária para estimular o consumo e agradar a população.', effects: { economy: 8, popularity: 4, corruption: 2, cash: -150 } },
  { id: 'finance_2', screen: 'finance', title: 'Incentivar Exportações', description: 'Conceder incentivos fiscais para empresas que exportam produtos e serviços.', effects: { economy: 6, relations: 4, cash: 100 } },
  { id: 'military_1', screen: 'military', title: 'Cortar Orçamento Militar', description: 'Reduzir os gastos com defesa para investir em outras áreas.', effects: { economy: 5, military: -10, stability: -3, relations: -2, popularity: -1 } },
  { id: 'military_2', screen: 'military', title: 'Modernizar Exército', description: 'Comprar equipamentos e treinar melhor as tropas para modernizar as forças armadas.', effects: { military: 10, economy: -2, cash: -250 } },
  { id: 'military_3', screen: 'military', title: 'Assinar Tratado de Paz', description: 'Firmar um acordo de paz com um país vizinho, reduzindo tensões na fronteira.', effects: { relations: 8, military: -4, stability: 6, corruption: -2 } }
];

const fallbackEvents = [
  { id: 'event_1', title: 'Escândalo de Corrupção', description: 'Um grande esquema de corrupção envolvendo membros do governo veio à tona.', effects: { corruption: 5, popularity: -8, stability: -4 } },
  { id: 'event_2', title: 'Crescimento Econômico', description: 'O PIB registrou alta acima do esperado, elevando o otimismo no país.', effects: { economy: 7, popularity: 3, stability: 2 } },
  { id: 'event_3', title: 'Greve Geral', description: 'Trabalhadores de diversas categorias organizaram uma greve que paralisou o país.', effects: { stability: -6, economy: -5, popularity: -2 } },
  { id: 'event_4', title: 'Visita Diplomática', description: 'Uma visita oficial de um líder estrangeiro melhorou as relações bilaterais.', effects: { relations: 5, stability: 3, popularity: 1 } },
  { id: 'event_5', title: 'Descoberta de Petróleo', description: 'Foram encontrados enormes reservatórios de petróleo no território nacional.', effects: { economy: 10, cash: 500, corruption: 4 } }
];

let decisions = [];
let events = [];
let currentDecision = null;
let currentScreen = 'president';

// Definições das telas
const screens = {
  president: {
    title: 'Gabinete do Presidente',
    description: 'Aqui você visualiza o panorama geral do país e toma decisões executivas que impactam todas as áreas.'
  },
  meeting: {
    title: 'Reunião Ministerial',
    description: 'Converse com seus ministros, alinhe estratégias e nomeie aliados. Suas escolhas determinam o rumo das políticas públicas.'
  },
  finance: {
    title: 'Comércio & Finanças',
    description: 'Gerencie impostos, incentivos e comércio exterior para equilibrar a economia e gerar riqueza.'
  },
  military: {
    title: 'Departamento Militar',
    description: 'Cuide da defesa nacional, invista nas forças armadas ou busque a paz com seus vizinhos.'
  }
};

/**
 * Carrega dados de decisões e eventos, incluindo expansões e alterações do admin.
 */
async function loadContent() {
  // Carrega decisões padrão
  decisions = [...fallbackDecisions];
  events = [...fallbackEvents];
  try {
    const resDec = await fetch('data/decisions.json');
    if (resDec.ok) {
      const defaultDecisions = await resDec.json();
      decisions = [...defaultDecisions];
    }
  } catch (err) {
    // Em ambientes file:// pode falhar; fallback já definido
    console.warn('Falha ao carregar decisions.json, usando fallback.');
  }
  // Carrega eventos padrão
  try {
    const resEv = await fetch('data/events.json');
    if (resEv.ok) {
      const defaultEvents = await resEv.json();
      events = [...defaultEvents];
    }
  } catch (err) {
    console.warn('Falha ao carregar events.json, usando fallback.');
  }

  // Carrega DLCs/expansões listados no manifest
  try {
    const manifestRes = await fetch('content/manifest.json');
    const manifest = await manifestRes.json();
    if (manifest && Array.isArray(manifest.packages)) {
      for (const pkg of manifest.packages) {
        if (pkg.file) {
          const pkgRes = await fetch(`content/${pkg.file}`);
          const pkgData = await pkgRes.json();
          if (pkgData.decisions && Array.isArray(pkgData.decisions)) {
            decisions.push(...pkgData.decisions);
          }
          if (pkgData.events && Array.isArray(pkgData.events)) {
            events.push(...pkgData.events);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Falha ao carregar DLCs:', err);
  }

  // Mescla alterações vindas da área administrativa, se existirem
  try {
    const adminDec = localStorage.getItem('admin_decisions');
    if (adminDec) {
      const parsed = JSON.parse(adminDec);
      if (Array.isArray(parsed)) {
        // Filtra duplicados pelo id
        const existingIds = new Set(decisions.map(d => d.id));
        parsed.forEach(item => {
          if (!existingIds.has(item.id)) {
            decisions.push(item);
          }
        });
      }
    }
    const adminEv = localStorage.getItem('admin_events');
    if (adminEv) {
      const parsed = JSON.parse(adminEv);
      if (Array.isArray(parsed)) {
        const existingIds = new Set(events.map(e => e.id));
        parsed.forEach(ev => {
          if (!existingIds.has(ev.id)) {
            events.push(ev);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Falha ao mesclar dados do admin:', err);
  }
}

/**
 * Renderiza os indicadores na HUD com base no estado atual.
 */
function renderStats() {
  statsContainer.innerHTML = '';
  const keys = Object.keys(state.stats);
  keys.forEach(key => {
    const value = state.stats[key];
    const stat = document.createElement('div');
    stat.className = 'stat';
    const label = document.createElement('div');
    label.className = 'stat-label';
    label.textContent = traduzirChave(key);
    const val = document.createElement('div');
    val.className = 'stat-value';
    val.textContent = typeof value === 'number' ? value : value;
    stat.appendChild(label);
    stat.appendChild(val);
    statsContainer.appendChild(stat);
  });
}

function traduzirChave(key) {
  switch (key) {
    case 'economy': return 'Economia';
    case 'popularity': return 'Popularidade';
    case 'stability': return 'Estabilidade';
    case 'relations': return 'Relações';
    case 'military': return 'Militar';
    case 'education': return 'Educação';
    case 'corruption': return 'Corrupção';
    case 'cash': return 'Caixa';
    default: return key;
  }
}

/**
 * Renderiza uma tela específica com título, descrição e botão de decisão.
 * @param {string} screenId
 */
function renderScreen(screenId) {
  currentScreen = screenId;
  screenContainer.innerHTML = '';
  const config = screens[screenId];
  if (!config) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'screen';
  const title = document.createElement('h3');
  title.textContent = config.title;
  const desc = document.createElement('p');
  desc.className = 'description';
  desc.textContent = config.description;
  const actions = document.createElement('div');
  actions.className = 'actions';
  const decBtn = document.createElement('button');
  decBtn.className = 'btn primary';
  decBtn.textContent = 'Tomar Decisão';
  decBtn.addEventListener('click', () => openDecision(screenId));
  actions.appendChild(decBtn);
  wrapper.appendChild(title);
  wrapper.appendChild(desc);
  wrapper.appendChild(actions);
  screenContainer.appendChild(wrapper);
}

/**
 * Abre o modal com uma decisão aleatória para a tela atual.
 * @param {string} screenId
 */
function openDecision(screenId) {
  const available = decisions.filter(d => d.screen === screenId);
  if (!available.length) {
    alert('Nenhuma decisão disponível para esta tela.');
    return;
  }
  const idx = Math.floor(Math.random() * available.length);
  currentDecision = available[idx];
  modalTitle.textContent = currentDecision.title;
  modalDescription.textContent = currentDecision.description;
  modalEffects.innerHTML = '';
  // Lista efeitos de forma legível
  Object.entries(currentDecision.effects).forEach(([k, v]) => {
    if (!v) return;
    const li = document.createElement('li');
    const sign = v > 0 ? '+' : '';
    li.textContent = `${traduzirChave(k)}: ${sign}${v}`;
    modalEffects.appendChild(li);
  });
  decisionModal.classList.remove('hidden');
}

/**
 * Aplica a decisão selecionada, avança o turno e chama evento aleatório.
 */
function applyCurrentDecision() {
  if (!currentDecision) return;
  applyEffects(currentDecision.effects);
  nextTurn();
  renderStats();
  decisionModal.classList.add('hidden');
  // Limpa a decisão atual
  currentDecision = null;
  // 50% de chance de evento aleatório
  if (Math.random() < 0.6 && events.length) {
    const ev = events[Math.floor(Math.random() * events.length)];
    applyEffects(ev.effects);
    renderStats();
    showToast(`${ev.title}: ${ev.description}`);
  }
}

/**
 * Exibe uma notificação temporária na tela.
 * @param {string} message
 */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 4000);
}

// Configuração de botões e listeners
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-screen');
    // Troca active
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderScreen(target);
  });
});

applyDecisionBtn.addEventListener('click', applyCurrentDecision);
closeModalBtn.addEventListener('click', () => {
  decisionModal.classList.add('hidden');
  currentDecision = null;
});

// Inicialização do jogo
async function init() {
  loadState();
  await loadContent();
  renderStats();
  renderScreen(currentScreen);
}

init();