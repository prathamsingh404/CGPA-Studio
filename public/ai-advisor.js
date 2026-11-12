// AI Academic Advisor & Interactive Planner for BMU CSE

import { BMU_GRADE_SCALE, RELATIVE_PRESETS } from './curriculum.js';
import { solveEndSemMarks, calculateRequiredSGPA, calculateUpdatedCGPA } from './endsem-solver.js';

export class BMUAIAdvisor {
  constructor(geminiApiKey = null) {
    this.geminiApiKey = geminiApiKey;
    this.conversationHistory = [];
  }

  setApiKey(key) {
    this.geminiApiKey = key ? key.trim() : null;
  }

  // Generate deterministic deep academic analysis using the BMU curriculum and grading engine
  generateComprehensiveAnalysis(data) {
    const {
      currentCGPA,
      completedCredits,
      targetCGPA,
      semester,
      courses,
      cutoffs,
      presetId = "moderate"
    } = data;

    const totalSemCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
    const solverResult = solveEndSemMarks({
      currentCGPA,
      completedCredits,
      targetCGPA,
      courses,
      cutoffs,
      strategy: "credit_priority"
    });

    const reqSGPA = solverResult.requiredSGPA;
    const maxPossible = solverResult.maxAttainableCGPA;
    const isFeasible = reqSGPA <= 10.0;

    // Identify high impact courses (4-credit)
    const highCreditCourses = courses.filter(c => Number(c.credits) >= 4);
    const lowCreditCourses = courses.filter(c => Number(c.credits) <= 2);

    // Identify top vulnerability
    const highestRiskSubject = [...solverResult.subjectPlans].sort((a, b) => {
      const riskWeight = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1, SAFE: 0 };
      return (riskWeight[b.riskLevel] || 0) - (riskWeight[a.riskLevel] || 0) || (b.requiredEndSem - a.requiredEndSem);
    })[0];

    // Determine advice tone and action steps
    let assessmentSummary = "";
    if (reqSGPA > 10.0) {
      assessmentSummary = `⚠️ **Goal Math Check:** Reaching a ${targetCGPA.toFixed(2)} CGPA in this semester alone is mathematically unreachable because it requires an SGPA of **${reqSGPA.toFixed(2)}** (maximum possible is 10.00). If you score straight A+ (10.0 SGPA) in every single course this term, your maximum possible CGPA will rise to **${maxPossible.toFixed(2)}**. Plan for a 2-semester progression to cross ${targetCGPA.toFixed(2)}!`;
    } else if (reqSGPA >= 9.0) {
      assessmentSummary = `🎯 **High Ambition Target:** You need an SGPA of **${reqSGPA.toFixed(2)}** this semester. This leaves zero room for B-tier grades in your 4-credit courses. Focus on locking in minimum 40+/50 in your End-Sems for core theory courses.`;
    } else if (reqSGPA >= 8.0) {
      assessmentSummary = `✅ **Realistic & Highly Achievable:** You need an SGPA of **${reqSGPA.toFixed(2)}**. Consistent B+ and A grades in your core subjects will comfortably bring your cumulative CGPA up to **${targetCGPA.toFixed(2)}**.`;
    } else {
      assessmentSummary = `✨ **Comfortable Target:** You need an SGPA of **${reqSGPA.toFixed(2)}**. Maintain solid fundamentals and avoid unforced errors in submissions.`;
    }

    const recommendations = [
      `**Prioritize 4-Credit Powerhouses:** Subjects like ${highCreditCourses.map(c => `\`${c.name}\` (${c.credits}cr)`).join(', ')} carry **${Math.round((highCreditCourses.reduce((s, c) => s + c.credits, 0) / totalSemCredits) * 100)}%** of your total semester weight. Getting an A+ here gives 4x the impact of a 1-credit lab.`,
      `**Relative Grading Advantage:** Under BMU's statistical model (${RELATIVE_PRESETS[presetId]?.label || 'Moderate Exam'}), if the cohort finds the end-sem tough, the class mean ($\mu$) will drop, lowering the raw marks required for Grade A and B+. Keep answering all high-weightage questions even if challenging.`,
      `**Watch Out for \`${highestRiskSubject ? highestRiskSubject.name : 'Struggling Subject'}\`:** With current internals of ${highestRiskSubject ? highestRiskSubject.internal : 0}/50, you need at least **${highestRiskSubject ? highestRiskSubject.requiredEndSem : 35}/50** in End-Sem to secure your target ${highestRiskSubject ? highestRiskSubject.targetGrade : 'B+'}. Make this your revision priority.`,
      `**Safety Buffer:** Aim for +4 marks above the calculated minimum cutoff in each end-sem exam to safeguard against statistical clustering at the grade boundaries.`
    ];

    return {
      solverResult,
      assessmentSummary,
      recommendations,
      highestRiskSubject
    };
  }

  // Answer free-form chat query
  async askAdvisor(userPrompt, contextData) {
    // If user provided a Gemini API Key, try live Gemini model
    if (this.geminiApiKey) {
      try {
        const geminiReply = await this.callGeminiAPI(userPrompt, contextData);
        if (geminiReply) return geminiReply;
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local academic advisor:", err);
      }
    }

    // High intelligence local academic reasoning engine
    return this.generateLocalAIResponse(userPrompt, contextData);
  }

  generateLocalAIResponse(prompt, data) {
    const p = prompt.toLowerCase();
    const {
      currentCGPA = 7.5,
      completedCredits = 40,
      targetCGPA = 8.5,
      courses = [],
      cutoffs = [],
      presetId = "moderate"
    } = data || {};

    const totalSemCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0) || 20;
    const reqResult = calculateRequiredSGPA(currentCGPA, completedCredits, targetCGPA, totalSemCredits);
    const solverResult = solveEndSemMarks({
      currentCGPA,
      completedCredits,
      targetCGPA,
      courses,
      cutoffs,
      strategy: "credit_priority"
    });

    if (p.includes("relative") || p.includes("grading") || p.includes("bell") || p.includes("curve")) {
      return `### How BMU's Relative Grading System Works:
1. **Statistical Normalization:** BMU uses a normal Gaussian distribution ($\mu, \sigma$) for courses with 30+ students.
2. **Class Mean ($\mu$) Anchor:** The class average score anchors the **Grade B** (7 Grade Points) / **B+** boundary.
3. **Cutoffs Formula:**
   - **A+ (10 pts):** Total marks $\\ge \\mu + 1.5\\sigma$ (Top 5-10% cohort)
   - **A (9 pts):** Between $\\mu + 1.0\\sigma$ and $\\mu + 1.5\\sigma$
   - **B+ (8 pts):** Between $\\mu + 0.5\\sigma$ and $\\mu + 1.0\\sigma$
   - **B (7 pts):** Around the class median
   - **D (4 pts):** Minimum passing grade ($\ge 35$ or $\mu - 2.0\sigma$)
4. **Key Advantage:** If an exam is notoriously tough (e.g. Mean drops to 48), scoring 68/100 can easily yield an **A** or **A+**, whereas in absolute grading it would only be a B!`;
    }

    if (p.includes("plan") || p.includes("end-sem") || p.includes("marks needed") || p.includes("target")) {
      return `### 🎯 Your End-Sem Target Breakdown:
- **Current CGPA:** ${currentCGPA} (${completedCredits} Credits)
- **Target CGPA:** ${targetCGPA}
- **Required Semester SGPA:** **${reqResult.requiredSGPA.toFixed(2)}**
- **Feasibility:** ${reqResult.statusMessage}

#### 📋 Minimum End-Sem Targets (Assuming 50 Internal + 50 End-Sem):
${solverResult.subjectPlans.map(s => `- **${s.name}** (${s.credits} cr): Need **${s.requiredEndSem}/50** in End-Sem ➔ Target **Grade ${s.targetGrade}** (${s.targetGP} pts)`).join('\n')}

💡 **Strategy Tip:** Put 60% of your prep time into your 4-credit courses (${courses.filter(c => c.credits >= 4).map(c => c.name).slice(0, 3).join(', ')}).`;
    }

    if (p.includes("what if") || p.includes("if i get") || p.includes("risk") || p.includes("fail")) {
      return `### 🔍 Sensitivity & What-If Analysis:
- **Credit Weight Sensitivity:** Every 1 grade point drop in a **4-credit course** (e.g. A to B+) reduces your semester SGPA by **${(4 / totalSemCredits).toFixed(2)}** points.
- **In a 2-credit course**, a 1 grade point drop only impacts your SGPA by **${(2 / totalSemCredits).toFixed(2)}** points.
- **Backlog Guard:** At BMU, a total score below minimum threshold (< 35 or < Mean - 2.0σ) results in an **F (Repeat)** grade (0 points), severely dragging down both SGPA and CGPA. Ensure you never leave any end-sem questions blank!`;
    }

    if (p.includes("percentage") || p.includes("convert") || p.includes("formula")) {
      const pct = (targetCGPA * 10).toFixed(1);
      return `### 📐 BMU Official Formula & Percentage Conversion:
- **SGPA Formula:** $\\text{SGPA} = \\frac{\\sum (\\text{Credits}_i \\times \\text{GradePoints}_i)}{\\sum \\text{Credits}_i}$
- **CGPA Formula:** $\\text{CGPA} = \\frac{\\sum (\\text{All Credits} \\times \\text{Earned Points})}{\\sum \\text{All Credits}}$
- **CGPA to Percentage Conversion:** $\\text{Percentage} = \\text{CGPA} \\times 10$
  - Target CGPA **${targetCGPA}** equates to **${pct}%** equivalence under BMU academic regulations.`;
    }

    // Default response
    return `### 💡 BMU Academic Advisor Guidance:
To reach your target CGPA of **${targetCGPA}** from your current **${currentCGPA}** across **${completedCredits}** credits:
1. You need an SGPA of **${reqResult.requiredSGPA.toFixed(2)}** in this semester's **${totalSemCredits}** credits.
2. ${reqResult.statusMessage}
3. Check the **[End-Sem Planner]** tab to view the exact marks required out of 50 for each subject based on your current internal scores!
4. Feel free to ask: *"What if the exam mean drops to 50?"*, *"Which subject is highest priority?"*, or *"Explain relative grading bell curve."*`;
  }

  // Call official Gemini API if key is supplied
  async callGeminiAPI(userPrompt, data) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`;

    const systemInstruction = `You are the specialized AI Academic Advisor for BML Munjal University (BMU), specifically for B.Tech Computer Science & Engineering students.
BMU uses a 10-point relative grading scale: A+ (10), A (9), B+ (8), B (7), C+ (6), C (5), D (4, minimum pass), F (0).
Courses evaluate 50% Internal Assessment + 50% End-Term Exam (Total 100).
Grades follow a normal distribution bell curve with Mean (mu) and Standard Deviation (sigma).
Current student context:
Current CGPA: ${data.currentCGPA || 7.5}, Completed Credits: ${data.completedCredits || 40}, Target CGPA: ${data.targetCGPA || 8.5}.
Be concise, encouraging, mathematically accurate, and provide concrete mark targets and study priorities.`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nStudent Query: ${userPrompt}` }]
        }
      ]
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text;
  }
}

