import { Injectable, computed, signal } from '@angular/core';
import { Chamado, Evento, NovoChamado, SlaEstado, Status } from './models';
import { mockChamados } from './mock-data';
import { dia } from './util';

const ev = (tipo: Evento['tipo'], autor: string, texto: string, detalhe?: string): Evento => ({
  tipo,
  autor,
  texto,
  detalhe,
  data: new Date().toISOString(),
});

/**
 * Camada de dados dos chamados. Hoje usa dados fictícios em memória (signals);
 * para ligar a uma API, troque apenas os métodos abaixo por chamadas HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class ChamadoService {
  private readonly _lista = signal<Chamado[]>(mockChamados());
  readonly lista = this._lista.asReadonly();

  /** Chamado aberto na tela de andamento (chat + detalhes). */
  readonly detalheId = signal<number | null>(null);
  /** Chamado aberto no painel de progresso. */
  readonly progressoId = signal<number | null>(null);
  readonly formAberto = signal(false);
  readonly editandoId = signal<number | null>(null);

  readonly detalhe = computed(() => this._lista().find((c) => c.id === this.detalheId()) ?? null);
  readonly progresso = computed(() => this._lista().find((c) => c.id === this.progressoId()) ?? null);
  readonly atrasados = computed(() => this._lista().filter((c) => this.estaAtrasado(c)));

  readonly resumo = computed(() => {
    const l = this._lista();
    const conta = (s: Status) => l.filter((c) => c.status === s).length;
    return {
      total: l.length,
      abertos: conta('Aberto'),
      andamento: conta('Em andamento'),
      aguardando: conta('Aguardando'),
      finalizados: conta('Finalizado'),
      atrasados: this.atrasados().length,
    };
  });

  readonly porCategoria = computed(() => {
    const mapa = new Map<string, number>();
    for (const c of this._lista()) mapa.set(c.categoria, (mapa.get(c.categoria) ?? 0) + 1);
    const max = Math.max(1, ...mapa.values());
    return [...mapa.entries()]
      .map(([nome, total]) => ({ nome, total, pct: (total / max) * 100 }))
      .sort((a, b) => b.total - a.total);
  });

  estaAtrasado(c: Chamado): boolean {
    return c.status !== 'Finalizado' && c.prazo < dia(0);
  }

  /** Metas de atendimento: 1ª resposta e resolução. */
  sla(c: Chamado): { resposta: SlaEstado; resolucao: SlaEstado } {
    const respondeu = c.mensagens.some((m) => m.tipo === 'resposta' && m.autor !== c.solicitante);
    const atraso = this.estaAtrasado(c);
    return {
      resposta: respondeu ? 'cumprido' : atraso ? 'violado' : 'pendente',
      resolucao: c.status === 'Finalizado' ? ((c.termino ?? '') <= c.prazo ? 'cumprido' : 'violado') : atraso ? 'violado' : 'pendente',
    };
  }

  abrirNovo(): void {
    this.editandoId.set(null);
    this.formAberto.set(true);
  }

  abrirEdicao(id: number): void {
    this.editandoId.set(id);
    this.formAberto.set(true);
  }

  fecharForm(): void {
    this.formAberto.set(false);
    this.editandoId.set(null);
  }

  criar(d: NovoChamado, anexos: string[]): void {
    const id = Math.max(0, ...this._lista().map((c) => c.id)) + 1;
    const campos = this.montar(d);
    const novo: Chamado = {
      id,
      ...campos,
      termino: null,
      status: 'Aberto',
      fixado: false,
      anexos,
      mensagens: [{ autor: campos.solicitante, texto: campos.descricao, tipo: 'abertura', data: new Date().toISOString() }],
      eventos: [
        ev('abertura', campos.solicitante, 'realizou a abertura do chamado'),
        ev('atribuicao', 'Sistema', `atribuiu ${d.responsaveis.join(', ')}`, `Departamento: ${d.departamento}`),
      ],
    };
    this._lista.update((l) => [novo, ...l]);
  }

  editar(id: number, d: NovoChamado, anexos: string[], autor: string): void {
    const campos = this.montar(d);
    this.atualizar(id, (c) => ({
      ...c,
      ...campos,
      anexos,
      eventos: [...c.eventos, ev('edicao', autor, 'editou os dados do chamado')],
    }));
  }

  alterarStatus(id: number, status: Status, autor: string): void {
    this.atualizar(id, (c) => ({
      ...c,
      status,
      termino: status === 'Finalizado' ? dia(0) : null,
      mensagens: [
        ...c.mensagens,
        { autor, texto: `Status alterado para ${status}`, tipo: 'status', data: new Date().toISOString() },
      ],
      eventos: [...c.eventos, ev('status', autor, status === 'Finalizado' ? 'finalizou o chamado' : `alterou o status para ${status}`)],
    }));
  }

  responder(id: number, texto: string, autor: string, extra: { interna?: boolean; tempoMin?: number } = {}): void {
    const limpo = texto.trim();
    if (!limpo) return;
    this.atualizar(id, (c) => ({
      ...c,
      mensagens: [...c.mensagens, { autor, texto: limpo, tipo: 'resposta', data: new Date().toISOString(), ...extra }],
      eventos: [...c.eventos, ev('resposta', autor, extra.interna ? 'registrou uma nota interna' : 'respondeu ao chamado')],
    }));
  }

  alternarFixado(id: number): void {
    this.atualizar(id, (c) => ({ ...c, fixado: !c.fixado }));
  }

  private montar(d: NovoChamado) {
    return {
      assunto: d.assunto.trim(),
      descricao: d.descricao.trim() || 'Sem descrição.',
      empresa: d.empresa || '—',
      deptoSolicitante: d.deptoSolicitante,
      solicitante: d.solicitante.trim() || 'Solicitante',
      departamento: d.departamento,
      responsaveis: d.responsaveis,
      plataforma: d.plataforma || '—',
      prioridade: d.prioridade,
      categoria: d.categoria,
      prazo: d.prazo || dia(7),
      agendamento: d.agendar ? { inicio: d.agInicio, fim: d.agFim, local: d.agLocal, descricao: d.agDescricao } : null,
    };
  }

  private atualizar(id: number, fn: (c: Chamado) => Chamado): void {
    this._lista.update((l) => l.map((c) => (c.id === id ? fn(c) : c)));
  }
}
