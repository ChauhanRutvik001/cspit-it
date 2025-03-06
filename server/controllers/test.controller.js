import Test from "../models/Test.js";

// Get all active tests
export const getAllTests = async (req, res) => {
  try {
    console.log('Fetching all active tests...');
    const tests = await Test.find({ isActive: true }).sort({ createdAt: -1 });
    console.log(`Found ${tests.length} active tests`);
    res.status(200).json(tests);
  } catch (error) {
    console.error('Error in getAllTests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tests',
      error: error.message 
    });
  }
};

// Get a single test by ID
export const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: "Test not found" 
      });
    }
    res.status(200).json(test);
  } catch (error) {
    console.error('Error in getTestById:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch test',
      error: error.message 
    });
  }
};

// Create a new test (admin only)
export const createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      test
    });
  } catch (error) {
    console.error('Error in createTest:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create test',
      error: error.message 
    });
  }
};

// Update a test (admin only)
export const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: "Test not found" 
      });
    }
    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      test
    });
  } catch (error) {
    console.error('Error in updateTest:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update test',
      error: error.message 
    });
  }
};

// Delete a test (admin only)
export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: "Test not found" 
      });
    }
    res.status(200).json({ 
      success: true,
      message: "Test deleted successfully" 
    });
  } catch (error) {
    console.error('Error in deleteTest:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete test',
      error: error.message 
    });
  }
}; 