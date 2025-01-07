import mongoose from 'mongoose'; // Import mongoose using ES6 import

const studentSelectionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  selections: [
    {
      domain: { type: String, required: true }, // Domain name (e.g., "Cloud Computing")
      subdomains: [
        {
          subdomain: { type: String, required: true }, // Subdomain name (e.g., "AWS")
          topics: [{ type: String, required: true }], // Topics (e.g., ["EC2", "S3", "Lambda"])
        },
      ],
    },
  ],
});

const StudentSelection = mongoose.model('StudentSelection', studentSelectionSchema); // Define model

export default StudentSelection; // Export model using ES6 export
