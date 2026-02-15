<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nepali Stock Market Application</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            padding: 60px 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            margin-bottom: 40px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .logo {
            font-size: 80px;
            margin-bottom: 20px;
        }
        
        .title {
            font-size: 48px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 15px;
            background: linear-gradient(90deg, #00d4ff, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 20px;
            color: #a0aec0;
            max-width: 600px;
            margin: 0 auto 30px;
        }
        
        .badge {
            display: inline-block;
            padding: 8px 20px;
            background: linear-gradient(90deg, #f59e0b, #ef4444);
            color: white;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .section {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 35px;
            margin-bottom: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .section-title {
            font-size: 28px;
            font-weight: 700;
            color: #00d4ff;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .section-title span {
            font-size: 30px;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.12);
            border-color: #00d4ff;
        }
        
        .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #fff;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .card-text {
            color: #a0aec0;
            font-size: 14px;
        }
        
        .tech-badge {
            display: inline-block;
            padding: 6px 14px;
            background: rgba(0, 212, 255, 0.15);
            color: #00d4ff;
            border-radius: 6px;
            font-size: 13px;
            margin: 3px;
            border: 1px solid rgba(0, 212, 255, 0.3);
        }
        
        .tech-badge.purple {
            background: rgba(124, 58, 237, 0.15);
            color: #a78bfa;
            border-color: rgba(124, 58, 237, 0.3);
        }
        
        .tech-badge.green {
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border-color: rgba(34, 197, 94, 0.3);
        }
        
        .code-block {
            background: #1a1a2e;
            border-radius: 10px;
            padding: 20px;
            overflow-x: auto;
            margin: 15px 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .code-block code {
            color: #a5b4fc;
            font-family: 'Fira Code', 'Consolas', monospace;
            font-size: 14px;
        }
        
        .code-block .comment {
            color: #6b7280;
        }
        
        .code-block .keyword {
            color: #c084fc;
        }
        
        .code-block .string {
            color: #34d399;
        }
        
        .steps {
            counter-reset: step;
        }
        
        .step {
            position: relative;
            padding-left: 60px;
            margin-bottom: 25px;
        }
        
        .step::before {
            counter-increment: step;
            content: counter(step);
            position: absolute;
            left: 0;
            top: 0;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #00d4ff, #7c3aed);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
        }
        
        .step-title {
            font-size: 18px;
            font-weight: 600;
            color: #fff;
            margin-bottom: 8px;
        }
        
        .step-text {
            color: #a0aec0;
        }
        
        .api-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .api-table th {
            background: rgba(0, 212, 255, 0.1);
            color: #00d4ff;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .api-table td {
            padding: 12px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            color: #a0aec0;
        }
        
        .api-table tr:hover td {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .method {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .method.get {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }
        
        .method.post {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
        }
        
        .method.delete {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
        
        .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .user-card {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .user-label {
            font-size: 14px;
            color: #a0aec0;
            margin-bottom: 5px;
        }
        
        .user-value {
            font-size: 16px;
            color: #fff;
            font-weight: 600;
        }
        
        .footer {
            text-align: center;
            padding: 40px 0;
            color: #6b7280;
        }
        
        .footer a {
            color: #00d4ff;
            text-decoration: none;
        }
        
        .heart {
            color: #ef4444;
            animation: heartbeat 1.5s infinite;
        }
        
        @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        .progress-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            margin-top: 15px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d4ff, #7c3aed);
            border-radius: 3px;
            animation: progress 2s ease-in-out infinite;
        }
        
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        
        .progress-text {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
            font-size: 13px;
            color: #a0aec0;
        }
        
        @media (max-width: 768px) {
            .title {
                font-size: 32px;
            }
            .subtitle {
                font-size: 16px;
            }
            .section {
                padding: 25px 20px;
            }
            .grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="logo">📈</div>
            <h1 class="title">Nepali Stock Market</h1>
            <p class="subtitle">
                A comprehensive full-stack web application for tracking Nepali stock market data, 
                IPOs, news, and portfolio management with real-time updates
            </p>
            <div class="badge">🚀 In Progress</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">
                <span>Development Status</span>
                <span>70% Complete</span>
            </div>
        </header>

        <!-- Features -->
        <section class="section">
            <h2 class="section-title"><span>✨</span> Features</h2>
            <div class="grid">
                <div class="card">
                    <div class="card-title">📊 Real-time Stock Data</div>
                    <p class="card-text">Live NEPSE stock prices and market data with instant updates</p>
                </div>
                <div class="card">
                    <div class="card-title">🏢 IPO Management</div>
                    <p class="card-text">Track and apply for Initial Public Offerings seamlessly</p>
                </div>
                <div class="card">
                    <div class="card-title">💼 Portfolio Management</div>
                    <p class="card-text">Manage your stock portfolio and track performance</p>
                </div>
                <div class="card">
                    <div class="card-title">👁️ Watchlist</div>
                    <p class="card-text">Create and manage custom watchlists for your favorite stocks</p>
                </div>
                <div class="card">
                    <div class="card-title">📰 News & Updates</div>
                    <p class="card-text">Latest market news and analysis from reliable sources</p>
                </div>
                <div class="card">
                    <div class="card-title">🔐 User Authentication</div>
                    <p class="card-text">Secure login and registration with JWT tokens</p>
                </div>
            </div>
        </section>

        <!-- Tech Stack -->
        <section class="section">
            <h2 class="section-title"><span>🛠️</span> Tech Stack</h2>
            
            <h3 style="color: #fff; margin-bottom: 15px; font-size: 18px;">Backend</h3>
            <div style="margin-bottom: 25px;">
                <span class="tech-badge">Node.js</span>
                <span class="tech-badge purple">Express.js</span>
                <span class="tech-badge green">MongoDB</span>
                <span class="tech-badge">JWT</span>
                <span class="tech-badge purple">Socket.IO</span>
                <span class="tech-badge green">bcryptjs</span>
            </div>
            
            <h3 style="color: #fff; margin-bottom: 15px; font-size: 18px;">Frontend</h3>
            <div>
                <span class="tech-badge">Next.js 14</span>
                <span class="tech-badge purple">TypeScript</span>
                <span class="tech-badge green">Tailwind CSS</span>
                <span class="tech-badge">Lucide React</span>
                <span class="tech-badge purple">React Query</span>
                <span class="tech-badge green">Recharts</span>
            </div>
        </section>

        <!-- Prerequisites -->
        <section class="section">
            <h2 class="section-title"><span>📋</span> Prerequisites</h2>
            <div class="grid">
                <div class="card">
                    <div class="card-title">Node.js</div>
                    <p class="card-text">Version 18.0.0 or higher</p>
                </div>
                <div class="card">
                    <div class="card-title">MongoDB</div>
                    <p class="card-text">Version 4.4 or higher</p>
                </div>
                <div class="card">
                    <div class="card-title">npm</div>
                    <p class="card-text">Version 9.0.0 or higher</p>
                </div>
            </div>
        </section>

        <!-- Quick Start -->
        <section class="section">
            <h2 class="section-title"><span>🚀</span> Quick Start</h2>
            
            <div class="steps">
                <div class="step">
                    <div class="step-title">Clone the Repository</div>
                    <div class="step-text">
                        <div class="code-block">
                            <code>
                                <span class="comment"># Clone the repository</span><br>
                                git clone <repository-url><br>
                                cd nepali-stock-market
                            </code>
                        </div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-title">Backend Setup</div>
                    <div class="step-text">
                        <div class="code-block">
                            <code>
                                <span class="comment"># Navigate to backend and install dependencies</span><br>
                                cd backend<br>
                                npm install<br><br>
                                <span class="comment"># Copy environment file and configure</span><br>
                                cp .env.example .env<br><br>
                                <span class="comment"># Seed database with sample data</span><br>
                                npm run seed<br><br>
                                <span class="comment"># Start development server</span><br>
                                npm run dev
                            </code>
                        </div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-title">Frontend Setup</div>
                    <div class="step-text">
                        <div class="code-block">
                            <code>
                                <span class="comment"># Navigate to frontend and install dependencies</span><br>
                                cd frontend<br>
                                npm install<br><br>
                                <span class="comment"># Copy environment file and configure</span><br>
                                cp .env.example .env.local<br><br>
                                <span class="comment"># Start development server</span><br>
                                npm run dev
                            </code>
                        </div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-title">Access the Application</div>
                    <div class="step-text">
                        <p>🌐 Frontend: <strong style="color: #00d4ff;">http://localhost:3000</strong></p>
                        <p>🔌 Backend API: <strong style="color: #00d4ff;">http://localhost:5000</strong></p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Project Structure -->
        <section class="section">
            <h2 class="section-title"><span>📁</span> Project Structure</h2>
            <div class="code-block">
                <code>
nepali-stock-market/<br>
├── <span class="keyword">backend/</span><br>
│   ├── <span class="string">models/</span>          # MongoDB models<br>
│   ├── <span class="string">routes/</span>         # API routes<br>
│   ├── <span class="string">middleware/</span>     # Express middleware<br>
│   ├── <span class="string">scripts/</span>        # Database scripts<br>
│   ├── <span class="string">config/</span>         # Configuration files<br>
│   └── <span class="string">server.js</span>       # Main server file<br>
├── <span class="keyword">frontend/</span><br>
│   ├── <span class="string">app/</span>             # Next.js app directory<br>
│   ├── <span class="string">components/</span>     # Reusable components<br>
│   ├── <span class="string">lib/</span>            # Utility functions<br>
│   └── <span class="string">public/</span>         # Static assets<br>
└── <span class="string">README.md</span>
                </code>
            </div>
        </section>

        <!-- Environment Variables -->
        <section class="section">
            <h2 class="section-title"><span>🔧</span> Environment Variables</h2>
            
            <h3 style="color: #fff; margin-bottom: 15px;">Backend (.env)</h3>
            <div class="code-block">
                <code>
NODE_ENV=development<br>
PORT=5000<br>
MONGODB_URI=mongodb://localhost:27017/nepali-stock-market<br>
JWT_SECRET=your-super-secret-jwt-key<br>
JWT_EXPIRE=7d<br>
CLIENT_URL=http://localhost:3000
                </code>
            </div>
            
            <h3 style="color: #fff; margin: 25px 0 15px;">Frontend (.env.local)</h3>
            <div class="code-block">
                <code>
NEXT_PUBLIC_API_URL=http://localhost:5000/api<br>
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
                </code>
            </div>
        </section>

        <!-- API Endpoints -->
        <section class="section">
            <h2 class="section-title"><span>📊</span> API Endpoints</h2>
            
            <h3 style="color: #fff; margin-bottom: 15px;">Authentication</h3>
            <table class="api-table">
                <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td><span class="method post">POST</span></td>
                    <td>/api/auth/signup</td>
                    <td>Register new user</td>
                </tr>
                <tr>
                    <td><span class="method post">POST</span></td>
                    <td>/api/auth/login</td>
                    <td>User login</td>
                </tr>
                <tr>
                    <td><span class="method get">GET</span></td>
                    <td>/api/auth/profile</td>
                    <td>Get user profile</td>
                </tr>
            </table>
            
            <h3 style="color: #fff; margin: 25px 0 15px;">Stocks</h3>
            <table class="api-table">
                <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td><span class="method get">GET</span></td>
                    <td>/api/stocks</td>
                    <td>Get all stocks</td>
                </tr>
                <tr>
                    <td><span class="method get">GET</span></td>
                    <td>/api/stocks/:symbol</td>
                    <td>Get stock by symbol</td>
                </tr>
                <tr>
                    <td><span class="method post">POST</span></td>
                    <td>/api/stocks</td>
                    <td>Create new stock (admin)</td>
                </tr>
            </table>
            
            <h3 style="color: #fff; margin: 25px 0 15px;">Portfolio & Watchlist</h3>
            <table class="api-table">
                <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td><span class="method get">GET</span></td>
                    <td>/api/portfolio</td>
                    <td>Get user portfolio</td>
                </tr>
                <tr>
                    <td><span class="method get">GET</span></td>
                    <td>/api/watchlist</td>
                    <td>Get user watchlist</td>
                </tr>
                <tr>
                    <td><span class="method post">POST</span></td>
                    <td>/api/watchlist/stocks/add</td>
                    <td>Add stock to watchlist</td>
                </tr>
                <tr>
                    <td><span class="method delete">DELETE</span></td>
                    <td>/api/watchlist/stocks/:id</td>
                    <td>Remove from watchlist</td>
                </tr>
            </table>
        </section>

        <!-- Default Users -->
        <section class="section">
            <h2 class="section-title"><span>👥</span> Default Users</h2>
            <p style="color: #a0aec0; margin-bottom: 20px;">
                For testing purposes, the following users are created by the seed script:
            </p>
            <div class="users-grid">
                <div class="user-card">
                    <div class="user-label">Regular User</div>
                    <div class="user-value">user@example.com</div>
                    <div class="user-label" style="margin-top: 10px;">Password: 123456</div>
                </div>
                <div class="user-card">
                    <div class="user-label">Admin User</div>
                    <div class="user-value">admin@example.com</div>
                    <div class="user-label" style="margin-top: 10px;">Password: 123456</div>
                </div>
            </div>
        </section>

        <!-- Contributing -->
        <section class="section">
            <h2 class="section-title"><span>🤝</span> Contributing</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-title">Fork the Repository</div>
                </div>
                <div class="step">
                    <div class="step-title">Create a Feature Branch</div>
                </div>
                <div class="step">
                    <div class="step-title">Commit Your Changes</div>
                </div>
                <div class="step">
                    <div class="step-title">Push to the Branch</div>
                </div>
                <div class="step">
                    <div class="step-title">Create a Pull Request</div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>
                Built with <span class="heart">❤️</span> for the Nepali Stock Market Community
            </p>
            <p style="margin-top: 10px;">
                Licensed under MIT License
            </p>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                © 2024 Nepali Stock Market Application. All rights reserved.
            </p>
        </footer>
    </div>
</body>
</html>
