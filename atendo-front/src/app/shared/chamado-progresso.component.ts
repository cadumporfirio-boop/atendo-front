import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ChamadoService } from '../core/chamado.service';
import { Evento } from '../core/models';

/** Painel "Progresso do chamado": todas as etapas em ordem cronológica. */
@Component({
  selector: 'app-chamado-progresso',
  imports: [DatePipe],
  template: `
    @if (svc.progresso(); as c) {
      <div class="overlay top-layer" (click)="fechar()"></div>
      <div class="modal prog top-layer" role="dialog" aria-label="Progresso do chamado">
        <header class="grad head">
          <div><h3>◔ Progresso do chamado #{{ c.id }}</h3><small>{{ c.assunto }}</small></div>
          <button class="ghost" (click)="fechar()" aria-label="Fechar">✕</button>
        </header>
        <div class="prog-body">
          @for (e of c.eventos; track $index; let i = $index) {
            <div class="prog-item">
              <span [class]="'prog-dot d-' + e.tipo">{{ icone[e.tipo] }}</span>
              <article class="prog-card">
                <div class="prog-top">
                  <p><b>{{ e.autor }}</b> {{ e.texto }}</p>
                  <small class="muted">{{ e.data | date: 'dd/MM/yyyy, HH:mm' }}</small>
                </div>
                @if (e.detalhe) {
                  <button class="link" (click)="alternar(i)">{{ aberto() === i ? 'Ocultar detalhes' : 'Ver detalhes' }}</button>
                  @if (aberto() === i) { <p class="muted small">{{ e.detalhe }}</p> }
                }
              </article>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ChamadoProgressoComponent {
  readonly svc = inject(ChamadoService);
  readonly aberto = signal(-1);
  readonly icone: Record<Evento['tipo'], string> = { abertura: '🗎', atribuicao: '👤', status: '✔', resposta: '💬', edicao: '✎' };

  alternar(i: number): void {
    this.aberto.set(this.aberto() === i ? -1 : i);
  }

  fechar(): void {
    this.svc.progressoId.set(null);
    this.aberto.set(-1);
  }
}
