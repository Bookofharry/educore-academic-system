import { KEYS, storageService } from '../services/storage';

export const seedData = () => {
  // Check if data already exists to avoid overwriting
  if (storageService.get(KEYS.USERS) && storageService.get(KEYS.USERS).length > 0) {
    return;
  }

  console.log("Initializing seed data...");

  // 1. Users (Demo Accounts)
  const users = [
    {
      id: 'admin1',
      name: 'System Administrator',
      email: 'admin@university.edu',
      password: 'admin123',
      role: 'ADMIN'
    },
    {
      id: 'lecturer1',
      name: 'Dr. John Doe',
      email: 'lecturer@university.edu',
      password: 'lecturer123',
      role: 'LECTURER'
    },
    {
      id: 'adviser1',
      name: 'Prof. Jane Smith',
      email: 'adviser@university.edu',
      password: 'adviser123',
      role: 'ADVISER'
    }
  ];
  storageService.set(KEYS.USERS, users);

  // 2. Departments
  const departments = [
    { id: 'dept1', code: 'CSC', name: 'Computer Science', faculty: 'Science' },
    { id: 'dept2', code: 'EEE', name: 'Electrical Engineering', faculty: 'Engineering' },
    { id: 'dept3', code: 'ACC', name: 'Accounting', faculty: 'Management Sciences' },
    { id: 'dept4', code: 'MED', name: 'Medicine and Surgery', faculty: 'Clinical Sciences' }
  ];
  storageService.set(KEYS.DEPARTMENTS, departments);

  // 3. Lecturers
  const lecturers = [
    { id: 'lect1', firstName: 'John', lastName: 'Doe', email: 'lecturer@university.edu', departmentId: 'dept1', title: 'Dr.' },
    { id: 'lect2', firstName: 'Jane', lastName: 'Smith', email: 'adviser@university.edu', departmentId: 'dept1', title: 'Prof.' },
    { id: 'lect3', firstName: 'Oluwaseun', lastName: 'Adeyemi', email: 'o.adeyemi@university.edu', departmentId: 'dept2', title: 'Dr.' },
    { id: 'lect4', firstName: 'Chukwudi', lastName: 'Okafor', email: 'c.okafor@university.edu', departmentId: 'dept2', title: 'Mr.' },
    { id: 'lect5', firstName: 'Aisha', lastName: 'Bello', email: 'a.bello@university.edu', departmentId: 'dept3', title: 'Mrs.' },
    { id: 'lect6', firstName: 'Emeka', lastName: 'Eze', email: 'e.eze@university.edu', departmentId: 'dept3', title: 'Dr.' },
    { id: 'lect7', firstName: 'Fatima', lastName: 'Umar', email: 'f.umar@university.edu', departmentId: 'dept4', title: 'Dr.' },
    { id: 'lect8', firstName: 'Samuel', lastName: 'Ojo', email: 's.ojo@university.edu', departmentId: 'dept1', title: 'Mr.' },
    { id: 'lect9', firstName: 'Grace', lastName: 'Okonkwo', email: 'g.okonkwo@university.edu', departmentId: 'dept4', title: 'Prof.' },
    { id: 'lect10', firstName: 'David', lastName: 'Peters', email: 'd.peters@university.edu', departmentId: 'dept2', title: 'Dr.' }
  ];
  storageService.set(KEYS.LECTURERS, lecturers);

  // 4. Courses
  const courses = [
    { id: 'crs1', code: 'CSC101', title: 'Introduction to Computer Science', creditUnit: 3, departmentId: 'dept1', level: 100, semester: 1 },
    { id: 'crs2', code: 'CSC102', title: 'Introduction to Programming', creditUnit: 3, departmentId: 'dept1', level: 100, semester: 2 },
    { id: 'crs3', code: 'CSC201', title: 'Data Structures and Algorithms', creditUnit: 3, departmentId: 'dept1', level: 200, semester: 1 },
    { id: 'crs4', code: 'CSC202', title: 'Computer Architecture', creditUnit: 2, departmentId: 'dept1', level: 200, semester: 2 },
    { id: 'crs5', code: 'EEE101', title: 'Basic Electrical Engineering I', creditUnit: 3, departmentId: 'dept2', level: 100, semester: 1 },
    { id: 'crs6', code: 'EEE102', title: 'Basic Electrical Engineering II', creditUnit: 3, departmentId: 'dept2', level: 100, semester: 2 },
    { id: 'crs7', code: 'ACC101', title: 'Principles of Accounting I', creditUnit: 3, departmentId: 'dept3', level: 100, semester: 1 },
    { id: 'crs8', code: 'ACC102', title: 'Principles of Accounting II', creditUnit: 3, departmentId: 'dept3', level: 100, semester: 2 },
    { id: 'crs9', code: 'MED101', title: 'Introduction to Medicine', creditUnit: 2, departmentId: 'dept4', level: 100, semester: 1 },
    { id: 'crs10', code: 'MTH101', title: 'General Mathematics I', creditUnit: 3, departmentId: 'dept1', level: 100, semester: 1 },
    { id: 'crs11', code: 'MTH102', title: 'General Mathematics II', creditUnit: 3, departmentId: 'dept1', level: 100, semester: 2 },
    { id: 'crs12', code: 'GST101', title: 'Use of English I', creditUnit: 2, departmentId: 'dept1', level: 100, semester: 1 },
    { id: 'crs13', code: 'GST102', title: 'Use of English II', creditUnit: 2, departmentId: 'dept1', level: 100, semester: 2 },
    { id: 'crs14', code: 'PHY101', title: 'General Physics I', creditUnit: 3, departmentId: 'dept2', level: 100, semester: 1 },
    { id: 'crs15', code: 'PHY102', title: 'General Physics II', creditUnit: 3, departmentId: 'dept2', level: 100, semester: 2 }
  ];
  storageService.set(KEYS.COURSES, courses);

  // 5. Academic Sessions
  const sessions = [
    { id: 'sess1', name: '2023/2024', status: 'COMPLETED' },
    { id: 'sess2', name: '2024/2025', status: 'ACTIVE' }
  ];
  storageService.set(KEYS.SESSIONS, sessions);

  // 6. Generate 50 Students programmatically
  const students = [];
  const firstNames = ['Oluwaseun', 'Chinedu', 'Amina', 'Ibrahim', 'Ngozi', 'Emeka', 'Fatima', 'Tunde', 'Chioma', 'Yusuf', 'Bola', 'Abubakar', 'Nneka', 'Babatunde', 'Zainab', 'Kelechi', 'Halima', 'Dayo', 'Bisi', 'Uche'];
  const lastNames = ['Adeyemi', 'Okafor', 'Bello', 'Eze', 'Umar', 'Ojo', 'Okonkwo', 'Peters', 'Oladipo', 'Nwosu', 'Danladi', 'Balogun', 'Okeke', 'Ibrahim', 'Lawal', 'Adeleke', 'Oni', 'Mustapha', 'Abiodun', 'Obi'];
  
  for (let i = 1; i <= 50; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const deptIndex = Math.floor(Math.random() * departments.length);
    const year = 2023 + Math.floor(Math.random() * 2); // 2023 or 2024
    const dept = departments[deptIndex];
    
    students.push({
      id: `stud${i}`,
      matricNumber: `${year}/${dept.code}/${String(i).padStart(4, '0')}`,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@student.school.edu`,
      phone: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      departmentId: dept.id,
      level: year === 2023 ? 200 : 100,
      admissionYear: year,
      adviserId: lecturers[Math.floor(Math.random() * lecturers.length)].id,
      status: 'ACTIVE'
    });
  }
  storageService.set(KEYS.STUDENTS, students);

  // Generate basic course registrations and allocations for demo
  const allocations = [
    { id: 'alloc1', lecturerId: 'lect1', courseId: 'crs1', sessionId: 'sess2', semester: 1 },
    { id: 'alloc2', lecturerId: 'lect1', courseId: 'crs2', sessionId: 'sess2', semester: 2 },
    { id: 'alloc3', lecturerId: 'lect3', courseId: 'crs5', sessionId: 'sess2', semester: 1 },
  ];
  storageService.set(KEYS.ALLOCATIONS, allocations);
  
  const registrations = [];
  const results = [];
  
  // Register some students to courses and give them some results
  students.forEach(student => {
    // Register 100 level students for 100 level courses in their dept
    const availableCourses = courses.filter(c => c.level === 100 && (c.departmentId === student.departmentId || c.departmentId === 'dept1' /* GST/MTH */));
    
    availableCourses.forEach(course => {
      // Registration
      registrations.push({
        id: `reg_${student.id}_${course.id}`,
        studentId: student.id,
        courseId: course.id,
        sessionId: student.admissionYear === 2023 ? 'sess1' : 'sess2',
        semester: course.semester
      });

      // Generate results if it's past session or semester 1 of current
      if (student.admissionYear === 2023 || course.semester === 1) {
        // Vary student performance logic
        const performanceType = parseInt(student.id.replace('stud', '')) % 5;
        // 0: Excellent, 1: Good, 2: Average, 3: Poor, 4: Random
        
        let caScore, examScore;
        
        if (performanceType === 0) {
          caScore = 20 + Math.floor(Math.random() * 11); // 20-30
          examScore = 50 + Math.floor(Math.random() * 21); // 50-70
        } else if (performanceType === 1) {
          caScore = 15 + Math.floor(Math.random() * 11); // 15-25
          examScore = 40 + Math.floor(Math.random() * 21); // 40-60
        } else if (performanceType === 2) {
          caScore = 10 + Math.floor(Math.random() * 11); // 10-20
          examScore = 30 + Math.floor(Math.random() * 21); // 30-50
        } else if (performanceType === 3) {
          caScore = 5 + Math.floor(Math.random() * 11); // 5-15
          examScore = 20 + Math.floor(Math.random() * 21); // 20-40 (High risk of failure)
        } else {
          caScore = Math.floor(Math.random() * 31); // 0-30
          examScore = Math.floor(Math.random() * 71); // 0-70
        }
        
        const totalScore = caScore + examScore;
        
        // Calculate grade according to specs
        let grade, gradePoint;
        if (totalScore >= 70) { grade = 'A'; gradePoint = 5; }
        else if (totalScore >= 60) { grade = 'B'; gradePoint = 4; }
        else if (totalScore >= 50) { grade = 'C'; gradePoint = 3; }
        else if (totalScore >= 45) { grade = 'D'; gradePoint = 2; }
        else if (totalScore >= 40) { grade = 'E'; gradePoint = 1; }
        else { grade = 'F'; gradePoint = 0; }
        
        results.push({
          id: `res_${student.id}_${course.id}`,
          studentId: student.id,
          courseId: course.id,
          sessionId: student.admissionYear === 2023 ? 'sess1' : 'sess2',
          semester: course.semester,
          caScore,
          examScore,
          totalScore,
          grade,
          gradePoint,
          qualityPoint: gradePoint * course.creditUnit
        });
      }
    });
  });
  
  storageService.set(KEYS.REGISTRATIONS, registrations);
  storageService.set(KEYS.RESULTS, results);

  // We will initialize settings, attendance and recommendations as empty arrays for now
  storageService.set(KEYS.ATTENDANCE, []);
  storageService.set(KEYS.RECOMMENDATIONS, []);
  
  storageService.set(KEYS.SETTINGS, {
    institutionName: 'Federal University of Technology',
    currentSessionId: 'sess2',
    currentSemester: 1
  });

  console.log("Seed data initialized.");
};

export const clearSeedData = () => {
  Object.values(KEYS).forEach(key => storageService.remove(key));
  console.log("All data cleared.");
};
