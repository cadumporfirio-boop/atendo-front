import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <main class="login">
      <section class="login-hero">
        <div class="brand"><span class="logo">A</span><b>Atendo</b></div>
        <p class="login-tag">Gestão de chamados simples e direta</p>
        <ul>
          <li>Abra e classifique chamados em segundos</li>
          <li>Acompanhe prazos e responsáveis</li>
          <li>Histórico completo de cada atendimento</li>
          <li>Visões em painel, kanban e tabela</li>
        </ul>
      </section>
      <section class="login-form">
        <form [formGroup]="form" (ngSubmit)="entrar()">
          <h1>Bem-vindo de volta</h1>
          <p class="muted">Entre para acessar a central de atendimento.</p>
          <label class="field">E-mail
            <input type="email" formControlName="email" autocomplete="username" />
          </label>
          <label class="field">Senha
            <span class="with-btn">
              <input [type]="verSenha() ? 'text' : 'password'" formControlName="senha" autocomplete="current-password" />
              <button type="button" class="ghost" (click)="verSenha.set(!verSenha())">{{ verSenha() ? 'Ocultar' : 'Mostrar' }}</button>
            </span>
          </label>
          @if (erro()) { <p class="erro">{{ erro() }}</p> }
          <button class="btn primary block" type="submit" [disabled]="carregando()">
            {{ carregando() ? 'Entrando...' : 'Entrar' }}
          </button>
          <p class="muted small">Demonstração: os campos já vêm preenchidos.</p>
        </form>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly verSenha = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['demo@atendo.app', [Validators.required, Validators.email]],
    senha: ['demo1234', [Validators.required]],
  });

  entrar(): void {
    if (this.form.invalid) {
      this.erro.set('Informe um e-mail e uma senha válidos.');
      return;
    }
    this.erro.set('');
    this.carregando.set(true);
    const { email, senha } = this.form.getRawValue();
    setTimeout(() => {
      if (this.auth.entrar(email, senha)) this.router.navigateByUrl('/painel');
      else this.carregando.set(false);
    }, 600);
  }
}
