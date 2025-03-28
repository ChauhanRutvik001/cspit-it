# Excel Upload Guide for Student and Counsellor Registration

This guide explains how to format Excel files for bulk registration of students and counsellors in the system.

## Required Excel Format

Both student and counsellor registration require the same Excel file format:

### Column Headers

Your Excel file must have the following column headers:
- `ID`: The unique identifier for the student or counsellor (e.g., student ID or employee ID)
- `NAME`: The full name of the student or counsellor

### Example Excel Structure

| ID       | NAME           |
|----------|----------------|
| 21it001  | John Doe       |
| 21it002  | Jane Smith     |
| 21it003  | Robert Johnson |

### Notes

- The headers must be written exactly as shown above (case-sensitive)
- The system will automatically convert IDs to lowercase
- Empty rows will be ignored
- Duplicate IDs will cause errors during registration

## Steps to Upload Excel File

1. Navigate to the appropriate registration page:
   - `/registation` for student registration
   - `/registationCounsellor` for counsellor registration
   
2. Click on the file upload button and select your Excel file (.xlsx or .xls format)

3. The system will parse the file and display the data in a table

4. Select the entries you wish to register by using the checkboxes

5. Click the "Register Selected" button to complete the registration process

## Sample Excel Files

You can download the sample Excel templates below:
- [Student Registration Template](/templates/student_registration_template.xlsx)
- [Counsellor Registration Template](/templates/counsellor_registration_template.xlsx)

## Troubleshooting

If you encounter errors during upload:
- Verify your Excel file has the correct column headers
- Check for duplicate IDs in your data
- Ensure all required fields have values
- Maximum recommended rows per upload: 100
