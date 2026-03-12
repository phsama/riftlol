# Riftnights — Página “Como Jogar?” (handoff para dev)

## Objetivo da página
Explicar as regras-base de Riftbound de forma clara, escaneável e elegante, usando texto objetivo + apoio visual funcional.

## Tom
Didático, confiante, enxuto, com cara de produto premium. Evitar parecer wiki seca e também evitar parecer landing page com excesso de arte decorativa.

## Estrutura da página

### 1. Hero
**Eyebrow:** Guia Essencial  
**Título:** Como Jogar Riftbound  
**Subtítulo:** Entenda o objetivo da partida, como funcionam as cartas, as Runes, o turno, o combate e os principais termos do jogo para começar a jogar com segurança.  
**CTA primário:** Ver regras  
**CTA secundário:** Explorar keywords

---

### 2. Visão Geral
**Título:** O que é Riftbound?  
**Texto:**  
Riftbound é um trading card game em que os jogadores disputam o controle de Battlefields usando campeões, unidades, magias, equipamentos e recursos. Mais do que apenas vencer cartas inimigas, o foco do jogo está em conquistar posições, sustentar vantagem e administrar bem o ritmo da partida.

---

### 3. Objetivo do Jogo
**Título:** Como vencer uma partida  
**Texto:**  
No formato padrão, vence quem chegar primeiro a 8 pontos. Você marca pontos ao conquistar Battlefields e também ao começar seu turno ainda controlando um deles. O ponto final exige condição especial: ele precisa vir de segurar um Battlefield até o seu próximo turno ou de conquistar os dois Battlefields no mesmo turno.

---

### 4. O que você precisa
**Título:** Estrutura básica da partida  
**Itens:**
- 1 Champion Legend
- 1 Chosen Champion
- 1 Main Deck com 39 cartas
- 1 Rune Deck com 12 cartas
- 3 Battlefields por jogador

**Texto de apoio:**  
Durante a partida padrão, dois Battlefields ficam ativos ao mesmo tempo.

**Asset sugerido:** `assets/01_table_layout.svg`

---

### 5. Estrutura do Deck
**Título:** Como o deck é dividido  
**Blocos:**
- **Champion Legend:** seu campeão principal, que define a identidade do deck.
- **Chosen Champion:** sua unidade especial garantida fora do Main Deck.
- **Main Deck:** 39 cartas com Units, Spells, Gear e demais peças da estratégia.
- **Rune Deck:** 12 cartas separadas para gerar recursos.
- **Battlefields:** 3 territórios que você disputa para pontuar.

---

### 6. Tipos de Carta
**Título:** Entendendo cada tipo de carta  
**Blocos:**
- **Legends:** campeões principais com habilidades centrais.
- **Units:** cartas que lutam pelos Battlefields.
- **Spells:** efeitos de uso único.
- **Gear:** permanentes de suporte.
- **Equipment:** Gear anexado a Units.
- **Runes:** recursos do jogo.
- **Tokens:** permanentes criados por efeito.

**Asset sugerido:** `assets/02_card_anatomy.svg`

---

### 7. Domains
**Título:** As identidades do jogo  
**Texto:**  
Domains são as facções de Riftbound. Seu Champion Legend define quais Domains o deck pode usar, e isso influencia as cartas disponíveis e a forma como as sinergias funcionam.

**Cards:**
- Fury — agressão e pressão
- Calm — cura e resistência
- Mind — truques e controle
- Body — força bruta
- Chaos — risco e explosão
- Order — proteção e consistência

**Asset sugerido:** `assets/05_domains_grid.svg`

---

### 8. Como funcionam as Runes
**Título:** O sistema de recursos  
**Blocos:**
- **Energy:** pago ao exaurir Runes.
- **Power:** pago ao reciclar uma Rune do Domain correspondente.
- **Regra importante:** a mesma Rune pode pagar Energy primeiro e depois ser reciclada para cobrir Power no mesmo pagamento.

---

### 9. Preparação da partida
**Título:** Antes de começar  
**Passos:**
1. Coloque seu Legend na Legend Zone.
2. Coloque seu Chosen Champion na Champion Zone.
3. Prepare Main Deck, Rune Deck e Battlefields.
4. Compre 4 cartas.
5. Faça mulligan de até 2 cartas.
6. Inicie a partida com 2 Battlefields ativos, um escolhido por cada jogador.

---

### 10. Fases do turno
**Título:** O turno em Riftbound  
**Blocos:**
- **Awaken:** desvire cartas exaustas.
- **Beginning:** marque pontos de Hold e resolva efeitos de início de turno.
- **Channel:** pegue 2 Runes do topo do Rune Deck.
- **Draw:** compre 1 carta.
- **Action Phase:** jogue cartas, mova Units, inicie combate e use habilidades.

**Texto de apoio:**  
No fim do turno, efeitos finais resolvem e todo o dano é removido das Units sobreviventes.

**Asset sugerido:** `assets/03_turn_flow.svg`

---

### 11. Combate
**Título:** Como funciona um Showdown  
**Texto:**  
O combate em Riftbound é chamado de Showdown e começa quando uma Unit é movida para um Battlefield.

**Sub-blocos:**
- **Open Showdown:** acontece quando o Battlefield não tem Units inimigas.
- **Combat Showdown:** acontece quando os dois lados têm Units no mesmo Battlefield.
- **Might:** representa ao mesmo tempo o dano causado e o dano suportado por uma Unit.
- **Distribuição de dano:** o dano é aplicado simultaneamente e deve ser atribuído de forma letal a uma Unit antes de passar para outra.

**Asset sugerido:** `assets/04_showdown_example.svg`

---

### 12. Timing
**Título:** Actions e Reactions  
**Texto:**  
O combate não é apenas uma soma de força. Durante um Showdown, os jogadores podem usar Actions e Reactions para alterar o resultado da disputa antes que o dano resolva. É aqui que boa parte da profundidade de Riftbound aparece.

---

### 13. Keywords Importantes
**Título:** Termos que você vai ver nas cartas  
**Lista curta recomendada para a página principal:**
- Accelerate
- Assault
- Deathknell
- Deflect
- Echo
- Equip
- Ganking
- Hidden
- Legion
- Quick-Draw
- Shield
- Tank
- Temporary
- Unique
- Vision
- Weaponmaster

**UX recomendada:** accordion ou grid de cards expansíveis.

---

### 14. Dicas para iniciantes
**Título:** Como aprender mais rápido  
**Lista:**
- Comece com um Champion Deck.
- Construa o deck ao redor do seu Legend.
- Não disperse sua estratégia.
- Use até 3 cópias das cartas-chave.
- Administre suas Runes com cuidado.

---

### 15. Modos de jogo
**Título:** Formatos disponíveis  
**Blocos:**
- Duel
- Match
- Skirmish
- War
- Magma Chamber

---

### 16. FAQ
**Perguntas:**
- Quantas cartas compro no começo?
- Quantas Runes pego por turno?
- Units entram prontas?
- O dano permanece entre turnos?
- Posso responder durante o combate?

---

### 17. CTA final
**Título:** Pronto para jogar melhor?  
**Texto:**  
Agora que você já entende o básico de Riftbound, explore cartas, keywords e estratégias para evoluir seu jogo e montar decks melhores.  
**Botões:** Ver cartas / Ver keywords / Explorar decks

---

## Direção visual
- Layout escuro, elegante e legível.
- Conteúdo em blocos curtos.
- Grid para Domains e Keywords.
- FAQ em accordion.
- Índice com âncoras no topo ou lateral.
- No mobile, usar compressão forte de espaçamento e cards em uma coluna.

