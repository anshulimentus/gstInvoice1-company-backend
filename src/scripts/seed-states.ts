import { DataSource } from 'typeorm';
import { State } from '../entities/state.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const indianStates = [
  // States (28)
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',

  // Union Territories (8)
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

async function seedStates() {
  // Import the AppDataSource from data-source.ts
  const { AppDataSource } = await import('../migrations/data-source');

  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Database connection established');

    const stateRepository = AppDataSource.getRepository(State);

    // Check if states already exist
    const existingCount = await stateRepository.count();
    if (existingCount > 0) {
      console.log(`States already exist (${existingCount} found). Skipping seed.`);
      return;
    }

    // Insert states
    const stateEntities = indianStates.map(name => ({ name }));
    await stateRepository.save(stateEntities);

    console.log(`Successfully seeded ${indianStates.length} Indian states and union territories:`);
    console.log('\n📍 STATES (28):');
    indianStates.slice(0, 28).forEach((state, index) => {
      console.log(`${index + 1}. ${state}`);
    });

    console.log('\n🏛️ UNION TERRITORIES (8):');
    indianStates.slice(28).forEach((state, index) => {
      console.log(`${index + 29}. ${state}`);
    });

  } catch (error) {
    console.error('Error seeding states:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedStates().catch(console.error);
