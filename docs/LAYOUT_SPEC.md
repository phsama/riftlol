# Layout Specification: Riftbound NIGHTS Deck Manager

Este documento detalha o sistema de design, componentes e diretrizes visuais do produto **Riftbound NIGHTS**. Esta especificação serve como base para críticas de UI/UX e futuras evoluções de design.

## 1. Design System (Tokens)

### 1.1 Paleta de Cores

#### Base & Backgrounds
O sistema utiliza uma hierarquia de profundidade baseada em tons escuros e frios.
- **Void:** `#060610` (Background Global)
- **Deep:** `#0a0a18` (Inputs e containers profundos)
- **Base:** `#10101f` (Cards e painéis principais)
- **Raised:** `#18182a` (Elementos destacados)
- **Surface:** `#1e1e32` (Hovers e estados ativos)
- **Overlay:** `#26263e` (Tooltips e menus suspensos)

#### Texto
- **Primary:** `#eaeaf0` (Títulos e corpo principal)
- **Secondary:** `#9999b8` (Subtítulos e labels)
- **Tertiary:** `#666680` (Textos de ajuda e desativados)
- **Inverse:** `#0a0a18` (Texto sobre fundos claros/gold)

#### Acentos (Brand)
- **Gold (Premium/Rare):** Escala de `#fdf8e8` (50) até `#6f561c` (700). Cor principal (400): `#c9a84c`.
- **Rift Blue (Action/Interactive):** Escala de `#e8f0ff` (50) até `#163a8f` (700). Cor principal (400): `#4a7fff`.

#### Domínios (Mecânicas de Jogo)
- **Body:** `#f97316` (Laranja)
- **Calm:** `#10b981` (Verde)
- **Chaos:** `#a855f7` (Roxo)
- **Fury:** `#ef4444` (Vermelho)
- **Mind:** `#0ea5e9` (Azul Claro)
- **Order:** `#eab308` (Amarelo)

### 1.2 Tipografia
- **Display (Títulos):** `Outfit`, sans-serif. Utilizado para cabeçalhos e elementos de destaque.
- **Body (Conteúdo):** `Inter`, sans-serif. Utilizado para todo o texto legível e interface funcional.
- **Escalabilidade:** Base de `16px`, com suavização de fonte (-webkit-font-smoothing) ativa.

### 1.3 Bordas e Arredondamento
- **SM:** `6px` (Botões pequenos, badges)
- **MD:** `10px` (Botões padrão, inputs)
- **LG:** `16px` (Cards, modais pequenos)
- **XL:** `24px` (Páginas, containers grandes)
- **Full:** `9999px` (Pills, badges redondos)

---

## 2. Componentes e Padrões

### 2.1 Efeitos de Superfície
- **Glassmorphism:** Aplicado em modais e painéis flutuantes.
  - `background: rgba(16, 16, 31, 0.7)`
  - `backdrop-filter: blur(16px)`
  - `border: 1px solid rgba(255, 255, 255, 0.06)`
- **Sombras:**
  - **Glow Gold:** Em botões primários e itens lendários.
  - **Card Hover:** Sombra profunda (`0 12px 40px rgba(0,0,0,0.7)`) combinada com um leve brilho dourado lateral.

### 2.2 Botões
- **Primary:** Gradiente de Gold 400 a 500, texto Inverse, sombra de brilho.
- **Secondary:** Fundo Surface, borda sutil, texto Primary.
- **Ghost:** Fundo transparente, transição suave para `rgba(255,255,255,0.05)` no hover.

### 2.3 Badges (Domínios e Raridades)
- **Domínios:** Estilo "pilled" com fundo semitransparente (15% opacidade) da cor do domínio e borda de 25%.
- **Raridades:** Fundo sutil (12%) e cores fixas conforme a raridade (Common, Uncommon, Rare, Legendary).

---

## 3. Estados e Animações
- **Loading:** Skeleton screens com animação de shimmer (linear-gradient 90deg animado).
- **Entradas:** `fade-in` global (300ms) com movimento sutil de `8px` no eixo Y.
- **Stagger:** Elementos de lista em cascata com delay incremental de `0.03s`.
- **Feedback:** Toasts fixos no canto inferior direito com animação de slide.

## 4. Layout e Grid
- **Estrutura:** Mobile-first, utilizando CSS Grid para layouts de página e Flexbox para alinhamentos internos de componentes.
- **Espaçamento:** Segue escala de 12px a 80px dependendo do contexto (ex: 80px de margem superior no footer desktop).
