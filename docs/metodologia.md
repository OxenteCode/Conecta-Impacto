# 🚀 Metodologia de Desenvolvimento Rápido - Oxente Code

Este documento define o processo padrão para a criação, desenvolvimento e entrega de funcionalidades e novos produtos dentro da startup.

## 🛠 Tech Stack Base

Focada em máxima produtividade, consistência visual e performance nativa:

- **Frontend:** React + Vite
- **UI System:** shadcn/ui (Radix UI + Tailwind CSS)
- **Ícones:** Hugeicons free
- **Linguagem:** TypeScript
- **Backend/Database:** Supabase (BaaS)
- **Mobile Bridge:** Capacitor (Cross-platform)

---

## 📂 Arquitetura de Pastas (Padrão Oxente)

- `src/assets/` → Imagens, SVGs e fontes estáticas.
- `src/components/ui/` → Componentes puros do shadcn (Mantenha o padrão original).
- `src/components/shared/` → Componentes reutilizáveis do projeto.
- `src/components/layout/` → Navbar, Sidebar, Containers de página.
- `src/hooks/` → Lógica de estado e hooks do Supabase.
- `src/lib/` → Configurações (ex: `supabaseClient.ts`, `utils.ts`).
- `src/pages/` → Componentes de página (Layout e orquestração).
- `src/services/` → Chamadas diretas de API/Supabase.
- `src/types/` → Definições de interfaces TypeScript e Database types.

---

## 📝 Cultura de Documentação e Código

Na Oxente Code, "código pronto" é código documentado.

1. **Comentários de "Porquê", não de "O que":** O código diz o que está fazendo, o comentário deve explicar a razão de uma decisão complexa.
2. **JSDoc para Funções e Hooks:** Toda função em `services/` ou `hooks/` deve ter uma breve descrição, parâmetros e retorno tipados.
3. **Documentação de Processos:** Manter arquivos README.md em pastas complexas explicando o fluxo de dados.
4. **Self-Documenting Code:** Priorizar nomes de variáveis e funções extremamente claros e em inglês (ou português, desde que haja consistência).

---

## 📋 Passo 1: Ideação e Planejamento (Discovery)

1. **Definição do Problema:** Qual dor do usuário estamos resolvendo hoje?
2. **User Stories:** "Como [usuário], eu quero [ação] para [resultado]."
3. **Draft Visual:** Seleção de componentes do shadcn que atendem à funcionalidade.

## 🏗 Passo 2: Configuração do Ambiente (Setup)

1. **Boilerplate:** Iniciar projeto com Vite + TS + Tailwind.
2. **shadcn/ui Init:** Instalar componentes base necessários: `button`, `input`, `card`, `dialog`.
3. **Supabase:** Configurar `.env` e rodar o Schema inicial.
4. **Capacitor:** `npx cap init` e adicionar plataformas iOS/Android.

## 💻 Passo 3: Desenvolvimento (Sprints de 1 Dia)

- **Modularização:** Se um componente passar de 1000 linhas, ele deve ser quebrado em arquivos menores.
- **Business Logic:** Toda chamada ao Supabase deve ficar em `services/` ou `hooks/`.
- **Comentários Técnicos:** Adicionar comentários em trechos lógicos que fujam do padrão.
- **Sync Mobile:** `npm run build && npx cap copy`.

## 🧪 Passo 4: Validação e Deploy

1. **Quality Check:** Tipagem completa, RLS ativo e **revisão da documentação** gerada na sprint.
2. **Web Preview:** Deploy automático para teste rápido.
3. **Mobile Run:** Teste em hardware real para validar performance e gestos nativos.

---

> _"Código limpo, pastas organizadas e processos documentados permitem que a Oxente Code mude de direção sem precisar recomeçar do zero."_
