import express from 'express'; // Import express using ES6 import
import { saveSelections, getSelections, getDomains, getAllSelections,getCounsellorStudentSelections } from '../controllers/studentSelectionController.js'; // Import the controller

const router = express.Router();
import { isAdmin, isAuthorized, isCounsellor } from "../middlewares/auth.js";


router.use(isAuthorized);

// Route to save or update student selections
router.post('/selections', saveSelections); //StudentSelectionPage.jsx

// Route to fetch student selections
router.get('/selections', getSelections); //StudentSelectionPage.jsx

// Route to fetch static domains data
router.get('/domains', getDomains); //StudentSelectionPage.jsx

// Route to fetch all students' selections
router.get('/ALLselections',isAdmin, getAllSelections);  //AllStudentSelections.jsx

router.get('/getCounsellorStudentSelections',isCounsellor, getCounsellorStudentSelections);  //AllStudentSelections.jsx

export default router; 
