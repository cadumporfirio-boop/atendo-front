import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChamadoService } from '../core/chamado.service';
import { Notificacao, TipoNotificacao } from '../core/models';
import { CATEGORIAS_NOTIF, NotificacaoService } from '../core/notificacao.service';
import { UiService } from '../core/ui.service';
import { iniciais } from '../core/util';

@Component({
  selector: 'app-notificacoes',
  imports: [DatePipe],
  template: `
    @if (ui.notifAberto()) {
      <div class="overlay clear" (click)="ui.notifAberto.set(false)"></div>
      <section class="notif" role="dialog" aria-label="Notificações">
        <header class="grad head">
          <div><h3>Notificações</h3><small>{{ svc.naoLidas() }} não lidas</small></div>
          <button class="btn sm" (click)="svc.marcarTodas()">✓ Marcar todas como lidas</button>
        </header>
        <div class="tabs">
          <button [class.on]="svc.aba() === 'nao-lidas'" (click)="svc.aba.set('nao-lidas')">Não lidas</button>
          <button [class.on]="svc.aba() === 'todas'" (click)="svc.aba.set('todas')">Todas</button>
        </div>
        <div class="chips">
          @for (c of categorias; track c) {
            <button [class.on]="svc.categoria() === c" (click)="svc.categoria.set(c)">{{ c }}</button>
          }
        </div>
        <div class="notif-list">
          @for (n of svc.visiveis(); track n.id) {
            <article class="notif-item" [class.lida]="n.lida" (click)="abrir(n)">
              <span class="av">{{ ini(n.origem) }}</span>
              <div class="notif-corpo">
                <div class="notif-top"><b>{{ n.titulo }}</b><span class="cat">{{ rotulo[n.tipo] }}</span></div>
                <p>{{ n.texto }}</p>
                @if (n.acao) { <button class="btn sm" (click)="acao($event, n)">{{ n.acao }}</button> }
                <small class="muted">{{ n.data | date: 'dd/MM/yyyy, HH:mm' }}</small>
              </div>
              @if (!n.lida) { <button class="ok-btn" title="Marcar como lida" (click)="marcar($event, n.id)">✓</button> }
            </article>
          } @empty {
            <p class="vazio muted">Nada por aqui.</p>
          }
        </div>
      </section>
    }
  `,
})
export class NotificacoesComponent {
  readonly svc = inject(NotificacaoService);
  readonly ui = inject(UiService);
  private readonly chamados = inject(ChamadoService);
  readonly categorias = Object.keys(CATEGORIAS_NOTIF);
  readonly ini = iniciais;
  readonly rotulo: Record<TipoNotificacao, string> = { chamado: 'Chamados', conversa: 'Conversas', mural: 'Mural', agenda: 'Agenda', sistema: 'Sistema' };

  abrir(n: Notificacao): void {
    this.svc.marcar(n.id);
    if (n.chamadoId !== undefined) {
      this.ui.notifAberto.set(false);
      this.chamados.detalheId.set(n.chamadoId);
    }
  }

  marcar(ev: Event, id: number): void {
    ev.stopPropagation();
    this.svc.marcar(id);
  }

  acao(ev: Event, n: Notificacao): void {
    ev.stopPropagation();
    this.svc.marcar(n.id);
  }
}
