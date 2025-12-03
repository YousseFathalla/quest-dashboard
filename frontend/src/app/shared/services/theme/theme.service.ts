import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LoggerService } from '@shared/services/logger/logger.service';


export type ThemeVariant = 'light' | 'dark';
export type ThemePalette = 'orange' | 'azure-blue' | 'magenta-violet' | 'cyan';
export type Theme = `${ThemePalette}-${ThemeVariant}`;

export interface ThemeOption {
  id: Theme;
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
      id: "orange-light",
      name: "Orange",
      palette: "orange",
      variant: "light",
      primaryColor: "#95480e",
      secondaryColor: "#95480e",
    },
    {
      id: "azure-blue-light",
      name: "Azure & Blue",
      palette: "azure-blue",
      variant: "light",
      primaryColor: "#0e5db9",
      secondaryColor: "#0e5db9",
    },
    {
      id: "magenta-violet-dark",
      name: "Magenta & Violet",
      palette: "magenta-violet",
      variant: "dark",
      primaryColor: "#feabf2",
      secondaryColor: "#feabf2",
    },
    {
      id: "cyan-dark",
      name: "Cyan",
      palette: "cyan",
      variant: "dark",
      primaryColor: "#1edddc",
      secondaryColor: "#1edddc",
    },
  ];

  readonly currentTheme = signal<Theme>("azure-blue-light");

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
        this.currentTheme.set(saved as Theme);
      }
    } catch (error: unknown) {
      this.logger.warn("Could not read theme from localStorage", error);
    }
  }

  setTheme(theme: Theme): void {
    if (this.themes.some((t) => t.id === theme)) {
      this.currentTheme.set(theme);
    }
  }
}
