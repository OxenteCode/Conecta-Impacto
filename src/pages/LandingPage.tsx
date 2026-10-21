import {
  BarChart3,
  Heart,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Globe,
  Building,
  LogIn,
  UserPlus,
  Play,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Logo } from '@/components/shared/Logo';

const ods = [
  { number: 3, title: 'Saúde e Bem-Estar', desc: 'Check-in emocional preventivo para quem cuida do próximo.', accent: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  { number: 9, title: 'Inovação e Infraestrutura', desc: 'Infraestrutura digital para modernizar operações do terceiro setor.', accent: 'border-l-orange-500', badge: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' },
  { number: 10, title: 'Redução das Desigualdades', desc: 'Conectamos recursos e voluntários a quem mais precisa.', accent: 'border-l-rose-500', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' },
  { number: 16, title: 'Instituições Eficazes', desc: 'Transparência total e relatórios ESG para gestão responsável.', accent: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  { number: 17, title: 'Parcerias', desc: 'Ponte entre empresas ESG, ONGs e voluntários engajados.', accent: 'border-l-violet-500', badge: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' },
];

const features = [
  {
    icon: Heart,
    title: 'Termômetro de Emoções',
    desc: 'Check-in emocional diário que protege a saúde mental dos voluntários com acolhimento e cuidado.',
    iconBg: 'bg-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Relatórios ESG',
    desc: 'Dados quantificados do impacto social transformados em relatórios para captação de recursos.',
    iconBg: 'bg-violet-500',
  },
  {
    icon: Users,
    title: 'Gestão de Voluntários',
    desc: 'Painel completo para acompanhar engajamento, horas e bem-estar de toda a base de voluntários.',
    iconBg: 'bg-blue-500',
  },
  {
    icon: Sparkles,
    title: 'Gamificação Afetiva',
    desc: 'Insígnias virtuais e reconhecimento que criam pertencimento e motivam o voluntariado contínuo.',
    iconBg: 'bg-amber-500',
  },
];

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Raízes do Bem — Plataforma de Gestão de Impacto Social';
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background text-slate-800 dark:text-foreground overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-stone-50/90 dark:bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span className="font-bold text-lg text-slate-900 dark:text-foreground tracking-tight">
              Raízes do Bem
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/transparencia"
              className="px-4 py-2 text-[15px] font-medium text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors rounded-full hover:bg-stone-200/50 dark:hover:bg-muted"
            >
              Transparência
            </Link>
            <Link
              to="/doador"
              className="px-4 py-2 text-[15px] font-medium text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors rounded-full hover:bg-stone-200/50 dark:hover:bg-muted"
            >
              Quero Doar
            </Link>
            <Link
              to="/portal-empresa"
              className="px-4 py-2 text-[15px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors rounded-full hover:bg-stone-200/50 dark:hover:bg-muted flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              Portal Empresa
            </Link>
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors rounded-full hover:bg-stone-200/50 dark:hover:bg-muted"
            >
              <LogIn size={16} />
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="ml-2 flex items-center gap-2 px-5 py-2 text-[15px] font-semibold bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
            >
              <UserPlus size={16} />
              Começar
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden bg-stone-50 dark:bg-background">
        {/* Soft Organic Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.08] dark:opacity-[0.03] blur-3xl pointer-events-none"
            style={{ background: 'var(--color-primary)' }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full opacity-[0.05] dark:opacity-[0.02] blur-3xl pointer-events-none"
            style={{ background: 'var(--color-accent)' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-400 text-[15px] font-medium mb-8 animate-in fade-in slide-in-from-top-4 duration-700 shadow-sm">
            <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
            Plataforma para o Terceiro Setor
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[4rem] font-extrabold leading-[1.15] tracking-tight mb-6 text-slate-900 dark:text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            Transforme ação solidária em <span className="text-emerald-600 dark:text-emerald-400">impacto mensurável</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            A plataforma SaaS B2B que conecta ONGs operacionais a empresas patrocinadoras, convertendo ações voluntárias auditadas em relatórios ESG e vitrines de impacto.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
            <Link
              to="/cadastro"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-[17px]"
            >
              <Heart size={20} className="group-hover:scale-110 transition-transform duration-300" />
              Criar conta gratuita
            </Link>
            <Link
              to="/transparencia"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-card border border-stone-200 dark:border-border rounded-full font-medium text-slate-700 dark:text-foreground hover:bg-stone-100 dark:hover:bg-muted shadow-sm transition-all duration-300 text-[17px]"
            >
              <Play size={18} />
              Ver Portal de Transparência
            </Link>
          </div>

          {/* Acolhimento Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-16 text-[15px] font-medium text-slate-500 dark:text-muted-foreground animate-in fade-in duration-700 delay-700">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-background/50 px-4 py-2 rounded-full border border-stone-200 dark:border-border shadow-sm">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              Dados seguros
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-background/50 px-4 py-2 rounded-full border border-stone-200 dark:border-border shadow-sm">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              Auditoria em dupla checagem
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-background/50 px-4 py-2 rounded-full border border-stone-200 dark:border-border shadow-sm">
              <Globe size={18} className="text-blue-500" />
              5 ODS conectados
            </div>
          </div>
        </div>
      </section>

      {/* ── Perfis (Alternate Background: Soft Emerald) ── */}
      <section className="py-24 px-4 bg-emerald-50/50 dark:bg-card/30 border-t border-emerald-100 dark:border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-foreground">
              Um espaço seguro para quem transforma o mundo
            </h2>
            <p className="text-slate-600 dark:text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Escolha seu perfil e descubra ferramentas desenhadas com empatia para facilitar o seu dia a dia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card Voluntário */}
            <div className="group rounded-[2rem] border border-stone-200 dark:border-border bg-white dark:bg-card p-10 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                <Heart size={28} className="text-emerald-700 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-foreground">Sou Voluntário</h3>
              <p className="text-slate-600 dark:text-muted-foreground mb-8 leading-relaxed text-[17px]">
                Registre suas ações, acompanhe seu impacto no mundo, conquiste insígnias e cuide do seu próprio bem-estar de forma acolhedora.
              </p>
              <ul className="space-y-4 mb-10">
                {['Check-in emocional de saúde mental', 'Registro prático de ações e horas', 'Reconhecimento orgânico e humano'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-foreground font-medium">
                    <Heart size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/cadastro?perfil=voluntario"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full font-semibold transition-colors duration-200 text-[17px]"
              >
                <UserPlus size={20} />
                Quero ser voluntário
              </Link>
            </div>

            {/* Card ONG */}
            <div className="group rounded-[2rem] border border-stone-200 dark:border-border bg-white dark:bg-card p-10 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
                <Building size={28} className="text-violet-700 dark:text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-foreground">Sou uma ONG</h3>
              <p className="text-slate-600 dark:text-muted-foreground mb-8 leading-relaxed text-[17px]">
                Acompanhe com clareza o bem-estar da sua equipe e gere relatórios ESG transparentes que comprovam o impacto das suas ações.
              </p>
              <ul className="space-y-4 mb-10">
                {['Métricas claras e visuais do impacto', 'Monitoramento da saúde emocional', 'Relatórios automatizados e bonitos'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-foreground font-medium">
                    <BarChart3 size={18} className="text-violet-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/cadastro?perfil=ong"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full font-semibold transition-colors duration-200 text-[17px]"
              >
                <UserPlus size={20} />
                Cadastrar minha ONG
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (Back to Stone) ── */}
      <section className="py-24 px-4 bg-stone-50 dark:bg-background border-t border-stone-200 dark:border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-foreground">
              Funcionalidades que abraçam as suas necessidades
            </h2>
            <p className="text-slate-600 dark:text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Desenhado para ser intuitivo, sem sobrecarga visual e com foco absoluto no que realmente importa: o impacto.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc, iconBg }) => (
              <div
                key={title}
                className="flex gap-5 p-6 rounded-[2rem] border border-stone-200 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${iconBg} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                  <Icon size={24} className={iconBg.replace('bg-', 'text-')} />
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-lg text-slate-900 dark:text-foreground">{title}</h4>
                  <p className="text-[15px] text-slate-600 dark:text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ODS Section (Soft Blue/Slate Accent) ── */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-muted/30 border-t border-slate-200 dark:border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-foreground">
              Conectado aos Objetivos Globais
            </h2>
            <p className="text-slate-600 dark:text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Cada passo na nossa plataforma ajuda a impulsionar as metas de desenvolvimento sustentável da ONU.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ods.map(({ number, title, desc, badge }) => (
              <div
                key={number}
                className="p-6 rounded-[2rem] border border-slate-200 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className={`self-start inline-flex items-center text-[13px] font-bold px-3 py-1.5 rounded-full mb-4 ${badge}`}>
                  <Globe size={14} className="mr-1.5" />
                  ODS {number}
                </div>
                <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-foreground">{title}</h4>
                <p className="text-[15px] text-slate-600 dark:text-muted-foreground leading-relaxed flex-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pitch Investor Section (TAM / SAM / SOM) ── */}
      <section className="py-24 px-4 bg-emerald-900 dark:bg-slate-950 text-white relative overflow-hidden border-t-8 border-emerald-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-400 blur-[100px]" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-[14px] font-bold tracking-wider uppercase mb-6 shadow-sm">
              <BarChart3 size={16} /> Visão de Mercado
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">
              O Tamanho do Desafio (e da Oportunidade)
            </h2>
            <p className="text-emerald-100/80 max-w-2xl mx-auto text-lg leading-relaxed">
              O ecossistema ESG e o Terceiro Setor movimentam recursos massivos que carecem de rastreabilidade de ponta a ponta.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* TAM */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20">
                <Globe size={32} className="text-emerald-300" />
              </div>
              <h3 className="text-sm font-bold text-emerald-400 tracking-widest uppercase mb-2">TAM (Mercado Total)</h3>
              <p className="text-4xl lg:text-5xl font-black text-white mb-4">R$ 18<span className="text-2xl lg:text-3xl text-emerald-400 ml-1">Bi</span></p>
              <p className="text-emerald-100/70 text-[15px] leading-relaxed">
                Volume estimado de recursos movimentados anualmente por ONGs e investimentos ESG em todo o Brasil.
              </p>
            </div>

            {/* SAM */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 relative lg:-translate-y-4 shadow-2xl shadow-emerald-900/50">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                <Users size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-emerald-400 tracking-widest uppercase mb-2">SAM (Mercado Endereçável)</h3>
              <p className="text-4xl lg:text-5xl font-black text-white mb-4">R$ 450<span className="text-2xl lg:text-3xl text-emerald-400 ml-1">Mi</span></p>
              <p className="text-emerald-100/70 text-[15px] leading-relaxed">
                Empresas do Nordeste que já publicam ativamente relatórios de sustentabilidade e buscam governança climática/social.
              </p>
            </div>

            {/* SOM */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-400 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <ShieldCheck size={32} className="text-emerald-950" />
              </div>
              <h3 className="text-sm font-bold text-emerald-400 tracking-widest uppercase mb-2">SOM (Foco Inicial - Ano 1)</h3>
              <p className="text-4xl lg:text-5xl font-black text-white mb-4">R$ 25<span className="text-2xl lg:text-3xl text-emerald-400 ml-1">Mi</span></p>
              <p className="text-emerald-100/70 text-[15px] leading-relaxed">
                O ecossistema do Rio Grande do Norte (Natal e Região Metropolitana) que adotará nossa rastreabilidade em 2027.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-24 px-4 bg-stone-50 dark:bg-background border-t border-stone-200 dark:border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-foreground">
            Vamos fazer o bem, juntos?
          </h2>
          <p className="text-slate-600 dark:text-muted-foreground mb-10 text-lg leading-relaxed">
            Sinta-se em casa. O Raízes do Bem é um espaço pensado para acolher e potencializar a sua vontade de transformar.
          </p>
          <Link
            to="/cadastro"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-emerald-600 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-lg"
          >
            <Sparkles size={22} />
            Entrar para a comunidade
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 dark:border-border bg-stone-100 dark:bg-muted/40 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-[15px] font-medium text-slate-500 dark:text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Globe size={16} className="text-emerald-700 dark:text-emerald-400" />
            </div>
            <span>Raízes do Bem © 2026 — Feito com empatia</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/transparencia" className="hover:text-slate-900 dark:hover:text-foreground transition-colors flex items-center gap-2">
              <BarChart3 size={16} /> Transparência
            </Link>
            <Link to="/login" className="hover:text-slate-900 dark:hover:text-foreground transition-colors flex items-center gap-2">
              <LogIn size={16} /> Entrar
            </Link>
            <Link to="/cadastro" className="hover:text-slate-900 dark:hover:text-foreground transition-colors flex items-center gap-2">
              <UserPlus size={16} /> Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
