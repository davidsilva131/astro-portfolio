// Client work entries for the Experience section (ADR 0002 content model:
// Experience = client work only, role + context, no demo).
// One source of truth consumed by the Experience section.
// Metric values are real, author-provided facts only; entries without a real
// figure simply omit the `metrics` field. No em-dashes in copy.

export interface ExperienceMetric {
  /** Short display string, e.g. "40s" or "All appointment flows". */
  value: string;
  /** Muted context line that explains the value. */
  label: string;
}

export interface ExperienceEntry {
  period: string;
  role: string;
  title: string;
  description: string;
  stack: string[];
  metrics?: ExperienceMetric[];
}

export const EXPERIENCE_ENTRIES: ExperienceEntry[] = [
  {
    period: "2024",
    role: "Frontend Developer",
    title: "Agendamiento / Cancillería",
    description:
      "Platform for scheduling and managing administrative procedures for Colombian foreign ministries. Built the frontend with React, Redux Toolkit and Material UI on a Vite build.",
    stack: ["React", "Redux", "RTK", "Material UI", "Vite"],
    metrics: [
      {
        value: "All appointment flows",
        label: "passports, national ID and foreigner procedures",
      },
    ],
  },
  {
    period: "2024",
    role: "Frontend Developer",
    title: "BeMyself",
    description:
      "Platform for managing digital credentials (e-cards) and enabling digital document signing. Implemented the frontend with React, Redux Toolkit and Material UI.",
    stack: ["React", "Redux", "RTK", "Material UI", "Vite"],
  },
  {
    period: "2023 - Present",
    role: "Frontend Developer",
    title: "Guarda",
    description:
      "SICOV system for issuing certificates of legal firearm possession. Contributed to the frontend and led the Webpack-to-Vite migration, improving build performance.",
    stack: ["React", "Redux", "RTK", "Material UI", "Webpack", "Vite"],
  },
  {
    period: "2023 - Present",
    role: "Frontend Developer",
    title: "Aulapp CEAS",
    description:
      "Platform for automotive training centers that issues driving training certificates to students and instructors. Developed the frontend with React, Redux Toolkit and Material UI.",
    stack: ["React", "Redux", "RTK", "Material UI", "Vite"],
  },
  {
    period: "2023 - Present",
    role: "Frontend Developer",
    title: "Aulapp CIAS",
    description:
      "Educational platform where traffic offenders complete mandatory remedial courses. Built the frontend with React, Redux Toolkit and Material UI.",
    stack: ["React", "Redux", "RTK", "Material UI", "Vite"],
  },
];
