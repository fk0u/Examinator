# Contributing to Examinator

First off, thank you for considering contributing to **Examinator**! It's people like you that make Examinator such a great tool for digital education and secure CBT proctoring.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open-source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## 🧠 Architecture Primer

Before contributing, please ensure you are familiar with our stack:

- **Frontend**: Qwik framework (SSR/SSG hybrid with extreme resumability) and Tailwind CSS v4.
- **Backend**: Bun runtime with Elysia.js + native uWebSockets.
- **Database**: Prisma ORM with MySQL.

We strictly follow a Monorepo strategy. Please refer to `docs/` for deep architectural insights.

## 🛠 Development Workflow

### 1. Fork & Clone

1. Fork the project on GitHub.
2. Clone your fork locally.
3. Add the original repository as an upstream remote to keep your fork synced.

### 2. Setup Local Environment

```bash
npm install
npm run db:push
npm run dev
```

### 3. Branching Strategy

We use a strict branching model. Never commit directly to `main`.
Create a new branch for each feature or fix:

- Features: `feat/your-feature-name` (e.g., `feat/facial-recognition`)
- Bug Fixes: `fix/your-fix-name` (e.g., `fix/websocket-reconnect`)
- Chores/Docs: `chore/dependency-updates` or `docs/update-api-spec`

### 4. Committing Changes

We enforce **Conventional Commits**. This is crucial for our automated CHANGELOG generation and semantic versioning.

Format: `<type>(<scope>): <subject>`

**Examples**:

- `feat(proctor): add audio detection to anti-cheat hooks`
- `fix(auth): resolve JWT expiration timezone mismatch`
- `style(ui): update glassmorphism backdrop filter blur`
- `refactor(db): optimize exam querying throughput`

### 5. Code Quality & Standards

- **TypeScript**: Use strict types. Avoid `any` at all costs. Utilize Prisma-generated types for entity passing.
- **Styling**: Qwik components must use modular Tailwind CSS utility classes. Avoid inline styles.
- **Linting**: Ensure your code passes all ESLint targets. Run `npm run lint` before committing.
- **Testing**: If you add a new API route, add an accompanying integration test or API stress test parameters.

## 🚀 Submitting a Pull Request (PR)

1. **Rebase**: Before pushing, rebase your branch against the upstream `main` to resolve any conflicts.
2. **Push**: Push your branch to your forked repository.
3. **Open PR**: Navigate to the main Examinator repository and click "New Pull Request".
4. **Description**: Fill out the PR template completely. Clearly describe what the PR does, why it is needed, and link any relevant issue numbers (e.g., "Fixes #123").
5. **Review**: A core maintainer will review your code. Do not take feedback personally; we are all striving for technical excellence. Address any requested changes promptly.

## 🐛 Reporting Bugs

Bugs are tracked as GitHub issues. When creating an issue, please adhere to the following:

- **Use the Bug Report Template**: Provide the OS, browser versions, and exact steps to reproduce.
- **Clear Title**: Write a clear and descriptive title.
- **Screenshots/Logs**: Attach browser console logs, server error traces, or video recordings if UI-related.

## 💡 Proposing Enhancements

Enhancement suggestions are tracked as GitHub issues.

- Provide a clear and detailed explanation of the feature.
- Explain _why_ this enhancement would be useful to most users, not just a niche edge-case.
- If possible, provide pseudo-code, wireframes, or references to similar features in other software.

Thank you for contributing to maintaining the integrity of digital education!
