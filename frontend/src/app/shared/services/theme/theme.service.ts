import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LoggerService } from '@shared/services/logger/logger.service';


export type ThemeVariant = 'light' | 'dark';
export type ThemePalette = 'orange' | 'azure' | 'magenta' | 'cyan';


export interface ThemeOption {
  id: ThemePalette;
  name: string;
  palette: ThemePalette;
  variant: ThemeVariant;
  primaryColor: string;
  secondaryColor: string;
}

@Injectable({ providedIn: "root" })
export class ThemeService {
  private static readonly THEME_STORAGE_KEY = "app-theme";
  private readonly document = inject(DOCUMENT);
  private readonly logger = inject(LoggerService);

  readonly themes: ThemeOption[] = [
    {
      id: "azure",
      name: "Azure",
      palette: "azure",
      variant: "light",
      primaryColor: "#0e5db9",
      secondaryColor: "#0e5db9",
    },
    {
      id: "orange",
      name: "Orange",
      palette: "orange",
      variant: "light",
      primaryColor: "#95480e",
      secondaryColor: "#95480e",
    },
    {
      id: "cyan",
      name: "Cyan",
      palette: "cyan",
      variant: "dark",
      primaryColor: "#1edddc",
      secondaryColor: "#1edddc",
    },
    {
      id: "magenta",
      name: "Magenta",
      palette: "magenta",
      variant: "dark",
      primaryColor: "#feabf2",
      secondaryColor: "#feabf2",
    },
  ];

  readonly currentTheme = signal<ThemePalette>("azure");

  readonly currentThemeOption = computed(() => {
    return this.themes.find((t) => t.id === this.currentTheme()) || this.themes[1];
  });

  readonly isDark = computed(() => this.currentThemeOption().variant === "dark");

  constructor() {
    // Initialize theme from localStorage before setting up the effect
    this.initFromStorage();

    effect(() => {
      const theme = this.currentThemeOption();
      const el = this.document.documentElement;

      el.dataset["theme"] = theme.variant;
      el.dataset["palette"] = theme.palette;
      el.style.colorScheme = theme.variant;

      try {
        localStorage.setItem(ThemeService.THEME_STORAGE_KEY, theme.id);
      } catch (error: unknown) {
        this.logger.warn("Could not persist theme to localStorage", error);
      }
    });
  }

  initFromStorage(): void {
    try {
      const saved = localStorage.getItem(ThemeService.THEME_STORAGE_KEY);

      if (saved && this.themes.some((t) => t.id === saved)) {
        this.currentTheme.set(saved as ThemePalette);
      }
    } catch (error: unknown) {
      this.logger.warn("Could not read theme from localStorage", error);
    }
  }

  setTheme(theme: ThemePalette): void {
    if (this.themes.some((t) => t.id === theme)) {
      this.currentTheme.set(theme);
    }
  }
}
