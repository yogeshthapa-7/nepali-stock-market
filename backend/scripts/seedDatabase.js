import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stock from '../models/Stock.js';
import News from '../models/News.js';
import IPO from '../models/IPO.js';
import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Watchlist from '../models/Watchlist.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nepali-stock-market');
    console.log('🔌 Connected to MongoDB');

    // Clear existing data
    await Stock.deleteMany({});
    await News.deleteMany({});
    await IPO.deleteMany({});
    await User.deleteMany({});
    await Portfolio.deleteMany({});
    await Watchlist.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        email: 'user@example.com',
        password: '123456',
        name: 'John Doe',
        role: 'user',
        isVerified: true,
      },
      {
        email: 'admin@example.com',
        password: '123456',
        name: 'Admin User',
        role: 'admin',
        isVerified: true,
      },
    ]);

    console.log('👥 Created sample users');

    // Seed Stocks
    const stocks = [
      {
        symbol: 'NABIL',
        name: 'Nabil Bank Limited',
        company: 'Nabil Bank Limited',
        price: 850.00,
        previousClose: 831.50,
        change: 18.50,
        changePercent: 2.22,
        volume: 125500,
        marketCap: '85.2B',
        peRatio: 18.5,
        eps: 45.95,
        dividendYield: 2.5,
        description: 'Nabil Bank Limited is one of the largest commercial banks in Nepal.',
        image: 'https://via.placeholder.com/50x50?text=NABIL'
      },
      {
        symbol: 'NBL',
        name: 'Nepal Bank Limited',
        company: 'Nepal Bank Limited',
        price: 1250.00,
        previousClose: 1260.08,
        change: -10.08,
        changePercent: -0.80,
        volume: 89200,
        marketCap: '62.8B',
        peRatio: 15.2,
        eps: 82.24,
        dividendYield: 3.2,
        description: 'Nepal Bank Limited is the first commercial bank of Nepal.',
        image: 'https://via.placeholder.com/50x50?text=NBL'
      },
      {
        symbol: 'EBL',
        name: 'Everest Bank Limited',
        company: 'Everest Bank Limited',
        price: 2450.00,
        previousClose: 2420.91,
        change: 29.09,
        changePercent: 1.20,
        volume: 67800,
        marketCap: '48.9B',
        peRatio: 22.1,
        eps: 110.86,
        dividendYield: 2.8,
        description: 'Everest Bank Limited is a leading commercial bank in Nepal.',
        image: 'https://via.placeholder.com/50x50?text=EBL'
      },
      {
        symbol: 'SBI',
        name: 'Siddhartha Bank Limited',
        company: 'Siddhartha Bank Limited',
        price: 980.00,
        previousClose: 950.54,
        change: 29.46,
        changePercent: 3.10,
        volume: 234100,
        marketCap: '78.4B',
        peRatio: 16.8,
        eps: 58.33,
        dividendYield: 2.1,
        description: 'Siddhartha Bank Limited is a rapidly growing commercial bank.',
        image: 'https://via.placeholder.com/50x50?text=SBI'
      },
      {
        symbol: 'ADBL',
        name: 'Agricultural Development Bank',
        company: 'Agricultural Development Bank Limited',
        price: 520.00,
        previousClose: 527.88,
        change: -7.88,
        changePercent: -1.49,
        volume: 156300,
        marketCap: '41.6B',
        peRatio: 12.4,
        eps: 41.94,
        dividendYield: 3.5,
        description: 'Agricultural Development Bank Limited is a leading development bank.',
        image: 'https://via.placeholder.com/50x50?text=ADBL'
      },
      {
        symbol: 'NICA',
        name: 'NIC Asia Bank',
        company: 'NIC Asia Bank Limited',
        price: 1150.00,
        previousClose: 1144.25,
        change: 5.75,
        changePercent: 0.50,
        volume: 98700,
        marketCap: '92.0B',
        peRatio: 19.8,
        eps: 58.08,
        dividendYield: 2.9,
        description: 'NIC Asia Bank is one of the largest commercial banks in Nepal.',
        image: 'https://via.placeholder.com/50x50?text=NICA'
      },
      {
        symbol: 'UPPER',
        name: 'Upper Tamakoshi Hydropower',
        company: 'Upper Tamakoshi Hydropower Company Limited',
        price: 650.00,
        previousClose: 635.00,
        change: 15.00,
        changePercent: 2.36,
        volume: 187500,
        marketCap: '65.0B',
        peRatio: 25.3,
        eps: 25.69,
        dividendYield: 1.8,
        description: 'Upper Tamakoshi Hydropower Company is a major hydropower developer.',
        image: 'https://via.placeholder.com/50x50?text=UPPER'
      },
      {
        symbol: 'SHIVAM',
        name: 'Shivam Cements',
        company: 'Shivam Cements Limited',
        price: 480.00,
        previousClose: 475.20,
        change: 4.80,
        changePercent: 1.01,
        volume: 123400,
        marketCap: '24.0B',
        peRatio: 18.7,
        eps: 25.67,
        dividendYield: 2.2,
        description: 'Shivam Cements is a leading cement manufacturer in Nepal.',
        image: 'https://via.placeholder.com/50x50?text=SHIVAM'
      }
    ];

    await Stock.insertMany(stocks);
    console.log('📈 Stock data seeded successfully');

    // Seed News
    const news = [
      {
        title: 'NEPSE Index Gains 25 Points Amid Banking Sector Rally',
        summary: 'The Nepal Stock Exchange (NEPSE) index gained 25.34 points today, driven by strong performance in banking sector.',
        content: 'The Nepal Stock Exchange (NEPSE) index closed at 1,956.78 points, gaining 25.34 points or 1.31% compared to the previous trading day. The surge was primarily driven by strong performance in the banking sector, with major commercial banks like Nabil Bank, Siddhartha Bank, and NIC Asia Bank showing significant gains. Trading volume remained robust with over 1.2 billion shares worth NPR 8.5 billion being traded.',
        category: 'market',
        source: 'Economic Times',
        author: 'Market Analyst',
        publishedAt: new Date(),
        image: 'https://via.placeholder.com/400x200?text=NEPSE+News',
        relatedStocks: []
      },
      {
        title: 'Nabil Bank Announces Q3 Results with 15% Profit Growth',
        summary: 'Nabil Bank Limited has announced its third-quarter results showing a 15% increase in net profit.',
        content: 'Nabil Bank Limited, one of Nepal\'s largest commercial banks, has announced impressive third-quarter results with a net profit of NPR 4.5 billion, representing a 15% year-on-year growth. The bank\'s total assets have reached NPR 350 billion, while its loan portfolio stands at NPR 280 billion. The board of directors has proposed a 10% cash dividend for the fiscal year.',
        category: 'company',
        source: 'Business Standard',
        author: 'Financial Reporter',
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
        image: 'https://via.placeholder.com/400x200?text=Nabil+Bank',
        relatedStocks: []
      },
      {
        title: 'SEC Nepal Approves New IPO Regulations',
        summary: 'The Securities Board of Nepal (SEBON) has approved new regulations for Initial Public Offerings.',
        content: 'The Securities Board of Nepal (SEBON) has approved comprehensive new regulations for Initial Public Offerings aimed at protecting retail investors and ensuring fair distribution. The new rules include mandatory allotment to local residents, transparent pricing mechanisms, and stricter disclosure requirements. These changes are expected to streamline the IPO process and enhance market confidence.',
        category: 'ipo',
        source: 'Regulatory News',
        author: 'Legal Correspondent',
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
        image: 'https://via.placeholder.com/400x200?text=SEBON+Regulation',
        relatedIPOs: []
      }
    ];

    await News.insertMany(news);
    console.log('📰 News data seeded successfully');

    // Seed IPOs
    const ipos = [
      {
        symbol: 'MERO',
        name: 'Mero Microfinance',
        company: 'Mero Microfinance Development Bank Limited',
        issuePrice: 100,
        shares: 1000000,
        sharesAvailable: 1000000,
        openDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        closeDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'upcoming',
        description: 'Mero Microfinance Development Bank Limited is issuing 1 million shares at NPR 100 per face value to general public.',
        company_info: {
          sector: 'Microfinance',
          chairman: 'John Doe',
          registrar: 'Nabil Capital Markets'
        },
        image: 'https://via.placeholder.com/400x200?text=Mero+Microfinance'
      },
      {
        symbol: 'HIMALAYA',
        name: 'Himalayan Insurance',
        company: 'Himalayan Insurance Company Limited',
        issuePrice: 250,
        shares: 500000,
        sharesAvailable: 500000,
        openDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        closeDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        status: 'open',
        description: 'Himalayan Insurance Company Limited is issuing 500,000 shares through Further Public Offering (FPO).',
        company_info: {
          sector: 'Insurance',
          chairman: 'Jane Smith',
          registrar: 'Global Capital Markets'
        },
        image: 'https://via.placeholder.com/400x200?text=Himalayan+Insurance'
      },
      {
        symbol: 'TECHNO',
        name: 'Techno Nepal',
        company: 'Techno Nepal Limited',
        issuePrice: 100,
        shares: 2000000,
        sharesAvailable: 0,
        openDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        closeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'closed',
        description: 'Techno Nepal Limited successfully completed its IPO with overwhelming public response.',
        company_info: {
          sector: 'Technology',
          chairman: 'Tech Expert',
          registrar: 'NMB Capital'
        },
        image: 'https://via.placeholder.com/400x200?text=Techno+Nepal',
        applications: [
          {
            userId: new mongoose.Types.ObjectId(),
            sharesApplied: 1000,
            applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: 'pending',
            sharesAllotted: 0
          }
        ]
      }
    ];

    await IPO.insertMany(ipos);
    console.log('🏢 IPO data seeded successfully');

    // Create portfolios and watchlists for users
    for (const user of users) {
      try {
        await Portfolio.create({ userId: user._id });
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Portfolio for user ${user.email} already exists`);
        } else {
          throw error;
        }
      }
      
      try {
        await Watchlist.create({ userId: user._id });
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Watchlist for user ${user.email} already exists`);
        } else {
          throw error;
        }
      }
    }

    console.log('📁 Created portfolios and watchlists');

    console.log('\n✅ Database seeded successfully!');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📊 Stocks: ${stocks.length}`);
    console.log(`📰 News: ${news.length}`);
    console.log(`🏢 IPOs: ${ipos.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
