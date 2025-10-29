# MercaSENA

A comprehensive agricultural marketplace platform built with Next.js, Firebase, and AI-powered recommendations.

## Features

- **Producer Dashboard**: Manage agricultural/livestock productions with AI recommendations
- **Buyer Dashboard**: Browse and purchase products with smart matching
- **Real-time Marketplace**: Live updates using Firebase Firestore
- **AI-Powered Insights**: Crop recommendations and harvest estimates using Google Genkit
- **Production Tracking**: Complete traceability from planning to harvest
- **Offer Management**: Smart bidding and negotiation system

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **AI**: Google Genkit for intelligent recommendations
- **State Management**: React Hooks, Firebase SDK

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/hdimate/mercaSENA.git
   cd mercaSENA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env.local`):
   ```
   # Firebase configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   # Add other Firebase config variables
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Start Genkit with file watching

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard layouts
│   │   ├── comprador/     # Buyer dashboard
│   │   └── productor/     # Producer dashboard
│   └── trazabilidad/      # Traceability system
├── components/            # Reusable UI components
├── firebase/              # Firebase configuration and hooks
├── ai/                    # AI/Genkit integration
├── hooks/                 # Custom React hooks
└── lib/                   # Utility functions and types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the SENA agricultural technology initiative.
