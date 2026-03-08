## [2026-03-08] - Evolução do Scanner & Correções de UX 🚀

### 🟢 O que entregamos hoje:
- **OCR Real Implementado**: Substituímos o sistema de teste (mock) por uma inteligência artificial real (`EasyOCR`) no servidor. Agora o scanner lê o texto da imagem para identificar as cartas fisicamente.
- **Suporte a Nomes Complexos**: Corrigimos um erro crítico onde cartas com apóstrofos (ex: **Warmog's Armor**) resultavam em telas em branco. Agora, qualquer carta do jogo abre corretamente no detalhe.
- **Normalização de Busca**: O scanner ficou mais resiliente a variações de caracteres especiais, facilitando o reconhecimento em diferentes condições de luz.

### 🟣 Impacto no Negócio:
- Scanner funcional para todas as cartas (não apenas para testes).
- Eliminação de crashes visuais em cartas de equipamento.
- UX mais fluida e profissional.
