import express from 'express'; // Import express using ES6 import
import { saveSelections, getSelections, getDomains, getAllSelections } from '../controllers/studentSelectionController.js'; // Import the controller

const router = express.Router();
import { isAdmin, isAuthorized } from "../middlewares/auth.js";


router.use(isAuthorized);

// Route to save or update student selections
router.post('/selections', saveSelections);

// Route to fetch student selections
router.get('/selections', getSelections);

// Route to fetch static domains data
router.get('/domains', getDomains);

// Route to fetch all students' selections
router.get('/ALLselections',isAdmin, getAllSelections);

export default router; // Export router using ES6 export
