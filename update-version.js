const fs = require('fs');
const { execSync } = require('child_process');

// 获取Git提交次数
function getCommitCount() {
  try {
    const count = execSync('git rev-list --count HEAD').toString().trim();
    return count;
  } catch (error) {
    console.error('获取Git提交次数失败:', error.message);
    return '0';
  }
}

// 生成版本号
function generateVersion() {
  const commitCount = getCommitCount();
  return `v1.0.${commitCount}`;
}

// 更新HTML文件中的版本号
function updateVersionInHTML() {
  const version = generateVersion();
  const filePath = './index.html';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    // 替换版本号
    content = content.replace(/智能客户池转化工具 v[\d]+\.[\d]+\.[\d]+/, `智能客户池转化工具 ${version}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`版本号已更新为: ${version}`);
  } catch (error) {
    console.error('更新版本号失败:', error.message);
  }
}

// 执行更新
updateVersionInHTML();