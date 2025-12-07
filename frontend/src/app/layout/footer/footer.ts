import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <p>
      Built by
      <a
        href="https://www.linkedin.com/in/youssefathalla/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary hover:underline font-semibold"
        >Youssef Fathalla</a
      >
    </p>
  `,

  host: {
    class: 'block w-full flex justify-center items-center py-4 text-xs tracking-wider uppercase',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
