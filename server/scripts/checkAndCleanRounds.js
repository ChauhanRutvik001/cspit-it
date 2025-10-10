import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkAndCleanRounds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;
    
    // Check all placement rounds
    const allRounds = await db.collection('placementrounds').find({}).toArray();
    console.log('\n📋 All Placement Rounds in Database:');
    allRounds.forEach(round => {
      console.log(`- ID: ${round._id}`);
      console.log(`  PlacementDrive: ${round.placementDrive || 'NULL'}`);
      console.log(`  RoundNumber: ${round.roundNumber}`);
      console.log(`  RoundName: ${round.roundName}`);
      console.log(`  Created: ${round.createdAt}`);
      console.log('---');
    });

    // Check for rounds with null placementDrive
    const nullPlacementDriveRounds = await db.collection('placementrounds').find({
      $or: [
        { placementDrive: null },
        { placementDrive: { $exists: false } }
      ]
    }).toArray();

    console.log(`\n🔍 Found ${nullPlacementDriveRounds.length} rounds with null placementDrive`);
    
    if (nullPlacementDriveRounds.length > 0) {
      console.log('Deleting rounds with null placementDrive...');
      await db.collection('placementrounds').deleteMany({
        $or: [
          { placementDrive: null },
          { placementDrive: { $exists: false } }
        ]
      });
      console.log('✅ Deleted rounds with null placementDrive');
    }

    // Check for duplicate round numbers per placement drive
    const placementDrives = await db.collection('placementrounds').distinct('placementDrive');
    console.log(`\n🏢 Found ${placementDrives.length} unique placement drives`);

    for (const driveId of placementDrives) {
      if (!driveId) continue;
      
      const roundsForDrive = await db.collection('placementrounds').find({ placementDrive: driveId }).toArray();
      console.log(`\n📊 Drive ${driveId}:`);
      console.log(`   Rounds: ${roundsForDrive.map(r => r.roundNumber).join(', ')}`);
      
      // Check for duplicates
      const roundNumbers = roundsForDrive.map(r => r.roundNumber);
      const duplicates = roundNumbers.filter((num, index) => roundNumbers.indexOf(num) !== index);
      
      if (duplicates.length > 0) {
        console.log(`   ⚠️  Duplicate round numbers found: ${duplicates.join(', ')}`);
        
        // Keep only the first occurrence of each round number
        for (const duplicateNum of duplicates) {
          const duplicateRounds = roundsForDrive.filter(r => r.roundNumber === duplicateNum);
          console.log(`   🗑️  Deleting ${duplicateRounds.length - 1} duplicate(s) of round ${duplicateNum}`);
          
          // Delete all but the first one
          for (let i = 1; i < duplicateRounds.length; i++) {
            await db.collection('placementrounds').deleteOne({ _id: duplicateRounds[i]._id });
          }
        }
      }
    }

    // List all indexes
    const indexes = await db.collection('placementrounds').indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n🎉 Database check and cleanup completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the check and cleanup
checkAndCleanRounds();























