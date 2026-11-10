import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChamadoService } from '../../core/chamado.service';

@Component({
  selector: 'app-painel',
  imports: [DatePipe],
  template: `
    <section class="page">
      <h2 class="page-title">Visão geral</h2>
      <div class="cards">
        <article class="stat"><span>Abertos</span><b>{{ svc.resumo().abertos }}</b></article>
        <article class="stat"><span>Em andamento</span><b>{{ svc.resumo().andamento }}</b></article>
        <article class="stat"><span>Aguardando</span><b>{{ svc.resumo().aguardando }}</b></article>
        <article class="stat danger"><span>Atrasados</span><b>{{ svc.resumo().atrasados }}</b></article>
        <article class="stat ok"><span>Finalizados</span><b>{{ svc.resumo().finalizados }}</b></article>
      </div>

      <div class="two">
        <div class="panel">
          <h3>Chamados por categoria</h3>
          @for (c of svc.porCategoria(); track c.nome) {
            <div class="bar">
              <span>{{ c.nome }}</span>
              <i><u [style.width.%]="c.pct"></u></i>
              <b>{{ c.total }}</b>
            </div>
          }
        </div>
        <div class="panel">
          <h3>Atrasados</h3>
          @for (c of svc.atrasados(); track c.id) {
            <button class="row-link" (click)="svc.detalheId.set(c.id)">
              <span>#{{ c.id }} · {{ c.assunto }}</span>
              <small>{{ c.prazo | date: 'dd/MM' }}</small>
            </button>
          } @empty {
            <p class="muted">Nenhum chamado atrasado.</p>
          }
        </div>
      </div>
    </section>
  `,
})
export class PainelComponent {
  readonly svc = inject(ChamadoService);
}
