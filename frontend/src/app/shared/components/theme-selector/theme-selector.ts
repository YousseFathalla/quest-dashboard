import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { ThemeService, type ThemePalette } from '@shared/services/theme/theme.service';
import { TitleCasePipe } from "@angular/common";

@Component({
  selector: 'theme-selector',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule,
    TitleCasePipe
  ],
  templateUrl: './theme-selector.html',
  styleUrl: './theme-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSelector {
  private readonly themeService = inject(ThemeService);

  /** List of available themes. */
  readonly themes = this.themeService.themes;
  /** Signal containing the current theme ID. */
  readonly currentTheme = this.themeService.currentTheme;
  /** Signal containing the current theme option object. */
  readonly currentThemeOption = this.themeService.currentThemeOption;

  /**
   * Sets the active theme.
   * @param {ThemePalette} theme - The ID of the theme to set.
   */
  onThemeChange(theme: ThemePalette): void {
    this.themeService.setTheme(theme);
  }

  /**
   * Handles click events on radio buttons.
   * Resets to default if the current theme is clicked again (optional behavior).
   * @param {ThemePalette} theme - The theme clicked.
   */
  handleRadioClick(theme: ThemePalette): void {
    if (this.currentTheme() === theme) {
      this.themeService.setTheme(this.themes[0].id);
    } else {
      this.themeService.setTheme(theme);
    }
  }
}
