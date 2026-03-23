# LibreFLIX - Full-Stack Architecture

A modern, containerized Full-Stack application for managing a movie catalog, built with a Monorepo architecture.

## Architecture Overview

This project is divided into two main services, orchestrated by Docker Compose:

- **Backend:** A RESTful API built with Node.js, Express, and MongoDB. It handles data persistence, validation (via Mongoose), and security (Header-based authentication).
- **Frontend:** Vanilla JavaScript, HTML, and CSS (preparation for dynamic data fetching).
- **Database:** MongoDB (NoSQL) running in an isolated container with persistent volumes.

## Tech Stack

- **Runtime:** Node.js (v20 Alpine)
- **Database:** MongoDB (v6) + Mongoose ODM
- **Infrastructure:** Docker & Docker Compose
- **Architecture:** Monorepo (Client/Server separation)

## How to Run Locally

You don't need to install Node or MongoDB on your machine. Just Docker!

1. Clone this repository.
2. Create a `.env` file in the `backend/` folder based on `.env.example` (or configure your `ADMIN_PASSWORD`).
3. Run the orchestrator from the root directory:
   ```bash
   docker compose up --build
   ```
4. The API will be available at http://localhost:3000.
