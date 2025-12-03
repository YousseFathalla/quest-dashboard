---
trigger: glob
globs: "**/*.ts, **/*.html"
---

# Angular Style Guide: Modern Best Practices

This style guide provides conventions for writing clean, readable, and performant Angular applications using the latest features like standalone components, signals, and native control flow.

---

## 1. TypeScript Best Practices

Foundation for maintainable and error-free code.

- **Strict Type Checking**: Always enable and adhere to strict type checking.
- **Prefer Type Inference**: Allow TypeScript to infer types when they are obvious.
  - **Bad**: `let name: string = 'Angular';`
  - **Good**: `let name = 'Angular';`
- **Avoid `any`**: Use `unknown` if the type is truly uncertain, or better yet, a specific type/interface.
- **Immutability**: Use `readonly` for properties and arrays where possible.
- **Utility Types**: Leverage `Partial<T>`, `Pick<T>`, `Omit<T>` instead of duplicating types.
- **Explicit Returns**: Define return types for all public methods.

```typescript
// models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
}
```

---

## 2. File & Naming Conventions

Consistent naming makes projects easier to navigate.

### Rule: File Naming

- **Rule**: Use `feature.type.ts` (kebab-case).
- **Examples**:
  - `item-list.component.ts`
  - `auth.service.ts`
  - `user.model.ts`

### Rule: Class & Symbol Naming

- **Rule**: PascalCase for classes (`ItemListComponent`), camelCase for properties/methods (`userName`).

### Rule: Selector Naming

- **Rule**: Use kebab-case with a consistent prefix (e.g., `app-`, `admin-`).
- **Example**: `selector: 'app-user-profile'`

---

## 3. Components & Directives

### Rule: Standalone & OnPush

- **Rule**: Always use standalone components.
- **Rule**: **Implicit Standalone**: Do NOT explicitly set `standalone: true` in decorators (it is the default).
- **Rule**: Always set `changeDetection: ChangeDetectionStrategy.OnPush`.

```typescript
@Component({
  selector: 'app-user-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // standalone: true <--- REMOVE THIS, it's implied
})
export class UserProfileComponent {}
```

### Rule: Inputs, Outputs, & Queries

- **Rule**: Use signal-based functions: `input()`, `output()`, `model()`, `viewChild()`, `viewChildren()`, `contentChild()`.
- **Rule**: Avoid `@Input`, `@Output`, `@ViewChild` decorators.

```typescript
export class UserCardComponent {
  // ✅ Good
  user = input.required<User>();
  expanded = model(false);
  save = output<void>();
  header = viewChild<ElementRef>('header');

  // ❌ Bad
  @Input() user!: User;
  @Output() save = new EventEmitter<void>();
}
```

### Rule: Host Bindings

- **Rule**: Use the `host` property in the component decorator instead of `@HostBinding` or `@HostListener`.

```typescript
@Component({
  host: {
    '(click)': 'toggle()',
    '[class.active]': 'isActive()',
    '[attr.aria-expanded]': 'expanded()'
  }
})
```

### Rule: Images

- **Rule**: Use `NgOptimizedImage` (`ngSrc`) for all static images instead of `src`.

---

## 4. Templates

### Rule: Control Flow

- **Rule**: Use built-in control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.

```html
@if (user(); as u) {
  <h1>{{ u.name }}</h1>
} @else {
  <loading-spinner />
}

@for (item of items(); track item.id) {
  <item-card [item]="item" />
}
```

### Rule: Data Binding

- **Rule**: Use `[property]` for binding.
- **Rule**: **Avoid `ngClass` and `ngStyle`**. Use direct `[class.name]` or `[style.prop]` bindings.

```html
<!-- ✅ Good -->
<div [class.active]="isActive()" [style.color]="color()"></div>

<!-- ❌ Bad -->
<div [ngClass]="{'active': isActive()}" [ngStyle]="{'color': color()}"></div>
```

### Rule: Deferrable Views

- **Rule**: Use `@defer` to lazy load non-critical content (e.g., below the fold).

```html
@defer (on viewport; prefetch on idle) {
  <heavy-chart />
} @placeholder {
  <div>Loading chart...</div>
}
```

### Rule: No Complex Logic

- **Rule**: Templates should be declarative. Do not use complex expressions, arrow functions, or `new` instantiations in templates.

---

## 5. State Management

### Rule: Signals

- **Rule**: Use `signal()` for mutable state and `computed()` for derived state.
- **Rule**: Update signals immutably using `.set()` or `.update()`. Never use `.mutate()`.

```typescript
count = signal(0);
double = computed(() => this.count() * 2);

increment() {
  this.count.update(c => c + 1);
}
```

---

## 6. Services & Dependency Injection

### Rule: Provisioning

- **Rule**: Use `providedIn: 'root'` for singleton services.

### Rule: Injection

- **Rule**: Use `inject()` instead of constructor injection.

```typescript
export class UserComponent {
  private auth = inject(AuthService); // ✅ Good
  // constructor(private auth: AuthService) {} // ❌ Bad
}
```

---

## 7. Routing

- **Rule**: Lazy load all feature routes using `loadComponent`.

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)
}
```

---

## 8. Accessibility (A11y)

- **Rule**: Ensure all interactive elements are keyboard accessible.
- **Rule**: Use semantic HTML (`<button>`, `<a>`, `<nav>`) over generic `div`s.
- **Rule**: Maintain WCAG AA contrast ratios.
- **Rule**: Use `aria-label` or `aria-labelledby` when visual labels are missing.
