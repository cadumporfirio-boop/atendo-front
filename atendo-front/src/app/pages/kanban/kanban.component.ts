import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ChamadoService } from '../../core/chamado.service';
import { STATUS_LISTA, Status } from '../../core/models';
import { iniciais, slug } from '../../core/util';

@Component({
  selector: 'app-kanban',
  template: `
    <section class="page">
      <h2 class="page-title">Kanban</h2>
      <div class="kan">
        @for (col of colunas(); track col.status) {
          <div class="kan-col" (dragover)="$event.preventDefault()" (drop)="soltar(col.status)">
            <h3>{{ col.status }} <small>{{ col.itens.length }}</small></h3>
            @for (c of col.itens; track c.id) {
              <article class="kan-card" draggable="true" (dragstart)="arrastando.set(c.id)" (click)="svc.detalheId.set(c.id)">
                <span [class]="'pill p-' + slug(c.prioridade)">{{ c.prioridade }}</span>
                <p>{{ c.assunto }}</p>
                <small class="muted">{{ c.empresa }}</small>
                <div class="avs">
                  @for (r of c.responsaveis; track r) { <span class="av" [title]="r">{{ ini(r) }}</span> }
                </div>
              </article>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class KanbanComponent {
  readonly svc = inject(ChamadoService);
  private readonly auth = inject(AuthService);
  readonly arrastando = signal<number | null>(null);
  readonly ini = iniciais;
  readonly slug = slug;

  readonly colunas = computed(() =>
    STATUS_LISTA.map((status) => ({ status, itens: this.svc.lista().filter((c) => c.status === status) })),
  );

  soltar(status: Status): void {
    const id = this.arrastando();
    this.arrastando.set(null);
    if (id === null) return;
    const atual = this.svc.lista().find((c) => c.id === id);
    if (atual && atual.status !== status) {
      this.svc.alterarStatus(id, status, this.auth.usuario()?.nome ?? 'Atendente');
    }
  }
}
