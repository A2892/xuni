<template>
  <div class="internship-view">
    <div class="view-container">
      <div class="page-header">
        <h1>💼 实习证明生成器</h1>
        <p>生成专业的实习证明</p>
      </div>

      <div class="content-grid">
        <div class="form-panel">
          <div class="form-section">
            <h3>公司信息</h3>
            <div class="form-group">
              <label>公司名称</label>
              <input type="text" placeholder="某某科技有限公司" class="input-field" />
            </div>
            <div class="form-group">
              <label>公司地址</label>
              <input type="text" placeholder="北京市朝阳区" class="input-field" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input type="tel" placeholder="010-12345678" class="input-field" />
            </div>
          </div>

          <div class="form-section">
            <h3>实习生信息</h3>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" placeholder="李明" class="input-field" />
            </div>
            <div class="form-group">
              <label>学校</label>
              <input type="text" placeholder="某某大学" class="input-field" />
            </div>
            <div class="form-group">
              <label>专业</label>
              <input type="text" placeholder="软件工程" class="input-field" />
            </div>
            <div class="form-group">
              <label>实习部门</label>
              <input type="text" placeholder="技术部" class="input-field" />
            </div>
            <div class="form-group">
              <label>实习岗位</label>
              <input type="text" placeholder="软件开发工程师" class="input-field" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>开始日期</label>
                <input type="date" class="input-field" />
              </div>
              <div class="form-group">
                <label>结束日期</label>
                <input type="date" class="input-field" />
              </div>
            </div>
          </div>

          <button class="btn-primary">生成实习证明</button>
        </div>

        <div class="preview-panel">
          <div class="certificate-preview">
            <h2 class="title">实习证明</h2>
            <div class="content">
              <p class="paragraph">
                兹证明<span class="highlight">李明</span>同学（<span class="highlight">某某大学软件工程</span>专业）
                于<span class="highlight">2024年7月1日</span>至<span class="highlight">2024年9月30日</span>
                在我公司<span class="highlight">技术部</span>进行实习。
              </p>
              <p class="paragraph">
                实习期间，该同学担任<span class="highlight">软件开发工程师</span>岗位，
                工作认真负责，积极主动，能够很好地完成安排的各项任务。
                该同学具备良好的专业素养和团队协作精神，得到了部门领导和同事的一致好评。
              </p>
              <p class="paragraph">
                特此证明。
              </p>
            </div>
            <div class="footer">
              <div class="company-info">
                <p class="company-name">某某科技有限公司</p>
                <p class="company-detail">地址：北京市朝阳区</p>
                <p class="company-detail">电话：010-12345678</p>
                <div class="seal-area">
                  <div class="company-seal">公司公章</div>
                </div>
                <p class="date">2024年9月30日</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.internship-view {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.view-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
}

.form-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-height: 800px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.preview-panel {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.certificate-preview {
  max-width: 650px;
  margin: 0 auto;
  padding: 50px;
  background: #fff;
  border: 2px solid #3498db;
  border-radius: 8px;
}

.title {
  text-align: center;
  font-size: 32px;
  color: #2c3e50;
  margin: 0 0 40px 0;
  font-weight: 900;
  letter-spacing: 8px;
  border-bottom: 3px solid #3498db;
  padding-bottom: 20px;
}

.content {
  margin: 30px 0;
}

.paragraph {
  font-size: 16px;
  line-height: 2.2;
  color: #2c3e50;
  margin-bottom: 24px;
  text-indent: 2em;
}

.highlight {
  font-weight: 700;
  color: #3498db;
}

.footer {
  margin-top: 60px;
}

.company-info {
  text-align: right;
}

.company-name {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.company-detail {
  font-size: 13px;
  color: #555;
  margin: 6px 0;
}

.seal-area {
  margin: 30px 0;
  display: flex;
  justify-content: flex-end;
}

.company-seal {
  width: 100px;
  height: 100px;
  border: 3px solid #e74c3c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  color: #e74c3c;
  opacity: 0.7;
  transform: rotate(-15deg);
}

.date {
  font-size: 14px;
  color: #555;
  margin-top: 20px;
}
</style>
