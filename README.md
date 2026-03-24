# Sunshine State Solar - Quote Form

A premium, multi-step solar quote form built with Next.js, Tailwind CSS (v4), and Framer Motion.

## Features
- **Replicated Logic**: Follows the exact question flow from the original Heyflow site.
- **Residency Check**: Includes the specific "No, I Rent" dead-end logic with a custom "Sorry!" message.
- **Premium Design**: Pure black background with high-contrast solar-themed elements and smooth step transitions.
- **Responsive**: Fully optimized for mobile and desktop.
- **API Ready**: Includes an API route (`/api/submit`) to handle form data.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The form will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `src/app/page.tsx`: Main form logic and UI.
- `src/app/globals.css`: Custom theme and Tailwind v4 configuration.
- `src/app/api/submit/route.ts`: Submission handler.
- `form_logic.md`: The transcribed logic from the original site.
