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

  readonly themes = this.themeService.themes;
  readonly currentTheme = this.themeService.currentTheme;
  readonly currentThemeOption = this.themeService.currentThemeOption;

  onThemeChange(theme: ThemePalette): void {
    this.themeService.setTheme(theme);
  }

  handleRadioClick(theme: ThemePalette): void {
    if (this.currentTheme() === theme) {
      this.themeService.setTheme(this.themes[0].id);
    } else {
      this.themeService.setTheme(theme);
    }
  }
}
