// BMU (BML Munjal University) Curriculum Database
// B.Tech Computer Science & Engineering (CSE) and Related Branches

export const BMU_PROGRAMS = {
  cse: {
    id: "cse",
    name: "B.Tech Computer Science & Engineering",
    school: "School of Engineering & Technology (SOET)",
    university: "BML Munjal University, Gurugram",
    totalCredits: 172,
    semesters: {
      1: {
        sem: 1,
        title: "Semester I (Foundation)",
        credits: 20,
        courses: [
          { code: "MTH101", name: "Calculus for Engineers", credits: 4, type: "Science Foundation", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE101", name: "Computer Programming using C", credits: 4, type: "Core Computing", maxInternal: 50, maxEndSem: 50 },
          { code: "EEE101", name: "Basic Electrical & Electronics Engg.", credits: 4, type: "Engineering Foundation", maxInternal: 50, maxEndSem: 50 },
          { code: "MEC101", name: "Elements of Mechanical Engineering", credits: 3, type: "Engineering Foundation", maxInternal: 50, maxEndSem: 50 },
          { code: "ENG101", name: "Communication & Writing Skills", credits: 2, type: "AEC", maxInternal: 50, maxEndSem: 50 },
          { code: "DES101", name: "Design Thinking & Joy of Engineering", credits: 2, type: "Perspective", maxInternal: 50, maxEndSem: 50 },
          { code: "ETH101", name: "Engineering Ethics & Values", credits: 1, type: "VAC", maxInternal: 50, maxEndSem: 50 }
        ]
      },
      2: {
        sem: 2,
        title: "Semester II (Core Foundations)",
        credits: 20,
        courses: [
          { code: "MTH102", name: "Linear Algebra & Differential Equations", credits: 4, type: "Science Foundation", maxInternal: 50, maxEndSem: 50 },
          { code: "MTH103", name: "Probability & Applied Statistics", credits: 3, type: "Science Foundation", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE102", name: "Python Programming & Problem Solving", credits: 4, type: "Core Computing", maxInternal: 50, maxEndSem: 50 },
          { code: "PHY101", name: "Engineering Physics with Optics", credits: 4, type: "Basic Science", maxInternal: 50, maxEndSem: 50 },
          { code: "ENV101", name: "Environmental Studies & Sustainability", credits: 2, type: "AEC", maxInternal: 50, maxEndSem: 50 },
          { code: "PRJ102", name: "Joy of Engineering Hands-on Project", credits: 3, type: "Experiential Project", maxInternal: 60, maxEndSem: 40 }
        ]
      },
      3: {
        sem: 3,
        title: "Semester III (Computing Foundations)",
        credits: 21,
        courses: [
          { code: "CSE201", name: "Data Structures and Algorithms", credits: 4, type: "Core Computing", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE202", name: "Discrete Mathematical Structures", credits: 4, type: "Core Science", maxInternal: 50, maxEndSem: 50 },
          { code: "ECE201", name: "Digital Logic Design & Microprocessors", credits: 4, type: "Hardware Core", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE203", name: "Object Oriented Programming (Java/C++)", credits: 4, type: "Core Computing", maxInternal: 50, maxEndSem: 50 },
          { code: "HUM201", name: "Economics for Engineers", credits: 3, type: "Management Core", maxInternal: 50, maxEndSem: 50 },
          { code: "HUM202", name: "Critical Thinking & Perspectives", credits: 2, type: "AEC", maxInternal: 50, maxEndSem: 50 }
        ]
      },
      4: {
        sem: 4,
        title: "Semester IV (Systems & Architecture)",
        credits: 21,
        courses: [
          { code: "CSE204", name: "Database Management Systems (DBMS)", credits: 4, type: "Core Computing", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE205", name: "Operating Systems", credits: 4, type: "Systems Core", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE206", name: "Computer Organization & Architecture", credits: 4, type: "Hardware Core", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE207", name: "Design & Analysis of Algorithms", credits: 4, type: "Core Theory", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE208", name: "Theory of Computation & Automata", credits: 3, type: "Core Theory", maxInternal: 50, maxEndSem: 50 },
          { code: "PRJ204", name: "Minor Design Project / Community Action", credits: 2, type: "Experiential Project", maxInternal: 60, maxEndSem: 40 }
        ]
      },
      5: {
        sem: 5,
        title: "Semester V (AI Spine & Specializations)",
        credits: 20,
        courses: [
          { code: "CSE301", name: "Computer Networks & Protocols", credits: 4, type: "Systems Core", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE302", name: "Artificial Intelligence & Machine Learning", credits: 4, type: "AI Spine Core", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE303", name: "Software Engineering & Agile Methods", credits: 3, type: "Core Computing", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE31X", name: "Program Elective I (Cloud / Full-Stack)", credits: 3, type: "Track Elective", maxInternal: 50, maxEndSem: 50 },
          { code: "OPE301", name: "Open Elective I (Interdisciplinary)", credits: 3, type: "Open Elective", maxInternal: 50, maxEndSem: 50 },
          { code: "PRJ301", name: "AI Spine Applied Capstone Mini-Project", credits: 3, type: "Experiential Project", maxInternal: 60, maxEndSem: 40 }
        ]
      },
      6: {
        sem: 6,
        title: "Semester VI (Advanced Tech & Cyber)",
        credits: 21,
        courses: [
          { code: "CSE304", name: "Cyber Security & Modern Cryptography", credits: 4, type: "Core Security", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE305", name: "Compiler Design & Code Optimization", credits: 3, type: "Core Theory", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE32X", name: "Program Elective II (Big Data / NLP)", credits: 3, type: "Track Elective", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE33X", name: "Program Elective III (IoT / Blockchain)", credits: 3, type: "Track Elective", maxInternal: 50, maxEndSem: 50 },
          { code: "OPE302", name: "Open Elective II", credits: 3, type: "Open Elective", maxInternal: 50, maxEndSem: 50 },
          { code: "PRJ302", name: "Comprehensive Design Project II", credits: 3, type: "Experiential Project", maxInternal: 60, maxEndSem: 40 },
          { code: "PS101", name: "Practice School Preparation & Internship", credits: 2, type: "Internship Prep", maxInternal: 100, maxEndSem: 0 }
        ]
      },
      7: {
        sem: 7,
        title: "Semester VII (Advanced Specialization)",
        credits: 16,
        courses: [
          { code: "CSE41X", name: "Program Elective IV (Deep Learning / MLOps)", credits: 3, type: "Advanced Elective", maxInternal: 50, maxEndSem: 50 },
          { code: "CSE42X", name: "Program Elective V (Distributed Systems)", credits: 3, type: "Advanced Elective", maxInternal: 50, maxEndSem: 50 },
          { code: "OPE401", name: "Open Elective III", credits: 3, type: "Open Elective", maxInternal: 50, maxEndSem: 50 },
          { code: "PRJ401", name: "Capstone Major Project – Phase I", credits: 7, type: "Major Capstone", maxInternal: 70, maxEndSem: 30 }
        ]
      },
      8: {
        sem: 8,
        title: "Semester VIII (Practice School / Thesis)",
        credits: 12,
        courses: [
          { code: "PS201", name: "Practice School / Full-Semester Corporate Internship", credits: 12, type: "Industry Immersion", maxInternal: 100, maxEndSem: 0 }
        ]
      }
    }
  },
  ai_ds: {
    id: "ai_ds",
    name: "B.Tech CSE with AI & Data Science",
    school: "School of Engineering & Technology",
    university: "BML Munjal University, Gurugram",
    totalCredits: 172,
    semesters: {
      3: {
        sem: 3,
        title: "Semester III (Data & Foundations)",
        credits: 21,
        courses: [
          { code: "AID201", name: "Data Structures & Computational Thinking", credits: 4, type: "Core", maxInternal: 50, maxEndSem: 50 },
          { code: "MTH201", name: "Linear Algebra & Optimization for AI", credits: 4, type: "Math Core", maxInternal: 50, maxEndSem: 50 },
    }
  }
};
