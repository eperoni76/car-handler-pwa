import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  protected readonly title = signal('car-handler-pwa');
  protected isLoginPage = signal(false);

  constructor() {
    // Verifica la rotta iniziale
    this.checkRoute(this.router.url);

    // Ascolta i cambiamenti di rotta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.checkRoute((event as NavigationEnd).url);
    });
  }

  private checkRoute(url: string): void {
    this.isLoginPage.set(url.includes('/login'));
  }
}
