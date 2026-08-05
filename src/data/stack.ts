// Curated technology list for the Stack section.
// One source of truth consumed by the marquee AND the indexed category rows.
// Order inside each category matches the spec (issue #8) verbatim.

export type StackCategoryId =
  | "frontend"
  | "backend-data"
  | "testing-ci"
  | "tools"
  | "methods";

export interface StackCategory {
  id: StackCategoryId;
  index: string; // "01" .. "05" for the indexed row label
  label: string;
  items: string[];
}

export const STACK_CATEGORIES: StackCategory[] = [
  {
    id: "frontend",
    index: "01",
    label: "Frontend",
    items: [
      "React 18/19",
      "Next.js",
      "Astro",
      "TypeScript",
      "JavaScript (ES6+)",
      "Tailwind CSS",
      "HTML5/CSS3",
      "Sass",
      "Material UI",
      "Shadcn/UI",
      "Three.js",
      "Zustand",
      "Redux/RTK",
    ],
  },
  {
    id: "backend-data",
    index: "02",
    label: "Backend & Data",
    items: [
      "Node.js",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "SQL/SQLite",
      "Firebase",
      "Firestore",
      "Supabase",
      "Axios",
      "Zod",
      "SQLAlchemy",
      "JWT",
      "Azure",
    ],
  },
  {
    id: "testing-ci",
    index: "03",
    label: "Testing & CI",
    items: ["Vitest", "React Testing Library", "GitHub Actions", "Husky", "ESLint"],
  },
  {
    id: "tools",
    index: "04",
    label: "Tools",
    items: [
      "Postman",
      "Bruno",
      "Git/GitHub",
      "Vite",
      "Webpack",
      "Docker",
      "Linux",
      "pnpm",
    ],
  },
  {
    id: "methods",
    index: "05",
    label: "Methods",
    items: [
      "Hermes",
      "OpenCode",
      "Obsidian",
      "Claude",
      "Open Design",
      "Handy",
      "Wipr Flow",
      "Scrum",
      "Flutter/Dart",
    ],
  },
];

// Flat deduplicated list (preserving first-seen order) for the marquee strip.
export const STACK_MARQUEE: string[] = (() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const cat of STACK_CATEGORIES) {
    for (const item of cat.items) {
      if (!seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    }
  }
  return out;
})();
