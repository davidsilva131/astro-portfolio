// Curated project entries: the hand-written side of the content model (ADR 0001).
// Two roles:
//   - Standalone entries (no `repo`): projects the GitHub API cannot provide
//     (private repos, other orgs). Always rendered.
//   - Enrichment entries (`repo` set): patch a synced repo's card with content
//     GitHub does not carry (description, stack, status, flagship, demo link).
// Merge rule: a field set here replaces the synced value; an empty string
// clears the synced value (e.g. a dead homepage). No em-dashes in copy.

export interface CuratedProject {
  /** GitHub repo name this entry enriches. Omit for standalone entries. */
  repo?: string;
  /** Display title; defaults to the repo name for synced entries. */
  title?: string;
  description: string;
  stack?: string[];
  art?: string;
  status?: "completed" | "in-progress";
  href?: string;
  source?: string;
  flagship?: boolean;
  /** Lower floats to the top, before synced entries. Unranked entries go last. */
  rank?: number;
}

export const CURATED_PROJECTS: CuratedProject[] = [
  {
    title: "LotoPetsPlay",
    description:
      "Gaming platform themed around pets, featuring user accounts, match history, and real-time data management.",
    stack: ["Next.js", "Tailwind CSS", "Supabase"],
    status: "in-progress",
    flagship: true,
    rank: 0,
    art: "/projects/lotopetsplay.png",
  },
  {
    title: "Vikingos",
    description: "VIKINGO'S motorcycle store: catalog, shopping flow and admin on Astro + Supabase.",
    stack: ["Astro", "Tailwind CSS", "Supabase"],
    status: "in-progress",
    href: "https://vikingos-production.up.railway.app",
    art: "/projects/vikingos.png",
    rank: 1,
  },
  {
    repo: "Mytodo-back",
    art: "/projects/mytodo-back.png",
    description: "REST API for a todo app: FastAPI, SQLAlchemy 2.0, Alembic migrations and JWT auth.",
    stack: ["FastAPI", "SQLAlchemy", "PostgreSQL", "JWT"],
  },
  {
    repo: "gh-dash",
    art: "/projects/gh-dash.png",
    description: "GitHub personal dashboard aggregating repos, PRs and activity via the GitHub API.",
    stack: ["Astro", "React", "Tailwind CSS", "shadcn/ui", "GitHub API"],
  },
  {
    repo: "portfolio_ayverson",
    title: "VFX Ayverson",
    art: "/projects/vfx-ayverson.png",
    description:
      "Professional portfolio for a video designer and editor, showcasing a work gallery and personal brand presentation.",
    stack: ["Astro", "Tailwind CSS"],
    href: "https://portfolio-ayverson.pages.dev",
  },
  {
    repo: "recipes-ia",
    art: "/projects/recipes-ia.png",
    description:
      "Conversational AI recipe generator: chat with a virtual chef, save favorites, and cook with what you have.",
    stack: ["React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Zustand", "AI"],
    href: "https://recipes-ia.davidsilva131.workers.dev/",
  },
  {
    repo: "ruleta-apuestas",
    description:
      "Roulette betting app with 30 themed numbers, automated game scheduling and an admin panel.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    repo: "apk-divisas",
    art: "/projects/apk-divisas.png",
    description: "Cross-platform currency converter for Bs/USD/EUR with calculator and VAT modes.",
    stack: ["Flutter", "Dart"],
  },
  {
    repo: "academia-futbol",
    title: "Academia Eudalio Arriaga",
    art: "/projects/academia-eudalio-arriaga.png",
    description:
      "Registration landing for Academia de Delanteros Eudalio Arriaga, wiring player profiles to WhatsApp.",
    stack: ["Astro", "Tailwind CSS"],
    href: "https://academiaeudalioarriaga.com/",
  },
  {
    repo: "revil",
    art: "/projects/revil.png",
    description: "Landing page for an Instagram growth service built with Astro and React.",
    stack: ["Astro", "React", "Tailwind CSS", "TypeScript"],
    href: "https://revil.shop/",
  },
  {
    repo: "Cocktails-Next",
    description: "Cocktail catalog and search app built with Next.js.",
    stack: ["Next.js", "React", "Tailwind CSS"],
    href: "",
  },
  {
    repo: "Quiz-App-With-Zustand",
    description: "Quiz app with React and Zustand state management.",
    stack: ["React", "Zustand"],
    href: "",
  },
  {
    repo: "landing-tesol",
    art: "/projects/landing-tesol.png",
    description: "Marketing landing for a TESOL service (Next.js).",
    stack: ["Next.js", "React", "Tailwind CSS"],
    href: "",
  },
  {
    // Clears the dead homepage so the card keeps its source link only.
    repo: "sprint4",
    href: "",
  },
  {
    // Clears the dead homepage so the card keeps its source link only.
    repo: "Portafolio",
    description: "My Portfolio",
    stack: ["JavaScript"],
    href: "",
  },
  {
    title: "food-now",
    art: "/projects/food-now.png",
    description: "Tracking app for meal deliveries to people living on the streets.",
    stack: ["JavaScript"],
    href: "https://food-now.vercel.app",
  },
  // Art-only enrichment for synced repos without a curated entry: GitHub
  // provides title/description/stack; the dither art is curated here.
  { repo: "astro-portfolio", art: "/projects/astro-portfolio.png" },
  { repo: "wraplove", art: "/projects/wraplove.png" },
  { repo: "davidsilva131", art: "/projects/davidsilva131.png" },
  { repo: "lawyer-bot-ve", art: "/projects/lawyer-bot-ve.png" },
];
