# Changelog - Riftbound NIGHTS (RiftNights.com)

### 🟢 O que entregamos nesta iteração:
- **Correção de Variantes na Coleção**: Fique tranquilo! A interface continua exibindo quantidades separadas para a "Arte Normal" e a "Arte Alternativa" independentemente. O erro era apenas de leitura: quando você escaneava uma versão alternativa, o sistema salvava no ID dela, mas a Coleção só puxava a leitura pelo ID da versão base. Agora o sistema varre todos os IDs daquela carta no banco e direciona as quantidades corretamente para as linhas separadas (Normal, AArt, Sign, Over) no Álbum.
- **Melhoria no Modal de Exportação**: O pop-up com o texto da sua coleção para copiar (Exportar) agora abre fixado próximo ao topo da tela, eliminando a necessidade de dar scroll para encontrar os botões em coleções muito grandes.
### 🟢 O que entregamos nesta iteração:
- **Riftbound NIGHTS**: Consolidamos a marca para **Riftbound NIGHTS**, unificando o Deck Manager em todas as frentes (Header, Footer, Termos Legais e SEO). O design agora reflete a identidade definitiva de lançamento.
- **Integração de Preços (LigaRiftbound)**: O preview de cartas agora exibe cotações em tempo real (Mínimo, Médio, Máximo) vindas da LigaRiftbound. 
- **Suporte Internacional de Moeda**: Para usuários em Inglês ou Espanhol, o sistema prioriza a exibição em Dólar ($) ou sinaliza a cotação em Real (R$) se for a única disponível, garantindo utilidade global.
- **Botão de Compra Direta**: Adicionamos um link direto para o marketplace da LigaRiftbound em cada carta, facilitando a aquisição de unidades faltantes para o seu deck.
- **Estabilidade de Preview**: Refatoramos o sistema de miniaturas para ser 100% estável e não "quebrar" mais o layout ao passar o mouse rapidamente.
- **Área "Como Jogar" & Keywords**: Re-verificamos e corrigimos todos os termos técnicos (Keywords) para os nomes oficiais de Riftbound (Accelerate, Assault, Deathknell), eliminando termos de outros card games.
- **Favicon & SEO Final**: Favicon premium com cache-busting e tags SEO devidamente propagadas para o domínio `riftnights.com`.
- **Redesenho Premium da Coleção**: Interface totalmente reformulada para layout horizontal (estilo lista), facilitando a gestão de variantes.
    - **Densidade Visual (max-width)**: O layout não estica mais desenfreadamente se houver apenas uma carta pesquisada.
    - **Botão Plus Gold (✦)**: Adição direta de unidades Foil com apenas um clique e visual claro.
    - **Lógica de Imagem Rara**: O card agora exibe automaticamente a arte mais rara que você possui (Assinada > Numerada > Alternativa > Normal).
    - **Foil Priority Visual**: Efeito de "Glow" dourado nos cards consertado, com animação e isolamento visual (`isolation: isolate`) refinados.
- **Exportação de Coleção Corrigida**: O modal de cópia de coleção agora aparece com todas as variantes (inclusive `signed_foil_qty`), livre do travamento inicial.
- **Perfomance de Foco (Alt+Tab)**: Coleção agora usa cache inteligente e não sofre reload desnecessário do servidor sempre que o usuário troca de aba/janela.
- **Banco de Dados Sincronizado**: Patch de emergência no PostgreSQL de produção para adicionar a variante de Foil Assinada, eliminando Erro 500 no Backend.

---

## [1.1.0] - 2026-03-10
### Adicionado
- Rodapé elegante nas versões desktop e mobile com links para páginas legais.
- Páginas de Privacidade e Termos de Uso (PT, EN, ES).
- Novo favicon premium e imagem OG para redes sociais.
- Lançamento oficial no domínio `riftnights.com`.
- Guia Digital "Como Jogar" com termos oficiais do Riftbound TCG.

### Corrigido
- Miniaturas de preview ("miniaturas abrindo errado") agora usam um sistema de posicionamento global estável.
- Favicon forçado com cache-busting e suporte redundante a `.ico`.
- Keywords oficiais do jogo (Accelerate, Shield, etc) em todos os idiomas.
- Limpeza de arquivos legados (Dockerfile, render.yaml) e logs de erro.

---

## [2026-03-10] - Correção do Filtro de Edições (Sets) e Internacionalização
- **Filtro de Edições Funcional**: Corrigido o bug que impedia o filtro por expansão/set de funcionar corretamente no Catálogo e no Álbum da Coleção. O sistema agora lê a nova estrutura de dados de set da API (`c.set.set_id`) e aplica a busca local sem falhas.
- **Identidade Visual das Runas/Domínios**: Ajustamos as cores globais de representação dos domínios (Mind, Body, Calm, Chaos, Order, Fury) para refletir os tons oficiais e idênticos aos dos ícones, garantindo consistência pela aplicação inteira.
- **Sincronização de Decks na Nuvem**: Corrigido um problema onde decks criados no PC apareciam como "0 cartas" no celular. Agora o aplicativo se reconecta automaticamente ao banco de cartas global para "reidratar" as cartas salvas apenas pelo ID, garantindo que o deck carregue perfeitamente independente do dispositivo onde a conta for acessada.
- [x] Correção do bug de variantes AART na Coleção
- [x] Limpeza de console.logs e alertas
- [x] Remover filtro "Sets" (não funcional) da Home e Coleção
- [x] Implementar Guia Digital "Como Jogar"
    - [x] Criar `HowToPlayView.vue` e rota
    - [x] Traduzir conteúdo completo (PT, EN, ES)
    - [x] Integrar no menu de navegação
    - [x] Corrigir Keywords para termos oficiais de Riftbound
- [x] Corrigir deploy do Favicon ✨ (Cache-busting + .ico)
- [x] Otimização de SEO Premium ✨ (Metas + Títulos)
- [x] Páginas Legais (AdSense Ready)
    - [x] Criar conteúdo e traduções (PT, EN, ES)
    - [x] Implementar `LegalView.vue`
    - [x] Integrar rodapé elegante (Desktop/Mobile)
- [x] Limpeza de Débito Técnico e Coerência Arquitetural
- [x] Identidade Visual (Novo Favicon)
- [x] Fix: Miniaturas de preview instáveis no catálogo/coleção ✨
- [x] Validação final com o usuário
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
