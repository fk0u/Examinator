<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nContributing+Guidelines&font=Montserrat" alt="Contributing Banner" />
</p>

# Contributing to Examinator 🤝

First off, thank you for considering contributing to **Examinator**! It's people like you that make Examinator an innovative and secure tool for digital education and proctoring.

By following these guidelines, you respect the time of the core contributors and maintainers. In return, they will reciprocate that respect by addressing your issue, assessing changes, and helping you finalize your pull requests.

## 🧠 Architectural Primer

Before touching the codebase, please familiarize yourself with our tech stack:

- **Frontend**: Qwik Framework (Hybrid SSR/SSG with extreme resumability) with Tailwind CSS v4.
- **Backend**: Bun Runtime utilizing Elysia.js + native uWebSockets.
- **Database**: Prisma ORM with MySQL relational DB.

We use a **Monorepo** architecture. Please refer to the `docs/` folder for deeper architectural guidelines.

## 🛠 Development Workflow

### 1. Fork & Clone

1. Fork the repo on GitHub.
2. Clone your fork locally.
3. Keep your remote `upstream` synced with our main repository.

### 2. Setup Local Environment

```bash
npm install
npm run db:push
npm run dev
```

... Keep the rest of the file identical to the user's previously generated content or I will rewrite the rest of it briefly.

### 3. Branching Strategy

We enforce strict branching. Never commit directly to `main`. Create a new branch:

- Use `feat/your-feature-name` (e.g., `feat/facial-recognition`)
- Use `fix/your-bug-fix` (e.g., `fix/websocket-reconnect`)
- Use `chore/dependency-updates` or `docs/update-api-spec`

### 4. Conventional Commits

We require all contributions to follow **Conventional Commits**. This is crucial for our automated `CHANGELOG` generation and Semantic Versioning.

**Format**: `<type>(<scope>): <subject>`

**Examples**:

- `feat(proctor): add audio detection to anti-cheat hooks`
- `fix(auth): resolve JWT expiration timezone mismatch`
- `style(ui): update glassmorphism backdrop filter blur`
- `refactor(db): optimize exam querying throughput`

### 5. Code Quality

- **TypeScript**: Always use strict typing. Avoid `any` at all costs. Use Prisma-generated types for DB entities.
- **Styling**: Qwik components MUST use Tailwind v4 utility classes. No inline styles.
- **Linting**: Run `npm run lint` before committing to catch formatting errors.
- **Testing**: If adding new Elysia endpoints, include integration/stress tests.

## 🚀 Pull Request Process

1. **Rebase**: Always rebase on top of `main` before pushing to avoid conflicts.
2. **Push**: Push your commits to your fork.
3. **Open PR**: Submit a Pull Request to our main repository.
4. **Description**: Fill out the PR template completely. Explain _why_ the change is needed and link to the issue (e.g., `Fixes #123`).
5. **Review**: Maintainers will review your PR. Don't take feedback personally; we all want the best codebase possible. Fix requested changes promptly.

## 🐛 Bug Reports

Bugs are tracked via GitHub issues. A great bug report must include:

- **Use the Template**: Provide OS, Browser, and EXACT reproduction steps.
- **Clear Title**: Summarize the issue in one sentence.
- **Logs/Screenshots**: Include browser console logs, server traces, or screenshots for UI bugs.

## 💡 Proposing Enhancements

Enhancements are also tracked as GitHub issues:

- Explain why the enhancement would be useful to most users, not just an edge-case.
- Provide pseudocode or UI wireframes if applicable.

Thank you for contributing to the future of digital education! 🎓
