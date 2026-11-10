import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from './models';

const CHAVE = 'atendo.usuario';

const padrao = (email = 'demo@atendo.app'): Usuario => ({
  nome: 'Atendente Demo',
  email,
  telefone: '',
  empresa: 'Empresa Demo',
  departamento: 'Suporte',
  aniversarioDia: null,
  aniversarioMes: null,
  mostrarAniversario: true,
});

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _usuario = signal<Usuario | null>(this.ler());
  readonly usuario = this._usuario.asReadonly();
  readonly logado = computed(() => this._usuario() !== null);

  /** Demo: aceita qualquer e-mail/senha preenchidos. Troque por uma chamada HTTP quando houver API. */
  entrar(email: string, senha: string): boolean {
    if (!email.trim() || !senha.trim()) return false;
    this.salvar({ ...(this._usuario() ?? padrao(email)), email });
    return true;
  }

  atualizar(dados: Partial<Usuario>): void {
    const atual = this._usuario();
    if (atual) this.salvar({ ...atual, ...dados });
  }

  sair(): void {
    this._usuario.set(null);
    localStorage.removeItem(CHAVE);
  }

  private salvar(u: Usuario): void {
    this._usuario.set(u);
    localStorage.setItem(CHAVE, JSON.stringify(u));
  }

  private ler(): Usuario | null {
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? { ...padrao(), ...(JSON.parse(bruto) as Partial<Usuario>) } : null;
    } catch {
      return null;
    }
  }
}
