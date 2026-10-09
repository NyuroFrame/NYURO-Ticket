export interface SlaRiskRow {
  ref: string;
  title: string;
  objective: 'primera_respuesta' | 'asignacion' | 'resolucion';
  remainingMin: number;
  sla: 'ok' | 'en_riesgo' | 'vencido' | 'pausado';
}

export interface NotificationRow {
  id: string;
  kind: string;
  ref: string;
  text: string;
  read: boolean;
}

export interface ServiceRow {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface ApprovalRow {
  id: string;
  service: string;
  requester: string;
  step: string;
}

export const mockSlaRisk: SlaRiskRow[] = [
  { ref: 'NYU-1042', title: 'Caída de correo en Soporte', objective: 'resolucion', remainingMin: -25, sla: 'vencido' },
  { ref: 'NYU-1041', title: 'Instalar VPN en laptop nueva', objective: 'asignacion', remainingMin: 12, sla: 'en_riesgo' },
  { ref: 'NYU-1040', title: 'Error de impresión', objective: 'primera_respuesta', remainingMin: 180, sla: 'ok' },
];

export const mockNotifications: NotificationRow[] = [
  { id: 'n1', kind: 'sla_riesgo', ref: 'NYU-1041', text: 'NYU-1041 en riesgo de asignación', read: false },
  { id: 'n2', kind: 'sla_riesgo', ref: 'NYU-1041', text: 'Duplicado que debe colapsar (M08-HU-016)', read: false },
  { id: 'n3', kind: 'asignacion', ref: 'NYU-1042', text: 'Te asignaron NYU-1042', read: true },
];

export const mockServices: ServiceRow[] = [
  { id: 's-vpn', name: 'Acceso VPN', category: 'Accesos', description: 'Solicitud de acceso con aprobación del responsable.' },
  { id: 's-laptop', name: 'Laptop nueva', category: 'Hardware', description: 'Pedido de equipo con inventario y entrega en sede.' },
  { id: 's-pass', name: 'Restablecer contraseña', category: 'Accesos', description: 'Autoservicio con verificación de identidad.' },
];

export const mockApprovals: ApprovalRow[] = [
  { id: 'a1', service: 'Acceso VPN', requester: 'Marco Ruiz', step: 'Jefatura de Soporte' },
];
