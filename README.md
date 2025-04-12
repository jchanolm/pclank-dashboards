# Token Believer Dashboard

## Overview
A modern, Palantir-inspired dashboard for analyzing token holder data and believer scores. The dashboard provides a clear visual representation of token health metrics and believer engagement.

## Key Features
- Dark, minimalist Palantir-inspired UI with subtle gradients and grid patterns
- Sortable token comparison table with visual indicators
- In-depth token analysis page with score breakdowns
- Top believers list with social credibility metrics
- Radar chart visualizing different dimensions of token scores
- Responsive design that works on all devices

## Implementation Details
- Direct integration with Neo4j database via API routes
- Modern Next.js App Router architecture
- Client-side sorting and filtering for responsive UX
- Visual cues (colors, symbols) to indicate metric health
- Clean, minimal interaction model with clear navigation

## Getting Started
1. Install dependencies: `npm install recharts neo4j-driver`
2. Configure Neo4j connection in `.env.local`
3. Run the development server: `npm run dev`

## File Structure
- `/app/page.tsx` - Main tokens comparison page
- `/app/tokens/[address]/page.tsx` - Detailed token analysis page
- `/app/api/tokens/route.ts` - API endpoint for retrieving token data
- `/app/api/tokens/[address]/believers/route.ts` - API endpoint for token believers
- `/components/TokenMetricsCards.tsx` - Token metrics display cards
- `/components/TokenRadarChart.tsx` - Radar chart for score dimensions
- `/components/TopBelieversTable.tsx` - Top believers table
- `/lib/neo4j.ts` - Neo4j database connection utilities
- `/lib/types.ts` - TypeScript type definitions