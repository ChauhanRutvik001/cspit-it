// Sample data creation script for testing the complaint system
// Run this after connecting to MongoDB to create sample complaints

import Complaint from "../models/complaint.js";

const sampleComplaints = [
  {
    title: "Mobile phone usage during placement test",
    description: "Some students were using mobile phones during the technical assessment round of XYZ company. This is unfair to others who followed the rules properly.",
    category: "Cheating in Placement Drive",
    priority: "High",
    status: "Resolved",
    adminResponse: "Thank you for reporting this. We have reviewed the CCTV footage and taken appropriate action. New measures have been implemented to ensure fair testing environment.",
    isPublic: true,
    resolvedAt: new Date('2024-10-20')
  },
  {
    title: "Unfair treatment by faculty during interview",
    description: "A faculty member was showing favoritism to certain students during mock interviews, giving them hints and extra time while being strict with others.",
    category: "Faculty Related", 
    priority: "Medium",
    status: "Under Review",
    adminResponse: "",
    isPublic: false
  },
  {
    title: "Placement drive information not shared properly",
    description: "Information about ABC company's placement drive was only shared with a few students. Many eligible students missed the opportunity due to lack of communication.",
    category: "Placement Process",
    priority: "High", 
    status: "Resolved",
    adminResponse: "We have updated our communication process to ensure all eligible students receive placement notifications via email and college portal. A new notification system has been implemented.",
    isPublic: true,
    resolvedAt: new Date('2024-10-25')
  },
  {
    title: "Infrastructure issues in computer lab",
    description: "Many computers in lab 3 are not working properly, making it difficult for students to practice coding for placement tests.",
    category: "Infrastructure",
    priority: "Medium",
    status: "Pending"
  },
  {
    title: "Student copying answers during online test",
    description: "During the online aptitude test for DEF company, I noticed some students were clearly getting answers from external sources. This affects the fair selection process.",
    category: "Cheating in Placement Drive",
    priority: "Critical",
    status: "Resolved",
    adminResponse: "Investigation completed. We have implemented additional monitoring measures and updated our online test security protocols. Thank you for maintaining academic integrity.",
    isPublic: true,
    resolvedAt: new Date('2024-10-28')
  }
];

export async function createSampleComplaints() {
  try {
    console.log("Creating sample complaints...");
    
    const createdComplaints = [];
    
    for (const complaintData of sampleComplaints) {
      const complaintId = Complaint.generateComplaintId();
      
      const complaint = new Complaint({
        ...complaintData,
        complaintId
      });
      
      const savedComplaint = await complaint.save();
      createdComplaints.push(savedComplaint);
      
      console.log(`✅ Created complaint: ${complaintId} - ${complaintData.title}`);
    }
    
    console.log(`\n🎉 Successfully created ${createdComplaints.length} sample complaints!`);
    
    return createdComplaints;
    
  } catch (error) {
    console.error("❌ Error creating sample complaints:", error);
    throw error;
  }
}

// Uncomment and run this if you want to create sample data
// createSampleComplaints().then(() => {
//   console.log("Sample data creation completed!");
//   process.exit(0);
// }).catch((error) => {
//   console.error("Error:", error);
//   process.exit(1);
// });