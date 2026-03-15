/*
 * Script do painel administrativo.
 * Carrega dados de decisões e eventos do localStorage ou dos arquivos JSON iniciais,
 * permite adicionar/remover itens e exportar/importar o conjunto completo de dados.
 */

// Verifica se usuário está logado; caso contrário, redireciona para login
if (!localStorage.getItem('adminLoggedIn')) {
  window.location.href = 'login.html';
}

// Referências de elementos
const decisionsTableBody = document.querySelector('#decisionsTable tbody');
const eventsTableBody = document.querySelector('#eventsTable tbody');
const decisionForm = document.getElementById('decisionForm');
const eventForm = document.getElementById('eventForm');
const exportBtn = document.getElementById('exportData');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const logoutBtn = document.getElementById('logoutBtn');

// Valores de fallback caso o carregamento de JSON falhe (ambiente file://)
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

// Carrega dados do localStorage ou dos arquivos iniciais
async function loadData() {
  const storedDec = localStorage.getItem('admin_decisions');
  const storedEv = localStorage.getItem('admin_events');
  if (storedDec) {
    try {
      decisions = JSON.parse(storedDec);
    } catch (e) {
      console.warn('Erro ao parsear decisões do localStorage:', e);
    }
  } else {
    try {
      const resp = await fetch('../data/decisions.json');
      if (resp.ok) {
        decisions = await resp.json();
        localStorage.setItem('admin_decisions', JSON.stringify(decisions));
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (err) {
      // Fallback: usa decisões incorporadas
      decisions = [...fallbackDecisions];
      localStorage.setItem('admin_decisions', JSON.stringify(decisions));
    }
  }
  if (storedEv) {
    try {
      events = JSON.parse(storedEv);
    } catch (e) {
      console.warn('Erro ao parsear eventos do localStorage:', e);
    }
  } else {
    try {
      const resp = await fetch('../data/events.json');
      if (resp.ok) {
        events = await resp.json();
        localStorage.setItem('admin_events', JSON.stringify(events));
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (err) {
      events = [...fallbackEvents];
      localStorage.setItem('admin_events', JSON.stringify(events));
    }
  }
  renderDecisions();
  renderEvents();
}

// Renderiza a tabela de decisões
function renderDecisions() {
  decisionsTableBody.innerHTML = '';
  decisions.forEach((dec, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${dec.id}</td><td>${mapScreen(dec.screen)}</td><td>${dec.title}</td><td><button class="btn secondary" data-index="${index}" data-type="dec">Remover</button></td>`;
    decisionsTableBody.appendChild(tr);
  });
}

// Renderiza a tabela de eventos
function renderEvents() {
  eventsTableBody.innerHTML = '';
  events.forEach((ev, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${ev.id}</td><td>${ev.title}</td><td><button class="btn secondary" data-index="${index}" data-type="ev">Remover</button></td>`;
    eventsTableBody.appendChild(tr);
  });
}

function mapScreen(key) {
  switch (key) {
    case 'president':
      return 'Gabinete';
    case 'meeting':
      return 'Ministros';
    case 'finance':
      return 'Finanças';
    case 'military':
      return 'Militar';
    default:
      return key;
  }
}

// Adiciona nova decisão
decisionForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const screen = document.getElementById('decScreen').value;
  const title = document.getElementById('decTitle').value.trim();
  const description = document.getElementById('decDescription').value.trim();
  const effects = {
    economy: parseInt(document.getElementById('effEconomy').value) || 0,
    popularity: parseInt(document.getElementById('effPopularity').value) || 0,
    stability: parseInt(document.getElementById('effStability').value) || 0,
    relations: parseInt(document.getElementById('effRelations').value) || 0,
    military: parseInt(document.getElementById('effMilitary').value) || 0,
    education: parseInt(document.getElementById('effEducation').value) || 0,
    corruption: parseInt(document.getElementById('effCorruption').value) || 0,
    cash: parseInt(document.getElementById('effCash').value) || 0
  };
  const id = `${screen}_${Date.now()}`;
  const newDecision = { id, screen, title, description, effects };
  decisions.push(newDecision);
  localStorage.setItem('admin_decisions', JSON.stringify(decisions));
  renderDecisions();
  decisionForm.reset();
});

// Adiciona novo evento
eventForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('evTitle').value.trim();
  const description = document.getElementById('evDescription').value.trim();
  const effects = {
    economy: parseInt(document.getElementById('evEconomy').value) || 0,
    popularity: parseInt(document.getElementById('evPopularity').value) || 0,
    stability: parseInt(document.getElementById('evStability').value) || 0,
    relations: parseInt(document.getElementById('evRelations').value) || 0,
    military: parseInt(document.getElementById('evMilitary').value) || 0,
    education: parseInt(document.getElementById('evEducation').value) || 0,
    corruption: parseInt(document.getElementById('evCorruption').value) || 0,
    cash: parseInt(document.getElementById('evCash').value) || 0
  };
  const id = `event_${Date.now()}`;
  const newEvent = { id, title, description, effects };
  events.push(newEvent);
  localStorage.setItem('admin_events', JSON.stringify(events));
  renderEvents();
  eventForm.reset();
});

// Remover decisão ou evento utilizando delegação de eventos
document.addEventListener('click', function (e) {
  const btn = e.target.closest('button[data-index]');
  if (btn) {
    const index = parseInt(btn.getAttribute('data-index'));
    const type = btn.getAttribute('data-type');
    if (type === 'dec') {
      decisions.splice(index, 1);
      localStorage.setItem('admin_decisions', JSON.stringify(decisions));
      renderDecisions();
    } else if (type === 'ev') {
      events.splice(index, 1);
      localStorage.setItem('admin_events', JSON.stringify(events));
      renderEvents();
    }
  }
});

// Exporta os dados como arquivo JSON
exportBtn.addEventListener('click', function () {
  const payload = JSON.stringify({ decisions, events }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'game_data_export.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Importa dados de um arquivo JSON
importBtn.addEventListener('click', function () {
  importFile.click();
});

importFile.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (data.decisions && data.events) {
        decisions = data.decisions;
        events = data.events;
        localStorage.setItem('admin_decisions', JSON.stringify(decisions));
        localStorage.setItem('admin_events', JSON.stringify(events));
        renderDecisions();
        renderEvents();
        alert('Dados importados com sucesso!');
      } else {
        alert('Arquivo inválido. É necessário um objeto com "decisions" e "events".');
      }
    } catch (err) {
      alert('Erro ao ler o arquivo: ' + err.message);
    }
  };
  reader.readAsText(file);
  importFile.value = '';
});

// Botão de logout
logoutBtn.addEventListener('click', function () {
  localStorage.removeItem('adminLoggedIn');
  window.location.href = 'login.html';
});

// Inicialização
loadData();