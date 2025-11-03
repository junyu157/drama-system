const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data', 'dramaData.json');

// 确保数据目录存在
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// 读取数据
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取数据失败:', error);
  }
  
  // 默认数据
  const defaultData = [
    {
      id: 1,
      title: "霸道总裁爱上我",
      keywords: ["霸道总裁", "爱情", "都市", "职场"],
      description: "一位普通女孩与霸道总裁之间的浪漫爱情故事，充满戏剧性的职场与情感冲突。",
      panUrl: "https://pan.baidu.com/s/1abc123def456ghi",
      icon: "💼",
      coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "神医王妃",
      keywords: ["古装", "穿越", "医术", "宫廷"],
      description: "现代医学博士穿越到古代，成为废柴王妃，凭借高超医术逆袭人生的精彩故事。",
      panUrl: "https://pan.baidu.com/s/2def456ghi789jkl",
      icon: "👑",
      coverImage: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=250&fit=crop"
    }
  ];
  
  writeData(defaultData);
  return defaultData;
}

// 写入数据
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入数据失败:', error);
    return false;
  }
}

// API路由

// 获取所有短剧
app.get('/api/dramas', (req, res) => {
  const data = readData();
  res.json(data);
});

// 根据ID获取短剧
app.get('/api/dramas/:id', (req, res) => {
  const data = readData();
  const drama = data.find(d => d.id === parseInt(req.params.id));
  if (!drama) {
    return res.status(404).json({ error: '短剧未找到' });
  }
  res.json(drama);
});

// 搜索短剧
app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const data = readData();
  
  const results = data.filter(drama => 
    drama.title.toLowerCase().includes(query) || 
    drama.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
    drama.description.toLowerCase().includes(query)
  );
  
  res.json(results);
});

// 添加短剧
app.post('/api/dramas', (req, res) => {
  const data = readData();
  const newDrama = {
    id: Math.max(...data.map(d => d.id), 0) + 1,
    title: req.body.title,
    keywords: req.body.keywords || [],
    description: req.body.description,
    panUrl: req.body.panUrl,
    icon: req.body.icon || "📺",
    coverImage: req.body.coverImage || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop"
  };
  
  data.push(newDrama);
  
  if (writeData(data)) {
    res.status(201).json(newDrama);
  } else {
    res.status(500).json({ error: '添加短剧失败' });
  }
});

// 更新短剧
app.put('/api/dramas/:id', (req, res) => {
  const data = readData();
  const index = data.findIndex(d => d.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: '短剧未找到' });
  }
  
  data[index] = {
    ...data[index],
    ...req.body,
    id: data[index].id
  };
  
  if (writeData(data)) {
    res.json(data[index]);
  } else {
    res.status(500).json({ error: '更新短剧失败' });
  }
});

// 删除短剧
app.delete('/api/dramas/:id', (req, res) => {
  const data = readData();
  const index = data.findIndex(d => d.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: '短剧未找到' });
  }
  
  const deletedDrama = data.splice(index, 1)[0];
  
  if (writeData(data)) {
    res.json({ message: '删除成功', drama: deletedDrama });
  } else {
    res.status(500).json({ error: '删除短剧失败' });
  }
});

// 前端页面路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`短剧网盘系统运行在 http://localhost:${PORT}`);
  console.log(`管理后台: http://localhost:${PORT}/admin`);
});