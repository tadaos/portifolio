// @ts-check
/**
 * Todo o conteúdo editável do portfólio.
 * Campos traduzíveis usam { pt, en }. URLs, tags e anos ficam num único valor.
 * Troque os dados abaixo pelos seus.
 */
export const content = {
  meta: {
    name: 'Tadao',
    handle: 'tadao.dev',
    title: { pt: 'Desenvolvedor de software', en: 'Software developer' },
    year: 2026,
  },

  ui: {
    pressStart: { pt: 'PRESSIONE QUALQUER TECLA', en: 'PRESS ANY KEY' },
    tapStart: { pt: 'TOQUE PARA COMEÇAR', en: 'TAP TO START' },
    insertCoin: { pt: 'INSIRA UMA FICHA', en: 'INSERT COIN' },
    hintOverview: { pt: 'Clique nos objetos para explorar', en: 'Click the objects to explore' },
    hintFocused: { pt: 'ESC ou clique fora para voltar', en: 'ESC or click outside to go back' },
    hintFocusedTouch: { pt: 'Toque fora para voltar', en: 'Tap outside to go back' },
    back: { pt: 'Voltar', en: 'Back' },
    close: { pt: 'Fechar', en: 'Close' },
    open: { pt: 'abrir', en: 'open' },
    langToggle: { pt: 'EN', en: 'PT' },
    labels: {
      computer: { pt: 'Projetos', en: 'Projects' },
      tv: { pt: 'Experiência', en: 'Experience' },
      corkboard: { pt: 'Sobre mim', en: 'About me' },
    },
    panelTitles: {
      computer: { pt: 'C:\\PROJETOS', en: 'C:\\PROJECTS' },
      tv: { pt: 'SELECIONE A FASE', en: 'SELECT STAGE' },
      corkboard: { pt: 'Quadro de avisos', en: 'Notice board' },
    },
    present: { pt: 'atual', en: 'present' },
    stage: { pt: 'FASE', en: 'STAGE' },
    role: { pt: 'CARGO', en: 'ROLE' },
    period: { pt: 'TEMPO', en: 'TIME' },
    skillsTitle: { pt: 'Ferramentas', en: 'Tools' },
    factsTitle: { pt: 'Coisas aleatórias', en: 'Random things' },
    contactTitle: { pt: 'Fale comigo', en: 'Get in touch' },
  },

  projects: [
    {
      id: 'pixel-tracker',
      title: 'Pixel Tracker',
      year: 2025,
      description: {
        pt: 'Rastreador de hábitos em que cada dia vira um pixel de um sprite que você completa ao longo do mês.',
        en: 'Habit tracker where each day becomes one pixel of a sprite you complete over the month.',
      },
      tags: ['three.js', 'Vite', 'IndexedDB'],
      url: 'https://github.com/seu-usuario/pixel-tracker',
    },
    {
      id: 'retro-sync',
      title: 'RetroSync',
      year: 2024,
      description: {
        pt: 'Sincroniza saves de emuladores entre máquinas, com histórico e restauração por slot.',
        en: 'Syncs emulator save files across machines, with history and per-slot restore.',
      },
      tags: ['Node', 'SQLite', 'CLI'],
      url: 'https://github.com/seu-usuario/retro-sync',
    },
    {
      id: 'cartridge-db',
      title: 'Cartridge DB',
      year: 2024,
      description: {
        pt: 'Catálogo da coleção de cartuchos com leitura de código de barras pela câmera.',
        en: 'Catalog for a cartridge collection with barcode scanning from the camera.',
      },
      tags: ['React', 'PostgreSQL', 'PWA'],
      url: 'https://github.com/seu-usuario/cartridge-db',
    },
    {
      id: 'crt-css',
      title: 'crt.css',
      year: 2023,
      description: {
        pt: 'Biblioteca CSS minúscula de efeitos de tela de tubo: scanlines, curvatura e flicker.',
        en: 'Tiny CSS library of CRT effects: scanlines, curvature and flicker.',
      },
      tags: ['CSS', 'npm'],
      url: 'https://github.com/seu-usuario/crt-css',
    },
    {
      id: 'lofi-deploy',
      title: 'Lofi Deploy',
      year: 2022,
      description: {
        pt: 'Ferramenta de deploy para sites estáticos em VPS barata, com rollback em um comando.',
        en: 'Deploy tool for static sites on a cheap VPS, with one-command rollback.',
      },
      tags: ['Go', 'SSH', 'Nginx'],
      url: 'https://github.com/seu-usuario/lofi-deploy',
    },
  ],

  experience: [
    {
      id: 'pixel-forge',
      company: 'Pixel Forge Studio',
      role: { pt: 'Desenvolvedor front-end sênior', en: 'Senior front-end developer' },
      from: '2023',
      to: null,
      bullets: {
        pt: [
          'Lidero o front-end de um editor de níveis no navegador usado por 40 mil criadores.',
          'Migrei o renderizador de Canvas 2D para WebGL e reduzi o tempo de frame pela metade.',
          'Mantenho o design system compartilhado entre três produtos.',
        ],
        en: [
          'Lead the front-end of a browser level editor used by 40k creators.',
          'Migrated the renderer from Canvas 2D to WebGL and halved frame time.',
          'Maintain the design system shared by three products.',
        ],
      },
    },
    {
      id: 'nimbus',
      company: 'Nimbus Labs',
      role: { pt: 'Desenvolvedor full-stack', en: 'Full-stack developer' },
      from: '2020',
      to: '2023',
      bullets: {
        pt: [
          'Construí a API de faturamento em Node e PostgreSQL que processa 2 milhões de eventos por dia.',
          'Introduzi testes de contrato entre serviços e cortei incidentes de integração.',
        ],
        en: [
          'Built the billing API in Node and PostgreSQL that handles 2M events a day.',
          'Introduced contract tests between services and cut integration incidents.',
        ],
      },
    },
    {
      id: 'bitmap',
      company: 'Agência Bitmap',
      role: { pt: 'Desenvolvedor júnior', en: 'Junior developer' },
      from: '2018',
      to: '2020',
      bullets: {
        pt: [
          'Entreguei mais de 30 sites institucionais e lojas virtuais.',
          'Automatizei o pipeline de build e deploy da agência.',
        ],
        en: [
          'Shipped more than 30 marketing sites and online stores.',
          'Automated the agency build and deploy pipeline.',
        ],
      },
    },
    {
      id: 'intern',
      company: 'Laboratório de Computação Gráfica',
      role: { pt: 'Estagiário de pesquisa', en: 'Research intern' },
      from: '2016',
      to: '2018',
      bullets: {
        pt: ['Visualizações científicas em WebGL para o grupo de simulação de fluidos.'],
        en: ['Scientific visualizations in WebGL for the fluid simulation group.'],
      },
    },
  ],

  about: {
    bio: {
      pt: 'Faço software para a web desde 2016. Gosto de interfaces que respondem rápido, de gráficos em tempo real e de código que dá para ler um ano depois. Quando não estou programando, estou consertando algum console antigo.',
      en: 'I have been building software for the web since 2016. I like interfaces that respond fast, real-time graphics and code that still reads well a year later. When I am not coding I am fixing some old console.',
    },
    facts: {
      pt: ['Café antes de qualquer commit', 'Super Nintendo é o melhor console', 'Teclado mecânico, switch marrom', 'Ainda uso vim'],
      en: ['Coffee before any commit', 'SNES is the best console', 'Mechanical keyboard, brown switches', 'Still use vim'],
    },
    skills: ['JavaScript', 'TypeScript', 'three.js', 'React', 'Node', 'PostgreSQL', 'CSS', 'Go'],
    contact: {
      email: 'voce@exemplo.com',
      github: 'https://github.com/seu-usuario',
      linkedin: 'https://linkedin.com/in/seu-usuario',
    },
  },
};
