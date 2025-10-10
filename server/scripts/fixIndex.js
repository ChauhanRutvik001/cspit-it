import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;
    
    // Drop the old conflicting index
    try {
      await db.collection('placementrounds').dropIndex('company_1_roundNumber_1');
      console.log('✅ Dropped old index: company_1_roundNumber_1');
    } catch (error) {
      console.log('ℹ️ Old index not found or already dropped:', error.message);
    }

    // Create the correct index
    await db.collection('placementrounds').createIndex(
      { placementDrive: 1, roundNumber: 1 }, 
      { unique: true }
    );
    console.log('✅ Created new index: placementDrive_1_roundNumber_1');

    // List all indexes to verify
    const indexes = await db.collection('placementrounds').indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n🎉 Index fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix
fixIndex();























