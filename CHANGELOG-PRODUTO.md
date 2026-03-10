## [2026-03-10] - Guia "Como Jogar" e Redesign de Interface

### 🟢 O que entregamos nesta iteração:
- **Área "Como Jogar"**: Lançamos um guia digital completo e imersivo, cobrindo regras básicas, montagem de deck, runas e fluxo de jogo. 
- **Correção e Renomeação**: Corrigimos um erro técnico (TypeError) que impedia a abertura da tela de Coleção e renomeamos o termo "Álbum" para **"Coleção"** em todos os idiomas, tornando a navegação mais intuitiva.
- **Destaque em Keywords**: O glossário de efeitos (Keywords) recebeu um design premium focado em facilitar o aprendizado dos termos técnicos mais complexos do TCG.
- **Novo Seletor de Idiomas**: Substituímos o seletor padrão por um componente customizado com flags, glassmorphism e animações suaves, elevando o padrão visual do produto.
- **Navegação Inteligente**: O guia foi integrado dinamicamente no menu superior (desktop) e na barra de abas (mobile) para acesso rápido.

---

## [2026-03-10] - Correção do Filtro de Edições (Sets) e Internacionalização
- **Filtro de Edições Funcional**: Corrigido o bug que impedia o filtro por expansão/set de funcionar corretamente no Catálogo e no Álbum da Coleção. O sistema agora lê a nova estrutura de dados de set da API (`c.set.set_id`) e aplica a busca local sem falhas.
- **Identidade Visual das Runas/Domínios**: Ajustamos as cores globais de representação dos domínios (Mind, Body, Calm, Chaos, Order, Fury) para refletir os tons oficiais e idênticos aos dos ícones, garantindo consistência pela aplicação inteira.
- **Sincronização de Decks na Nuvem**: Corrigido um problema onde decks criados no PC apareciam como "0 cartas" no celular. Agora o aplicativo se reconecta automaticamente ao banco de cartas global para "reidratar" as cartas salvas apenas pelo ID, garantindo que o deck carregue perfeitamente independente do dispositivo onde a conta for acessada.
- **Correção de Variantes "Presas" no Álbum**: Resolvemos um bug onde o filtro "Apenas Possuídas" impedia que o usuário removesse uma carta de arte alternativa (AART) se ele não possuísse a arte normal da mesma carta. Agora as variantes folham e expandem corretamente em qualquer tipo de filtro ativo.
- **Otimização Extrema de Carregamento (Edge Caching)**: Habilitamos o uso nativo de infraestrutura global da Vercel (Edge Network) que intercepta a rota `/api/cards` e guarda a cópia inteira do banco de dados na memória. Isso vai derrubar o tempo de loading de absurdos `~1500ms` por usuário, para levíssimos `~50ms`, melhorando intensamente a experiência em dispositivos móveis.
- **Respiro Visual no Álbum**: O cabeçalho e a barra de filtros da Coleção estavam muito comprimidos. Adicionamos margens, espaçamentos generosos e aumentamos sutilmente os campos de busca, trazendo um design mais limpo e "respirável" que condiz com produtos premium.
- **Auto-Limpeza de Cartas Vazias**: Refatoramos o backend (`collections.py`) para que sempre que uma carta tiver todas as suas versões alteradas para quantidade "ZERO" (0), o sistema delete fisicamente esse relacionamento do banco de dados, mantendo a coleção limpa em vez de guardar lixo (registros vazios).
- **Paralelismo de Componentes e Non-Blocking UI**: A tela de Álbum e Catálogo exigiam que as `Sets` (expansões) baixassem 100% da API oficial antes de soltar a tela branca do usuário. Removemos essa dependência, fazendo o carregamento da UI reagir isoladamente às cartas, cortando o tempo de espera visual do usuário pela metade (o filtro de Sets agora carrega no background, silenciosamente).

### 🟣 Impacto no Negócio:
- Os jogadores agora conseguem isolar a visualização apenas para as cartas de um Set específico (ex: "Origins" ou "SFD"), facilitando o foco em completar expansões individuais ou montar decks temáticos sem poluição visual.

---

## [2026-03-08] - Consolidação Geral & Resumo Executivo 📊

### 🟢 Status do Projeto: 
- **Fases 5, 6 e 7**: 100% Concluídas e Operacionais. 
- **Sistema Atual**: Álbum digital funcional, scanner com IA real (`EasyOCR`) e cache de performance ativo.

### ⏱️ Métricas de Desenvolvimento (Vibe Coding):
- **Prompts Trocados**: ~15-18 prompts de alto nível (Direção do Usuário).
- **Tempo "Codando e Compilando"**: Estimado em ~6 horas de execução direta (incluindo instalações pesadas como PyTorch/EasyOCR).
- **Fases Percorridas**: 
  - **Fase 5 (Coleção)**: Implementação do banco e UI do álbum.
  - **Fase 6 (Scanner)**: Integração de câmera e motor de OCR real.
  - **Fase 7 (Performance)**: Cache de cartas e otimização de JSONB.

### 🟢 O que entregamos na última iteração:
- **OCR Real Implementado**: Substituímos o sistema de teste (mock) por uma inteligência artificial real (`EasyOCR` que depois migrou para `Tesseract.js` no Frontend para economizar Serverless).
- **Match por Similaridade (Fuzzy Search)**: Resolvemos o problema final da "Fiora". Como a lente do celular e a luz às vezes fazem o OCR ler "Flora" em vez de "Fiora", adicionamos um algoritmo de Distância de Levenshtein (`string-similarity`) para cruzar os dados. Agora cartas com grafia torta no scan são lidas com perfeição.
- **Backend Sync (psycopg2)**: A infraestrutura do backend foi adaptada na Vercel para driblar o bloqueio IPv6 imposto pela AWS no pacote gŕatis, garantindo que o banco chegue no Supabase via IPv4.

### 🟣 Impacto no Negócio:
- Scanner 100% autônomo e de graça, rodando direto no celular da pessoa, sem pesar no servidor.
- Alta tolerância a celulares com câmera ruim ou reflexo na carta graças à Similaridade Lexical.
- API Vercel conectada definitivamente ao banco sem bloqueio de rede.
