import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, X, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

type FlowState = 'idle' | 'processing' | 'preview' | 'uploading' | 'success' | 'error';

interface CheckInResult {
  imagemUrl: string;
  dataCaptura: string;
}

interface CheckInCameraProps {
  /** ID da ação voluntária a que este check-in pertence (opcional). */
  acaoId?: string;
  /** Callback chamado após upload bem-sucedido. */
  onSuccess?: (result: CheckInResult) => void;
  /** Callback chamado quando o utilizador fecha/cancela o componente. */
  onClose?: () => void;
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

const MAX_WIDTH = 1280;
const WATERMARK_HEIGHT = 52;
const FONT_SIZE_MAIN = 13;
const FONT_SIZE_SUB = 11;

/**
 * Carrega um File/Blob num HTMLImageElement e devolve a instância.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Recebe um File de imagem e devolve um Blob WebP com carimbo de data/hora.
 */
async function applyWatermark(file: File): Promise<{ blob: Blob; capturedAt: Date }> {
  const capturedAt = new Date();
  const img = await loadImage(file);

  // Redimensionamento proporcional
  let { width, height } = img;
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width);
    width = MAX_WIDTH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height + WATERMARK_HEIGHT;

  const ctx = canvas.getContext('2d')!;

  // Desenha a foto original
  ctx.drawImage(img, 0, 0, width, height);

  // Fundo semitransparente da faixa de carimbo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
  ctx.fillRect(0, height, width, WATERMARK_HEIGHT);

  // Linha de destaque verde-teal
  ctx.fillStyle = '#2dd4bf'; // teal-400
  ctx.fillRect(0, height, 4, WATERMARK_HEIGHT);

  // Shield icon (desenhado via texto Unicode)
  ctx.fillStyle = '#2dd4bf';
  ctx.font = `bold ${FONT_SIZE_MAIN + 2}px monospace`;
  ctx.fillText('✦', 12, height + 20);

  // Título fixo
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${FONT_SIZE_MAIN}px Arial, sans-serif`;
  ctx.fillText('Evidência Auditável — Raízes do Bem', 30, height + 20);

  // Data/hora
  ctx.fillStyle = '#94a3b8'; // slate-400
  ctx.font = `${FONT_SIZE_SUB}px Arial, sans-serif`;
  ctx.fillText(
    `Captura: ${capturedAt.toLocaleString('pt-BR', { timeZoneName: 'short' })}`,
    30,
    height + 38
  );

  // Canto direito: status "Pendente de Homologação"
  ctx.fillStyle = '#fbbf24'; // amber-400
  ctx.font = `bold ${FONT_SIZE_SUB - 1}px Arial, sans-serif`;
  const statusText = '● PENDENTE DE HOMOLOGAÇÃO';
  const statusWidth = ctx.measureText(statusText).width;
  ctx.fillText(statusText, width - statusWidth - 12, height + 20);

  // Libera URL do object
  URL.revokeObjectURL(img.src);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve({ blob, capturedAt });
        else reject(new Error('Falha ao converter canvas para Blob.'));
      },
      'image/webp',
      0.88
    );
  });
}

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadEvidencia(
  blob: Blob,
  capturedAt: Date,
  sessaoId: string,
  acaoId?: string
): Promise<CheckInResult> {
  const timestamp = capturedAt.getTime();
  const path = `${sessaoId}/${timestamp}.webp`;

  // 1. Upload para o Storage
  const { error: storageError } = await supabase.storage
    .from('evidencias_auditoria')
    .upload(path, blob, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (storageError) throw storageError;

  // 2. URL pública
  const { data: urlData } = supabase.storage
    .from('evidencias_auditoria')
    .getPublicUrl(path);

  const imagemUrl = urlData.publicUrl;

  // 3. Insert na tabela de evidências
  const { error: dbError } = await supabase.from('acoes_pendentes').insert({
    user_id: sessaoId,
    acao_id: acaoId ?? null,
    imagem_url: imagemUrl,
    data_captura: capturedAt.toISOString(),
    status: 'Pendente de Homologação',
  });

  if (dbError) throw dbError;

  return { imagemUrl, dataCaptura: capturedAt.toISOString() };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckInCamera({ acaoId, onSuccess, onClose }: CheckInCameraProps) {
  const { sessao } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingCapturedAt, setPendingCapturedAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Recebe o arquivo da câmara e processa o canvas
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFlowState('processing');
    setErrorMsg('');

    try {
      const { blob, capturedAt } = await applyWatermark(file);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPendingBlob(blob);
      setPendingCapturedAt(capturedAt);
      setFlowState('preview');
    } catch (err) {
      console.error('[CheckInCamera] Erro no canvas:', err);
      setErrorMsg('Não foi possível processar a imagem. Tente novamente.');
      setFlowState('error');
    }

    // Reset o input para permitir nova captura
    e.target.value = '';
  }, []);

  // ── Envia a evidência ao Supabase
  const handleUpload = useCallback(async () => {
    if (!pendingBlob || !pendingCapturedAt || !sessao) return;

    setFlowState('uploading');
    setErrorMsg('');

    try {
      const result = await uploadEvidencia(pendingBlob, pendingCapturedAt, sessao.id, acaoId);
      setFlowState('success');
      onSuccess?.(result);
    } catch (err: unknown) {
      console.error('[CheckInCamera] Erro no upload:', err);
      const msg =
        err instanceof Error ? err.message : 'Falha no envio. Verifique sua conexão e tente novamente.';
      setErrorMsg(msg);
      setFlowState('error');
    }
  }, [pendingBlob, pendingCapturedAt, sessao, acaoId, onSuccess]);

  // ── Reinicia o fluxo para nova captura
  const handleRetry = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingBlob(null);
    setPendingCapturedAt(null);
    setErrorMsg('');
    setFlowState('idle');
  };

  const isLoading = flowState === 'processing' || flowState === 'uploading';

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-lg">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Camera size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">Check-in em Campo</p>
            <p className="text-[10px] text-muted-foreground">Evidência com carimbo auditável</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-4">

        {/* Input de câmara oculto */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Capturar foto da câmara"
        />

        {/* ── Estado: IDLE — convida à captura ── */}
        {flowState === 'idle' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-border/40 rounded-2xl bg-muted/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Camera size={26} className="text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Tirar Foto de Evidência</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px]">
                  A câmara traseira será ativada. A foto receberá carimbo automático.
                </p>
              </div>
            </div>

            <button
              onClick={() => inputRef.current?.click()}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              Abrir Câmara
            </button>

            {/* Selo de confiança */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Carimbo de data/hora gerado localmente antes do envio</span>
            </div>
          </div>
        )}

        {/* ── Estado: PROCESSING ── */}
        {flowState === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <Loader2 size={32} className="text-teal-400 animate-spin" />
            <p className="text-sm font-semibold text-foreground">Processando imagem…</p>
            <p className="text-xs text-muted-foreground">Aplicando carimbo auditável no Canvas</p>
          </div>
        )}

        {/* ── Estado: PREVIEW ── */}
        {flowState === 'preview' && previewUrl && (
          <div className="space-y-4">
            {/* Preview da imagem com marca de água */}
            <div className="relative rounded-2xl overflow-hidden border border-border/50">
              <img
                src={previewUrl}
                alt="Preview da evidência com marca de água"
                className="w-full object-cover max-h-72"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-xl">
                <ShieldCheck size={11} className="text-teal-400" />
                <span className="text-[9px] text-teal-300 font-bold tracking-wider">CARIMBO APLICADO</span>
              </div>
            </div>

            {/* Data/hora exibida */}
            {pendingCapturedAt && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border/30">
                <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                <span className="text-[11px] text-muted-foreground">
                  <span className="font-bold text-foreground">Captura:</span>{' '}
                  {pendingCapturedAt.toLocaleString('pt-BR', { timeZoneName: 'short' })}
                </span>
              </div>
            )}

            {/* Ações */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRetry}
                className="py-3 rounded-2xl font-semibold text-xs border border-border/60 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40 transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <Camera size={14} />
                Nova Foto
              </button>
              <button
                onClick={() => void handleUpload()}
                className="py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                Enviar Evidência
              </button>
            </div>
          </div>
        )}

        {/* ── Estado: UPLOADING ── */}
        {flowState === 'uploading' && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Upload size={22} className="text-teal-400" />
              </div>
              <Loader2 size={48} className="text-emerald-400/40 animate-spin absolute -inset-2" />
            </div>
            <p className="text-sm font-semibold text-foreground">Enviando para o Supabase…</p>
            <p className="text-xs text-muted-foreground text-center max-w-[200px]">
              Salvando no bucket <code className="text-teal-400">evidencias_auditoria</code>
            </p>
          </div>
        )}

        {/* ── Estado: SUCCESS ── */}
        {flowState === 'success' && (
          <div className="space-y-4">
            {/* Preview mantido após sucesso */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30">
                <img
                  src={previewUrl}
                  alt="Evidência enviada"
                  className="w-full object-cover max-h-64 opacity-80"
                />
                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
                    <CheckCircle2 size={22} className="text-emerald-400" />
                    <span className="text-sm font-bold text-white">Evidência Registada!</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span className="text-sm font-bold text-emerald-400">Upload concluído com sucesso</span>
              </div>
              <p className="text-xs text-muted-foreground pl-5">
                A evidência foi enviada para o bucket{' '}
                <code className="text-teal-400">evidencias_auditoria</code> e registada na
                tabela <code className="text-teal-400">acoes_pendentes</code> com status{' '}
                <span className="text-amber-400 font-semibold">Pendente de Homologação</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRetry}
                className="py-3 rounded-2xl font-semibold text-xs border border-border/60 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40 transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <Camera size={14} />
                Novo Check-in
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="py-3 rounded-2xl font-bold text-xs bg-muted text-foreground hover:bg-muted/80 transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  <X size={14} />
                  Fechar
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Estado: ERROR ── */}
        {flowState === 'error' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle size={26} className="text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Ocorreu um erro</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">{errorMsg}</p>
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Camera size={16} />
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Loading overlay ─ desabilita interação durante estados de carregamento */}
        {isLoading && (
          <div
            className="absolute inset-0 z-10"
            aria-hidden="true"
            style={{ pointerEvents: 'all', cursor: 'wait' }}
          />
        )}
      </div>
    </div>
  );
}
