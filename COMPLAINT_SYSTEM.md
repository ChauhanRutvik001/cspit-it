# Anonymous Student Complaint System

## Overview
A secure and anonymous complaint system that allows students to report issues without revealing their identity, ensuring they can speak up about problems without fear of retaliation.

## Features

### 🎯 Complete Anonymity
- No student information is stored or linked to complaints
- Anonymous complaint IDs for tracking status
- No way to trace back to the student who submitted

### 📝 Student Features
1. **Submit Complaint**
   - Anonymous complaint submission form
   - Multiple categories (cheating, misconduct, faculty issues, etc.)
   - Priority levels (Low, Medium, High, Critical)
   - Get unique tracking ID for status updates

2. **Track Complaint Status**
   - Check complaint status using tracking ID
   - View admin responses when available
   - No login required for tracking

3. **Public Complaints Board**
   - View resolved complaints and their responses
   - Learn from previous issues and solutions
   - Filtered by category for easy browsing

### 🛠️ Admin Features
1. **Complaint Management**
   - View all complaints with filters
   - Update complaint status and responses
   - Internal notes for admin use (not visible to students)
   - Mark complaints as public to share solutions

2. **Statistics Dashboard**
   - Overview of complaint counts by status
   - Category-wise distribution
   - Monthly trends
   - Quick insights for administrators

## Technology Stack

### Backend
- **Model**: `complaint.js` - MongoDB schema for complaints
- **Controller**: `complaint.controller.js` - Business logic for complaint operations
- **Routes**: `complaint.routes.js` - API endpoints
- **Middleware**: Authentication and admin authorization

### Frontend
- **Student Interface**: `StudentComplaintForm.jsx` - Multi-tab interface for students
- **Admin Interface**: `AdminComplaintManagement.jsx` - Comprehensive admin dashboard
- **Navigation**: Integrated into existing header navigation

## API Endpoints

### Public/Student Endpoints
```
GET  /api/v1/complaints/public                    # Get public complaints board
POST /api/v1/complaints/submit                    # Submit new complaint (auth required)
GET  /api/v1/complaints/status/:complaintId       # Track complaint status
```

### Admin Endpoints
```
GET    /api/v1/complaints/admin/all               # Get all complaints (admin only)
PUT    /api/v1/complaints/admin/:complaintId      # Update complaint (admin only)
GET    /api/v1/complaints/admin/stats             # Get statistics (admin only)
DELETE /api/v1/complaints/admin/:complaintId      # Delete complaint (admin only)
```

## Complaint Categories
- Unfair Behavior
- Cheating in Placement Drive
- Mobile Phone Usage During Exam
- Misconduct
- Faculty Related
- Placement Process
- Infrastructure
- Other

## Status Flow
1. **Pending** - Initial status after submission
2. **Under Review** - Admin is investigating
3. **Resolved** - Issue has been addressed
4. **Closed** - Complaint closed without resolution

## Security Features
- Anonymous complaint IDs using timestamp and random string
- No personal information stored
- Secure admin-only access for management
- Optional public sharing of resolved complaints (admin controlled)

## Usage

### For Students
1. Navigate to `/complaints`
2. Fill out the anonymous complaint form
3. Save the provided complaint ID for tracking
4. Check status anytime using the tracking tab
5. Browse public complaints for similar issues

### For Admins
1. Navigate to `/admin/complaints`
2. View and filter complaints
3. Click on any complaint to view details and respond
4. Update status and provide responses
5. Optionally make resolved complaints public
6. View statistics for insights

## Database Schema
```javascript
{
  complaintId: String (unique),      // Anonymous tracking ID
  title: String,                     // Complaint title
  description: String,               // Detailed description
  category: String,                  // Predefined categories
  priority: String,                  // Low/Medium/High/Critical
  status: String,                    // Pending/Under Review/Resolved/Closed
  adminResponse: String,             // Admin's response
  handledBy: ObjectId,               // Admin who handled (internal)
  resolvedAt: Date,                  // When resolved
  isPublic: Boolean,                 // Show on public board
  internalNotes: String,             // Admin-only notes
  relatedPlacementDrive: ObjectId,   // Optional reference
  timestamps: true                   // createdAt, updatedAt
}
```

## Benefits
- **Student Safety**: Anonymous reporting prevents retaliation
- **Transparency**: Public board shows how issues are resolved
- **Accountability**: Admins must respond to complaints
- **Insights**: Statistics help identify recurring problems
- **Trust Building**: Students see that their concerns matter