# VoiceView - Site Infrastructure Management System

## Overview

VoiceView is a full-stack web application for managing corporate site infrastructure, connectivity, and telephony services across multiple geographic regions. The application provides a centralized dashboard to track and document network connectivity, telephony systems, services, and network diagrams for enterprise locations.

The system enables IT teams to:
- Catalog sites by geographic region (North, South, East, West)
- Document connectivity details including ISP information and local IT contacts
- Track telephony platforms (Microsoft Teams, Avaya, Cisco, CX One, etc.) with number ranges
- Manage site services (Switchboard, Recording, TMS)
- Store and reference network diagrams

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (corporate blue theme)
- **Forms**: React Hook Form with Zod resolver for validation
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Development**: Vite dev server with HMR integration via custom middleware
- **Production**: Static file serving from built assets

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (requires DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema migrations (`npm run db:push`)
- **Validation**: Drizzle-Zod generates Zod schemas from database tables

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and TypeScript types
- `routes.ts`: API contract definitions with Zod input/output schemas

### Key Data Models
1. **Sites**: Core entity with name, region, and site code
2. **Site Info**: 1:N relationship - address, main number, IT manager, user count, operating hours (opening/closing time dropdowns), other info
3. **Site Connectivity**: 1:1 relationship - link type, ISP name, ISP contacts (multiple, each with name/email/phone), local IT contacts (multiple, each with name/email/phone)
4. **Site Services**: 1:N relationship - service types with status tracking
5. **Site Telephony**: 1:N relationship - telephony platforms with number ranges, block size, voice service provider, type of routing
6. **Site Diagrams**: 1:N relationship - diagram image (upload from PC as base64 or external URL), title, description, uploaded by, uploaded at date, file name

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for PostgreSQL

### UI Framework Dependencies
- **Radix UI**: Full suite of accessible UI primitives (dialog, dropdown, tabs, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **cmdk**: Command menu component
- **Vaul**: Drawer component

### Build and Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Validation and Forms
- **Zod**: Schema validation for API contracts and forms
- **React Hook Form**: Form state management
- **drizzle-zod**: Generates Zod schemas from Drizzle tables