import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ChamadoService } from '../core/chamado.service';
import { MENSAGENS_PRONTAS, SlaEstado, STATUS_LISTA, Status } from '../core/models';
import { iniciais, slug } from '../core/util';

/** Tela de andamento: chat do chamado + resumo e detalhes ao lado. */
@Component({
  selector: 'app-chamado-detalhe',
  imports: [DatePipe, FormsModule],
  template: `
    @if (svc.detalhe(); as c) {
      <div class="overlay" (click)="fechar()"></div>
      <div class="modal xl" role="dialog" aria-label="Andamento do chamado">
        <header class="grad head">
          <div><h3>Andamento do chamado #{{ c.id }}</h3><small>Acompanhamento do chamado</small></div>
          <div class="head-actions">
            <button class="btn sm" (click)="svc.progressoId.set(c.id)">◔ Progresso</button>
            <button class="btn sm" (click)="editar(c.id)">✎ Editar</button>
            <button class="ghost" (click)="fechar()" aria-label="Fechar">✕</button>
          </div>
        </header>

        <div class="andamento">
          <aside class="resumo">
            <section class="box">
              <h4>Resumo do chamado</h4>
              <div class="chips-row">
                <select [ngModel]="c.status" (ngModelChange)="mudarStatus(c.id, $event)">
                  @for (s of statusLista; track s) { <option [value]="s">{{ s }}</option> }
                </select>
                <span [class]="'pill p-' + slug(c.prioridade)">{{ c.prioridade }}</span>
              </div>
              <div class="kv"><small>Prazo</small><b>{{ c.prazo | date: 'dd/MM/yyyy' }}</b></div>
              <div class="kv"><small>Aberto em</small><b>{{ c.mensagens[0].data | date: 'dd/MM/yyyy, HH:mm' }}</b></div>
              <h5>Metas de atendimento (SLA)</h5>
              <div class="sla-row"><span>1ª resposta</span><span [class]="'tag t-' + cls(svc.sla(c).resposta)">{{ rotulo(svc.sla(c).resposta) }}</span></div>
              <div class="sla-row"><span>Resolução</span><span [class]="'tag t-' + cls(svc.sla(c).resolucao)">{{ rotulo(svc.sla(c).resolucao) }}</span></div>
              <div class="kv"><small>Tempo gasto</small><b>{{ tempoTotal(c.mensagens) }} min</b></div>
            </section>
            <section class="box">
              <h4>Pessoas</h4>
              <div class="kv"><small>Quem pediu</small><b>{{ c.solicitante }}</b><small>{{ c.deptoSolicitante }}</small></div>
            </section>
            @if (c.agendamento; as ag) {
              <section class="box">
                <h4>Agendamento</h4>
                <div class="kv"><small>Início</small><b>{{ ag.inicio | date: 'dd/MM/yyyy, HH:mm' }}</b></div>
                <div class="kv"><small>Fim</small><b>{{ ag.fim | date: 'dd/MM/yyyy, HH:mm' }}</b></div>
                <div class="kv"><small>Local</small><b>{{ ag.local || '—' }}</b></div>
                <div class="kv"><small>Descrição</small><b>{{ ag.descricao || '—' }}</b></div>
              </section>
            }
            <section class="box">
              <h4>Responsáveis</h4>
              <div class="avs">@for (r of c.responsaveis; track r) { <span class="av" [title]="r">{{ ini(r) }}</span> }</div>
              <p class="muted small">{{ c.responsaveis.join(' · ') }}</p>
            </section>
            <section class="box">
              <h4>Classificação</h4>
              <div class="kv"><small>Departamento</small><b>{{ c.departamento }}</b></div>
              <div class="kv"><small>Categoria</small><b>{{ c.categoria }}</b></div>
              <div class="kv"><small>Plataforma</small><b>{{ c.plataforma }}</b></div>
              <div class="kv"><small>Empresa cliente</small><b>{{ c.empresa }}</b></div>
              @if (c.anexos.length) {
                <div class="kv"><small>Anexos</small>@for (a of c.anexos; track a) { <b>📎 {{ a }}</b> }</div>
              }
            </section>
          </aside>

          <section class="chat">
            <div class="chat-head"><b>Mensagens</b><span class="live">● Ao vivo</span></div>
            <div class="chat-list">
              @for (m of c.mensagens; track $index) {
                @if (m.tipo === 'status') {
                  <div class="chat-sys">{{ m.texto }} · {{ m.data | date: 'dd/MM HH:mm' }}</div>
                } @else {
                  <div [class]="'msg' + (m.autor === eu ? ' eu' : '') + (m.interna ? ' interna' : '')">
                    <small class="autor">{{ m.autor }}{{ m.interna ? ' · nota interna' : '' }}</small>
                    <p>{{ m.texto }}</p>
                    <small class="hora">{{ m.tempoMin ? '⏱ ' + m.tempoMin + ' min · ' : '' }}{{ m.data | date: 'dd/MM/yyyy, HH:mm' }}</small>
                  </div>
                }
              }
            </div>
            <div class="composer">
              <label class="inline">Mensagens prontas
                <select #p (change)="usarPronta(p.value); p.value = ''">
                  <option value="">Selecione uma mensagem pronta</option>
                  @for (t of prontas; track t) { <option [value]="t">{{ t }}</option> }
                </select>
              </label>
              <textarea rows="2" placeholder="Digite sua mensagem..." [(ngModel)]="texto"></textarea>
              <div class="composer-row">
                <span>⏱ Tempo gasto
                  <input class="mini" type="number" min="0" [(ngModel)]="horas" /> h
                  <input class="mini" type="number" min="0" max="59" [(ngModel)]="minutos" /> min
                </span>
                <label class="check"><input type="checkbox" [(ngModel)]="interna" /> Só para a equipe</label>
                <button class="btn primary" (click)="enviar(c.id)" [disabled]="!texto.trim()">Enviar</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    }
  `,
})
export class ChamadoDetalheComponent {
  readonly svc = inject(ChamadoService);
  private readonly auth = inject(AuthService);
  readonly statusLista = STATUS_LISTA;
  readonly prontas = MENSAGENS_PRONTAS;
  readonly slug = slug;
  readonly ini = iniciais;
  texto = '';
  interna = false;
  horas = 0;
  minutos = 0;

  get eu(): string {
    return this.auth.usuario()?.nome ?? 'Atendente';
  }

  cls(e: SlaEstado): string {
    return e === 'cumprido' ? 'ok' : e === 'violado' ? 'atraso' : 'pend';
  }

  rotulo(e: SlaEstado): string {
    return e === 'cumprido' ? 'Cumprido' : e === 'violado' ? 'Violado' : 'Pendente';
  }

  tempoTotal(msgs: { tempoMin?: number }[]): number {
    return msgs.reduce((t, m) => t + (m.tempoMin ?? 0), 0);
  }

  fechar(): void {
    this.svc.detalheId.set(null);
    this.limpar();
  }

  editar(id: number): void {
    this.svc.abrirEdicao(id);
  }

  mudarStatus(id: number, status: Status): void {
    this.svc.alterarStatus(id, status, this.eu);
  }

  usarPronta(valor: string): void {
    if (valor) this.texto = valor;
  }

  enviar(id: number): void {
    const tempoMin = (this.horas || 0) * 60 + (this.minutos || 0);
    this.svc.responder(id, this.texto, this.eu, { interna: this.interna, tempoMin: tempoMin || undefined });
    this.limpar();
  }

  private limpar(): void {
    this.texto = '';
    this.interna = false;
    this.horas = 0;
    this.minutos = 0;
  }
}
