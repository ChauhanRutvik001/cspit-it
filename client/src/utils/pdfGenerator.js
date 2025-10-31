import jsPDF from 'jspdf';

export const generateCareerGuidePDF = (studentData, recommendations) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Helper function to add text with line breaks
  const addTextWithBreaks = (text, x, y, maxWidth) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * 7);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (currentY, requiredSpace = 30) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage();
      return 20;
    }
    return currentY;
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Personalized Career Guidance Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated for: ${studentData.name}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Student Profile Section
  yPosition = checkNewPage(yPosition);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Profile', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const profileData = [
    `Name: ${studentData.name}`,
    `Branch: ${studentData.branch}`,
    `Current Status: ${studentData.currentYear}`,
    `CGPA/Percentage: ${studentData.cgpa}`,
    `Placement Status: ${studentData.placementStatus}`,
    `Skills: ${studentData.skills.join(', ')}`,
    `Interests: ${studentData.interests.join(', ')}`,
    `Exams Prepared: ${studentData.examsPrepared.join(', ')}`,
    `Preferred Location: ${studentData.preferredLocation}`,
    `Salary Expectation: ${studentData.salaryExpectation}`
  ];

  profileData.forEach(item => {
    yPosition = addTextWithBreaks(item, 20, yPosition, pageWidth - 40);
    yPosition += 3;
  });

  if (studentData.careerGoals) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    yPosition = addTextWithBreaks('Additional Notes:', 20, yPosition, pageWidth - 40);
    doc.setFont('helvetica', 'normal');
    yPosition = addTextWithBreaks(studentData.careerGoals, 20, yPosition, pageWidth - 40);
  }

  yPosition += 20;

  // Recommendations Section
  recommendations.forEach((rec, index) => {
    yPosition = checkNewPage(yPosition, 80);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Recommendation ${index + 1}: ${rec.path}`, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Priority and Timeline
    doc.text(`Priority: ${rec.priority} | Timeline: ${rec.timeline}`, 20, yPosition);
    yPosition += 7;
    
    // Reason
    doc.setFont('helvetica', 'bold');
    doc.text('Why this path:', 20, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    yPosition = addTextWithBreaks(rec.reason, 20, yPosition, pageWidth - 40);
    yPosition += 5;
    
    // Immediate Actions
    doc.setFont('helvetica', 'bold');
    doc.text('Immediate Action Plan:', 20, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    
    rec.immediateActions.forEach((action, actionIndex) => {
      yPosition = addTextWithBreaks(`${actionIndex + 1}. ${action}`, 25, yPosition, pageWidth - 50);
      yPosition += 3;
    });
    
    // Additional details based on recommendation type
    if (rec.companies) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Target Companies:', 20, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      yPosition = addTextWithBreaks(rec.companies.join(', '), 20, yPosition, pageWidth - 40);
    }
    
    if (rec.cutoffs) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Exam Cutoffs:', 20, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      Object.entries(rec.cutoffs).forEach(([exam, cutoff]) => {
        yPosition = addTextWithBreaks(`${exam}: ${cutoff}`, 25, yPosition, pageWidth - 50);
        yPosition += 3;
      });
    }
    
    yPosition += 15;
  });

  // Emergency Resources Section
  yPosition = checkNewPage(yPosition, 60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('🆘 Emergency Resources & Support', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const emergencyResources = [
    '📞 Career Counseling Helpline: +91 99999 99999',
    '📧 Email Support: career.help@cdpc.edu',
    '🌐 Online Resources: www.cdpc-careers.edu/resources',
    '📅 Free Consultation: Book at www.cdpc-careers.edu/book',
    '💬 WhatsApp Support: +91 88888 88888',
    '🎯 Skill Assessment: www.cdpc-careers.edu/assessment'
  ];

  emergencyResources.forEach(resource => {
    yPosition = addTextWithBreaks(resource, 20, yPosition, pageWidth - 40);
    yPosition += 5;
  });

  // Important Links Section
  yPosition += 10;
  yPosition = checkNewPage(yPosition, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('🔗 Important Links & Exam Portals', 20, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  const importantLinks = [
    'GATE Registration: https://gate.iitm.ac.in/',
    'UPSC ESE: https://www.upsc.gov.in/',
    'GPSC: https://gpsc.gujarat.gov.in/',
    'Startup India: https://startupindia.gov.in/',
    'Job Portals: https://www.naukri.com/ | https://www.linkedin.com/',
    'Skill Development: https://www.coursera.org/ | https://www.udemy.com/',
    'Government Jobs: https://www.sarkariresult.com/',
    'Higher Studies: https://www.universitygrants.gov.in/'
  ];

  importantLinks.forEach(link => {
    yPosition = addTextWithBreaks(link, 20, yPosition, pageWidth - 40);
    yPosition += 5;
  });

  // Monthly Action Plan
  yPosition += 10;
  yPosition = checkNewPage(yPosition, 60);
  doc.setFont('helvetica', 'bold');
  doc.text('📅 3-Month Action Plan', 20, yPosition);
  yPosition += 10;

  const monthlyPlan = [
    {
      month: 'Month 1: Foundation',
      tasks: [
        'Complete skill assessment and identify gaps',
        'Update resume and LinkedIn profile',
        'Research target companies/institutions',
        'Start preparing for relevant exams'
      ]
    },
    {
      month: 'Month 2: Skill Building',
      tasks: [
        'Complete online courses for skill gaps',
        'Work on 2-3 portfolio projects',
        'Practice coding/technical problems daily',
        'Network with professionals in target field'
      ]
    },
    {
      month: 'Month 3: Application & Networking',
      tasks: [
        'Apply to relevant positions/programs',
        'Attend virtual job fairs and events',
        'Schedule informational interviews',
        'Continue exam preparation with mock tests'
      ]
    }
  ];

  doc.setFont('helvetica', 'normal');
  monthlyPlan.forEach(month => {
    yPosition = checkNewPage(yPosition, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(month.month, 20, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    
    month.tasks.forEach((task, index) => {
      yPosition = addTextWithBreaks(`${index + 1}. ${task}`, 25, yPosition, pageWidth - 50);
      yPosition += 3;
    });
    yPosition += 5;
  });

  // Footer
  yPosition = checkNewPage(yPosition, 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This report is generated by CDPC AI Career Guidance System. For updates, visit our website.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`Career_Guide_${studentData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Additional utility function for quick actions
export const generateQuickActionChecklist = (recommendations) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('✅ Quick Action Checklist', 20, 20);
  
  let yPosition = 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  recommendations.forEach((rec, index) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${rec.path}:`, 20, yPosition);
    yPosition += 7;
    
    doc.setFont('helvetica', 'normal');
    rec.immediateActions.forEach(action => {
      doc.text(`☐ ${action}`, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  });
  
  doc.save(`Action_Checklist_${new Date().toISOString().split('T')[0]}.pdf`);
};