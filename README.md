***

# LeaseSense

<p align="center">
  <img src="https://raw.githubusercontent.com/mrgigabyte/leasesense-readme-assets/main/leasesense-banner.png" alt="LeaseSense Banner" />
</p>

<p align="center">
  <strong>Understand Your Energy. Unlock Savings. Empowering Tenants with Data-Driven Insights.</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/github/workflow/status/mrgigabyte/leasesense-readme-assets/CI/main?style=for-the-badge&logo=githubactions&logoColor=white" alt="Build Status"></a>
  <a href="#"><img src="https://img.shields.io/github/package-json/v/mrgigabyte/leasesense-readme-assets?style=for-the-badge" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/github/license/mrgigabyte/leasesense-readme-assets?style=for-the-badge" alt="License"></a>
</p>

## Overview

**LeaseSense** is a powerful web application designed to bring energy intelligence directly to tenants of both residential and commercial properties. By seamlessly connecting to their utility provider accounts, users get access to a personalized dashboard that demystifies their energy consumption. The platform benchmarks performance, provides actionable, AI-driven recommendations, and helps users understand their carbon footprint, fostering energy equity without requiring property ownership.

LeaseSense delivers “energy equity without ownership.” In minutes, tenants authenticate a utility or smart plug, pick “Home” or “Shop,” and receive a dashboard that:
	•	Explains every dollar & kWh in plain language. Utility data is fetched via Bayou’s one‑click OAuth (<60 s) and normalized to 15‑min intervals, meeting Green‑Button standards.  
	•	Benchmarks performance against anonymized peers (renters vs. cafés) using EIA RECS and CBECS medians.   
	•	Recommends low‑lift actions (shift laundry, stagger espresso machines) engineered from NILM‑disaggregated device estimates.  
	•	Generates shareable “Impact Proofs”—print‑friendly certificates that boost tenant–landlord conversations or green‑marketing for stores.
	•	Surfaces rebates & C‑PACE financing paths when bigger upgrades make sense.   

This repository serves as a comprehensive template for building modern, full-stack applications with a serverless backend, third-party API integrations, and immersive data visualizations.

<p align="center">
  <img src="https://raw.githubusercontent.com/mrgigabyte/leasesense-readme-assets/main/leasesense-demo.gif" alt="LeaseSense Application Demo" width="800"/>
</p>

## ✨ Features

*   **Seamless Utility Integration**: Connects to utility providers via **Bayou's** secure OAuth flow to fetch and normalize energy data.
*   **Interactive Dashboard**: Visualizes energy usage, cost, and carbon emissions with beautiful charts and WebGL-powered backgrounds.
*   **AI-Powered Recommendations**: Delivers personalized, low-lift actions to help users reduce consumption and save money.
*   **Peer Benchmarking**: Compares a user's energy performance against anonymized peers (e.g., other renters or shops).
*   **Real-time Carbon Insights**: Fetches live carbon intensity data from the **Electricity Maps API** to calculate environmental impact.
*   **Persona-Driven Experience**: Tailors the dashboard and benchmarks for different user types, such as **renters** and **shop owners**.
*   **Modern Authentication**: Secure user management powered by **Supabase Auth**.
*   **Scalable Serverless Backend**: All backend logic is handled by robust, type-safe **Deno Edge Functions** on Supabase.
*   **Polished UI/UX**: Built with **React**, **Vite**, **TypeScript**, and **Shadcn UI** for a fast, responsive, and aesthetically pleasing experience.

## ⚙️ How It Works

LeaseSense uses a combination of a React frontend and a Supabase serverless backend to deliver a seamless experience.

<p align="center">
  <img src="https://raw.githubusercontent.com/mrgigabyte/leasesense-readme-assets/main/architecture-diagram.png" alt="LeaseSense Architecture Diagram" width="800"/>
</p>

1.  **Authentication**: Users sign up or log in using Supabase Auth.
2.  **Onboarding**: The user selects their persona (e.g., "Renter") and connects their utility account.
3.  **Utility Connection**: A Supabase Edge Function calls the **Bayou API** to create a customer and returns a secure OAuth link.
4.  **Data Fetching**: Another Edge Function securely fetches the user's utility data from Bayou, polling until the data is ready.
5.  **Dashboard**: The frontend displays the data in an interactive dashboard, enriching it with carbon intensity data and AI recommendations fetched from other Edge Functions.

## 🛠️ Tech Stack

| Category          | Technology                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**      | [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)                                   |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Tailwind CSS](https://tailwindcss.com/)                      |
| **Routing**       | [React Router](https://reactrouter.com/)                                                                                                |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query/latest)                                                                                     |
| **3D & Shaders**  | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction), [Drei](https://github.com/pmndrs/drei), [GLSL](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language) |
| **Backend**       | [Supabase](https://supabase.com/) (Auth, Database, Edge Functions)                                                                      |
| **Edge Runtime**  | [Deno](https://deno.land/)                                                                                                              |
| **External APIs** | [Bayou](https://www.bayou.energy/) (Utility Data), [Electricity Maps](https://www.electricitymaps.com/) (Carbon Intensity)                |
| **Tooling**       | [Bun](https://bun.sh/), [ESLint](https://eslint.org/)                                                                                    |

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or higher)
*   [Bun](https://bun.sh/) (or `npm`/`yarn`)
*   [Supabase Account](https://supabase.com/) & [Supabase CLI](https://supabase.com/docs/guides/cli)
*   **Bayou API Key**: Sign up for a free developer account at [Bayou](https://www.bayou.energy/).
*   **Electricity Maps API Key**: Get a free key from [Electricity Maps](https://www.electricitymaps.com/free-api/).

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/leasesense-main.git
cd leasesense-main
```

### 2. Install Dependencies

This project uses **Bun** as the primary package manager.

```bash
bun install
```
*Alternatively, you can use `npm install` or `yarn`.*

### 3. Set Up Supabase Backend

This is the most critical step. Ensure you have the Supabase CLI installed (`bunx supabase --version`) and are logged in (`bunx supabase login`).

**a. Link Your Supabase Project**

```bash
# Replace YOUR_PROJECT_ID with the one from your Supabase project dashboard
bunx supabase link --project-ref YOUR_PROJECT_ID
```

**b. Create Database Tables**

Execute the following SQL queries in your Supabase dashboard's SQL Editor to create the necessary tables.

Go to `Database` -> `SQL Editor` -> `+ New query` and run this script:

```sql
-- Create custom types
CREATE TYPE public.user_type AS ENUM ('renter', 'shop');
CREATE TYPE public.metric_type AS ENUM ('kwh_per_sqft', 'avg_monthly_kwh', 'avg_monthly_cost');
CREATE TYPE public.recommendation_status AS ENUM ('seen', 'interested', 'dismissed');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_type public.user_type NOT NULL,
  address text NULL,
  sq_ft integer NULL,
  utility_provider text NULL,
  bayou_customer_id text NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile." ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Profiles are viewable by users." ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Create benchmarks table
CREATE TABLE public.benchmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  benchmark_type public.user_type NOT NULL,
  metric public.metric_type NOT NULL,
  value real NOT NULL,
  period text NOT NULL,
  data_source text NOT NULL,
  CONSTRAINT benchmarks_pkey PRIMARY KEY (id)
);
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Benchmarks are viewable by everyone." ON public.benchmarks FOR SELECT USING (true);

-- Create user_actions table
CREATE TABLE public.user_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  recommendation_id text NOT NULL,
  status public.recommendation_status NOT NULL DEFAULT 'seen'::public.recommendation_status,
  CONSTRAINT user_actions_pkey PRIMARY KEY (id),
  CONSTRAINT user_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own actions." ON public.user_actions FOR ALL USING (auth.uid() = user_id);
```

**c. Set Environment Variables**

Create a `.env` file in the project root by copying the example:

```bash
cp .env.example .env
```

Now, fill in your Supabase frontend keys in the `.env` file:
```env
# .env

VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

Next, set the **backend secrets** for your Supabase Edge Functions. These are not stored in the `.env` file. Run these commands in your terminal:
```bash
# Get this from your Supabase Project Settings > API
bunx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Get these from your third-party service dashboards
bunx supabase secrets set BAYOU_API_KEY="YOUR_BAYOU_API_KEY"
bunx supabase secrets set BAYOU_DOMAIN="api.bayou.energy" # Use this unless you have a custom domain
bunx supabase secrets set ELECTRICITY_MAPS_API_KEY="YOUR_ELECTRICITY_MAPS_KEY"
```

**d. Deploy Edge Functions**
```bash
bunx supabase functions deploy
```
This command deploys all functions from the `supabase/functions` directory to your project.

### 4. Run the Application

You're all set! Start the development server:

```bash
bun run dev
```
The application will be available at `http://localhost:8080`.

## 🤝 Contributing

We welcome contributions of all kinds! Whether you're fixing a bug, adding a new feature, or improving the documentation, your help is appreciated.

1.  **Fork the repository.**
2.  **Create a new branch** (`git checkout -b feature/your-awesome-feature`).
3.  **Make your changes** and commit them (`git commit -m 'feat: Add some awesome feature'`).
4.  **Push to the branch** (`git push origin feature/your-awesome-feature`).
5.  **Open a Pull Request** and describe your changes.

## 🗺️ Roadmap

LeaseSense is an evolving platform. Here are some features we're planning for the future:

*   **Real Recommendation Engine**: Replace the mocked `generateRecommendations` function with a genuine AI model (e.g., using NILM) to provide tailored advice.
*   **"Impact Proof" Generation**: Implement the feature to generate and share printable certificates of energy savings.
*   **Expanded Utility Support**: Add more utility providers to the onboarding flow.
*   **Landlord/Property Manager View**: Create a separate dashboard for property managers to view aggregated, anonymized data for their buildings.
*   **Unit & E2E Testing**: Implement a comprehensive testing suite.

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgments

*   **Supabase**: For their incredible all-in-one backend platform.
*   **Bayou**: For making utility data accessible and easy to work with.
*   **Shadcn/UI** & **Radix UI**: For providing the building blocks for our beautiful UI.
*   **Poimandres (pmndrs)**: For the amazing React Three Fiber and Drei libraries that power our visualizations.
*   **Vite**: For a lightning-fast frontend tooling experience.
*   **Lovable**: For the initial project scaffolding.
