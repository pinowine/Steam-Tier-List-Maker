const fs = require('fs');
const path = require('path');

console.log('🔍 Steam Tier List 项目检查\n');

// 检查必要文件
const requiredFiles = [
  'package.json',
  'public/index.html',
  'src/index.js',
  'src/App.jsx',
  'src/styles/globals.css',
  'tailwind.config.js',
  'postcss.config.js'
];

const componentFiles = [
  'src/components/GameCard.jsx',
  'src/components/TierList.jsx',
  'src/components/ProgressBar.jsx',
  'src/components/AddGameModal.jsx',
  'src/components/SteamImporter.jsx',
  'src/contexts/AppContext.jsx',
  'src/services/steamApi.js'
];

console.log('📁 检查核心文件:');
let missingCore = false;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 缺失`);
    missingCore = true;
  }
});

console.log('\n📦 检查组件文件:');
let missingComponents = [];
componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ⚠️  ${file} - 缺失`);
    missingComponents.push(file);
  }
});

// 检查package.json
console.log('\n📋 检查依赖:');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'react',
    'react-dom',
    '@dnd-kit/core',
    '@dnd-kit/sortable',
    'axios'
  ];

  const requiredDevDeps = [
    'tailwindcss',
    'autoprefixer',
    'postcss'
  ];

  console.log('  生产依赖:');
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`    ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`    ❌ ${dep} - 缺失`);
    }
  });

  console.log('  开发依赖:');
  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`    ✅ ${dep}: ${packageJson.devDependencies[dep]}`);
    } else {
      console.log(`    ⚠️  ${dep} - 缺失`);
    }
  });
}

// 检查Tailwind配置
console.log('\n🎨 检查Tailwind配置:');
if (fs.existsSync('tailwind.config.js')) {
  const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
  if (tailwindConfig.includes('./src/**/*.{js,jsx,ts,tsx}')) {
    console.log('  ✅ Content路径配置正确');
  } else {
    console.log('  ❌ Content路径配置可能有问题');
  }
}

if (fs.existsSync('postcss.config.js')) {
  console.log('  ✅ PostCSS配置文件存在');
} else {
  console.log('  ❌ PostCSS配置文件缺失');
  console.log('  💡 创建 postcss.config.js:');
  console.log(`     module.exports = {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    }`);
}

// 检查CSS文件
if (fs.existsSync('src/styles/globals.css')) {
  const css = fs.readFileSync('src/styles/globals.css', 'utf8');
  if (css.includes('@tailwind base') && css.includes('@tailwind components') && css.includes('@tailwind utilities')) {
    console.log('  ✅ Tailwind指令正确');
  } else {
    console.log('  ❌ Tailwind指令缺失');
  }
}

// 建议
console.log('\n💡 建议:');
if (missingCore) {
  console.log('  1. 核心文件缺失，请确保所有文件都已正确创建');
}

if (missingComponents.length > 0) {
  console.log('  2. 部分组件缺失，如果要使用完整功能，请创建这些文件');
  console.log('     或者先使用最小测试版App.jsx测试基础功能');
}

if (!fs.existsSync('node_modules')) {
  console.log('  3. node_modules不存在，请运行: npm install');
}

console.log('\n🚀 下一步:');
console.log('  1. 如果有缺失的文件，请创建它们');
console.log('  2. 运行: npm install');
console.log('  3. 使用最小测试版App.jsx先测试基础功能');
console.log('  4. 逐步添加组件，定位问题');
console.log('  5. 运行: npm start');

console.log('\n✨ 检查完成!');