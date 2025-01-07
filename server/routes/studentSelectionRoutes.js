import express from 'express'; // Import express using ES6 import
import { saveSelections, getSelections, getDomains } from '../controllers/studentSelectionController.js'; // Import the controller

const router = express.Router();
import { isAuthorized } from "../middlewares/auth.js";


router.use(isAuthorized);

// Route to save or update student selections
router.post('/selections', saveSelections);

// Route to fetch student selections
router.get('/selections/:studentId', getSelections);

// Route to fetch static domains data
router.get('/domains', getDomains);

export default router; // Export router using ES6 export
