export const generateRecommendations = (riskData) => {
  const recommendations = [];

  // Base recommendation on overall risk level
  if (riskData.level === 'CRITICAL') {
    recommendations.push({
      type: 'URGENT',
      title: 'Mandatory Academic Counseling',
      description: 'Student must immediately schedule a meeting with their Academic Adviser and the Head of Department before registering for the next semester.'
    });
    recommendations.push({
      type: 'POLICY',
      title: 'Credit Load Reduction',
      description: 'Strictly limit course registration to a maximum of 12 credit units to allow focus on core failing subjects.'
    });
  } else if (riskData.level === 'HIGH') {
    recommendations.push({
      type: 'URGENT',
      title: 'Adviser Intervention Required',
      description: 'Student should be flagged for a mandatory check-in with their Academic Adviser.'
    });
    recommendations.push({
      type: 'POLICY',
      title: 'Suggested Credit Reduction',
      description: 'Recommend reducing course load by dropping 1-2 non-essential electives.'
    });
  } else if (riskData.level === 'MODERATE') {
    recommendations.push({
      type: 'STANDARD',
      title: 'Adviser Review',
      description: 'Adviser should review student progress at the mid-semester mark.'
    });
  } else {
    recommendations.push({
      type: 'SUCCESS',
      title: 'Maintain Current Trajectory',
      description: 'Student is performing well. No special intervention is required at this time.'
    });
  }

  // Factor-specific recommendations
  riskData.factors.forEach(factor => {
    if (factor.includes('CGPA is extremely low') || factor.includes('probation threshold')) {
      recommendations.push({
        type: 'ACADEMIC',
        title: 'Probation Recovery Program',
        description: 'Enroll student in the academic recovery workshop focusing on study skills and time management.'
      });
    }
    
    if (factor.includes('failed')) {
      recommendations.push({
        type: 'ACADEMIC',
        title: 'Course Retakes Registration',
        description: 'Prioritize registration for failed carry-over courses before adding new semester courses.'
      });
    }

    if (factor.includes('Attendance')) {
      recommendations.push({
        type: 'BEHAVIORAL',
        title: 'Attendance Monitoring',
        description: 'Place student on a weekly attendance monitoring list. Send warning letter if absence continues.'
      });
    }

    if (factor.includes('Continuous Assessment')) {
      recommendations.push({
        type: 'ACADEMIC',
        title: 'Peer Tutoring',
        description: 'Recommend the student joins a peer tutoring group for early intervention before final exams.'
      });
    }

    if (factor.includes('Declining GPA')) {
      recommendations.push({
        type: 'BEHAVIORAL',
        title: 'Well-being Check',
        description: 'A sudden decline in performance may indicate personal issues. Adviser should check on student well-being.'
      });
    }
  });

  return recommendations;
};
