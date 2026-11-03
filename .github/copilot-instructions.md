# Pawly Project Guidelines

## Project Structure

- Keep the app as a lightweight Vite frontend using vanilla JavaScript modules.
- Use `src/main.js` as the application entry point and `src/style.css` for project-specific styles.
- Keep static files and reusable assets under `public/` or `src/assets/` according to how they are imported.

## UI and Styling

- Use Bootstrap 5 utility classes and components for layout and common UI patterns.
- Use Bootstrap Icons for interface icons; mark decorative icons with `aria-hidden="true"`.
- Put Pawly-specific visual overrides in `src/style.css` rather than modifying dependency styles.
- Preserve the existing responsive behavior, including the minimum body width of 320px.

## JavaScript Conventions

- Use ES modules and standard browser APIs; avoid adding frameworks unless explicitly requested.
- Render application content inside the existing `#app` element.
- Keep initialization and DOM updates clear and localized in `src/main.js`.
- Prefer semantic HTML, accessible labels, and keyboard-friendly interactions.

## Validation

- Keep the existing npm scripts and dependency choices unless the task requires a change.
- For implementation changes, verify that the Vite production build succeeds with the project’s configured build script.
