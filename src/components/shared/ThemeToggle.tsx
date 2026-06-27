import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ThemeToggle — alternância claro/escuro.
 *
 * Persiste preferência em localStorage.
 * Na primeira visita, respeita prefers-color-scheme do sistema.
 * Aplica/remove classe "dark" no <html>.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('ci-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('ci-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ci-theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(prev => !prev)}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-lg',
        'text-muted-foreground hover:text-foreground',
        'hover:bg-muted transition-colors duration-200',
        className
      )}
    >
      {isDark
        ? <Sun size={16} strokeWidth={2} />
        : <Moon size={16} strokeWidth={2} />
      }
    </button>
  );
}
