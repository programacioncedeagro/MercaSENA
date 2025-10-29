# MercaSENA - Copilot Instructions

This workspace contains a Next.js agricultural marketplace platform with the following key technologies:

## Project Overview
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Genkit for recommendations
- **Package Manager**: npm

## Key Features
- Producer dashboard for agricultural/livestock management
- Buyer dashboard for marketplace interactions
- Real-time data with Firebase
- AI-powered crop recommendations and harvest estimates
- Complete production traceability system

## Development Guidelines
- Use TypeScript strictly - all files should be typed
- Follow Next.js 15 App Router patterns
- Use Tailwind CSS for styling
- Leverage Radix UI components for consistent UI
- Firebase hooks are available in `@/firebase` for data operations
- AI features are in `src/ai/` using Google Genkit

## Code Standards
- Use functional components with hooks
- Implement proper error handling with Firebase
- Follow the established folder structure
- Use the custom UI components from `@/components/ui`
- Maintain responsive design principles

## Available Scripts
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run typecheck` - TypeScript validation
- `npm run lint` - Code linting
- `npm run genkit:dev` - AI development server

## Project Structure
- `src/app/` - Next.js pages and layouts
- `src/components/` - Reusable UI components
- `src/firebase/` - Firebase configuration and hooks
- `src/ai/` - AI/Genkit integration
- `src/lib/` - Utility functions and types

When working on this project, prioritize type safety, responsive design, and real-time data consistency.