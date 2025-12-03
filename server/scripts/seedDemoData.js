import mongoose from "mongoose";
import { config } from "dotenv";
import User from "../models/user.js";
import Complaint from "../models/complaint.js";
import StudentSelection from "../models/StudentSelection.js";

config();

const MONGO_URI = process.env.MONGO_URI;

const counsellorNames = [
  { name: "Priyanka", id: "priyanka", email: "priyanka.it@charusat.ac.in" },
  { name: "Purvi", id: "purvi", email: "purvi.it@charusat.ac.in" },
  { name: "Dhaval", id: "dhaval", email: "dhaval.it@charusat.ac.in" },
];

function pad(num, size) {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

async function createCounsellors() {
  const created = [];
  for (const c of counsellorNames) {
    let existing = await User.findOne({ id: c.id });
    if (!existing) {
      const doc = await User.create({
        name: c.name,
        id: c.id,
        email: c.email,
        password: "Pass@123",
        role: "counsellor",
        firstTimeLogin: false,
        firstTimeData: false,
      });
      created.push(doc);
    } else {
      created.push(existing);
    }
  }
  return created;
}

async function createStudents(counsellors) {
  const students = [];
  // Override names for specific IDs
  const overrideNames = {
    "22it017": "DAVE BHAVIK PARSHOTAM",
  };
  // Ordered name list to map sequentially for 22it001 onward
  const orderedNames = [
    "AAL ANKIT LIMBABHAI",
    "ANGHAN SHRUTI CHETANBHAI",
    "ANSHUMAN PRAJAPATI",
    "AVAIYA ANSHUL JAGDISHBHAI",
    "BAGTHALIYA MANAV VIPULBHAI",
    "BHARADAVA GAURANG NILESHBHAI",
    "BHATT ASHIRWAD NIKHILKUMAR",
    "BHATT JAY ASHISHBHAI",
    "BHIMANI DHRUVIBEN PRAKASHBHAI",
    "BHUVA DEV SUNIL",
    "BILIMORIA JEET CHETANBHAI",
    "BODRA JAY KALPESHBHAI",
    "CHAKLASIYA TIRTH BHARATBHAI",
    "CHAUDHARY JASMINKUMAR GANESHBHAI",
    "CHAUHAN RUTVIKBHAI BHARATBHAI",
    "CHOVATIYA ANANT BHARATBHAI",
    "DAVE DHRUVIL SATYAM",
    "DEDANIYA SUJAL DINESHBHAI",
    "DESAI HEMIL DINESHBHAI",
    "DESAI MADHAV NARANBHAI",
    "DESAI PRIYANSHI BHARAT",
    "DESAI VISHWA NIMESHBHAI",
    "DEVGANIYA ARPIT BHARATBHAI",
    "DHANANI DHRUVIN RAMESHBHAI",
    "DHANDHA HARSH JIGNESHBHAI",
    "DHOLARIYA LINA BHAVESHBHAI",
    "DONDA PRINCE DEVRAJBHAI",
    "DUA HARSH VINODKUMAR",
    "GADHIYA RONAK MUKESHBHAI",
    "GALANI PRIYANSHU SANJAYBHAI",
    "GODHANI TIRTH MAHESHBHAI",
    "GOHEL JAYKUMAR JAYESHBHAI",
    "GOSWAMI SHUBHAMBHARTI KAILASBHARTI",
    "HADIYA HARSH DHIRAJLAL",
    "HARSORA HIMANSHU VINODKUMAR",
    "HARWANI VIDHI DEEPAKKUMAR",
    "HIRANI JEEL HITENDRABHAI",
    "HIRAPARA YASH HARESHBHAI",
    "HIRPARA DEV RASIKBHAI",
    "HIRPARA PRATVI DINESHKUMAR",
    "HIRVANIA OM JAYESHKUMAR",
    "JADAV MOHIT RAJUBHAI",
    "JADEJA SHRIVARDHANSINH BRIJRAJSINH",
    "KHUNT JAIMIN",
    "JANI DIVYAM VIRAL",
    "JIVANI DEV JAYPRAKASH",
    "KAKADIYA KRISH NITINBHAI",
    "KAKADIYA YASHKUMAR DINESHBHAI",
    "KALARIYA TAMANNA KAMLESH",
    "KALSARIYA JENIL ARVINDBHAI",
    "KANSARA SOHAM BHARATKUMAR",
    "KAPADIA PRIYANK CHIRAGBHAI",
    "KARIA KAVYA HIRENBHAI",
    "KASODARIYA HARSHEEL RAMESHBHAI",
    "KASUNDRA DHARMKUMAR VASANTBHAI",
    "KATHROTIYA DHRUV VIMALKUMAR",
    "KATHROTIYA PRUSHTI RAKESHKUMAR",
    "KHENI KEYUR ZAVERBHAI",
    "KIRANBHAI BARAIYA",
  ];
  const femaleNames = new Set([
    "ANGHAN SHRUTI CHETANBHAI",
    "BHIMANI DHRUVIBEN PRAKASHBHAI",
    "DHOLARIYA LINA BHAVESHBHAI",
    "HARWANI VIDHI DEEPAKKUMAR",
    "KALARIYA TAMANNA KAMLESH",
    "KARIA KAVYA HIRENBHAI",
    "KATHROTIYA PRUSHTI RAKESHKUMAR",
    "DESAI PRIYANSHI BHARAT",
    "HIRANI JEEL HITENDRABHAI",
  ]);
  for (let i = 1; i <= 60; i++) {
    const roll = `22it${pad(i, 3)}`;
    let existing = await User.findOne({ id: roll });
    if (!existing) {
      const name = overrideNames[roll] || orderedNames[i - 1] || `Student ${i}`;
      const email = `${roll}@charusat.edu.in`;
      const student = await User.create({
        name,
        id: roll,
        email,
        password: "Pass@123",
        role: "student",
        firstTimeLogin: false,
        firstTimeData: false,
      });
      students.push(student);
    } else {
      students.push(existing);
    }
  }

  // Assign counsellors after creation to bypass pre-save restriction
  for (const s of students) {
    let counsellorIdx;
    const num = parseInt(s.id.slice(-3), 10);
    if (num >= 1 && num <= 20) counsellorIdx = 0; // Priyanka
    else if (num >= 21 && num <= 40) counsellorIdx = 1; // Purvi
    else counsellorIdx = 2; // Dhaval

    const batch = (num >= 1 && num <= 20) ? "a1" : (num >= 21 && num <= 40) ? "b1" : "c1";
    const avatar = (s.id.toLowerCase() === "22it017") ? "http://localhost:5173/img2.avif" : undefined;

    const isFemale = femaleNames.has(s.name);
    // Generate unique birth date (years 2003-2005) and address per student
    const year = 2003 + (num % 3); // 2003, 2004, 2005 cycling
    const month = (num * 7) % 12; // 0-11 varied
    const day = ((num * 11) % 28) + 1; // 1-28 to avoid invalid dates
    const birthDate = new Date(year, month, day);
    const address = `House ${100 + num}, Street ${num}, CSPIT Campus, Changa`;
    await User.findByIdAndUpdate(s._id, {
      $set: {
        "profile.semester": 7,
        "profile.batch": batch,
        "profile.gender": isFemale ? "Female" : "Male",
        "profile.birthDate": birthDate,
        "profile.permanentAddress": address,
        "profile.mobileNo": `9${pad(num, 9)}`,
        "profile.github": `https://github.com/demo-${s.id}`,
        "profile.linkedIn": `https://linkedin.com/in/demo-${s.id}`,
        "profile.counsellor": counsellors[counsellorIdx]._id,
        ...(avatar ? { "profile.avatar": avatar } : {}),
      },
    });
  }

  return students;
}

async function createDemoComplaints(students, counsellors) {
  const samples = [
    {
      title: "Issue with Placement Process",
      description: "Interview slot overlap observed in Round 2.",
      category: "Placement Process",
      priority: "Medium",
      isPublic: true,
    },
    {
      title: "Infrastructure Concern",
      description: "Projector not working in Lab 3 during test.",
      category: "Infrastructure",
      priority: "Low",
      isPublic: false,
    },
    {
      title: "Faculty Related",
      description: "Doubt clearing session timing clash with company pre-placement talk.",
      category: "Faculty Related",
      priority: "High",
      isPublic: true,
    },
  ];

  for (let i = 0; i < samples.length; i++) {
    const c = samples[i];
    const handledBy = counsellors[i % counsellors.length]._id;
    const complaintId = Complaint.generateComplaintId();
    const exists = await Complaint.findOne({ complaintId });
    if (!exists) {
      await Complaint.create({
        complaintId,
        title: c.title,
        description: c.description,
        category: c.category,
        priority: c.priority,
        status: "Under Review",
        handledBy,
        isPublic: c.isPublic,
      });
    }
  }
}

// Domain catalog aligned to typical UI choices
const DOMAIN_CATALOG = [
  {
    domain: "Web Development",
    subdomains: [
      { subdomain: "Frontend", topics: ["HTML", "CSS", "JavaScript", "React"] },
      { subdomain: "Backend", topics: ["Node.js", "Express", "REST APIs", "JWT"] },
    ],
  },
  {
    domain: "Data Science",
    subdomains: [
      { subdomain: "Python", topics: ["Pandas", "NumPy", "Matplotlib"] },
      { subdomain: "ML", topics: ["Regression", "Classification", "Clustering"] },
    ],
  },
  {
    domain: "Cloud Computing",
    subdomains: [
      { subdomain: "AWS", topics: ["EC2", "S3", "Lambda"] },
      { subdomain: "Azure", topics: ["VM", "Blob", "Functions"] },
    ],
  },
  {
    domain: "DevOps",
    subdomains: [
      { subdomain: "CI/CD", topics: ["GitHub Actions", "Pipelines"] },
      { subdomain: "Containers", topics: ["Docker", "Kubernetes"] },
    ],
  },
  {
    domain: "Mobile Development",
    subdomains: [
      { subdomain: "Android", topics: ["Kotlin", "Jetpack"] },
      { subdomain: "Cross-Platform", topics: ["React Native", "Flutter"] },
    ],
  },
  {
    domain: "Cybersecurity",
    subdomains: [
      { subdomain: "Network", topics: ["Firewalls", "IDS/IPS"] },
      { subdomain: "AppSec", topics: ["OWASP", "AuthN/AuthZ"] },
    ],
  },
];

function pickUnique(arr, count) {
  const indices = new Set();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * arr.length));
  }
  return [...indices].map(i => arr[i]);
}

async function createStudentSelections(students) {
  for (const s of students) {
    const existing = await StudentSelection.findOne({ studentId: s._id });
    if (existing) continue;

    const count = 2 + (parseInt(s.id.slice(-3), 10) % 2); // 2 or 3 domains
    const chosenDomains = pickUnique(DOMAIN_CATALOG, count);
    const selections = chosenDomains.map(d => ({
      domain: d.domain,
      subdomains: d.subdomains.map(sd => ({ subdomain: sd.subdomain, topics: sd.topics }))
    }));

    await StudentSelection.create({
      studentId: s._id,
      selections,
    });
  }
}

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_URI missing in environment");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  try {
    const counsellors = await createCounsellors();
    console.log(`Counsellors ready: ${counsellors.map(c => c.name).join(", ")}`);

    const students = await createStudents(counsellors);
    console.log(`Students ready: ${students.length}`);

    await createDemoComplaints(students, counsellors);
    await createStudentSelections(students);
    console.log("Demo complaints created");
    console.log("Student selections created");

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

main();
