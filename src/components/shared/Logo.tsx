import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
    >
      {/* Orange stylized heart ribbon loop */}
      <path
        d="M50 85C25 64 12 43 20 24C27 7 43 12 50 23C57 12 73 7 80 24C88 43 75 64 50 85Z"
        stroke="#f97316" /* orange-500 */
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Network connection lines inside (teal) */}
      <path
        d="M30 30 L50 23 M70 30 L50 23 M30 30 L20 44 M70 30 L80 44 M20 44 L35 62 M80 44 L65 62 M35 62 L50 76 M65 62 L50 76 M50 50 L30 30 M50 50 L70 30 M50 50 L50 76 M50 50 L35 62 M50 50 L65 62 M20 44 L50 50 M80 44 L50 50"
        stroke="#0d9488" /* teal-600 */
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Nodes (teal circles with white outline) */}
      <circle cx="50" cy="23" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="70" cy="30" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="20" cy="44" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="80" cy="44" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="5.5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="35" cy="62" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="65" cy="62" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="50" cy="76" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}
