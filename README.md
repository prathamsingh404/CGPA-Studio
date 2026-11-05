# BMU CGPA Studio • Relative Grading System & End-Sem AI Planner

A fully functional, high-precision CGPA calculation, relative grading simulation, and AI-powered End-Sem planning system engineered specifically for **BML Munjal University (BMU)** students (B.Tech Computer Science & Engineering and related engineering tracks).

Designed with the **Aura Neo-Brutalist technical grid aesthetic** (inspired by `https://tide-retail-commerce-system-1.aura.build/`).

---

## 🌟 Key Capabilities

### 1. BMU Relative Grading Engine (Not Absolute!)
* **Statistical Normal Distribution $\mathcal{N}(\mu, \sigma)$**: Calibrated according to BMU's official Grade Moderation Committee guidelines for cohorts of 30+ students.
* **10-Point Scale Mapping**:
  * **A+ (10 pts)**: Outstanding ($\ge \mu + 1.5\sigma$, ~top 5–10% of cohort)
  * **A (9 pts)**: Excellent ($\mu + 1.0\sigma$ to $\mu + 1.5\sigma$)
  * **B+ (8 pts)**: Very Good ($\mu + 0.5\sigma$ to $\mu + 1.0\sigma$)
  * **B (7 pts)**: Good / Core Class Median ($\mu - 0.2\sigma$ to $\mu + 0.5\sigma$)
  * **C+ (6 pts)**: Adequate ($\mu - 0.8\sigma$ to $\mu - 0.2\sigma$)
  * **C (5 pts)**: Average Passing ($\mu - 1.4\sigma$ to $\mu - 0.8\sigma$)
  * **D (4 pts)**: Minimum Passing Grade ($\mu - 2.0\sigma$, floor $\ge 35$)
  * **F (0 pts)**: Fail / Repeat ($< 35$ or $< \mu - 2.0\sigma$)
* **Interactive Gaussian Bell Curve Lab**: Live HTML5 canvas rendering the probability density curve, color-coded grade zones, cutoffs, and an interactive pointer showing your current score and percentile rank.
* **Exam Difficulty Calibration**:
  * *Moderate Paper* ($\mu = 62, \sigma = 14$)
  * *Tough Paper* ($\mu = 48, \sigma = 13$ — lower cutoffs for top grades)
  * *High-Scoring Paper* ($\mu = 75, \sigma = 11$)
  * *Absolute Grading Scale* (automatic fallback for batches $< 30$ students: $93, 85, 75, 65, 55, 46, 40$)
* **Real Section Cohort Modeler**: Paste real marks from your classmates or quiz averages to auto-calculate the section's empirical $\mu$ and $\sigma$.

---

### 2. End-Sem Marks Reverse Solver (As Requested in Image)
Answers the exact question:
> *"What is the minimum grade and end-sem marks I need in each subject to reach my target CGPA?"*

* **Target SGPA Formula**:
  $$\text{Required Sem SGPA} = \frac{\text{Target CGPA} \times (\text{Completed Credits} + \text{Sem Credits}) - (\text{Current CGPA} \times \text{Completed Credits})}{\text{Sem Credits}}$$
* **Course-by-Course Reverse Solver**: Takes your continuous internal assessment marks (out of 50 or 60) and determines the exact marks needed in each End-Sem exam out of 50 to secure that target grade.
* **Three Solver Strategies**:
  1. **Credit Priority (High ROI)**: Pushes for higher grades (A/A+) in 4-credit courses (DSA, DBMS, OS) where grade points have 4x the impact, easing the pressure on lower-credit courses.
  2. **Balanced Effort**: Distributes required grade points evenly across the cohort.
  3. **Internal Strength**: Prioritizes courses where your internal scores are already strong.
* **Safety Buffers & Risk Levels**: Flags courses with `CRITICAL`, `HIGH`, `MODERATE`, `LOW`, or `SAFE` risk tags and calculates how many marks cushion you have before dropping a grade.

---

### 3. Interactive AI Academic Advisor & Step-by-Step Interview
* **"Ask Me One at a Time" Wizard Flow**:
  Matches the exact conversational interview requested:
  1. *Step 1*: Current CGPA and completed credits.
  2. *Step 2*: Target CGPA.
  3. *Step 3*: Semester subjects & credit distribution confirmation.
  4. *Step 4*: Internal marks in each course.
  5. *Step 5*: Grade-to-point table & exam difficulty review.
  6. *Output*: Instant personalized **End-Sem Victory Roadmap**!
* **AI Chat Copilot**:
  * Understands BMU academic regulations, percentage conversion ($\text{CGPA} \times 10$), credit weights, and backlog rules.
  * Supports free-form questions like:
    * *"What if the exam mean drops to 50?"*
    * *"Which courses carry the highest credit risk?"*
    * *"Can I still get an 8.5 CGPA with a B in Operating Systems?"*
  * Supports optional **Google Gemini API Key** for open-ended generative chat or uses the high-precision built-in offline engine.

---

### 4. Official BMU B.Tech CSE Curriculum Preloaded
* Preloaded with all 8 semesters of **BML Munjal University B.Tech Computer Science & Engineering**:
  * **Semester 1**: Calculus, C Programming, Basic Electrical & Electronics, Mechanical Elements, Communication, Design Thinking, Ethics (20 Credits)
  * **Semester 2**: Linear Algebra, Probability & Statistics, Python Programming, Physics, Environmental Studies, Joy of Engg (20 Credits)
  * **Semester 3**: DSA, Discrete Maths, Digital Logic, OOP Java/C++, Economics for Engineers, Critical Thinking (21 Credits)
  * **Semester 4**: DBMS, Operating Systems, COA, Design & Analysis of Algorithms, Automata, Minor Project (21 Credits)
  * **Semester 5**: Computer Networks, AI & Machine Learning, Software Engineering, Program Elective I, Open Elective I, AI Spine Capstone (20 Credits)
  * **Semester 6**: Cyber Security & Cryptography, Compiler Design, Program Electives II & III, Open Elective II, Comprehensive Design Project II, Practice School Prep (21 Credits)
  * **Semester 7**: Advanced Electives IV & V, Open Elective III, Capstone Major Project Phase I (16 Credits)
  * **Semester 8**: Practice School / Corporate Internship (12 Credits)
* Support for custom course addition, deletion, and editing.

---

## 🚀 How to Run

### Method 1: Local Server (Already Running!)
The application is currently served locally at:
👉 **[http://localhost:3000](http://localhost:3000)**

You can also run:
```bash
npm start
# or
node server.js
```

### Method 2: Zero-Dependency Direct Open
Simply double-click or open `index.html` directly in any web browser (Chrome, Edge, Firefox, Safari). No installation or build step needed.

---

## 🎨 Aura Neo-Brutalist Design Tokens
* Background: Technical Millimeter Canvas (`24px` grid) with ambient neon glow.
* Borders: Sharp `2px solid #0A0A0A` neo-brutalist stroke.
* Drop Shadows: High-contrast `4px 4px 0px #0A0A0A` hard offset.
* Color Accents:
  * Neon Yellow (`#FFE600`) — System status and brand marks.
  * Electric Pink (`#FF5CA8`) — Primary action CTAs and hero emphasis.
  * Mint Green (`#00E599`) — High performance & A+ grade pill.
  * Cyan (`#00D8F6`) — Statistical metrics & Bell Curve highlights.

