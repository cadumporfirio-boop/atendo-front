import { Injectable, computed, signal } from '@angular/core';
import { Notificacao, TipoNotificacao } from './models';

const atras = (horas: number): string => new Date(Date.now() - horas * 3600000).toISOString();

export const CATEGORIAS_NOTIF: Record<string, TipoNotificacao | null> = {
  Tudo: null,
  Chamados: 'chamado',
  Conversas: 'conversa',
  Mural: 'mural',
  Agenda: 'agenda',
  Sistema: 'sistema',
};

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly _lista = signal<Notificacao[]>([
    { id: 1, tipo: 'mural', titulo: 'Aviso: manutenção programada', texto: 'Amanhã a equipe técnica fará uma manutenção programada e todos serão liberados mais cedo. Detalhes no mural.', origem: 'Equipe Técnica', data: atras(5), lida: false },
    { id: 2, tipo: 'sistema', titulo: 'Hoje é aniversário de Carla Dias!', texto: 'Que tal mandar os parabéns? Clique para abrir uma mensagem direta.', origem: 'Carla Dias', data: atras(8), lida: false, acao: 'Mandar parabéns' },
    { id: 3, tipo: 'chamado', titulo: 'Atualização no Chamado #1008', texto: 'Bruno Lima atualizou o chamado.', origem: 'Bruno Lima', data: atras(26), lida: false, chamadoId: 1008 },
    { id: 4, tipo: 'conversa', titulo: 'Nova mensagem no Chamado #1006', texto: 'Paulo Reis: podem priorizar? A equipe está parada.', origem: 'Paulo Reis', data: atras(30), lida: false, chamadoId: 1006 },
    { id: 5, tipo: 'agenda', titulo: 'Visita técnica agendada', texto: 'Chamado #1008 · em 2 dias às 09:00 · Sala de reuniões.', origem: 'Agenda', data: atras(40), lida: true, chamadoId: 1008 },
    { id: 6, tipo: 'chamado', titulo: 'Chamado #1004 finalizado', texto: 'Ana Souza finalizou o chamado.', origem: 'Ana Souza', data: atras(150), lida: true, chamadoId: 1004 },
  ]);

  readonly aba = signal<'nao-lidas' | 'todas'>('nao-lidas');
  readonly categoria = signal<string>('Tudo');
  readonly naoLidas = computed(() => this._lista().filter((n) => !n.lida).length);

  readonly visiveis = computed(() => {
    const tipo = CATEGORIAS_NOTIF[this.categoria()] ?? null;
    const soNaoLidas = this.aba() === 'nao-lidas';
    return this._lista().filter((n) => (!soNaoLidas || !n.lida) && (tipo === null || n.tipo === tipo));
  });

  marcar(id: number): void {
    this._lista.update((l) => l.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  marcarTodas(): void {
    this._lista.update((l) => l.map((n) => ({ ...n, lida: true })));
  }
}
