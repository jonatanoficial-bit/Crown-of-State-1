# Jogo de Simulação Política (Mobile‑First)

Bem‑vindo ao esqueleto inicial de um jogo web mobile‑first de simulação política.  
Este projeto foi concebido como uma base premium, totalmente responsiva e expansível para um simulador político 2D inspirado em títulos como **Tropico**, mas com foco em decisões estratégicas por turnos, interface cinematográfica e arquitetura modular.

## 💡 Visão Geral

Nesta versão inicial você encontrará uma estrutura de pastas organizada, um loop de jogo básico, tela de menu, HUD de indicadores centrais e quatro telas temáticas:

1. **Gabinete do Presidente** – o centro de comando, onde o jogador vê o panorama geral e toma decisões executivas.
2. **Reunião Ministerial** – espaço para reunir conselheiros e definir políticas amplas.
3. **Comércio & Finanças** – área dedicada à economia interna e ao comércio exterior.
4. **Departamento Militar** – painel de segurança, forças armadas e defesa.

Também foi implementado um sistema simples de decisões e eventos, carregados a partir de arquivos JSON, além de uma área administrativa local para criação e edição de conteúdo (mockado em `localStorage`).

## 📁 Estrutura de Pastas

```
political-sim/
│  README.md            # este documento
│  index.html           # menu principal cinematográfico
│  game.html            # interface principal do jogo
│
├─assets/               # imagens, ícones e fontes
│   └─icons.svg         # sprites de ícones em SVG reutilizáveis
│
├─styles/               # folhas de estilo (mobile‑first)
│   ├─main.css          # estilos globais e design system
│   └─admin.css         # estilos específicos da área administrativa
│
├─scripts/              # módulos de JavaScript
│   ├─state.js          # gerenciamento de estado do jogo e persistência
│   ├─game.js           # lógica principal e loop de jogo por turnos
│   └─admin.js          # lógica do painel administrativo
│
├─data/                 # conteúdo base em formato JSON
│   ├─decisions.json    # lista de decisões iniciais por tela
│   └─events.json       # eventos aleatórios iniciais
│
├─content/              # pasta preparada para DLCs/expansões
│   ├─manifest.json     # lista de pacotes disponíveis
│   └─base.json         # exemplo de pacote de conteúdo (vazio)
│
├─admin/                # interface administrativa
│   ├─login.html        # tela de login local
│   └─admin.html        # painel administrativo
│
├─core/                 # espaço reservado para motores e lógica futura
├─ui/                   # componentes de interface reutilizáveis
└─systems/              # módulos de sistemas (economia, diplomacia etc.)
```

### Conteúdo modular
A pasta `content/` contém um `manifest.json` que descreve pacotes de conteúdo adicionais (DLCs) e arquivos separados com dados.  
Cada pacote pode incluir mais decisões, eventos ou até novos sistemas no futuro. O `manifest.json` indica o nome, versão e caminho de cada expansão.  
O carregamento dos pacotes é feito de forma dinâmica no início do jogo; basta adicionar um novo registro no manifest e o arquivo correspondente na pasta `content/`.

### Área Administrativa

O diretório `admin/` oferece uma área de administração local que funciona via `localStorage` (sem backend nesta versão).  
A página `login.html` possui um login simples (usuário: `admin`, senha: `admin`). Após autenticar, o usuário pode acessar `admin.html`, onde é possível:

- Visualizar decisões e eventos carregados.
- Adicionar novas decisões e eventos.
- Exportar ou importar dados em JSON (para integração futura com um backend ou compartilhamento de DLC).

O painel tem uma estrutura preparada para evoluir para integração com banco de dados/servidor quando solicitado.

## 🚀 Como Rodar

Este projeto é completamente estático e não requer servidores ou dependências externas. Para executar localmente:

1. Faça download ou clone o repositório.
2. Abra `index.html` em seu navegador (preferencialmente Chrome, Firefox ou Safari).  
   - Em ambientes mobile, o layout se ajusta automaticamente.
3. Para acessar o painel administrativo, abra `admin/login.html` e autentique‑se.

### GitHub Pages

Para publicar no GitHub Pages, basta colocar todos os arquivos desta pasta na branch `gh-pages` ou na raiz da branch configurada para páginas.  
Como o projeto é estático, não há configuração adicional necessária.

## 🔧 Expansão e Evolução

Esta base foi projetada pensando em expansão contínua. Algumas sugestões de próximos passos:

1. **Sistemas adicionais** — adicionar módulos em `systems/` para economia detalhada, diplomacia, educação, etc.
2. **Novas telas** — criar arquivos HTML ou componentes JavaScript dentro de `ui/` para áreas como Relações Exteriores, Educação, Segurança Interna, Crises, Eleições e Inteligência.
3. **Balanceamento e Conteúdo** — povoar `data/` e `content/` com centenas de decisões e eventos, bem como criar cadeias de eventos e consequências a longo prazo.
4. **Integração Backend** — substituir o uso de `localStorage` por chamadas a uma API, persistindo progresso e conteúdos em um banco de dados.
5. **Polimento visual** — incrementar animações, transições e assets gráficos (imagens, ilustrações ou vídeos) para tornar cada tela ainda mais cinematográfica.

Sinta‑se à vontade para explorar, modificar e evoluir este projeto.  
Contribuições são muito bem‑vindas!
