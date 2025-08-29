/**
 * Personality Quiz App — Single-file React component
 * - TailwindCSS utility classes for styling (no PostCSS config needed if using CDN or pre-wired)
 * - Framer Motion for animations
 * - useReducer for state transitions, useState for tiny UI helpers
 *
 * How scoring works:
 *  - Two simple dimensions: Extrovert (E) vs Introvert (I), Thinker (T) vs Feeler (F)
 *  - Each answer maps to one or more trait bumps, e.g., { E: 1 } or { F: 2 }
 *  - Final type picks the max in each axis: (E vs I) + (T vs F) → e.g., "ET", "IF"
 */
