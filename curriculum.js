// BMU (BML Munjal University) Curriculum Database
export const BMU_PROGRAMS = {
  cse: {
    id: "cse",
    name: "B.Tech Computer Science & Engineering",
    school: "School of Engineering & Technology",
    totalCredits: 172,
    semesters: {
      1: {
      "sem": 1,
      "title": "Semester I (Foundation)",
      "credits": 20,
      "courses": [
            {
                  "code": "MTH101",
                  "name": "Calculus for Engineers",
                  "credits": 4,
                  "type": "Science Foundation",
                  "maxInternal": 50,
                  "maxEndSem": 50
            },
            {
                  "code": "CSE101",
                  "name": "Computer Programming using C",
                  "credits": 4,
                  "type": "Core Computing",
                  "maxInternal": 50,
                  "maxEndSem": 50
            }
      ]
}
    }
  }
};

export const BMU_GRADE_SCALE = [
  {
    "grade": "A+",
    "points": 10,
    "label": "Outstanding"
  },
  {
    "grade": "A",
    "points": 9,
    "label": "Excellent"
  }
];
