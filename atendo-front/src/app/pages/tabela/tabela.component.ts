import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChamadoService } from '../../core/chamado.service';
import { Chamado, PRIORIDADES, Prioridade, STATUS_LISTA, Status } from '../../core/models';
import { iniciais, slug } from '../../core/util';

type Chave = 'id' | 'assunto' | 'prazo';

@Component({
  selector: 'app-tabela',
  imports: [DatePipe, FormsModule],
  template: `
    <section class="page">
      <h2 class="page-title">Chamados</h2>
      <div class="toolbar">
        <input class="busca" type="search" placeholder="Buscar assunto, empresa ou solicitante..." [ngModel]="busca()" (ngModelChange)="busca.set($event)" />
        <select [ngModel]="status()" (ngModelChange)="status.set($event)">
          <option value="Todos">Todos os status</option>
          @for (s of statusLista; track s) { <option [value]="s">{{ s }}</option> }
        </select>
        <select [ngModel]="prio()" (ngModelChange)="prio.set($event)">
          <option value="Todas">Todas as prioridades</option>
          @for (p of prioridades; track p) { <option [value]="p">{{ p }}</option> }
        </select>
      </div>

      <div class="tbl">
        <table>
          <thead>
            <tr>
              <th class="sort" (click)="ordenar('id')">ID {{ seta('id') }}</th>
              <th class="sort" (click)="ordenar('assunto')">Assunto {{ seta('assunto') }}</th>
              <th>Empresa</th>
              <th>Solicitante</th>
              <th>Categoria</th>
              <th>Prioridade</th>
              <th class="sort" (click)="ordenar('prazo')">Prazo {{ seta('prazo') }}</th>
              <th>Término</th>
              <th>Status</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            @for (c of visiveis(); track c.id) {
              <tr (click)="svc.detalheId.set(c.id)">
                <td>
                  <button class="pin" [class.on]="c.fixado" (click)="fixar($event, c.id)" aria-label="Fixar chamado">★</button>
                  #{{ c.id }}
                </td>
                <td class="assunto">
                  {{ c.assunto }}
                  <small class="muted">{{ c.mensagens.length }} mensagens</small>
                </td>
                <td>{{ c.empresa }}</td>
                <td>{{ c.solicitante }}</td>
                <td>{{ c.categoria }}</td>
                <td><span [class]="'pill p-' + slug(c.prioridade)">{{ c.prioridade }}</span></td>
                <td>
                  {{ c.prazo | date: 'dd/MM/yyyy' }}
                  <div class="sla">
                    <span [class]="'tag t-' + primeiraResposta(c)">1ª resp.</span>
                    <span [class]="'tag t-' + resolucao(c)">Resol.</span>
                  </div>
                </td>
                <td>{{ c.termino ? (c.termino | date: 'dd/MM/yyyy') : '—' }}</td>
                <td><span [class]="'pill s-' + slug(c.status)">{{ c.status }}</span></td>
                <td>
                  <div class="avs">
                    @for (r of c.responsaveis; track r) { <span class="av" [title]="r">{{ ini(r) }}</span> }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="10" class="vazio">Nenhum chamado encontrado.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class TabelaComponent {
  readonly svc = inject(ChamadoService);
  readonly statusLista = STATUS_LISTA;
  readonly prioridades = PRIORIDADES;
  readonly ini = iniciais;
  readonly slug = slug;

  readonly busca = signal('');
  readonly status = signal<Status | 'Todos'>('Todos');
  readonly prio = signal<Prioridade | 'Todas'>('Todas');
  readonly chave = signal<Chave>('id');
  readonly asc = signal(false);

  readonly visiveis = computed(() => {
    const q = this.busca().trim().toLowerCase();
    const st = this.status();
    const pr = this.prio();
    const k = this.chave();
    const dir = this.asc() ? 1 : -1;
    return this.svc
      .lista()
      .filter(
        (c) =>
          (st === 'Todos' || c.status === st) &&
          (pr === 'Todas' || c.prioridade === pr) &&
          (!q || `${c.assunto} ${c.empresa} ${c.solicitante}`.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        if (a.fixado !== b.fixado) return a.fixado ? -1 : 1;
        const cmp = k === 'id' ? a.id - b.id : a[k].localeCompare(b[k]);
        return cmp * dir;
      });
  });

  ordenar(k: Chave): void {
    if (this.chave() === k) this.asc.set(!this.asc());
    else {
      this.chave.set(k);
      this.asc.set(true);
    }
  }

  seta(k: Chave): string {
    return this.chave() === k ? (this.asc() ? '▲' : '▼') : '';
  }

  fixar(ev: Event, id: number): void {
    ev.stopPropagation();
    this.svc.alternarFixado(id);
  }

  primeiraResposta(c: Chamado): string {
    return c.mensagens.length > 1 ? 'ok' : this.svc.estaAtrasado(c) ? 'atraso' : 'pend';
  }

  resolucao(c: Chamado): string {
    return c.status === 'Finalizado' ? 'ok' : this.svc.estaAtrasado(c) ? 'atraso' : 'pend';
  }
}
