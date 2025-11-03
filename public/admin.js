class DramaManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadDramas();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('dramaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDrama();
        });
    }

    async loadDramas() {
        try {
            const response = await fetch('/api/dramas');
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            const dramas = await response.json();
            this.renderDramas(dramas);
        } catch (error) {
            this.showMessage('加载短剧失败: ' + error.message, 'error');
        }
    }

    renderDramas(dramas) {
        const container = document.getElementById('dramaList');
        container.innerHTML = '';

        if (dramas.length === 0) {
            container.innerHTML = '<p>暂无短剧数据</p>';
            return;
        }

        dramas.forEach(drama => {
            const dramaElement = this.createDramaElement(drama);
            container.appendChild(dramaElement);
        });
    }

    createDramaElement(drama) {
        const div = document.createElement('div');
        div.className = 'drama-item';
        div.innerHTML = `
            <div class="drama-header">
                <div class="drama-title">${drama.icon} ${drama.title}</div>
                <div class="drama-actions">
                    <button class="admin-btn btn-primary" onclick="dramaManager.editDrama(${drama.id})">编辑</button>
                    <button class="admin-btn btn-danger" onclick="dramaManager.deleteDrama(${drama.id})">删除</button>
                </div>
            </div>
            <div class="keywords">
                ${drama.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
            </div>
            <p>${drama.description}</p>
            <p><strong>网盘链接:</strong> <a href="${drama.panUrl}" target="_blank">${drama.panUrl}</a></p>
            ${drama.coverImage ? `<p><strong>封面:</strong> <a href="${drama.coverImage}" target="_blank">查看图片</a></p>` : ''}
        `;
        return div;
    }

    async saveDrama() {
        const formData = {
            title: document.getElementById('title').value,
            keywords: document.getElementById('keywords').value.split(',').map(k => k.trim()),
            description: document.getElementById('description').value,
            panUrl: document.getElementById('panUrl').value,
            icon: document.getElementById('icon').value,
            coverImage: document.getElementById('coverImage').value || undefined
        };

        // 验证必填字段
        if (!formData.title || !formData.keywords.length || !formData.description || !formData.panUrl) {
            this.showMessage('请填写所有必填字段', 'error');
            return;
        }

        const dramaId = document.getElementById('dramaId').value;

        try {
            let response;
            if (dramaId) {
                // 更新
                response = await fetch(`/api/dramas/${dramaId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // 新增
                response = await fetch('/api/dramas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (response.ok) {
                this.showMessage(dramaId ? '短剧更新成功!' : '短剧添加成功!', 'success');
                this.resetForm();
                await this.loadDramas();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || '保存失败');
            }
        } catch (error) {
            this.showMessage('保存失败: ' + error.message, 'error');
        }
    }

    async editDrama(id) {
        try {
            const response = await fetch(`/api/dramas/${id}`);
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            const drama = await response.json();

            document.getElementById('dramaId').value = drama.id;
            document.getElementById('title').value = drama.title;
            document.getElementById('keywords').value = drama.keywords.join(', ');
            document.getElementById('description').value = drama.description;
            document.getElementById('panUrl').value = drama.panUrl;
            document.getElementById('icon').value = drama.icon;
            document.getElementById('coverImage').value = drama.coverImage || '';

            // 滚动到表单
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            this.showMessage('加载短剧数据失败: ' + error.message, 'error');
        }
    }

    async deleteDrama(id) {
        if (!confirm('确定要删除这个短剧吗？此操作不可撤销。')) {
            return;
        }

        try {
            const response = await fetch(`/api/dramas/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('短剧删除成功!', 'success');
                await this.loadDramas();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || '删除失败');
            }
        } catch (error) {
            this.showMessage('删除失败: ' + error.message, 'error');
        }
    }

    resetForm() {
        document.getElementById('dramaForm').reset();
        document.getElementById('dramaId').value = '';
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
        
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }
}

// 初始化管理器
const dramaManager = new DramaManager();

// 全局函数供HTML调用
function resetForm() {
    dramaManager.resetForm();
}