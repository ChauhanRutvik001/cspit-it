import StudentSelection from "../models/StudentSelection.js"; // Import the model using ES6 import
import user from "../models/user.js";

// Save Student Selections
const saveSelections = async (req, res) => {
  try {
    const { selections } = req.body;

    const studentId = req.user.id; // Get student ID from token

    console.log(req.body); // Debugging: Log request body

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    if (!selections || !Array.isArray(selections)) {
      return res
        .status(400)
        .json({ message: "Selections must be an array (can be empty)." });
    }

    // Validate non-empty selections
    for (const selection of selections) {
      if (!selection.domain) {
        return res
          .status(400)
          .json({ message: "Each selection must have a domain." });
      }

      if (!selection.subdomains || !Array.isArray(selection.subdomains)) {
        return res.status(400).json({
          message: `Each domain must have subdomains (can be empty).`,
        });
      }

      for (const subdomain of selection.subdomains) {
        if (!subdomain.subdomain) {
          return res
            .status(400)
            .json({ message: "Each subdomain must have a name." });
        }

        if (!subdomain.topics || !Array.isArray(subdomain.topics)) {
          return res.status(400).json({
            message: `Topics for each subdomain must be an array (can be empty).`,
          });
        }
      }
    }

    // Check if a selection already exists for the student
    let studentSelection = await StudentSelection.findOne({ studentId });

    if (!studentSelection) {
      studentSelection = new StudentSelection({ studentId, selections });
    } else {
      studentSelection.selections = selections; // Update selections
    }

    await studentSelection.save();
    res.status(200).json({ message: "Selections saved successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error saving selections: ${error.message}` });
  }
};

// Fetch Student Selections
const getSelections = async (req, res) => {
  try {
    const studentId = req.user.id;
    // const { studentId } = req.params;

    // Validate required parameter
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    const studentSelection = await StudentSelection.findOne({ studentId });

    if (!studentSelection) {
      return res
        .status(404)
        .json({ message: "No selections found for this student." });
    }

    res.status(200).json(studentSelection);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching selections: ${error.message}` });
  }
};

export const getAllSelections = async (req, res) => {
  try {
    const { page = 1, limit = 10, order = "asc" } = req.query;
    console.log("hello");

    // Removed the search filter
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch all data with population
    const allSelections = await StudentSelection.find().populate(
      "studentId",
      "name id profile.avatar"
    );

    // Debugging: Log fetched data
    // console.log(allSelections);

    // Sort data manually based on populated field
    const sortedSelections = allSelections.sort((a, b) => {
      const nameA = a.studentId.id.toLowerCase();
      const nameB = b.studentId.id.toLowerCase();
      return order === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    // Paginate sorted data
    const paginatedSelections = sortedSelections.slice(
      skip,
      skip + limitNumber
    );

    const totalDocuments = allSelections.length;

    // Handle no selections found
    if (!paginatedSelections.length) {
      return res.status(404).json({ message: "No selections found." });
    }

    // Send successful response
    res.status(200).json({
      data: paginatedSelections,
      pagination: {
        totalDocuments,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalDocuments / limitNumber),
      },
    });
  } catch (error) {
    // Error handling
    res
      .status(500)
      .json({ message: `Error fetching selections: ${error.message}` });
  }
};

// Get Static Domains Data
const getDomains = (req, res) => {
  const staticData = [
    {
      domain: "Cloud Computing",
      subdomains: [
        {
          subdomain: "AWS",
          topics: ["EC2", "S3", "Lambda", "IAM", "CloudFormation", "RDS"],
        },
        {
          subdomain: "Microsoft Azure",
          topics: [
            "Azure VMs",
            "Blob Storage",
            "Azure AD",
            "Functions",
            "Kubernetes Service",
          ],
        },
        {
          subdomain: "Google Cloud Platform",
          topics: [
            "Compute Engine",
            "App Engine",
            "BigQuery",
            "Cloud Functions",
          ],
        },
        {
          subdomain: "Docker",
          topics: [
            "Containers",
            "Image Creation",
            "Docker Compose",
            "Networking",
          ],
        },
        {
          subdomain: "Terraform",
          topics: ["Infrastructure as Code", "Modules", "State Management"],
        },
        {
          subdomain: "Monitoring Tools",
          topics: ["CloudWatch", "Azure Monitor", "Prometheus"],
        },
      ],
    },
    {
      domain: "Mobile App Dev",
      subdomains: [
        {
          subdomain: "Java",
          topics: ["OOP Concepts", "Multi-threading", "Android SDK"],
        },
        {
          subdomain: "Flutter",
          topics: ["Widgets", "Dart Language", "State Management"],
        },
        {
          subdomain: "Firebase",
          topics: ["Realtime Database", "Authentication", "Cloud Messaging"],
        },
      ],
    },
    {
      domain: "Cybersecurity",
      subdomains: [
        {
          subdomain: "Wireshark",
          topics: ["Packet Capturing", "Protocol Analysis", "Filtering"],
        },
        {
          subdomain: "Metasploit",
          topics: ["Exploit Development", "Payload Delivery"],
        },
        {
          subdomain: "Burp Suite",
          topics: ["Web Application Testing", "Vulnerability Scanning"],
        },
      ],
    },
    {
      domain: "Machine Learning",
      subdomains: [
        {
          subdomain: "Python",
          topics: ["NumPy", "Pandas", "Scikit-learn Basics"],
        },
        {
          subdomain: "TensorFlow",
          topics: ["Neural Networks", "Model Training", "Deployment"],
        },
        {
          subdomain: "PyTorch",
          topics: ["Dynamic Computation Graphs", "Transfer Learning"],
        },
      ],
    },
    {
      domain: "Gaming",
      subdomains: [
        {
          subdomain: "Unity",
          topics: ["Game Object Management", "C# Scripting", "Animation"],
        },
        {
          subdomain: "Unreal Engine",
          topics: ["Blueprints", "Asset Management", "Game Physics"],
        },
        {
          subdomain: "Blender",
          topics: ["3D Modeling", "Animation", "Texturing"],
        },
      ],
    },
    {
      domain: "Software Testing",
      subdomains: [
        {
          subdomain: "Selenium",
          topics: ["Automated Browser Testing", "Test Scripts"],
        },
        {
          subdomain: "Postman",
          topics: ["API Testing", "Collections", "Scripting"],
        },
      ],
    },
    {
      domain: "Management",
      subdomains: [
        {
          subdomain: "Jira",
          topics: ["Task Management", "Workflow Automation", "Reporting"],
        },
        {
          subdomain: "Excel",
          topics: ["Formulas", "Pivot Tables", "Data Visualization"],
        },
        {
          subdomain: "Tableau",
          topics: [
            "Dashboard Creation",
            "Data Blending",
            "Storytelling with Data",
          ],
        },
      ],
    },
    {
      domain: "Full Stack Development",
      subdomains: [
        {
          subdomain: "HTML",
          topics: ["Semantic Tags", "Forms", "Accessibility"],
        },
        {
          subdomain: "CSS",
          topics: ["Flexbox", "Grid", "Responsive Design", "Animation"],
        },
        {
          subdomain: "JavaScript",
          topics: ["ES6 Features", "DOM Manipulation", "Event Handling"],
        },
        {
          subdomain: "React",
          topics: ["Components", "State Management", "React Hooks"],
        },
        {
          subdomain: "Node.js",
          topics: ["Express Framework", "Middleware", "REST APIs"],
        },
        {
          subdomain: "Git",
          topics: ["Branching", "Merging", "Version Control"],
        },
      ],
    },
  ];

  res.status(200).json(staticData);
};

export const getCounsellorStudentSelections = async (req, res) => {
  try {
    const { page = 1, limit = 10, order = "asc" } = req.query;
    const counsellorId = req.user.id; // Get counsellor ID from authenticated user
    console.log("Counsellor ID:", counsellorId);

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit parameter",
      });
    }

    // Find students associated with the counsellor
    const students = await user.find({
      role: "student",
      "profile.counsellor": counsellorId,
    }).select("_id");

    const studentIds = students.map(student => student._id);

    // Fetch selections only for these students
    const allSelections = await StudentSelection.find({ studentId: { $in: studentIds } })
      .populate("studentId", "name id profile.avatar");

    // Sort selections based on student ID
    const sortedSelections = allSelections.sort((a, b) => {
      const nameA = a.studentId.id.toLowerCase();
      const nameB = b.studentId.id.toLowerCase();
      return order === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    // Paginate sorted selections
    const paginatedSelections = sortedSelections.slice(skip, skip + limitNumber);
    const totalDocuments = allSelections.length;

    if (!paginatedSelections.length) {
      return res.status(404).json({ message: "No selections found." });
    }

    res.status(200).json({
      success: true,
      data: paginatedSelections,
      pagination: {
        totalDocuments,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalDocuments / limitNumber),
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching selections: ${error.message}` });
  }
};


export { saveSelections, getSelections, getDomains }; // Export using ES6 export
