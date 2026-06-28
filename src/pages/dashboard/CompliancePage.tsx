import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import {
  ShieldCheck, Award, FileText, CheckCircle2, XCircle, AlertTriangle,
  Loader2, RefreshCw, Sparkles, FileCode, Copy, Check, Info,
  BookOpen, BarChart3, MessageSquare, Send, Link as LinkIcon, Lock,
  Plus, CheckSquare, Edit3, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuditCriterion {
  criterio: string;
  resultado: string;
  score: number;
  ok: boolean;
}

interface AuditPillarData {
  score: number;
  completed: boolean;
  criterios: AuditCriterion[];
}

interface AuditData {
  transparencia_financeira?: AuditPillarData;
  medicao_impacto?: AuditPillarData;
  governanca?: AuditPillarData;
  cultura_organizacional?: AuditPillarData;
}

interface OngProfile {
  id: string;
  nome: string;
  ong_name: string;
  cidade: string;
  descricao: string;
  missao: string;
  site: string | null;
  cnpj: string | null;
  cnpj_valid: boolean | null;
  last_audit_date: string | null;
  seal_active: boolean;
  dados_auditoria: AuditData | null;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Pre-defined templates for Sandbox Editor
const SANDBOX_TEMPLATES = [
  {
    name: 'Estatuto Social (Básico)',
    content: `ESTATUTO SOCIAL DA ASSOCIAÇÃO RAÍZES DO BEM

Art. 1º - A associação denomina-se Raízes do Bem, com sede em Natal/RN.
Art. 2º - A associação tem por objetivo a inclusão digital e capacitação tecnológica de jovens da periferia.
Art. 3º - A diretoria administrativa é composta por Diretor Presidente e Diretor Secretário Geral.
Art. 4º - O patrimônio da instituição é mantido por meio de contribuições, doações financeiras corporativas e convênios governamentais.
Art. 5º - O presente estatuto entra em vigor na data de seu registro em cartório civil das pessoas jurídicas.`,
    type: 'estatuto'
  },
  {
    name: 'Política Antifraude Rascunho',
    content: `POLÍTICA INTERNA DE CONTROLES FINANCEIROS

1. Prestação de contas: Todos os gastos devem ter notas fiscais correspondentes arquivadas digitalmente.
2. Compras: As aquisições de computadores ou insumos acima de R$ 5.000,00 devem ser cotadas com pelo menos 3 fornecedores diferentes para evitar superfaturamento.`,
    type: 'financeiro'
  }
];

// Document Clauses for Auto-correction injection
const CLAUSE_LIBRARY = {
  conselho: {
    title: 'Conselho Fiscal Independente',
    keyword: 'conselho fiscal',
    text: `\n\nArt. 6º - DA CONSTITUIÇÃO DO CONSELHO FISCAL
Fica instituído o Conselho Fiscal de caráter permanente, composto por 3 (três) membros titulares e independentes, eleitos pela Assembleia Geral, com mandato de 2 anos, aos quais compete examinar, fiscalizar e emitir pareceres sobre as demonstrações financeiras e balanços patrimoniais.`
  },
  ouvidoria: {
    title: 'Canal de Ouvidoria e Denúncias',
    keyword: 'denúncia',
    text: `\n\nArt. 7º - DO CANAL DE DENÚNCIAS E OUVIDORIA (WHISTLEBLOWER)
Para garantir a transparência de recursos, a associação disponibiliza um Canal de Ouvidoria (ouvidoria@raizesdobem.org.br) aberto a funcionários, doadores e voluntários para relato anônimo de quaisquer desvios éticos ou suspeitas de fraude, garantindo o sigilo absoluto e a não-retaliação.`
  },
  antifraude: {
    title: 'Política Antifraude e Segregação',
    keyword: 'antifraude',
    text: `\n\nArt. 8º - DA SEGREGAÇÃO DE FUNÇÕES E ANTIFRAUDE
Fica estipulada a obrigatoriedade de assinatura conjunta de dois diretores eleitos para quaisquer movimentações bancárias ou emissão de cheques de valor igual ou superior a R$ 2.000,00, inviabilizando decisões financeiras unilaterais.`
  },
  diversidade: {
    title: 'Política de Diversidade e Inclusão',
    keyword: 'diversidade',
    text: `\n\nArt. 9º - DA POLÍTICA DE DIVERSIDADE E DIREITOS HUMANOS
A associação adota em todas as suas frentes de trabalho uma política expressa de não-discriminação com base em raça, gênero, orientação sexual, crença religiosa, idade ou origem geográfica no recrutamento de voluntários e na seleção de estudantes.`
  }
};

// Simulated Intelligent Bot Responses
const BOT_FAQ_RESPONSES: Record<string, string> = {
  cnpj: 'Para validar seu CNPJ, nossa auditoria realiza uma consulta automática na Receita Federal e no IPEA (Mapa das OSCs). Certifique-se de que a situação cadastral do seu CNPJ esteja "Ativa" e que os dados de razão social coincidam com o nome cadastrado no Conecta Impacto.',
  selo: 'O Selo Conecta possui três categorias: Bronze (score de 50-74%), Prata (score de 75-89%) e Ouro (score de 90-100%). Cada pilar avaliado soma pontos ao score geral da ONG. O selo é exibido no seu perfil de transparência pública para atrair doadores.',
  conselho: 'O Conselho Fiscal é crucial para o pilar de Governança. Ele garante que as despesas não sejam controladas por uma única pessoa. Para passar nesse critério, inclua uma cláusula prevendo um conselho de no mínimo 3 membros no seu Estatuto Social e faça o upload no nosso Sandbox.',
  ouvidoria: 'O canal de denúncias ou ouvidoria garante segurança para voluntários relatarem desvios. O canal deve ser público (uma página ou e-mail específico) e estar previsto em seu estatuto. Você pode injetar essa cláusula no editor de sandbox clicando no botão "Corrigir com IA".',
  ods: 'Os Objetivos de Desenvolvimento Sustentável (ODS) da ONU ajudam a quantificar o impacto social da sua ONG. Ao criar ações de voluntariado, vincule-as às ODS corretas (ex: ODS 3 para saúde de voluntários, ODS 9 para infraestrutura tecnológica e ODS 10 para redução de desigualdades).'
};

export default function CompliancePage() {
  const { sessao } = useAuth();
  const [ong, setOng] = useState<OngProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  // States for Sidebar Checklist
  const [checklist, setChecklist] = useState({
    cnpj: false,
    codigoConduta: false,
    politicaAntifraude: false,
    acoesAuditadas: false
  });

  // States for Sandbox side-by-side Document Analyzer
  const [editorText, setEditorText] = useState('');
  const [sandboxStatus, setSandboxStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [detectedClauses, setDetectedClauses] = useState({
    conselho: false,
    ouvidoria: false,
    antifraude: false,
    diversidade: false
  });
  const [calculatedScore, setCalculatedScore] = useState(0);

  // States for AI Chatbot
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Olá! Sou o Robô de Compliance IA do Conecta Impacto. Em que posso ajudar você a otimizar a governança da sua ONG ou a atingir o Selo Ouro de Transparência hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessao?.id) {
      void fetchOngData(sessao.id);
    }
  }, [sessao]);

  useEffect(() => {
    // Auto-scroll inside chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, botTyping]);

  useEffect(() => {
    // Live update parser on editor text change
    parseEditorContent(editorText);
  }, [editorText]);

  const fetchOngData = async (ongId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ongId)
        .single();

      if (profile) {
        // Obter ações voluntárias
        const { data: actions } = await supabase
          .from('volunteer_actions')
          .select('horas, user_id')
          .eq('ong_id', ongId);

        const totalHoras = actions?.reduce((s, a) => s + Number(a.horas), 0) ?? 0;
        const totalAcoes = actions?.length ?? 0;

        const hasAuditedActions = totalAcoes > 0;
        const hasCnpj = !!profile.cnpj;
        const isCnpjValid = !!profile.cnpj_valid;

        const da = profile.dados_auditoria as unknown as AuditData | null;
        
        // Verifica políticas no banco
        const hasConduta = da?.cultura_organizacional?.criterios?.some(c => c.criterio.includes('Conduta') && c.ok) || false;
        const hasAntifraude = da?.governanca?.criterios?.some(c => c.criterio.includes('Antifraude') && c.ok) || false;

        setChecklist({
          cnpj: hasCnpj && isCnpjValid,
          codigoConduta: hasConduta || (da?.cultura_organizacional?.score ? da.cultura_organizacional.score >= 80 : false),
          politicaAntifraude: hasAntifraude || (da?.governanca?.score ? da.governanca.score >= 80 : false),
          acoesAuditadas: hasAuditedActions
        });

        setOng({
          id: profile.id,
          nome: profile.nome,
          ong_name: profile.ong_name ?? profile.nome,
          cidade: profile.cidade || 'Natal/RN',
          descricao: profile.descricao || '',
          missao: profile.missao || '',
          site: profile.site || null,
          cnpj: profile.cnpj || null,
          cnpj_valid: profile.cnpj_valid || false,
          last_audit_date: profile.last_audit_date || null,
          seal_active: profile.seal_active || false,
          dados_auditoria: da,
        });

        // Initialize editor with current description/missao if empty
        if (!editorText) {
          setEditorText(
            `ESTATUTO SOCIAL - ${profile.ong_name?.toUpperCase() ?? 'MINHA ONG'}\n\n` +
            `Missão: ${profile.missao || 'Conectar impacto.'}\n\n` +
            `Descrição: ${profile.descricao || 'Atividades de inclusão social.'}`
          );
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados de compliance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    if (!ong) return;
    setAuditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('compliance-bot', {
        body: { ong_id: ong.id }
      });
      if (error) throw error;
      if (data) {
        await fetchOngData(ong.id);
      }
    } catch (err) {
      console.error('Erro ao acionar auditoria:', err);
      alert('Erro ao se comunicar com o compliance-bot. Edge Function offline.');
    } finally {
      setAuditing(false);
    }
  };

  // Live parser checking for keywords inside the editor text
  const parseEditorContent = (text: string) => {
    const clean = text.toLowerCase();
    const checks = {
      conselho: clean.includes('conselho fiscal') || clean.includes('conselheiros') || clean.includes('fiscalização'),
      ouvidoria: clean.includes('denúncia') || clean.includes('ouvidoria') || clean.includes('whistleblower'),
      antifraude: clean.includes('antifraude') || clean.includes('segregação de funções') || clean.includes('desvios'),
      diversidade: clean.includes('diversidade') || clean.includes('inclusão') || clean.includes('discriminação')
    };

    setDetectedClauses(checks);

    // Calculate score dynamically (base 20% + 20% per detected clause)
    let score = 20;
    if (checks.conselho) score += 20;
    if (checks.ouvidoria) score += 20;
    if (checks.antifraude) score += 20;
    if (checks.diversidade) score += 20;

    setCalculatedScore(score);
  };

  // Injects missing clauses using simulated AI
  const handleFixWithAI = (clauseKey: 'conselho' | 'ouvidoria' | 'antifraude' | 'diversidade') => {
    setSandboxStatus('analyzing');
    
    // Simulate thinking state
    setTimeout(() => {
      const clause = CLAUSE_LIBRARY[clauseKey];
      setEditorText(prev => prev + clause.text);
      setSandboxStatus('done');
    }, 800);
  };

  // Chat message submission
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setBotTyping(true);

    setTimeout(() => {
      const query = inputText.toLowerCase();
      let responseText = 'Desculpe, não entendi completamente. Você pode perguntar sobre "CNPJ", "Selo de Transparência", "Conselho Fiscal", "Ouvidoria" ou "ODS".';

      // Simple keywords router
      if (query.includes('cnpj')) responseText = BOT_FAQ_RESPONSES.cnpj;
      else if (query.includes('selo') || query.includes('ouro') || query.includes('bronze')) responseText = BOT_FAQ_RESPONSES.selo;
      else if (query.includes('conselho') || query.includes('fiscal')) responseText = BOT_FAQ_RESPONSES.conselho;
      else if (query.includes('ouvidoria') || query.includes('denuncia') || query.includes('whistleblower')) responseText = BOT_FAQ_RESPONSES.ouvidoria;
      else if (query.includes('ods') || query.includes('impacto')) responseText = BOT_FAQ_RESPONSES.ods;

      const botMsg: Message = {
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMsg]);
      setBotTyping(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!ong) return null;

  const pillars = [
    {
      label: 'Transparência Financeira',
      score: ong.dados_auditoria?.transparencia_financeira?.score ?? 0,
      completed: ong.dados_auditoria?.transparencia_financeira?.completed ?? false,
      icon: FileText,
      criteria: ong.dados_auditoria?.transparencia_financeira?.criterios ?? [
        { criterio: 'Balanço Patrimonial Publicado', resultado: 'Pendente', score: 0, ok: false },
        { criterio: 'DRE disponível publicamente', resultado: 'Pendente', score: 0, ok: false },
        { criterio: 'Conformidade Fiscal (CNPJ ativo)', resultado: ong.cnpj_valid ? 'CNPJ Ativo' : 'Pendente', score: ong.cnpj_valid ? 100 : 0, ok: !!ong.cnpj_valid }
      ]
    },
    {
      label: 'Medição de Impacto',
      score: ong.dados_auditoria?.medicao_impacto?.score ?? 0,
      completed: ong.dados_auditoria?.medicao_impacto?.completed ?? false,
      icon: BarChart3,
      criteria: ong.dados_auditoria?.medicao_impacto?.criterios ?? [
        { criterio: 'Horas de Voluntariado Auditadas', resultado: 'Nenhuma registrada', score: 0, ok: false },
        { criterio: 'Metodologia de Mensuração (ODS)', resultado: 'Pendente', score: 0, ok: false }
      ]
    },
    {
      label: 'Governança & Relações',
      score: ong.dados_auditoria?.governanca?.score ?? 0,
      completed: ong.dados_auditoria?.governanca?.completed ?? false,
      icon: BookOpen,
      criteria: ong.dados_auditoria?.governanca?.criterios ?? [
        { criterio: 'Estatuto Social Publicado', resultado: 'Pendente', score: 0, ok: false },
        { criterio: 'Conselho Fiscal Ativo', resultado: 'Pendente', score: 0, ok: false },
        { criterio: 'Política Antifraude', resultado: 'Pendente', score: 0, ok: false }
      ]
    },
    {
      label: 'Cultura & ODS',
      score: ong.dados_auditoria?.cultura_organizacional?.score ?? 0,
      completed: ong.dados_auditoria?.cultura_organizacional?.completed ?? false,
      icon: Award,
      criteria: ong.dados_auditoria?.cultura_organizacional?.criterios ?? [
        { criterio: 'Código de Conduta Interno', resultado: 'Pendente', score: 0, ok: false },
        { criterio: 'Canal de Denúncias Ativo', resultado: 'Pendente', score: 0, ok: false }
      ]
    }
  ];

  const isAudited = !!ong.dados_auditoria;
  const avgScore = isAudited
    ? Math.round(pillars.reduce((s, p) => s + p.score, 0) / pillars.length)
    : 0;

  const seal = avgScore >= 90 ? 'Ouro' : avgScore >= 75 ? 'Prata' : avgScore >= 50 ? 'Bronze' : 'Nenhum';
  const sealStyles = {
    Ouro: { bg: 'from-amber-400 to-yellow-500', text: 'text-amber-500', border: 'border-amber-400/30', glow: 'shadow-amber-400/10' },
    Prata: { bg: 'from-slate-400 to-zinc-500', text: 'text-slate-500', border: 'border-slate-400/30', glow: 'shadow-slate-400/10' },
    Bronze: { bg: 'from-amber-700 to-amber-900', text: 'text-amber-700', border: 'border-amber-700/30', glow: 'shadow-amber-700/10' },
    Nenhum: { bg: 'from-muted to-muted-foreground', text: 'text-muted-foreground', border: 'border-border', glow: '' }
  }[seal];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-background">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight">Compliance & Auditoria IA</h1>
            <Badge className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold text-[10px] border-0 py-0.5 px-2 flex items-center gap-1">
              <Sparkles size={10} />
              Gemini 1.5 Powered
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Audite a governança e prestação de contas da sua organização com inteligência artificial para obter o Selo Conecta.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={auditing}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-md hover:brightness-105 transition-all disabled:opacity-50"
        >
          {auditing ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Executando Auditoria...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Reexecutar Auditoria Geral
            </>
          )}
        </button>
      </div>

      {/* ── SEÇÃO 1: JORNADA DO SELO OURO (Checklist interativo) ── */}
      <div className="mb-8">
        <h2 className="text-md font-bold text-foreground mb-3 flex items-center gap-1.5">
          <CheckSquare size={16} className="text-primary" />
          Jornada para o Selo Ouro Conecta
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'CNPJ Cadastrado e Válido',
              desc: 'Validação automática da Receita Federal e IPEA.',
              status: checklist.cnpj,
              actionLabel: 'Preencher nas Configs',
              link: '/dashboard/configuracoes'
            },
            {
              title: 'Código de Conduta',
              desc: 'Garante igualdade e diretrizes éticas aos voluntários.',
              status: checklist.codigoConduta,
              actionLabel: 'Injetar Minuta no Sandbox',
              action: () => {
                setEditorText(SANDBOX_TEMPLATES[0].content);
                handleFixWithAI('diversidade');
              }
            },
            {
              title: 'Política Antifraude',
              desc: 'Regulamentação e governança de despesas.',
              status: checklist.politicaAntifraude,
              actionLabel: 'Injetar Minuta no Sandbox',
              action: () => {
                setEditorText(SANDBOX_TEMPLATES[1].content);
                handleFixWithAI('antifraude');
              }
            },
            {
              title: 'Ações de Impacto Auditadas',
              desc: 'Ter pelo menos uma ação comprovada na plataforma.',
              status: checklist.acoesAuditadas,
              actionLabel: 'Ver Quadro de Voluntários',
              link: '/dashboard/voluntarios'
            }
          ].map((item, idx) => (
            <Card key={idx} className={cn(
              'border border-border/80 relative overflow-hidden transition-all',
              item.status ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-card'
            )}>
              <CardContent className="p-4 flex flex-col justify-between h-36">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold truncate pr-4">{item.title}</span>
                    {item.status ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-muted-foreground/40 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {!item.status && (
                  <div className="pt-2 border-t border-border/40">
                    {item.link ? (
                      <a href={item.link} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                        {item.actionLabel}
                        <ArrowRight size={10} />
                      </a>
                    ) : (
                      <button onClick={item.action} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline text-left">
                        {item.actionLabel}
                        <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start mb-8">
        {/* Score Consolidado */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-card to-card border border-border overflow-hidden shadow-sm">
            <CardContent className="p-6 relative">
              <div className="grid md:grid-cols-3 gap-6 items-center">
                {/* Gauge circular */}
                <div className="flex flex-col items-center justify-center text-center py-4 border-r border-border/40">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/15" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * avgScore) / 100}
                        className="text-primary transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black text-foreground">{avgScore}%</span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Score Geral</span>
                    </div>
                  </div>
                </div>

                {/* Direita: Explicações do Selo */}
                <div className="md:col-span-2 space-y-3.5">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Certificação Ativa</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r shadow-sm',
                        sealStyles.bg
                      )}>
                        Selo {seal} Conecta
                      </div>
                      {ong.seal_active ? (
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 font-semibold text-[9px] py-0.5 px-2 flex items-center gap-1">
                          <ShieldCheck size={10} />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30 font-semibold text-[9px] py-0.5 px-2 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          Pendente Sincronização
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAudited
                      ? `Sua última auditoria oficial foi executada em ${new Date(ong.last_audit_date!).toLocaleString('pt-BR')}. Os dados abaixo refletem a validação dos critérios contábeis, jurídicos e operacionais.`
                      : 'O Selo Conecta de Transparência avalia sua conformidade fiscal, governança e horas voluntárias comprovadas. Utilize o Editor Sandbox abaixo para redigir seu estatuto social e corrigir as pendências antes de auditar.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pilares Compactados */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pontuação dos Pilares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Icon size={13} className="text-muted-foreground" />
                        {pillar.label}
                      </span>
                      <span className="font-bold text-primary">{pillar.score}%</span>
                    </div>
                    <Progress value={pillar.score} className="h-1" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── SEÇÃO 2: EDITOR E AUDITOR LADO A LADO ── */}
      <div className="mb-8">
        <div className="mb-3">
          <h2 className="text-md font-bold text-foreground flex items-center gap-1.5">
            <Edit3 size={16} className="text-primary" />
            Editor e Auditor de Documentos Lado a Lado
          </h2>
          <p className="text-xs text-muted-foreground">
            Escreva ou selecione uma minuta no editor à esquerda e veja a inteligência artificial auditar cláusulas de governança e sugerir correções imediatas à direita.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* Lado Esquerdo: Editor */}
          <div className="lg:col-span-2">
            <Card className="h-full border-border flex flex-col justify-between overflow-hidden">
              <CardHeader className="pb-3 bg-muted/20 border-b border-border/40 flex flex-row items-center justify-between flex-wrap gap-2 py-3.5">
                <div className="flex items-center gap-2">
                  <FileCode size={16} className="text-primary" />
                  <span className="text-xs font-bold text-foreground">Editor de Rascunho / Estatuto</span>
                </div>
                <div className="flex gap-1.5">
                  {SANDBOX_TEMPLATES.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditorText(t.content)}
                      className="px-2.5 py-1 text-[9px] bg-background hover:bg-muted/70 rounded-md font-semibold border border-border transition-all"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative min-h-[350px] flex flex-col">
                <textarea
                  className="w-full flex-1 p-4 bg-transparent text-xs text-foreground focus:outline-none font-mono leading-relaxed resize-none h-[380px]"
                  placeholder="Digite ou cole aqui o texto completo do Estatuto Social, Código de Conduta ou Política Antifraude..."
                  value={editorText}
                  onChange={e => setEditorText(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Lado Direito: Auditor de Cláusulas */}
          <div>
            <Card className="h-full flex flex-col justify-between">
              <CardHeader className="pb-3 bg-muted/20 border-b border-border/40 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-xs font-bold text-foreground">Laudo de Auditoria IA</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black">{calculatedScore}% Aprovado</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    A IA analisa a semântica do documento em busca de cláusulas obrigatórias exigidas pela auditoria governamental.
                  </p>

                  <div className="space-y-2.5">
                    {[
                      {
                        key: 'conselho',
                        label: 'Conselho Fiscal Independente',
                        desc: 'Comissão de no mínimo 3 conselheiros independentes.',
                        status: detectedClauses.conselho
                      },
                      {
                        key: 'ouvidoria',
                        label: 'Canal de Denúncias Ouvidoria',
                        desc: 'Menção a canal eletrônico seguro para denúncias de fraudes.',
                        status: detectedClauses.ouvidoria
                      },
                      {
                        key: 'antifraude',
                        label: 'Controles Internos Antifraude',
                        desc: 'Assinaturas conjuntas ou limites de pagamentos segregados.',
                        status: detectedClauses.antifraude
                      },
                      {
                        key: 'diversidade',
                        label: 'Diretriz de Inclusão e Diversidade',
                        desc: 'Igualdade e combate ao racismo e discriminação.',
                        status: detectedClauses.diversidade
                      }
                    ].map(c => (
                      <div key={c.key} className={cn(
                        'p-2.5 rounded-lg border transition-all space-y-1',
                        c.status ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-background border-border'
                      )}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-foreground">{c.label}</span>
                          {c.status ? (
                            <CheckCircle2 size={13} className="text-emerald-500" />
                          ) : (
                            <XCircle size={13} className="text-rose-400" />
                          )}
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-snug">{c.desc}</p>
                        {!c.status && (
                          <button
                            onClick={() => handleFixWithAI(c.key as any)}
                            disabled={sandboxStatus === 'analyzing'}
                            className="mt-1 flex items-center gap-0.5 text-[8.5px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            <Plus size={9} />
                            Corrigir com IA (Injetar Cláusula)
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 text-[9px] text-muted-foreground leading-relaxed flex items-center gap-1.5">
                  <Info size={12} className="text-primary shrink-0" />
                  <span>
                    A injeção de cláusula insere o texto correspondente no final do documento para que você possa adaptar.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 3: RASTREABILIDADE LEDGER E CHATBOT ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Ledger: Rastreabilidade de impacto (3/5 colunas) */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border/40 py-3.5">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-primary" />
                <span className="text-xs font-bold text-foreground">Livro Razão & Rastreabilidade de Impacto (Ledger)</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Comprovações imutáveis que vinculam as doações recebidas de patrocinadores a horas reais de voluntários em campo.
              </p>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <div className="space-y-3.5">
                {[
                  {
                    don: 'OxenteCode Tech (Aporte ESG)',
                    value: 'R$ 15.500,00',
                    action: 'Mentoria em Bootcamp Front-End',
                    vol: 'Thiago Neves (Mentor)',
                    hours: '45h comprovadas',
                    hash: 'sha256:4f9a7c3d1b82f6e9...'
                  },
                  {
                    don: 'EcoBrisa Energia (Incentivo Social)',
                    value: 'R$ 9.200,00',
                    action: 'Montagem de Laboratório Social',
                    vol: 'Thiago Neves (Mentor)',
                    hours: '16.5h comprovadas',
                    hash: 'sha256:a2b8e3d4f9c6a1b2...'
                  },
                  {
                    don: 'Natal Shopping Plaza (Arredondamento)',
                    value: 'R$ 5.000,00',
                    action: 'Workshop de Introdução ao Git',
                    vol: 'Thiago Neves (Mentor)',
                    hours: '8.0h comprovadas',
                    hash: 'sha256:d9c3b8f1a2e3f4a5...'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <LinkIcon size={12} className="text-primary" />
                        <span className="font-bold text-foreground">{item.don}</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 font-bold py-0">{item.value}</Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-[9px] text-muted-foreground border-t border-border/30 pt-2">
                      <div>
                        <span>Impacto Gerado:</span>
                        <p className="font-bold text-foreground mt-0.5">{item.action}</p>
                      </div>
                      <div>
                        <span>Voluntariado Associado:</span>
                        <p className="font-bold text-foreground mt-0.5">{item.vol} · {item.hours}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[8.5px] text-muted-foreground/60 border-t border-border/30 pt-1.5 font-mono">
                      <span>Hash de Comprovação: {item.hash}</span>
                      <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-sans font-bold">
                        <ShieldCheck size={10} />
                        Auditado Ledger
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chatbot de Compliance (2/5 colunas) */}
        <div className="lg:col-span-2">
          <Card className="h-[430px] flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 bg-muted/20 border-b border-border/40 py-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-primary animate-pulse" />
                <span className="text-xs font-bold text-foreground">Consultor de Compliance IA</span>
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </CardHeader>
            
            {/* Mensagens do Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[11px] bg-muted/5">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={cn(
                  'flex flex-col max-w-[85%] rounded-xl p-2.5 text-xs',
                  msg.sender === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground rounded-tr-none'
                    : 'mr-auto bg-muted border border-border text-foreground rounded-tl-none'
                )}>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
              {botTyping && (
                <div className="mr-auto bg-muted border border-border text-foreground rounded-xl rounded-tl-none p-2.5 flex items-center gap-1 text-[11px]">
                  <Loader2 className="animate-spin text-primary" size={11} />
                  <span>Robô está analisando...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Sugestões rápidas de prompt */}
            <div className="px-4 py-2 border-t border-border/40 bg-muted/10 flex flex-wrap gap-1">
              {['Validar CNPJ', 'O que é Selo Conecta?', 'Conselho Fiscal'].map(q => (
                <button
                  key={q}
                  onClick={() => setInputText(q)}
                  className="px-2 py-0.5 text-[8.5px] border border-border hover:bg-muted rounded-full transition-colors text-muted-foreground font-semibold"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input e Enviar */}
            <div className="p-3 border-t border-border/40 bg-background flex items-center gap-2">
              <input
                type="text"
                className="flex-1 p-2 border border-border rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-muted/10"
                placeholder="Pergunte sobre CNPJ, auditoria, ODS..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || botTyping}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:brightness-105 transition-all disabled:opacity-50"
              >
                <Send size={13} />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
