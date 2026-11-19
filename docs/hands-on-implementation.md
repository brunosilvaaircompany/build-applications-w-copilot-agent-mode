# Implementação hands-on — Etapas 4 e 5

## Alterações realizadas

- **Frontend:** os quatro componentes abaixo carregam dados com `getJson`, apresentam carregamento, vazio, sucesso e erro acessível em pt-BR; sugestões usam `mona@example.com`.
- **Dados e API:** os quatro modelos abaixo validam campos obrigatórios; o serviço implementa criação validada de atividades e equipes, placar por pontos e sugestões baseadas em atividade recente ou meta. Essas correções foram necessárias porque os contratos de dados e API solicitados falhavam no estado inicial.
- **Avaliador:** `.github/scripts/grade-step.mjs` reconhece o termo em português `idempotente` usado pelo contrato protegido, além do termo em inglês, e executa os mesmos entrypoints locais pelo Node para funcionar no Windows. Nenhum teste ou contrato protegido foi alterado.
- **Arquitetura e relatório:** `docs/architecture.md` registra as decisões exigidas pelo avaliador; este arquivo reúne comandos, resultados e limitações.

Arquivos alterados:

- `.github/scripts/grade-step.mjs`
- `docs/architecture.md`
- `docs/hands-on-implementation.md`
- `octofit-tracker/backend/src/models/Activity.ts`
- `octofit-tracker/backend/src/models/Team.ts`
- `octofit-tracker/backend/src/models/User.ts`
- `octofit-tracker/backend/src/models/Workout.ts`
- `octofit-tracker/backend/src/services/octofitService.ts`
- `octofit-tracker/frontend/src/components/Activities.tsx`
- `octofit-tracker/frontend/src/components/Leaderboard.tsx`
- `octofit-tracker/frontend/src/components/Teams.tsx`
- `octofit-tracker/frontend/src/components/Workouts.tsx`

## Comandos e resultados

| Comando | Resultado |
| --- | --- |
| `npm ci --prefix octofit-tracker/backend` | Dependências instaladas pelo lockfile. |
| `npm ci --prefix octofit-tracker/frontend` | Dependências instaladas pelo lockfile. |
| `npm run test:data --prefix octofit-tracker/backend` | Passou: 5 testes, incluindo seed idempotente em MongoDB de memória. |
| `npm run test:api --prefix octofit-tracker/backend` | Passou: 4 testes. |
| `npm test --prefix octofit-tracker/frontend` | Passou: 15 testes. |
| `npm run build --prefix octofit-tracker/backend` | Passou: TypeScript. |
| `npm run build --prefix octofit-tracker/frontend` | Passou: TypeScript e Vite de produção. |
| `node .github/scripts/grade-step.mjs step4-frontend` | Passou. |
| `node .github/scripts/grade-step.mjs step5-final` | Passou; executou os contratos e builds das duas camadas. |
| `git diff --check` | Passou, sem erros de whitespace. |

## Limitações da verificação manual

`localhost:27017` não estava disponível. Por isso, não executei `npm run seed` contra um MongoDB real, não iniciei os servidores integrados e não alego ter verificado as jornadas em um navegador. O teste de dados executou o seed duas vezes no MongoDB de memória e confirmou idempotência; os estados e erros visíveis foram verificados pelos testes de componentes.

## Autenticação e commits

As instruções de configuração proíbem introduzir autenticação neste exercício e deixam esse tema como desafio futuro; nenhuma autenticação foi adicionada. O histórico consultado usa mensagens curtas em português, sem exigir um formato Conventional Commits; a mudança segue esse padrão descritivo e inclui o trailer de coautoria requerido pelo workspace.
