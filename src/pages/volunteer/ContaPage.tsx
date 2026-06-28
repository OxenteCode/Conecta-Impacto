import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Calendar,
  LogOut,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function ContaPage() {
  const { sessao, setSessao, logout } = useAuth();
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    document.title = 'Minha Conta — Raízes do Bem';
    if (sessao) {
      setNome(sessao.nome);
      void loadProfileDetails();
    }
  }, [sessao]);

  const loadProfileDetails = async () => {
    if (!sessao) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', sessao.id)
        .single();
      
      if (data?.created_at) {
        setCreatedAt(new Date(data.created_at).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessao || !nome.trim()) return;
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nome: nome.trim() })
        .eq('id', sessao.id);

      if (error) throw error;

      // Atualiza a sessão local
      setSessao({
        ...sessao,
        nome: nome.trim()
      });
      
      setSuccessMsg('Seu nome de perfil foi atualizado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Erro ao atualizar dados.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Configurações de Conta
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Gerencie seus dados pessoais, consulte permissões de acesso e controle sua sessão.
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20 shrink-0">
            {sessao?.nome?.[0]?.toUpperCase() ?? 'V'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold truncate text-foreground">{sessao?.nome ?? 'Voluntário'}</h2>
            <p className="text-xs text-muted-foreground truncate">{sessao?.email}</p>
          </div>
        </div>

        <div className="border-t border-border/30 pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-400" />
              Nível de Acesso
            </span>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider">
              Voluntário
            </span>
          </div>
          {createdAt && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar size={14} className="text-teal-400" />
                Membro desde
              </span>
              <span className="font-medium text-foreground">{createdAt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-emerald-400" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Editar Dados Pessoais</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="conta-nome" className="text-[10px] uppercase font-bold text-muted-foreground">Nome de Exibição</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="conta-nome"
                type="text"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Endereço de E-mail</label>
            <div className="relative opacity-50">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                disabled
                value={sessao?.email ?? ''}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-muted/20 text-xs cursor-not-allowed"
              />
            </div>
            <p className="text-[9px] text-muted-foreground/60 leading-none">O e-mail de login do Supabase Auth não pode ser alterado diretamente.</p>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] animate-in fade-in duration-300">
              <CheckCircle2 size={12} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="px-3 py-2.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] animate-in fade-in duration-300">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={updating || !nome.trim() || nome === sessao?.nome}
            className={cn(
              'w-full py-3.5 rounded-2xl font-bold text-xs transition-all duration-200',
              updating || !nome.trim() || nome === sessao?.nome
                ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border/10'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.01]'
            )}
          >
            {updating ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw size={12} className="animate-spin" />
                Salvando...
              </span>
            ) : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      {/* Danger Zone / Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-4 bg-rose-500/5 border border-rose-500/15 text-rose-400 hover:bg-rose-500/10 active:scale-98 font-bold text-xs rounded-3xl flex items-center justify-center gap-2 transition-all duration-200"
      >
        <LogOut size={16} />
        Sair do Portal do Voluntário
      </button>

    </div>
  );
}
