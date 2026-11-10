import { Component, effect, inject, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { UiService } from '../core/ui.service';
import { iniciais } from '../core/util';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  template: `
    @if (ui.perfilAberto()) {
      <div class="overlay" (click)="fechar()"></div>
      <div class="modal form-modal" role="dialog" aria-label="Meu perfil">
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <header class="grad head">
            <div><h3>◉ Meu perfil</h3><small>Edição permitida apenas para nome e campos de contato</small></div>
            <button type="button" class="ghost" (click)="fechar()" aria-label="Fechar">✕</button>
          </header>
          <div class="form-body">
            <section class="sec foto">
              <span class="av xl-av">{{ ini(form.controls.nome.value) }}</span>
              <div>
                <b>Foto de perfil</b>
                <p class="muted small">JPG, PNG ou WebP, até 4 MB. A imagem será exibida nos chamados e nas equipes.</p>
                <button type="button" class="btn sm">Escolher foto</button>
                <button type="button" class="btn sm">Remover foto</button>
              </div>
            </section>
            <div class="grid2">
              <label class="field">Nome<input formControlName="nome" /></label>
              <label class="field">E-mail<input type="email" formControlName="email" /></label>
              <label class="field">Telefone/Celular<input formControlName="telefone" placeholder="(00) 00000-0000" /></label>
              <label class="field">Empresa<input formControlName="empresa" /></label>
              <label class="field">Departamento<input formControlName="departamento" /></label>
              <div class="field">Aniversário
                <div class="grid2 tight">
                  <input type="number" min="1" max="31" formControlName="dia" placeholder="Dia" />
                  <select formControlName="mes">
                    <option [ngValue]="null">Mês</option>
                    @for (m of meses; track m; let i = $index) { <option [ngValue]="i + 1">{{ m }}</option> }
                  </select>
                </div>
                <small class="muted">Somente dia e mês. O sistema não precisa do ano.</small>
              </div>
            </div>
            <label class="switch sec"><input type="checkbox" formControlName="mostrar" /><span></span> Exibir meu aniversário para os colegas</label>
          </div>
          <footer class="modal-foot">
            <button type="button" class="btn" (click)="fechar()">Cancelar</button>
            <button type="submit" class="btn primary">Salvar</button>
          </footer>
        </form>
      </div>
    }
  `,
})
export class PerfilComponent {
  readonly ui = inject(UiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  readonly meses = MESES;
  readonly ini = iniciais;

  readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    empresa: [''],
    departamento: [''],
    dia: [null as number | null],
    mes: [null as number | null],
    mostrar: [true],
  });

  constructor() {
    effect(() => {
      if (!this.ui.perfilAberto()) return;
      untracked(() => {
        const u = this.auth.usuario();
        if (!u) return;
        this.form.setValue({
          nome: u.nome, email: u.email, telefone: u.telefone, empresa: u.empresa, departamento: u.departamento,
          dia: u.aniversarioDia, mes: u.aniversarioMes, mostrar: u.mostrarAniversario,
        });
      });
    });
  }

  fechar(): void {
    this.ui.perfilAberto.set(false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const f = this.form.getRawValue();
    this.auth.atualizar({
      nome: f.nome, email: f.email, telefone: f.telefone, empresa: f.empresa, departamento: f.departamento,
      aniversarioDia: f.dia, aniversarioMes: f.mes, mostrarAniversario: f.mostrar,
    });
    this.fechar();
  }
}
