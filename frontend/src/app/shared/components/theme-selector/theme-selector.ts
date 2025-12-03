import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { ThemeService, type Theme } from '@shared/services/theme/theme.service';

@Component({
  selector: 'theme-selector',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule,
  ],
  templateUrl: './theme-selector.html',
  styleUrl: './theme-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSelector {
  private themeService = inject(ThemeService);

  readonly themes = this.themeService.themes;
  readonly currentTheme = this.themeService.currentTheme;
  readonly currentThemeOption = this.themeService.currentThemeOption;

  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  handleRadioClick(theme: Theme): void {
    if (this.currentTheme() !== theme) this.themeService.setTheme(theme);
    else this.themeService.setTheme(this.themes[0].id);
  }
}
