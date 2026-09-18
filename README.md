# Luma
**Customer Service for the Digital Economy**

Luma is an online customer delivery and intelligence platform designed to connect the customer journey with internal operations of a company. It utilizes social media, smart queues, online payments, document verification, and collaboration across teams.

By saving the customer's time and energy while returning insights and customer approval, Luma allows for 24-hour round-the-clock service delivery.

Built by **Team Luma** for the **Hackaholics (Wema Bank)** hackathon.

## The Problem
Experiences in many institutions—especially "legacy" institutions like schools, banks, and hospitals—are heavily fragmented. Customers often wait in physical queues, discover document problems only after reaching a branch, make payments through separate channels, and repeatedly ask the same questions on social media. Meanwhile, different branches independently solve the same operational problems without sharing knowledge.

## The Solution: One Connected Customer Service Delivery Experience
Luma brings these fragmented processes together into one cohesive ecosystem. Though the application provides specialized views depending on the user's role (Customer vs. Staff/Management), it functions as a single, connected product.

### The Core Modules
1. **Social Studio:** A social media management dashboard tied to an AI service for analytics, content idea generation, and helping social media managers quickly resolve customer complaints. It monitors customer questions, sentiment, and trends, translating conversations into actionable insights.
2. **Smart Queue:** Allows customers to select institutions, services, and branches, book convenient slots, and track their digital queue tickets with live estimated waiting times—reducing unnecessary physical waiting.
3. **Document Verification:** Customers can upload required documents (IDs, transcripts, etc.) from home. The system provides immediate visual status (Verified, Processing, Action Required, Rejected) using AI/OCR for preliminary verification.
4. **Payments:** Integrated payments using Wema Bank's ALATPay API. Customers can securely pay processing fees during their journey (e.g., when uploading documents) and receive immediate confirmation linked to their service.
5. **Branch Connect:** An internal collaboration platform where branch staff and teams share successful strategies, challenges, customer trends, and solutions, ensuring no branch has to solve an operational problem from scratch.
6. **Luma Intelligence Dashboard:** A management command center that aggregates data across all modules—showing active queues, wait times, document verification statuses, service demands, and cross-branch insights.

## User Roles
Luma provides tailored experiences for three key roles:

- **Customer:** Queue booking, tracking, document uploads, payments, and feedback submission.
- **Company Staff/Social Media Manager:** Social Studio monitoring, live queue management, customer request handling, document review, and Branch Connect collaboration.
- **Management/Admin:** Intelligence dashboard analytics, branch performance tracking, and cross-branch insights.

## Customer Journey Example (Business Account Opening)
1. Customer selects "Business Account Opening" and chooses a branch.
2. Books a queue/appointment slot.
3. Uploads required documents and tracks verification status.
4. Pays required processing fees via the integrated ALATPay modal.
5. Receives confirmation and visits the branch when notified.
6. Submits feedback upon completion.
7. Internal systems analyze feedback; Social Studio identifies trends (e.g., document confusion) and suggests an FAQ campaign; Branch Connect shares a previously successful solution from another branch, ultimately reflecting improved metrics on the Intelligence Dashboard.

## Technical Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Architecture:** Component-based frontend, mock data structures ready for API/PostgreSQL integration.

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```

Navigate to the local URL (usually `http://localhost:5173/`) in your browser to interact with the prototype.
