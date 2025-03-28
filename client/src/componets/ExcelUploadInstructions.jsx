import React from 'react';
import { FileUp, Download, AlertCircle, Check, X } from 'lucide-react';
import ExcelTemplateGenerator from './ExcelTemplateGenerator';

const ExcelUploadInstructions = ({ type = "student" }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <FileUp className="mr-2 text-blue-600" size={20} />
        Excel Upload Instructions
      </h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-sm text-blue-700">
            Upload an Excel file (.xlsx or .xls) with {type} information for bulk registration.
          </p>
        </div>
        
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h3 className="font-semibold text-gray-700">Required Column Headers:</h3>
          <ExcelTemplateGenerator type={type} />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-200 p-2 rounded">ID</div>
            <div className="bg-gray-200 p-2 rounded">NAME</div>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-700">Example Data:</h3>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 text-sm text-gray-900">{type === "student" ? "21it001" : "fac001"}</td>
              <td className="px-4 py-2 text-sm text-gray-900">John Doe</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm text-gray-900">{type === "student" ? "21it002" : "fac002"}</td>
              <td className="px-4 py-2 text-sm text-gray-900">Jane Smith</td>
            </tr>
          </tbody>
        </table>
        
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={18} />
          <p className="text-sm text-gray-600">
            Column headers must match exactly as shown above (case sensitive).
            The system will convert all IDs to lowercase during processing.
          </p>
        </div>
        
        {/* Add troubleshooting guidance */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
          <h3 className="font-semibold text-gray-700 mb-3">Troubleshooting Excel File Issues</h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Use the "Generate Template" button above to create a valid Excel file</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Don't rename the file extension (.xlsx)</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Don't modify Excel file with text editors</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Always use Excel or compatible spreadsheet software to edit templates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadInstructions;
