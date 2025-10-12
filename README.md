**CompaHunt** is a full-stack, AI-driven platform designed to streamline and automate the modern job search. It combines a powerful web application, a smart browser extension, and an intelligent backend to provide a seamless experience for tracking job applications, analyzing opportunities, and managing career-related communications.

## Core Features

*   **One-Click Job Parsing:** A browser extension for Chrome that instantly parses job details from LinkedIn pages with a single click, eliminating manual data entry.
*   **Cost-Effective AI Email Analysis:** An intelligent system that uses local vector embeddings to classify incoming emails, determining their relevance to the job search. This approach is estimated to be **up to 40x more cost-effective** than using large language models (LLMs) for initial analysis.
*   **Secure & Scalable Architecture:** A robust, microservice-ready system built with a Kotlin/Spring Boot backend, Next.js frontend, and a Python ML service. Authentication is secured via **RS256-signed JWTs**, ensuring stateless and easily verifiable access control across all components.
*   **Comprehensive Job Tracking:** A user-friendly dashboard with features like a Kanban board, interview calendar, and analytics to visualize and manage the entire application lifecycle.
*   **Zero-Cost Data Acquisition:** The browser extension relies on a custom DOM parser, completely bypassing the need for expensive LinkedIn API subscriptions.

## Tech Stack

| Component            | Technologies                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**         | ![Next.js](https://img.shields.io/badge/-Next.js-000000?logo=next.js) ![React](https://img.shields.io/badge/-React-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript) ![TailwindCSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css) ![TanStack Query](https://img.shields.io/badge/-TanStack_Query-FF4154?logo=react-query) |
| **Backend**          | ![Kotlin](https://img.shields.io/badge/-Kotlin-7F52FF?logo=kotlin) ![Spring Boot](https://img.shields.io/badge/-Spring_Boot-6DB33F?logo=spring) ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql) ![pgvector](https://img.shields.io/badge/-pgvector-336791) ![JPA/Hibernate](https://img.shields.io/badge/-JPA/Hibernate-59666C) ![Quartz](https://img.shields.io/badge/-Quartz-95358A) |
| **Browser Extension**| ![Plasmo](https://img.shields.io/badge/-Plasmo-F4425D) ![React](https://img.shields.io/badge/-React-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript) |
| **ML Service**       | ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python) ![Flask](https://img.shields.io/badge/-Flask-000000?logo=flask) ![Sentence Transformers](https://img.shields.io/badge/-Sentence_Transformers-343434) |
| **Authentication**   | ![NextAuth.js](https://img.shields.io/badge/-NextAuth.js-000000?logo=next.js) ![JWT](https://img.shields.io/badge/-JWT_(RS256)-000000?logo=json-web-tokens) |
| **DevOps & Tooling** | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker) ![Gradle](https://img.shields.io/badge/-Gradle-02303A?logo=gradle) ![NPM](https://img.shields.io/badge/-NPM-CB3837?logo=npm) |

## Architecture Overview

1.  **Browser Extension:** Injected into LinkedIn pages, it parses DOM content and sends structured job data to the backend via a secure REST API call.
2.  **Frontend (Next.js):** The main user dashboard for managing applications, viewing analytics, and scheduling interviews. Communicates with the backend using JWT-authenticated API calls.
3.  **Backend (Kotlin/Spring Boot):** The core of the application. It handles business logic, user management, and data persistence. It communicates with the ML Service to generate vector embeddings for text analysis.
4.  **ML Service (Python/Flask):** A lightweight microservice dedicated to a single task: generating sentence embeddings from text using the `intfloat/multilingual-e5-base` model.

---
*This project was created to demonstrate full-stack development skills, architectural design patterns, and practical AI application.*