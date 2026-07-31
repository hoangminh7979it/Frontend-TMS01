import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly THEME_KEY = 'tms01_theme_preference';
  private currentThemeSubject = new BehaviorSubject<ThemeMode>('dark');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    const initialTheme: ThemeMode = savedTheme || 'dark';
    this.setTheme(initialTheme);
  }

  public setTheme(theme: ThemeMode): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  public toggleTheme(): void {
    const newTheme: ThemeMode = this.currentThemeSubject.value === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  public isDarkMode(): boolean {
    return this.currentThemeSubject.value === 'dark';
  }
}
