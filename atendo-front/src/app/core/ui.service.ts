import { Injectable, signal } from '@angular/core';

/** Estado de interface compartilhado (painéis abertos). */
@Injectable({ providedIn: 'root' })
export class UiService {
  readonly notifAberto = signal(false);
  readonly perfilAberto = signal(false);
}
