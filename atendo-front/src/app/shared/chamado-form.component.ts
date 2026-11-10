import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ChamadoService } from '../core/chamado.service';
import { ATENDENTES, CATEGORIAS, DEPARTAMENTOS, EMPRESAS, PLATAFORMAS, PRIORIDADES, Prioridade } from '../core/models';
import { dia } from '../core/util';

/** Formulário usado tanto para abrir quanto para editar um chamado. */
@Component({
  selector: 'app-chamado-form',
  imports: [ReactiveFormsModule],
  template: `
    @if (svc.formAberto()) {
      <div class="overlay" (click)="fechar()"></div>
      <div class="modal form-modal" role="dialog" aria-label="Chamado">
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <header class="grad head">
            <div>
              <h3>{{ svc.editandoId() !== null ? '✎ Editar chamado #' + svc.editandoId() : '+ Novo chamado' }}</h3>
              <small>Solicitação de atendimento</small>
            </div>
            <button type="button" class="ghost" (click)="fechar()" aria-label="Fechar">✕</button>
          </header>

          <div class="form-body">
            <section class="sec">
              <h4>Solicitante</h4>
              <div class="grid2">
                <label class="field">Departamento
                  <select formControlName="deptoSolicitante">@for (d of departamentos; track d) { <option [value]="d">{{ d }}</option> }</select>
                </label>
                <label class="field">Solicitante<input formControlName="solicitante" placeholder="Nome de quem pediu" /></label>
              </div>
            </section>

            <section class="sec">
              <h4>Defina os responsáveis</h4>
              <div class="grid2">
                <label class="field">Departamento do chamado
                  <select formControlName="departamento">@for (d of departamentos; track d) { <option [value]="d">{{ d }}</option> }</select>
                </label>
                <label class="field">Responsáveis
                  <select multiple formControlName="responsaveis" size="3">@for (a of atendentes; track a) { <option [value]="a">{{ a }}</option> }</select>
                  @if (form.controls.responsaveis.touched && form.controls.responsaveis.invalid) { <small class="erro">Selecione ao menos um responsável.</small> }
                </label>
                <label class="field">Plataforma
                  <select formControlName="plataforma"><option value="">Selecione a plataforma</option>@for (p of plataformas; track p) { <option [value]="p">{{ p }}</option> }</select>
                </label>
              </div>
            </section>

            <section class="sec">
              <h4>Configuração</h4>
              <div class="grid3">
                <label class="field">Prioridade
                  <select formControlName="prioridade">@for (p of prioridades; track p) { <option [value]="p">{{ p }}</option> }</select>
                </label>
                <label class="field">Categoria
                  <select formControlName="categoria">@for (c of categorias; track c) { <option [value]="c">{{ c }}</option> }</select>
                </label>
                <label class="field">Prazo final<input type="date" formControlName="prazo" /></label>
              </div>
              <label class="field">Empresa cliente
                <select formControlName="empresa"><option value="">Nenhuma</option>@for (e of empresas; track e) { <option [value]="e">{{ e }}</option> }</select>
                <small class="muted">Opcional: de qual empresa atendida este chamado trata.</small>
              </label>
              <div class="sub">
                <label class="switch"><input type="checkbox" formControlName="agendar" /><span></span> Agendar chamado</label>
                @if (form.controls.agendar.value) {
                  <div class="grid2">
                    <label class="field">Início<input type="datetime-local" formControlName="agInicio" /></label>
                    <label class="field">Fim<input type="datetime-local" formControlName="agFim" /></label>
                    <label class="field">Local<input formControlName="agLocal" /></label>
                    <label class="field">Descrição<input formControlName="agDescricao" /></label>
                  </div>
                }
              </div>
            </section>

            <section class="sec">
              <h4>Detalhes da demanda</h4>
              <label class="field">Título
                <input formControlName="assunto" placeholder="Título curto" />
                @if (form.controls.assunto.touched && form.controls.assunto.invalid) { <small class="erro">Informe o título.</small> }
              </label>
              <label class="field">Descrição<textarea rows="4" formControlName="descricao" placeholder="Explique o problema"></textarea></label>
            </section>

            <section class="sec">
              <h4>Anexos</h4>
              <input type="file" multiple (change)="anexar($event)" />
              @if (arquivos().length) { <p class="muted small">📎 {{ arquivos().join(', ') }}</p> }
            </section>
          </div>

          <footer class="modal-foot">
            <button type="button" class="btn" (click)="fechar()">Cancelar</button>
            <button type="submit" class="btn primary">{{ svc.editandoId() !== null ? 'Salvar alterações' : 'Abrir chamado' }}</button>
          </footer>
        </form>
      </div>
    }
  `,
})
export class ChamadoFormComponent {
  readonly svc = inject(ChamadoService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly departamentos = DEPARTAMENTOS;
  readonly atendentes = ATENDENTES;
  readonly plataformas = PLATAFORMAS;
  readonly prioridades = PRIORIDADES;
  readonly categorias = CATEGORIAS;
  readonly empresas = EMPRESAS;
  readonly arquivos = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    deptoSolicitante: [DEPARTAMENTOS[0]],
    solicitante: [''],
    departamento: [DEPARTAMENTOS[0]],
    responsaveis: [[] as string[], Validators.required],
    plataforma: [''],
    prioridade: ['Baixa' as Prioridade],
    categoria: [CATEGORIAS[0]],
    prazo: [dia(7)],
    empresa: [''],
    agendar: [false],
    agInicio: [''],
    agFim: [''],
    agLocal: [''],
    agDescricao: [''],
    assunto: ['', Validators.required],
    descricao: [''],
  });

  constructor() {
    // Ao abrir o formulário: preenche com o chamado em edição ou limpa para um novo.
    effect(() => {
      const aberto = this.svc.formAberto();
      const id = this.svc.editandoId();
      if (!aberto) return;
      untracked(() => {
        const c = id !== null ? this.svc.lista().find((x) => x.id === id) : undefined;
        if (c) {
          this.form.setValue({
            deptoSolicitante: c.deptoSolicitante,
            solicitante: c.solicitante,
            departamento: c.departamento,
            responsaveis: c.responsaveis,
            plataforma: c.plataforma === '—' ? '' : c.plataforma,
            prioridade: c.prioridade,
            categoria: c.categoria,
            prazo: c.prazo,
            empresa: c.empresa === '—' ? '' : c.empresa,
            agendar: c.agendamento !== null,
            agInicio: c.agendamento?.inicio ?? '',
            agFim: c.agendamento?.fim ?? '',
            agLocal: c.agendamento?.local ?? '',
            agDescricao: c.agendamento?.descricao ?? '',
            assunto: c.assunto,
            descricao: c.descricao,
          });
          this.arquivos.set(c.anexos);
        } else {
          this.form.reset();
          this.arquivos.set([]);
        }
      });
    });
  }

  anexar(ev: Event): void {
    const arquivos = (ev.target as HTMLInputElement).files;
    this.arquivos.set(arquivos ? Array.from(arquivos).map((a) => a.name) : []);
  }

  fechar(): void {
    this.svc.fecharForm();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dados = this.form.getRawValue();
    const id = this.svc.editandoId();
    if (id !== null) this.svc.editar(id, dados, this.arquivos(), this.auth.usuario()?.nome ?? 'Atendente');
    else this.svc.criar(dados, this.arquivos());
    this.fechar();
  }
}
