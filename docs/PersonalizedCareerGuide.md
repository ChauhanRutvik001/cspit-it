# Personalized Career Guide Feature

## Overview
A comprehensive career guidance system specifically designed for Indian engineering students who are facing placement challenges or seeking career direction. This feature provides personalized recommendations based on student profiles and current situations.

## Key Features

### 1. Multi-Step Profile Collection
- **Step 1: Personal Information**
  - Full name and engineering branch
  - Current academic year/status
  - CGPA/Percentage
  - Placement status (including "not placed yet" scenarios)

- **Step 2: Skills & Preferences**
  - Technical skills assessment
  - Career interests selection
  - Exam preparation status
  - Location and salary preferences
  - Personal situation description

- **Step 3: Personalized Recommendations**
  - AI-driven career path suggestions
  - Priority-based recommendations
  - Actionable next steps

### 2. Specialized Support for Unplaced Students

#### Target Scenarios:
- **"Not placed yet - Need guidance"** - Primary focus group
- **"Have offers but looking for better options"** - Optimization seekers
- **"Preparing for competitive exams"** - Exam-focused students
- **"Considering higher studies"** - Academic pathway seekers
- **"Planning to start a business"** - Entrepreneurial minds

#### Tailored Recommendations Include:
1. **PSU/Government Jobs**
   - GATE, UPSC ESE, GPSC exam guidance
   - Updated cutoff scores for 2025
   - Target organizations by branch
   - Step-by-step preparation plan

2. **Private Sector Opportunities**
   - Off-campus placement strategies
   - Skill-building recommendations
   - Company-specific preparation
   - Resume and interview guidance

3. **Higher Studies Path**
   - M.Tech vs MBA decision support
   - Entrance exam preparation
   - Institution selection guidance
   - Financial planning assistance

4. **Entrepreneurship Journey**
   - Idea validation process
   - Incubator and funding information
   - Sector-specific opportunities
   - Government scheme guidance

### 3. Advanced Features

#### PDF Generation
- Comprehensive career guidance report
- Quick action checklist
- Monthly planning templates
- Resource compilation

#### Real-time Updates
- 2025 exam cutoffs and dates
- Current job market trends
- Government scheme information
- Industry-specific insights

#### Emergency Support
- Immediate help resources
- Career counseling contacts
- Skill assessment tools
- Job alert subscriptions

## Technical Implementation

### Components Structure
```
PersonalizedCareerGuide.jsx
├── Multi-step form with progress tracking
├── Dynamic recommendation engine
├── PDF generation integration
└── Emergency resources section

pdfGenerator.js
├── Comprehensive report generation
├── Quick checklist creation
├── Professional formatting
└── Error handling
```

### Data Structures

#### Student Profile
```javascript
{
  name: String,
  branch: String (IT/CSE/Civil/Mechanical/CE/etc.),
  currentYear: String,
  cgpa: Number,
  skills: Array[String],
  interests: Array[String],
  placementStatus: String,
  careerGoals: String,
  preferredLocation: String,
  salaryExpectation: String,
  examsPrepared: Array[String]
}
```

#### Career Recommendations
```javascript
{
  priority: String (High/Medium/Low),
  path: String,
  reason: String,
  immediateActions: Array[String],
  timeline: String,
  additionalData: Object (companies/cutoffs/resources)
}
```

### Updated Information (2025)

#### GATE Cutoffs by Branch
- **IT**: 720+ (General Category)
- **CSE**: 750+ (General Category)
- **Civil**: 740+ (General Category)
- **Mechanical**: 750+ (General Category)
- **CE**: 730+ (General Category)

#### Target Companies by Branch
- **IT/CSE**: TCS, Infosys, Google, Microsoft, Amazon
- **Civil**: L&T, Tata Projects, Godrej Properties
- **Mechanical**: Tata Motors, Mahindra, Bajaj Auto
- **Chemical**: IL&FS Environmental, Ramky Enviro

## User Journey

### For Unplaced Students
1. **Immediate Assessment**: Quick evaluation of current situation
2. **Gap Analysis**: Identify skill and preparation gaps
3. **Multi-path Strategy**: Parallel preparation for multiple opportunities
4. **Action Planning**: Week-by-week executable plans
5. **Continuous Support**: Regular check-ins and updates

### Success Metrics
- Placement rate improvement
- Student satisfaction scores
- Feature usage analytics
- Download completion rates

## Integration Points

### With Existing CDPC System
- Seamless integration in Browse.jsx
- Consistent design language
- Shared resources and contacts
- Unified branding

### External Integrations
- Government job portals
- Exam registration systems
- Company career pages
- Educational institutions

## Future Enhancements

### Phase 2 Features
- AI-powered interview preparation
- Real-time job matching
- Peer networking platform
- Success story sharing

### Phase 3 Features
- Industry mentor connections
- Live webinar integration
- Placement tracking dashboard
- Alumni network access

## Support Resources

### Immediate Help
- **Career Counseling**: +91 99999 99999
- **Email Support**: career.help@cdpc.edu
- **WhatsApp**: +91 88888 88888
- **Online Booking**: www.cdpc-careers.edu/book

### Self-Help Tools
- Skill assessment portal
- Resume builder
- Interview simulator
- Salary calculator

## File Locations
- Main Component: `/src/components/PersonalizedCareerGuide.jsx`
- PDF Generator: `/src/utils/pdfGenerator.js`
- Integration: `/src/components/Browse.jsx`

## Dependencies
- React 18+
- Framer Motion
- Lucide React Icons
- jsPDF

This feature represents a comprehensive solution for engineering students facing career uncertainty, providing them with personalized, actionable guidance to navigate their professional journey successfully.