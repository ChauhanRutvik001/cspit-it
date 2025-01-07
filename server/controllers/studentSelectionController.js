import StudentSelection from "../models/StudentSelection.js"; // Import the model using ES6 import

const saveSelections = async (req, res) => {
  try {
    const { studentId, selections } = req.body;

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
        return res
          .status(400)
          .json({
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
          return res
            .status(400)
            .json({
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
    const { studentId } = req.params;

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

export { saveSelections, getSelections, getDomains }; // Export using ES6 export
