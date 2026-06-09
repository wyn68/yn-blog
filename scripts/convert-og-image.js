const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/og-image.svg');
const outputDir = path.join(__dirname, '../public');

// 读取 SVG 文件
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('开始转换 OG 图片...');

// 转换为 WebP 格式（高压缩
sharp(Buffer.from(svgContent))
  .resize(1200, 630)
  .webp({
    quality: 85
  })
  .toFile(path.join(outputDir, 'og-image.webp'))
  .then(() => {
    console.log('✅ WebP 格式转换完成');
  })
  .catch((err) => {
    console.error('❌ WebP 转换失败:', err);
  });

// 转换为 AVIF 格式（更高效的压缩）
sharp(Buffer.from(svgContent))
  .resize(1200, 630)
  .avif({
    quality: 75,
    effort: 9
  })
  .toFile(path.join(outputDir, 'og-image.avif'))
  .then(() => {
    console.log('✅ AVIF 格式转换完成');
  })
  .catch((err) => {
    console.error('❌ AVIF 转换失败:', err);
  });

// 同时生成一个基础的 PNG 格式作为备用
sharp(Buffer.from(svgContent))
  .resize(1200, 630)
  .png({
    quality: 85,
    effort: 10
  })
  .toFile(path.join(outputDir, 'og-image.png'))
  .then(() => {
    console.log('✅ PNG 格式转换完成');
  })
  .catch((err) => {
    console.error('❌ PNG 转换失败:', err);
  });

