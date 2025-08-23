# Next.js Portfolio Development Instructions

Always reference these instructions first and fallback to search or bash
commands only when you encounter unexpected information that does not match the
info here.

## Working Effectively

### Bootstrap and Development Setup

- **ALWAYS install dependencies first**: `npm install` -- takes ~30 seconds.
  NEVER CANCEL. Set timeout to 60+ seconds.
- **Check code formatting**: `npx prettier --check .` to see formatting issues.
- **Format code**: `npx prettier --write .` -- takes ~5 seconds for full
  codebase format.
- **Lint code**: `npm run lint` -- takes ~10 seconds. Shows TypeScript and
  ESLint warnings.

### Build and Development Commands

- **Development server**: `npm run dev` -- starts in ~1 second with Turbopack.
  NEVER CANCEL.
  - Runs on http://localhost:3000
  - Uses Next.js 15.1.2 with Turbopack for fast development
  - Auto-reloads on file changes
- **Production build**: `npm run build` -- takes ~30 seconds. NEVER CANCEL. Set
  timeout to 90+ seconds.
  - Creates static export in `dist/` directory
  - Must complete before running production server
- **Production server**: `npm run start` -- requires `npm run build` first
  - Serves static files from `dist/` directory
  - Runs on http://localhost:3000

### Docker Development (Note: May fail in some environments)

- **Build Docker image**: `docker build -t next-portfolio .` -- takes 2-5
  minutes if working. NEVER CANCEL. Set timeout to 10+ minutes.
- **Run Docker container**: `docker run -d -p 3000:3000 next-portfolio`
- **WARNING**: Docker build may fail due to Alpine package repository access
  issues (`libc6-compat` package not found). This is a known environment
  limitation.

## Validation

### Manual Testing Requirements

- **ALWAYS test the development server** after making changes:
  1. Run `npm run dev`
  2. Verify http://localhost:3000 responds with HTTP 200
  3. Check the portfolio loads with proper styling and components
- **Test production build** for significant changes:
  1. Run `npm run build` (wait for completion)
  2. Run `npm run start`
  3. Verify production site works correctly
- **ALWAYS run linting and formatting** before committing:
  1. `npm run lint` -- must pass without errors
  2. `npx prettier --write .` -- format all files
  3. `npx prettier --check .` -- verify formatting is correct

### End-to-End Scenarios

After making changes, **ALWAYS** test these user scenarios:

- **Portfolio Loading**: Visit homepage, verify all sections load (About,
  Projects, Technologies)
- **Theme Toggle**: Test dark/light mode toggle functionality
- **Project Cards**: Verify project cards display correctly with tags and links
- **Responsive Design**: Check layout works on different screen sizes
- **README Dialog**: Test project README modal functionality

## Key Project Structure

### Important Directories

- `/app` - Next.js App Router structure with layout and pages
- `/app/(root)` - Main page route and data definitions
- `/components` - React components including UI library components
- `/components/ui` - Radix UI components (shadcn/ui pattern)
- `/lib` - Utility functions and shared code
- `/public` - Static assets (images, logos, fonts)

### Configuration Files

- `next.config.ts` - Next.js configuration with static export enabled
- `tailwind.config.ts` - TailwindCSS configuration with custom design system
- `tsconfig.json` - TypeScript configuration
- `.prettierrc` - Prettier formatting configuration
- `eslint.config.mjs` - ESLint configuration for Next.js

### Key Data Files

- `/app/(root)/var.tsx` - Contains project data, technology stack, and portfolio
  content
- `/app/globals.css` - Global styles and TailwindCSS imports
- `/app/layout.tsx` - Root layout with theme provider and metadata

## Technology Stack

### Core Technologies

- **Next.js 15.1.2** - React framework with App Router and static export
- **React 19** - UI library with modern features
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework with custom design system
- **Radix UI** - Accessible component primitives

### Development Tools

- **Turbopack** - Fast bundler for development mode
- **ESLint** - Code linting with Next.js rules
- **Prettier** - Code formatting with TailwindCSS plugin
- **Node.js 20+** - Runtime environment

### Alternative Development Environments

- **Nix** - Nix shell configuration available (`shell.nix`, `flake.nix`)
- **Devbox** - Development environment setup (`devbox.json`)

## Common Issues and Solutions

### Build Issues

- **"No production build found"**: Always run `npm run build` before
  `npm run start`
- **TypeScript errors**: Check `tsconfig.json` and ensure all dependencies are
  installed
- **Prettier formatting warnings**: Run `npx prettier --write .` to fix
  formatting

### Development Issues

- **Port 3000 in use**: Kill existing processes with `pkill -f "next"` before
  starting
- **Turbopack errors**: Restart development server if hot reload stops working
- **Styling issues**: Verify TailwindCSS classes and check global CSS imports

### Docker Issues

- **Alpine package errors**: Docker build may fail due to environment network
  restrictions
- **Alternative**: Use local development with `npm run dev` instead of Docker

## Important Notes

### Static Export Configuration

- This project uses `output: 'export'` in `next.config.ts` for static site
  generation
- All content is pre-rendered at build time
- No server-side APIs are available in production

### No Test Suite

- **No test scripts** are configured in this project
- Manual testing through browser interaction is required
- Focus on visual and functional validation

### Portfolio Content

- Project data is statically defined in `/app/(root)/var.tsx`
- External README files are fetched from GitHub repositories
- Technology logos are stored in `/public/logo/`

## Command Reference

### Essential Commands (Copy-Paste Ready)

```bash
# Initial setup
npm install

# Development
npm run dev
npm run lint
npx prettier --write .

# Production
npm run build
npm run start

# Code quality
npx prettier --check .
npm run lint
```

### Timeout Guidelines for Long-Running Commands

- `npm install`: 60+ seconds timeout
- `npm run build`: 90+ seconds timeout
- `docker build`: 600+ seconds timeout (10+ minutes)
- **NEVER CANCEL** any build commands - they must complete fully

### Quick Health Check

```bash
npm run lint && npx prettier --check . && npm run build
```

Run this command sequence to verify the project is in good state before making
changes.
