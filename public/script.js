// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const directoryBtn = document.getElementById('directoryBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const friendLinksContainer = document.getElementById('friendLinksContainer');
    
    let allDramas = [];
    
    // 初始化加载数据
    loadDramas();
    
    // 搜索功能
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 总目录功能
    directoryBtn.addEventListener('click', showDirectory);
    
    // 加载短剧数据
    async function loadDramas() {
        try {
            const response = await fetch('/api/dramas');
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            allDramas = await response.json();
        } catch (error) {
            console.error('加载数据失败:', error);
            // 如果后端不可用，使用备用数据
            if (typeof dramaData !== 'undefined') {
                allDramas = dramaData;
            } else {
                allDramas = [];
                showMessage('数据加载失败，请刷新页面重试', 'error');
            }
        }
    }
    
    // 执行搜索
    async function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            showInitialState();
            return;
        }
        
        let filteredDramas = [];
        
        try {
            // 尝试使用后端搜索
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('搜索请求失败');
            }
            filteredDramas = await response.json();
        } catch (error) {
            console.error('搜索失败，使用前端搜索:', error);
            // 如果后端搜索失败，使用前端搜索
            filteredDramas = allDramas.filter(drama => {
                return drama.title.toLowerCase().includes(query) || 
                       drama.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
                       drama.description.toLowerCase().includes(query);
            });
        }
        
        displayResults(filteredDramas, query);
    }
    
    // 显示搜索结果
    function displayResults(dramas, query) {
        resultsContainer.innerHTML = '';
        
        if (dramas.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>没有找到与"${query}"相关的短剧</h3>
                    <p>请尝试其他关键词或查看总目录</p>
                </div>
            `;
            // 显示友情链接
            friendLinksContainer.classList.add('visible');
            return;
        }
        
        dramas.forEach(drama => {
            const dramaCard = createDramaCard(drama);
            resultsContainer.appendChild(dramaCard);
        });
        
        // 显示友情链接
        friendLinksContainer.classList.add('visible');
    }
    
    // 创建短剧卡片
    function createDramaCard(drama) {
        const card = document.createElement('div');
        card.className = 'drama-card';
        
        card.innerHTML = `
            <div class="drama-image" style="background-image: url('${drama.coverImage}')">
                <div class="drama-icon">${drama.icon}</div>
            </div>
            <div class="drama-content">
                <h3 class="drama-title">${drama.title}</h3>
                <div class="drama-keywords">
                    ${drama.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
                </div>
                <p class="drama-description">${drama.description}</p>
                <div class="drama-actions">
                    <a href="${drama.panUrl}" target="_blank" class="btn-primary">转存到网盘</a>
                    <a href="${drama.panUrl}" target="_blank" class="btn-secondary">查看详情</a>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // 显示总目录
    function showDirectory() {
        resultsContainer.innerHTML = '';
        
        const directoryView = document.createElement('div');
        directoryView.className = 'directory-view';
        
        directoryView.innerHTML = `
            <div class="directory-header">
                <h2>短剧总目录 (${allDramas.length}部)</h2>
                <button class="back-btn" id="backToSearch">返回搜索</button>
            </div>
            <div class="drama-list">
                ${allDramas.map(drama => `
                    <div class="drama-item">
                        <span class="drama-item-name">
                            ${drama.icon} ${drama.title}
                        </span>
                        <a href="${drama.panUrl}" target="_blank" class="drama-item-link">转存</a>
                    </div>
                `).join('')}
            </div>
        `;
        
        resultsContainer.appendChild(directoryView);
        
        // 显示友情链接
        friendLinksContainer.classList.add('visible');
        
        // 添加返回按钮事件
        document.getElementById('backToSearch').addEventListener('click', showInitialState);
    }
    
    // 显示初始状态
    function showInitialState() {
        resultsContainer.innerHTML = `
            <div class="initial-state">
                <h3>欢迎使用短剧网盘转存系统</h3>
                <p>输入关键词搜索短剧，或点击"查看总目录"浏览所有短剧</p>
            </div>
        `;
        
        // 隐藏友情链接
        friendLinksContainer.classList.remove('visible');
    }
    
    // 显示消息
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.style.cssText = `
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            background: ${type === 'error' ? '#f8d7da' : '#d4edda'};
            color: ${type === 'error' ? '#721c24' : '#155724'};
            border: 1px solid ${type === 'error' ? '#f5c6cb' : '#c3e6cb'};
        `;
        messageDiv.textContent = message;
        
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
            showInitialState();
        }, 3000);
    }
    
    // 初始化页面状态
    showInitialState();
});