import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ChamadoService } from '../core/chamado.service';
import { NotificacaoService } from '../core/notificacao.service';
import { UiService } from '../core/ui.service';
import { iniciais } from '../core/util';
import { ChamadoDetalheComponent } from '../shared/chamado-detalhe.component';
import { ChamadoFormComponent } from '../shared/chamado-form.component';
import { ChamadoProgressoComponent } from '../shared/chamado-progresso.component';
import { NotificacoesComponent } from '../shared/notificacoes.component';
import { PerfilComponent } from '../shared/perfil.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    ChamadoDetalheComponent, ChamadoFormComponent, ChamadoProgressoComponent, NotificacoesComponent, PerfilComponent,
  ],
  template: `
    <div class="app">
      <aside class="side" [class.aberta]="menu()">
        <div class="brand"><span class="logo">A</span><b>Atendo</b></div>
        <nav (click)="menu.set(false)">
          <a routerLink="/painel" routerLinkActive="on">◫ Painel</a>
          <a routerLink="/kanban" routerLinkActive="on">▥ Kanban</a>
          <a routerLink="/tabela" routerLinkActive="on">☰ Tabela</a>
        </nav>
        <p class="side-foot muted small">Projeto de portfólio · dados fictícios</p>
      </aside>

      <div class="main">
        <header class="top">
          <button class="ghost menu-btn" (click)="menu.set(!menu())" aria-label="Abrir menu">☰</button>
          <span class="spacer"></span>
          <button class="btn primary" (click)="svc.abrirNovo()">+ Novo chamado</button>
          <button class="ghost bell" (click)="ui.notifAberto.set(!ui.notifAberto())" aria-label="Notificações">
            🔔 @if (notif.naoLidas() > 0) { <span class="count">{{ notif.naoLidas() }}</span> }
          </button>
          <button class="ghost user" (click)="ui.perfilAberto.set(true)" aria-label="Meu perfil">
            <span class="av">{{ ini(auth.usuario()?.nome ?? '') }}</span>
            <span class="user-nome">{{ auth.usuario()?.nome }}</span>
          </button>
          <button class="ghost" (click)="sair()">Sair</button>
        </header>
        <router-outlet />
      </div>
    </div>
    <app-notificacoes />
    <app-chamado-detalhe />
    <app-chamado-progresso />
    <app-chamado-form />
    <app-perfil />
  `,
})
export class ShellComponent {
  readonly svc = inject(ChamadoService);
  readonly auth = inject(AuthService);
  readonly notif = inject(NotificacaoService);
  readonly ui = inject(UiService);
  private readonly router = inject(Router);
  readonly menu = signal(false);
  readonly ini = iniciais;

  sair(): void {
    this.auth.sair();
    this.router.navigateByUrl('/login');
  }
}
