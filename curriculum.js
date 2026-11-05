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
    }
  }
};
