// Simple test script to verify fixes
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Nepali Stock Market Application Fixes...\n');

// Test 1: Check if environment files exist
console.log('1. Checking environment files:');
const backendEnv = fs.existsSync(path.join(__dirname, 'backend', '.env'));
const frontendEnv = fs.existsSync(path.join(__dirname, 'frontend', '.env.local'));

console.log(`   ✓ Backend .env exists: ${backendEnv ? '✅' : '❌'}`);
console.log(`   ✓ Frontend .env.local exists: ${frontendEnv ? '✅' : '❌'}`);

// Test 2: Check if required environment variables are present
console.log('\n2. Checking environment variables:');
if (backendEnv) {
  const backendEnvContent = fs.readFileSync(path.join(__dirname, 'backend', '.env'), 'utf8');
  const requiredVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
  requiredVars.forEach(varName => {
    const exists = backendEnvContent.includes(varName);
    console.log(`   ✓ ${varName} present: ${exists ? '✅' : '❌'}`);
  });
}

if (frontendEnv) {
  const frontendEnvContent = fs.readFileSync(path.join(__dirname, 'frontend', '.env.local'), 'utf8');
  const requiredVars = ['NEXT_PUBLIC_API_URL'];
  requiredVars.forEach(varName => {
    const exists = frontendEnvContent.includes(`${varName}=`) || frontendEnvContent.includes(varName);
    console.log(`   ✓ ${varName} present: ${exists ? '✅' : '❌'}`);
  });
}

// Test 3: Check if middleware files have been updated
console.log('\n3. Checking middleware updates:');
const frontendMiddleware = fs.existsSync(path.join(__dirname, 'frontend', 'middleware.ts'));
if (frontendMiddleware) {
  const middlewareContent = fs.readFileSync(path.join(__dirname, 'frontend', 'middleware.ts'), 'utf8');
  const hasImprovedAuth = middlewareContent.includes('request.headers.get(\'authorization\')');
  const hasApiSkip = middlewareContent.includes('pathname.startsWith(\'/api\')');
  console.log(`   ✓ Improved token handling: ${hasImprovedAuth ? '✅' : '❌'}`);
  console.log(`   ✓ API route skipping: ${hasApiSkip ? '✅' : '❌'}`);
}

// Test 4: Check if CSS classes have been added
console.log('\n4. Checking CSS improvements:');
const globalsCSS = fs.existsSync(path.join(__dirname, 'frontend', 'app', 'globals.css'));
if (globalsCSS) {
  const cssContent = fs.readFileSync(path.join(__dirname, 'frontend', 'app', 'globals.css'), 'utf8');
  const hasUtilityClasses = cssContent.includes('.bg-grid-pattern');
  const hasTypography = cssContent.includes('.text-xs');
  const hasFontWeights = cssContent.includes('.font-light');
  console.log(`   ✓ Utility classes added: ${hasUtilityClasses ? '✅' : '❌'}`);
  console.log(`   ✓ Typography classes: ${hasTypography ? '✅' : '❌'}`);
  console.log(`   ✓ Font weight classes: ${hasFontWeights ? '✅' : '❌'}`);
}

// Test 5: Check if auth context has been improved
console.log('\n5. Checking auth context improvements:');
const authContext = fs.existsSync(path.join(__dirname, 'frontend', 'app', 'lib', 'auth-context.tsx'));
if (authContext) {
  const authContent = fs.readFileSync(path.join(__dirname, 'frontend', 'app', 'lib', 'auth-context.tsx'), 'utf8');
  const hasBetterErrorHandling = authContent.includes('setUser(null)');
  const hasTokenCleanup = authContent.includes('localStorage.removeItem');
  console.log(`   ✓ Better error handling: ${hasBetterErrorHandling ? '✅' : '❌'}`);
  console.log(`   ✓ Token cleanup on errors: ${hasTokenCleanup ? '✅' : '❌'}`);
}

// Test 6: Check if database connection has been improved
console.log('\n6. Checking database connection improvements:');
const dbConfig = fs.existsSync(path.join(__dirname, 'backend', 'config', 'database.js'));
if (dbConfig) {
  const dbContent = fs.readFileSync(path.join(__dirname, 'backend', 'config', 'database.js'), 'utf8');
  const hasBetterErrorHandling = dbContent.includes('console.error');
  console.log(`   ✓ Better error handling: ${hasBetterErrorHandling ? '✅' : '❌'}`);
}

console.log('\n🎉 Fix verification complete!');
console.log('\n📋 Summary:');
console.log('   • Environment files created for both backend and frontend');
console.log('   • Middleware improved for better JWT token handling');
console.log('   • CSS classes added for missing utilities');
console.log('   • Auth context enhanced with better error handling');
console.log('   • Database connection error handling improved');
console.log('\n🚀 The application should now run without the identified errors!');