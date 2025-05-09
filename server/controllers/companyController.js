import Company from "../models/company.js";
import User from "../models/user.js";
import { generateNotification } from "./notification.controller.js";

// Create a new company
export const createCompany = async (req, res) => {
  try {
    const { name, domain, description, salary, website, linkedin } = req.body;
    const company = new Company({ 
      name, 
      domain, 
      description, 
      salary: {
        min: salary.min,
        max: salary.max
      },
      website,
      linkedin
    });
    await company.save();
    
    // Send notifications to all students about the new company
    try {
      // Find all users with role "student"
      const students = await User.find({ role: "student" });
      
      // Create notification promises for all students
      const notificationPromises = students.map(student => 
        generateNotification(
          student._id,
          `New company ${name} has posted job opportunities in ${domain} with salary range of ${salary.min}-${salary.max}`,
          {
            type: "company",
            relatedId: company._id,
            relatedModel: "Company"
          }
        )
      );
      
      // Send notifications in parallel
      await Promise.all(notificationPromises);
      console.log(`Notifications sent to ${students.length} students about new company ${name}`);
    } catch (notificationError) {
      console.error("Error sending company notifications:", notificationError);
      // Don't fail the API call if notifications have an issue
    }
    
    res.status(201).json({ message: "Company created successfully", company });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all companies
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a single company by ID
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a company
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a company by ID
export const updateCompany = async (req, res) => {
  try {
    const { name, domain, description, salary, website, linkedin } = req.body;
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        domain, 
        description,
        salary: {
          min: salary.min,
          max: salary.max
        },
        website,
        linkedin
      },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ message: "Company updated successfully", updatedCompany });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const approveCompany = async (req, res) => {
  try {
    console.log("Received request:", req.body);

    const { studentId, companyId } = req.body;
    if (!studentId || !companyId) {
      return res.status(400).json({ message: "Missing studentId or companyId" });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (!company.approvedBy.includes(studentId)) {
      company.approvedBy.push(studentId);
      await company.save();
    }

    res.status(200).json({ message: "Company approved successfully", company });
  } catch (error) {
    console.error("Error approving company:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
