Here is the complete, updated version with the roles and flows you described integrated cleanly:

---

We are Assistant Teachers, around 110 people in total, and we will have around 8 Teachers, along with one Head Teacher / Super Teacher.

Our Teacher has given us a task: we need to approach normal students and collect their details, such as which domain they work in, how much experience they have, their name, and their phone number.

The other important part is that I will provide you with some content from a book. We will later use this content to finalize/evaluate their vertical. The content explains how we can evaluate a vertical using 4 steps, 8 tests, specific goals, and other criteria. You will understand the complete evaluation framework from the content I provide later. Based on that framework, we will determine whether a particular domain is actually beneficial and worth pursuing or not.

All of the students will have to complete this task — around 110 students in total.

### Technology Stack

My plan is to build this application using my own tech stack:

- **Frontend**: Next.js  
- **Styling**: Tailwind CSS  
- **Backend**: FastAPI  
- **AI**: OpenAI Agent SDK for simple AI agents (we can discuss details later)  
- **Database**: Supabase PostgreSQL  
- **Authentication**: Simple email verification initially (Google OAuth and OTP can be added later)  
- **Monitoring/Logging**: Sentry for application and AI logs  

### User Roles & Hierarchy

The application will have the following roles in this clear hierarchy:

**Super Admin → Super Teacher → Lead Teacher → Elite User → Member**

1. **Super Admin** (Me)  
   Full system control and oversight.

2. **Super Teacher**  
   Selected / asked during the login flow.  
   Has high-level visibility over Lead Teachers and everything under them.

3. **Lead Teacher**  
   Similar to Elite Users in flow: after logging in, the Lead Teacher must select their batch/shift:  
   - Morning  
   - Afternoon  
   - Evening  

   After selecting the shift, the rest of the Lead Teacher dashboard and features become available.

4. **Elite User** (≈110 people)  
   The students responsible for collecting data from normal students (Members).

5. **Member**  
   Normal students whose data is collected.

### Elite User Flow

When an Elite User logs in, they must select which batch they belong to:

- Morning  
- Afternoon  
- Evening  

After selecting the batch, they can proceed.

Each Elite User should have a **Plus (+)** button to add/collect a new Member.

They will enter:

- Name  
- Domain  
- Experience  
- Phone Number  
- Description (optional)  
- Any other required fields  

Once saved, the Member is permanently associated with that Elite User’s account.

### AI Analysis (for Elite Users)

After saving a Member, the Elite User can run the AI Agent.

The AI Agent evaluates the Member’s domain/vertical using the evaluation framework content I will provide later (4 steps, 8 tests, goals, criteria, etc.).

The AI output should include:

- Summary  
- Where the domain is suitable  
- Where it is not suitable  
- Why it is not suitable  
- Areas that need improvement  
- How those areas can be improved  
- Overall evaluation  
- Reasons why the domain is suitable (if it is)  
- Reasons why the domain is not suitable (if it is not)

This feature can be called **AI Analysis**.

Elite Users can:

- View all their collected Members as cards/widgets on the dashboard  
- Open any Member’s detail page to see full details + AI Analysis / summary  
- See their own performance on the Elite Leaderboard  

### Elite Leaderboard

There will be a competition among Elite Users based on:

- Number of Members collected  
- Number of authentic Members  
- Overall performance quality  

Each Elite User can see their own ranking and performance.

### Lead Teacher Flow

After logging in and selecting Morning / Afternoon / Evening, a Lead Teacher can see:

- All Elite Users assigned to them  
- How many Members each Elite User has collected  
- Each Elite User’s performance  
- Elite User leaderboard (under them)  
- Collected Member data  
- AI analysis results  

They get a detailed overview of everything under their responsibility.

### Super Teacher

The Super Teacher (selected during login) has access to:

- All Lead Teachers  
- How many Elite Users are under each Lead Teacher  
- How many Members each Lead Teacher’s Elite Users have collected  
- Teacher-wise leaderboard  
- Elite-wise leaderboard  
- Overall performance metrics  

### Super Admin (Me)

Complete control over the entire system:

- Total users and login activity  
- Super Teachers, Lead Teachers, Elite Users, Members  
- User roles and details  
- User activity logs  
- Full CRUD operations  
- Assign / change user roles  
- Create, update, delete users  
- Overall system data and configuration  

### AI Features for Higher Roles

Teachers (Lead Teachers), Super Teachers, and Super Admin should eventually have an AI assistant that can answer questions about the data, for example:

- Which Elite User has poor performance?  
- Which Elite User has collected the most authentic Members?  
- Which Elite Users have Members in more suitable domains?  

**Rate Limits (configurable by Super Admin):**

- Elite Users: e.g. 10 AI API calls per day (auto-resets daily)  
- Lead Teachers: e.g. 5 AI calls per 30 minutes (initially)  

These limits should be configurable from the Super Admin panel.

### AI Provider Strategy

We need one primary AI provider + one automatic fallback.

I will decide the final primary + fallback combination during architecture finalization (Gemini vs Agent Router, etc.).

The AI Agent must strictly use the domain/vertical evaluation content I will provide later.  
Tavily can be used when external/current web research is required.

### Logging & Monitoring

Use Sentry for:

- Application errors  
- AI failures  
- API errors  
- User actions  
- Agent execution issues  

Maintain detailed AI Agent execution logs:

- Which Member was analyzed  
- Who triggered the Agent  
- Timestamp  
- Result / success-failure status  
- Error details (if any)  
- AI provider used  
- API usage  

### Authentication

Keep the first version simple and fast:

- Proper email verification  
- OTP and Google OAuth can be added later  

### UI/UX Requirements

- Mobile-first  
- Clean, professional, modern, simple  
- Light color palette with proper color theory (avoid overusing dark blue, green, or random colors)  
- Consistent visual language  
- Easy navigation  
- Dashboards that make Members, performance, AI analysis, and rankings instantly clear  

### Development Constraint

I want the **initial version** ready in only **2 hours**.

Therefore:

- Keep the first version focused and MVP-style  
- Architecture should still be future-proof and scalable  
- Main focus order:  
  **Member Data Collection → AI Domain Evaluation → Elite Dashboard → Leaderboards → Lead Teacher / Super Teacher Monitoring → Super Admin Management**

The actual domain/vertical evaluation content will be provided next. That content will become the foundation for the AI Agent’s evaluation logic.

---

This version now clearly includes:

- Super Admin (you)  
- Super Teacher (selected on the login page)  
- Lead Teacher (must select Morning / Afternoon / Evening after login, same style as Elite)  
- Elite User (with batch selection)  
- Member  

and keeps the original hierarchy and all technical requirements intact.