# jdsc.site Portfolio Context

The public portfolio site for David Silva. The "Things I've Built" section presents the projects worth showing; the rest of the site is static copy.

## Language

**Project**:
An entry in the Things I've Built section. Every project has a name, a description, a technology stack, and optionally a live demo link or source link.
_Avoid_: Repo, card, item

**Synced project**:
A project whose content is taken automatically from one of the account's public GitHub repositories, so a new repository appears in the section without editing the portfolio.
_Avoid_: Auto project, fetched project

**Curated project**:
A hand-written project entry used when the source of truth cannot provide the project — typically private repositories or projects owned by other organizations — or to enrich a synced project with content the source of truth does not carry, such as a description, status, or live demo link. Curated projects are added deliberately, never automatically.
_Avoid_: Override, manual project, special entry

**Source of truth**:
The place project content originates. For synced projects it is the GitHub account's public repositories; for curated projects it is the portfolio's own curated entries.
_Avoid_: Data source, backend
