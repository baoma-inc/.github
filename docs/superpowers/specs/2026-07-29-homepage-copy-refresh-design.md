# Homepage Copy Refresh Design

## Goal

Refresh the public organization profile so it accurately describes the current
HomeLink Proxy product and the engineering systems behind it. The copy should
balance customer value with technical credibility while preserving the current
page layout.

## Scope

Update `profile/README.md` in place:

- revise the banner subtitle and rotating introductory lines;
- rewrite the "关于我们" introduction and capability list;
- update the existing project descriptions and add `frontend` and `rust` to the
  current project table;
- update the existing Mermaid architecture diagram to show the web platform and
  capacity logger in their correct roles;
- calibrate surrounding explanatory and security copy where current wording is
  outdated or broader than the repository evidence supports.

## Content Direction

The profile will present one coherent system:

1. Users authorize Android devices to act as managed mobile-network edge nodes.
2. The Go control plane authenticates, schedules, and connects proxy traffic
   through distributed reverse tunnels.
3. HomeLink Proxy provides the public site, customer console, and operations
   console for accounts, access, usage, billing, and support workflows.
4. Capacity Logger provides a separately deployed Rust ingestion path for audit
   logs and aggregated capacity events.
5. Expense Flow supports the team's internal finance, reconciliation, and risk
   operations.

Descriptions will stay concise and public-safe. They may name technologies and
high-level responsibilities already reflected by repository documentation, but
must not expose private hosts, ports, credentials, environment variables,
deployment topology details, or unreleased operational procedures.

## Layout Contract

The existing layout is fixed. The change must not add, remove, rename, or reorder
top-level sections. It must preserve:

- the centered header and footer structure;
- banner, logo, typing animation, badges, and technology badge placement;
- project table columns and formatting;
- Mermaid diagram style and its current section position;
- language statistics markers, contributor table markers, member markers, and
  all automation-managed blocks;
- contribution snake, separators, and footer treatment.

Adding project rows and architecture nodes is content maintenance within the
existing table and diagram, not a layout redesign.

## Accuracy Rules

- Describe `baomao_android` as an MVP-stage authorized Android edge client.
- Describe `idlephone` as the active Go control plane and distributed tunnel
  gateway system.
- Describe `frontend` as the HomeLink Proxy site plus customer and operations
  consoles for the currently implemented mobile proxy product.
- Describe `rust` as the independent HTTPS audit-log and capacity-event ingestion
  service backed by ClickHouse.
- Keep `expense-flow` positioned as an internal finance and risk operations
  system, not part of the customer traffic path.
- Avoid claiming a production state, capacity result, compliance certification,
  or security control unless the repository evidence supports that wording.

## Verification

Before publishing:

- compare headings, section order, HTML wrappers, separators, table columns, and
  automation markers against the current README;
- render the Markdown and confirm the Mermaid graph parses;
- scan the diff for private infrastructure details and unsupported claims;
- verify all repository links and image URLs remain intact;
- confirm only copy, project rows, and Mermaid content changed on the profile.
