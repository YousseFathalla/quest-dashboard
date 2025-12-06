/**
 * @fileoverview Main header component for the application layout.
 * Contains the branding and global controls like the theme selector.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeSelector } from '@shared/components/theme-selector/theme-selector';
import { MatToolbar } from '@angular/material/toolbar';


@Component({
  selector: 'app-header',
  imports: [ThemeSelector, MatToolbar],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: '@container sticky top-0 z-10',
  },
})
export class Header {}
