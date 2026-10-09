import React from 'react';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Badge — OCP: mapa de tonos cerrado,SIN estilos inline en consumidores.
 * ISP: props mínimas para etiqueta de estado.
 */
const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-ink-700 border-slate-200',
  info: 'bg-brand-50 text-brand-700 border-brand-100',
  success: 'bg-green-50 text-success border-green-200',
  warning: 'bg-amber-50 text-warning border-amber-200',
  danger: 'bg-red-50 text-danger border-red-200',
};

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Strategy: estado de dominio → tono visual.
 * M04 estados, M06 SLA, M05 asignación comparten este contrato.
 */
export function toneForTicketStatus(status: string): Tone {
  switch (status) {
    case 'abierto':
    case 'pendiente':
      return 'warning';
    case 'en_atencion':
      return 'info';
    case 'en_espera':
      return 'neutral';
    case 'resuelto':
    case 'cerrado':
      return 'success';
    case 'cancelado':
    case 'vencido':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function toneForPriority(priority: string): Tone {
  switch (priority) {
    case 'critica':
    case 'alta':
      return 'danger';
    case 'media':
      return 'warning';
    case 'baja':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function toneForSla(state: 'ok' | 'en_riesgo' | 'vencido' | 'pausado'): Tone {
  switch (state) {
    case 'ok':
      return 'success';
    case 'en_riesgo':
      return 'warning';
    case 'vencido':
      return 'danger';
    case 'pausado':
      return 'neutral';
  }
}
