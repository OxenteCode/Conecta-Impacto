# 🚀 Especificação Funcional, Responsiva e Lógica - Conecta Impacto

Este documento define o escopo dos módulos, a estratégia de design responsivo e o fluxo lógico de autenticação para a plataforma Conecta Impacto.

---

## 📐 Estratégia de Responsividade (Tailwind Breakpoints)

- **Mobile-First (Padrão - Voluntário):** Focado em telas verticais, usando utilitários de safe areas para o Capacitor (ex: pb-safe).
- **Desktop-First (ONG):** Otimizado para monitores grandes (usando prefixos md: e lg:), expandindo menus laterais e organizando dados em colunas.

---

## 🔐 Arquitetura Lógica de Autenticação (Ponto de Partida)

Antes de conectar o Supabase, o ambiente será preparado usando um serviço de simulação (authService.ts) que valida as regras de negócio e persiste o estado do usuário temporariamente no localStorage.

### 1. Modelagem de Tipos (src/types/auth.ts)
O arquivo de tipos deve mapear estritamente o perfil ativo:
- tipoUsuario: pode ser 'voluntario' ou 'ong'.
- sessaoUsuario: objeto contendo id, nome, email, role (tipoUsuario) e ongName (opcional para o perfil de instituição).

### 2. Regras de Negócio para Criação de Conta (Sign-Up)
A tela de cadastro possui um seletor inicial de perfil que altera os campos obrigatórios do formulário via shadcn/ui form:

- Perfil Voluntário:
  * Campos: Nome Completo, E-mail, Senha (mínimo 6 caracteres).
  * Destino pós-cadastro: Redireciona para o Portal do Voluntário (/meu-perfil) disparando imediatamente o modal do Termômetro de Emoções.

- Perfil Organização (ONG):
  * Campos: Nome do Gestor, Nome da Instituição/ONG, E-mail Institucional, Senha.
  * Destino pós-cadastro: Redireciona para o Dashboard Administrativo (/dashboard).

### 3. Lógica de Roteamento e Proteção de Rotas (src/components/layout/ProtectedRoute.tsx)
O ponto de partida lógico intercepta o usuário da seguinte forma:
- Se não houver sessaoUsuario ativa no localStorage -> Redireciona para /login.
- Se role for 'voluntario' -> Bloqueia acesso a rotas de gestão de ONGs (/dashboard/*).
- Se role for 'ong' -> Bloqueia acesso a rotas exclusivas de voluntários (/meu-perfil/*).

---

## 📂 Módulos da Plataforma e Comportamento de Tela

### 📱 1. Portal do Voluntário (Foco: Mobile-First, Escalável para Desktop)
Módulo focado em engajamento por afeto, gamificação e monitoramento de saúde mental (ODS 3).

* Módulo de Autocuidado (Termômetro de Emoções):
  - Um modal que bloqueia a tela até que o voluntário selecione como está se sentindo no dia (escala de 1 a 5 com emojis).
  - Grava a resposta anonimamente vinculada à data para fins de estatística institucional da ONG.

* Registro de Ações em Campo (Fricção Zero):
  - Formulário simplificado para declarar horas e o impacto gerado (ex: "10 cobertores entregues").
  - No mobile, os inputs ocupam 100% da largura. No desktop, dividem-se em duas colunas.

---

### 💻 2. Dashboard Administrativo (Foco: Desktop-Optimized)
Módulo corporativo para gestão institucional, transparência de dados e relatórios ESG (ODS 16 e 17).

* Painel Geral de Controle (Métricas Centrais):
  - Linha superior com mini-cards lado a lado (Voluntários Ativos, Horas Acumuladas, Impacto Quantitativo).
  - Monitor de Saúde Institucional: Gráfico de linha que acende um alerta visual em vermelho se a média emocional da base de voluntários cair abaixo de 3.5.

---

## 📝 Diretrizes de Engenharia e Código

1. Separação de Formulários: Não crie um arquivo gigante para o Login e Cadastro. Use a pasta src/pages/onboarding/ dividida em LoginPage.tsx e RegisterPage.tsx.
2. Responsividade Limpa: Use classes flexíveis do Tailwind. Exemplo: className="grid grid-cols-1 md:grid-cols-2 gap-4".
3. Cultura de Documentação: O arquivo authService.ts deve conter comentários JSDoc explicando as funções checkCurrentSession(), loginSimulado() e logoutSimulado().

---

> _"A segurança e a clareza no primeiro clique definem a retenção do usuário. Um fluxo de login robusto é a fundação de uma plataforma escalável."_