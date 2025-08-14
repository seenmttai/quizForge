# Lab Question AI System

## Overview

This is an AI-powered web application designed to generate unique but equivalent lab questions for each student, addressing the problem of copying and unfair evaluation in academic settings. The system uses advanced AI to create personalized questions that maintain consistent difficulty levels while ensuring no two students receive identical questions.

The application serves as an administrative dashboard for instructors to generate questions, manage students, track assignments, and monitor analytics. It focuses on conduction lab experiments but can be extended to other subjects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS** with shadcn/ui component library for styling
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** server with TypeScript support
- **RESTful API** design with structured route handling
- **Session-based authentication** using Replit's OpenID Connect
- **Drizzle ORM** for database operations with PostgreSQL
- **Express middleware** for logging, error handling, and authentication

### Database Design
- **PostgreSQL** database with Drizzle ORM
- **User management** with role-based access control
- **Student tracking** with unique identifiers
- **Question templates** for AI generation parameters
- **Question storage** with metadata and variables
- **Assignment system** linking students to questions
- **Activity logging** for audit trails
- **Question batches** for bulk operations

### AI Integration
- **OpenAI GPT-4** for question generation and paraphrasing
- **Template-based approach** with controlled variable substitution
- **Difficulty consistency** through AI evaluation
- **Variable generation** with configurable ranges and constraints
- **Batch processing** for efficient question creation

### Authentication & Authorization
- **Replit Auth** integration using OpenID Connect
- **Session management** with PostgreSQL session store
- **Role-based access** (instructor/admin roles)
- **Secure cookie handling** with HTTP-only flags

### State Management
- **Client-side caching** with TanStack Query
- **Optimistic updates** for better user experience
- **Error boundary handling** for graceful failures
- **Loading states** and skeleton screens

### Development & Deployment
- **TypeScript** throughout the entire stack
- **ESM modules** for modern JavaScript
- **Hot reload** in development with Vite
- **Build optimization** with tree shaking and code splitting
- **Environment-based configuration**

## External Dependencies

### Core Infrastructure
- **Replit hosting platform** for deployment and authentication
- **PostgreSQL database** (Neon serverless recommended)
- **OpenAI API** for question generation and AI processing

### Authentication Services
- **Replit OpenID Connect** for user authentication
- **Session storage** in PostgreSQL with connect-pg-simple

### UI Component Library
- **Radix UI primitives** for accessible component foundation
- **Lucide React** for consistent iconography
- **Tailwind CSS** for utility-first styling

### Development Tools
- **Vite ecosystem** for build tooling and development server
- **Drizzle Kit** for database migrations and schema management
- **ESBuild** for production bundling

### API Integrations
- **OpenAI GPT-4** API for natural language processing
- **Date-fns** for date manipulation and formatting
- **Zod** for runtime type validation and schema definition

### Monitoring & Analytics
- **Activity logging** stored in PostgreSQL
- **Error tracking** through custom middleware
- **Performance monitoring** via Vite plugins in development