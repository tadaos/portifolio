# Dev Room — portfólio 3D em three.js

Portfólio de desenvolvedor apresentado como um quarto de dev/gamer em 3D. Uma tela inicial estilo menu de jogo retrô cobre a cena com um blur; ao apertar qualquer tecla (ou tocar), a câmera entra no quarto. Três objetos são clicáveis e aproximam a câmera para mostrar as informações:

| Objeto | Onde | Conteúdo |
| --- | --- | --- |
| Computador antigo na mesa | parede do fundo, esquerda | Projetos |
| TV de tubo com console retrô | parede do fundo, centro | Experiência |
| Quadro de cortiça | parede lateral, direita | Sobre mim e contato |

Tudo é construído com primitivas do three.js (sem modelos externos). A interface é bilíngue (PT-BR / EN) com toggle e persistência em `localStorage`.

## Rodando

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/ com caminhos relativos (serve de qualquer subpasta)
npm run preview   # testa o build
```

## Editando o conteúdo

Todo o texto do portfólio está em `src/content.js`: nome, cargo, projetos, experiências, bio, curiosidades, ferramentas e contato. Campos traduzíveis usam `{ pt: '...', en: '...' }`; URLs, tags e anos ficam num único valor.

## Estrutura

```
src/
├── main.js                 renderer, loop e ligação dos módulos
├── content.js              conteúdo editável (pt/en)
├── state.js                modo da aplicação e emitter de eventos
├── style.css               tela inicial, painéis, HUD, responsivo
├── util/                   tween feito à mão e helpers de matemática
├── scene/                  quarto, mesa+PC, TV+console, quadro, bagunça, telas, luzes
├── camera/                 pontos de câmera e animação de foco
├── interaction/picker.js   raycast de hover e clique
└── ui/                     i18n, tela inicial, painéis, templates, HUD
```

## Ajustando a câmera

Abra `http://localhost:5173/?debug`. No console do navegador:

```js
__tds.orbit()        // libera a câmera para orbitar com o mouse
__tds.pose()         // imprime posição e alvo atuais para copiar em src/camera/focusPoints.js
__tds.orbit(false)   // devolve o controle ao rig
__tds.focusOn('tv')  // 'computer' | 'tv' | 'corkboard'
__tds.back()
```

## Acessibilidade e desempenho

- `prefers-reduced-motion`: sem piscar, sem parallax, transições curtas, TV em quadro fixo.
- Celular: painel vira folha inferior, FOV mais aberto, pixel ratio limitado a 1.5 e sem sombra da luminária.
- Texto dos painéis é HTML normal: selecionável, com links e foco de teclado.
