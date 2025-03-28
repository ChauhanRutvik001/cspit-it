import React from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

/**
 * Component to generate Excel templates directly from the browser
 * This avoids issues with corrupted downloads
 */
const ExcelTemplateGenerator = ({ type = "student" }) => {
  const generateTemplate = () => {
    try {
      // Create worksheet with the required headers
      const ws = XLSX.utils.json_to_sheet([]);
      
      // Set column headers with proper width
      XLSX.utils.sheet_add_aoa(ws, [['ID', 'NAME']], { origin: 'A1' });
      
      // Add sample data
      const sampleData = type === 'student' 
        ? [
            ['21it001', 'John Doe'],
            ['21it002', 'Jane Smith']
          ]
        : [
            ['fac001', 'Dr. Robert Brown'],
            ['fac002', 'Prof. Sarah Johnson']
          ];
      
      XLSX.utils.sheet_add_aoa(ws, sampleData, { origin: 'A2' });
      
      // Set column widths for better readability
      ws['!cols'] = [{ wch: 15 }, { wch: 25 }];
      
      // Create workbook and add the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      
      // Generate the file and trigger download
      const fileName = `${type}_registration_template.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error generating Excel template:", error);
      alert("Failed to generate template. Please try again.");
    }
  };

  return (
    <button 
      onClick={generateTemplate}
      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
    >
      <Download size={16} className="mr-2" />
      Generate {type === 'student' ? 'Student' : 'Counsellor'} Template
    </button>
  );
};

export default ExcelTemplateGenerator;
