const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// 内存数据存储（替代文件存储）
let dramaData = [
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
    },
    {
        id: 3,
        title: "重生之商界巨鳄",
        keywords: ["重生", "商战", "逆袭", "都市"],
        description: "商业精英重生回到年轻时代，利用未来知识在商界掀起惊涛骇浪的传奇故事。",
        panUrl: "https://pan.baidu.com/s/3ghi789jkl012mno",
        icon: "💰",
        coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop"
    },
    {
        id: 4,
        title: "校花的贴身高手",
        keywords: ["校园", "高手", "保镖", "青春"],
        description: "神秘高手化身学生，成为校花贴身保镖，展开一段惊险刺激的校园生活。",
        panUrl: "https://pan.baidu.com/s/4jkl012mno345pqr",
        icon: "🎓",
        coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop"
    }
];

// API路由

// 获取所有短剧
app.get('/api/dramas', (req, res) => {
    res.json(dramaData);
});

// 根据ID获取短剧
app.get('/api/dramas/:id', (req, res) => {
    const drama = dramaData.find(d => d.id === parseInt(req.params.id));
    if (!drama) {
        return res.status(404).json({ error: '短剧未找到' });
    }
    res.json(drama);
});

// 搜索短剧
app.get('/api/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    
    const results = dramaData.filter(drama => 
        drama.title.toLowerCase().includes(query) || 
        drama.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
        drama.description.toLowerCase().includes(query)
    );
    
    res.json(results);
});

// 添加短剧（内存存储版本）
app.post('/api/dramas', (req, res) => {
    const newDrama = {
        id: Math.max(...dramaData.map(d => d.id), 0) + 1,
        title: req.body.title,
        keywords: req.body.keywords || [],
        description: req.body.description,
        panUrl: req.body.panUrl,
        icon: req.body.icon || "📺",
        coverImage: req.body.coverImage || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop"
    };
    
    dramaData.push(newDrama);
    res.status(201).json(newDrama);
});

// 更新短剧（内存存储版本）
app.put('/api/dramas/:id', (req, res) => {
    const index = dramaData.findIndex(d => d.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ error: '短剧未找到' });
    }
    
    dramaData[index] = {
        ...dramaData[index],
        ...req.body,
        id: dramaData[index].id
    };
    
    res.json(dramaData[index]);
});

// 删除短剧（内存存储版本）
app.delete('/api/dramas/:id', (req, res) => {
    const index = dramaData.findIndex(d => d.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ error: '短剧未找到' });
    }
    
    const deletedDrama = dramaData.splice(index, 1)[0];
    res.json({ message: '删除成功', drama: deletedDrama });
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
    console.log(`短剧网盘系统运行在端口 ${PORT}`);
    console.log(`管理后台: http://localhost:${PORT}/admin`);
    console.log('数据使用内存存储，重启后数据会重置');
});