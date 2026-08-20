# Engineering & Design Rules (Hemi-Style)

## 1. Design Consistency
- **Grid-First:** Every section must utilize a faint CSS-grid or SVG background to maintain the "Blueprint" aesthetic.
- **Typography:** Headings must use a bold, modern sans-serif. Monospaced fonts are reserved strictly for metadata, labels, or technical "status" indicators.
- **Color Discipline:** Use ONLY the colors defined in the theme file. No arbitrary Tailwind shades (e.g., use `text-brand-primary`, not `text-orange-500`).

## 2. Technical Standards
- **Component Isolation:** The Interactive Grid must be a standalone component with a `requestAnimationFrame` loop to ensure 60FPS performance.
- **Scalability:** Assume the site will handle 10x traffic bursts. Use static generation where possible; no heavy client-side logic in the main thread.
- **No Refactoring Regression:** When updating components, do not simplify logic or remove Tailwind classes to "save space." Keep the explicit styling.

## 3. Interaction & UX
- **Micro-Interactions:** Every button must have a subtle hover state and a "press" feedback (0.98 scale).
- **Smoothness:** Use Framer Motion `spring` physics for animations, never linear easing.
- **Responsive Integrity:** The interactive canvas must gracefully scale or swap to a simplified static version on mobile viewports.

## 4. LLM Guardrails (Anti-Slacking)
- **Complete Files:** Never provide "snippets." Always output the full, functional file to prevent integration errors.
- **Explicit Imports:** Do not use `...other imports`. List every dependency clearly.
- **No Placeholder Logic:** Do not use `// logic goes here`. Write the functional boilerplate or the full implementation.

# Codevolt 2.0 Frontend Rules

## 1. Tone & Copy Architecture
- **No Fluff:** Maintain the "Serious Builder" tone. Use high-contrast headers for phrases like "0 -> 1".
- **Gate System:** Day 1, 2, and 3 must be visualized as "Gates." Use a vertical progress-stepper layout.
- **The "Rules of Reality":** The "What Matters / What Doesn't" section must be a clean, two-column comparative table or bento-grid.

## 2. UI/UX Specifications (Hemi-Inspiration)
- **Interactive Grid:** Implement a Canvas-based grid on the Right-Hero section. Hovering over pixels must toggle them between '0', '.', and 'X' smoothly.
- **Blueprint Background:** Apply a faint vertical grid pattern to the entire body to mimic a technical workspace.
- **Sticky Status:** The "Register Now" CTA must remain accessible, preferably in a minimalist glassmorphism header.

## 3. Engineering Guardrails
- **Deterministic Layouts:** Use Tailwind CSS for all styling. No inline styles.
- **Component Integrity:** Do not skip the "Agenda" or "Eligibility" sections. They must be rendered as clean, scannable lists using `JetBrains Mono` for time-stamps.
- **Performance:** Ensure the Canvas animation is optimized with `requestAnimationFrame`.