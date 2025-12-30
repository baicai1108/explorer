// new-server.js - 完全绕过老旧的ecstatic/union
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const ROOT_DIR = __dirname;

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // 默认首页
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // 构建文件路径
  const filePath = path.join(ROOT_DIR, pathname);
  
  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 文件不存在，尝试app目录
      const altPath = path.join(ROOT_DIR, 'app', pathname);
      fs.stat(altPath, (err2, stats2) => {
        if (err2 || !stats2.isFile()) {
          // 返回404
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - File Not Found\n' + pathname);
        } else {
          serveFile(altPath, res);
        }
      });
    } else {
      serveFile(filePath, res);
    }
  });
});

// 服务文件函数
function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = getContentType(ext);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 - Internal Server Error');
      return;
    }
    
    // 设置正确的Content-Type
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'  // 禁用缓存，避免ETag问题
    };
    
    res.writeHead(200, headers);
    res.end(data);
  });
}

// 获取Content-Type
function getContentType(ext) {
  const map = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.svg': 'image/svg+xml'
  };
  
  return map[ext] || 'application/octet-stream';
}

// 启动服务器
server.listen(PORT, () => {
  console.log(`✅ 区块链浏览器已启动！`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📁 服务目录: ${ROOT_DIR}`);
});

// 处理错误
server.on('error', (err) => {
  console.error('服务器错误:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`端口 ${PORT} 已被占用，尝试端口 ${PORT + 1}`);
    server.listen(PORT + 1);
  }
});