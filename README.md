# Oliveira Barbearia — Frontend

React 18 + Vite + TypeScript + Tailwind CSS 3 + Framer Motion + Lucide React.

Consome a API Spring Boot **barbearia-oliveira** (rodando em `http://localhost:8080`).

```bash
cp .env.example .env   # ajuste VITE_API_URL se a API estiver em outro endereço
npm install
npm run dev      # http://localhost:5173
npm run build && npm run preview
```

## Deploy (Vercel)

Importe o repositório na Vercel (framework **Vite** é detectado sozinho) e crie a variável
`VITE_API_URL` com o endereço da API no Railway (ex.: `https://barbearia-oliveira-production.up.railway.app`).
O `vercel.json` faz as rotas `/admin/...` funcionarem ao abrir o link direto ou dar F5.
Passo a passo completo: `DEPLOY.md` no repositório da API.

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Landing page + wizard de agendamento (side-panel no desktop, bottom-sheet no mobile) |
| `/admin/login` | Login admin (POST `/api/public/auth/login`, token JWT guardado na sessão) |
| `/admin` | Agenda do dia: confirmar, cancelar e "Avisar cliente" (link wa.me gerado pela API) |
| `/admin/barbeiros` | Gestão de barbeiros |
| `/admin/servicos` | Gestão de serviços |
| `/admin/horarios` | Horários de trabalho de cada barbeiro (expediente e almoço por dia) |

## Estrutura

```
tailwind.config.js        Design system Night & Lime (cores, fontes, sombras, animações)
src/
  components/ui/          Button, Input, Card, Modal, Switch, Badge, Toast, Avatar, Logo, ServiceIcon
  components/booking/     BookingWizard + Stepper + 5 passos + BookingSummary
  components/landing/     Header, Hero, Sobre, Serviços, Equipe, Galeria, Contato/rodapé
  components/admin/       DataTable responsiva (tabela no desktop, cards no mobile)
  pages/                  Landing e páginas admin
  lib/api.ts              Cliente HTTP (fetch), token JWT e tratamento do ErroResponse da API
  store/AppStore.tsx      Estado global + conversão dos DTOs da API para os tipos do front
  data/mock.ts            Conteúdo fixo da vitrine: contato, categorias e horário exibido na landing
  data/media.ts           Fotos da landing (Unsplash) — troque pelas fotos reais
  lib/                    cn, máscara de telefone, formatação BRL/datas
```

## Notas

- O botão "Confirmar Agendamento" tem estado de loading e ignora cliques enquanto envia.
- Os horários do agendamento vêm de `GET /api/public/agendamentos/disponibilidade`; um 409 da API
  (ex.: "O barbeiro não atende neste dia.") aparece como mensagem no passo de data/hora.
- Não há mensagens automáticas: ao concluir o agendamento o cliente toca em "Enviar para a barbearia no
  WhatsApp" (link wa.me com o texto pronto). Sem confirmação no painel em até 20 min, a API cancela o horário.
- O token do admin fica no `sessionStorage`; se a API responder 401, o painel volta para o login.

## Paleta e acessibilidade

| Token | Cor | Uso |
| --- | --- | --- |
| `night` | #0F0F0F | Fundo escuro principal |
| `surface` | #202020 | Cards e superfícies escuras |
| `brand` | #5DD62C | Botões e destaques (sempre com texto escuro) |
| `brand-dark` | #337418 | Texto/ícones verdes sobre fundo claro (contraste AA) |
| `paper` | #F8F8F8 | Fundo claro e texto sobre escuro |

- Mobile-first, com barra fixa de "Agendar" + WhatsApp no celular e áreas de toque de 44px+.
- Link "Pular para o conteúdo", foco visível, modal com foco preso e fundo inerte, `aria-label` nos controles.
- Respeita "reduzir movimento" do sistema (CSS + Framer Motion `MotionConfig`).
