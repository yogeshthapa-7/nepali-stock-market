import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MarketIndex from '../models/MarketIndex.js';

dotenv.config();

// Sample market indices data (simulating NEPSE data)
const seedIndices = [
    {
        name: 'NEPSE',
        displayName: 'NEPSE Index',
        value: 2825.67,
        previousValue: 2790.12,
        high: 2835.00,
        low: 2780.50,
        volume: 125000000,
        marketCap: 'N/A',
        description: 'Nepal Stock Exchange Index - Main market index',
    },
    {
        name: 'Sensitive',
        displayName: 'Sensitive Index',
        value: 456.32,
        previousValue: 450.18,
        high: 460.00,
        low: 445.00,
        volume: 85000000,
        marketCap: 'N/A',
        description: 'Sensitive Index - Tracks floatation adjusted stocks',
    },
    {
        name: 'Float',
        displayName: 'Float Index',
        value: 198.45,
        previousValue: 196.80,
        high: 200.00,
        low: 195.00,
        volume: 45000000,
        marketCap: 'N/A',
        description: 'Float Index - Floatation adjusted index',
    },
    {
        name: 'Turnover',
        displayName: 'Turnover Index',
        value: 325.80,
        previousValue: 320.50,
        high: 330.00,
        low: 315.00,
        volume: 3500000000,
        marketCap: 'N/A',
        description: 'Turnover Index - Based on turnover',
    },
    {
        name: 'Banking',
        displayName: 'Banking Index',
        value: 425.60,
        previousValue: 418.30,
        high: 430.00,
        low: 410.00,
        volume: 25000000,
        marketCap: 'N/A',
        description: 'Banking Sector Index',
    },
    {
        name: 'Hot',
        displayName: 'Hot Stocks Index',
        value: 685.40,
        previousValue: 695.20,
        high: 700.00,
        low: 680.00,
        volume: 15000000,
        marketCap: 'N/A',
        description: 'Hot Stocks Index - Most traded stocks',
    },
    {
        name: 'Insurance',
        displayName: 'Insurance Index',
        value: 725.15,
        previousValue: 710.80,
        high: 730.00,
        low: 705.00,
        volume: 8000000,
        marketCap: 'N/A',
        description: 'Insurance Sector Index',
    },
    {
        name: 'Microfinance',
        displayName: 'Microfinance Index',
        value: 315.90,
        previousValue: 320.45,
        high: 325.00,
        low: 310.00,
        volume: 12000000,
        marketCap: 'N/A',
        description: 'Microfinance Sector Index',
    },
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nepali-stock-market';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing indices
        await MarketIndex.deleteMany({});
        console.log('Cleared existing market indices');

        // Insert new indices
        const createdIndices = await MarketIndex.insertMany(seedIndices);
        console.log(`Created ${createdIndices.length} market indices`);

        console.log('Market indices seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
