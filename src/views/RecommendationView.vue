<template>
  <div class="recommendation-view">
    <div class="view-container">
      <div class="page-header">
        <h1>✉️ 推荐信生成器</h1>
        <p>生成专业的推荐信</p>
      </div>

      <div class="content-grid">
        <div class="form-panel">
          <div class="form-section">
            <h3>推荐人信息</h3>
            <div class="form-group">
              <label>推荐人姓名</label>
              <input type="text" placeholder="王教授" class="input-field" />
            </div>
            <div class="form-group">
              <label>职位/职称</label>
              <input type="text" placeholder="教授、博士生导师" class="input-field" />
            </div>
            <div class="form-group">
              <label>单位</label>
              <input type="text" placeholder="某某大学计算机学院" class="input-field" />
            </div>
            <div class="form-group">
              <label>联系邮箱</label>
              <input type="email" placeholder="professor@university.edu" class="input-field" />
            </div>
          </div>

          <div class="form-section">
            <h3>被推荐人信息</h3>
            <div class="form-group">
              <label>学生姓名</label>
              <input type="text" placeholder="张三" class="input-field" />
            </div>
            <div class="form-group">
              <label>申请目标</label>
              <input type="text" placeholder="硕士研究生" class="input-field" />
            </div>
          </div>

          <button class="btn-primary">生成推荐信</button>
        </div>

        <div class="preview-panel">
          <div class="letter-preview">
            <div class="letter-header">
              <p class="date">2024年12月30日</p>
            </div>
            <div class="letter-content">
              <p class="greeting">尊敬的招生委员会：</p>
              <p class="paragraph">
                我是某某大学计算机学院的教授，很荣幸为张三同学撰写这封推荐信。
                我与该生相识已有三年，期间担任其专业课教师和项目指导老师。
              </p>
              <p class="paragraph">
                张三同学学习认真刻苦，专业基础扎实，在课程学习中表现优异。
                该生具有良好的科研潜力和创新能力，曾参与多个科研项目，
                展现出色的团队协作能力和独立思考能力。
              </p>
              <p class="paragraph">
                基于以上，我强烈推荐张三同学攻读贵校的硕士研究生项目。
                相信该生一定能够在贵校继续取得优异成绩。
              </p>
            </div>
            <div class="letter-footer">
              <p class="signature">推荐人：王教授</p>
              <p class="position">教授、博士生导师</p>
              <p class="organization">某某大学计算机学院</p>
              <p class="contact">邮箱：professor@university.edu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recommendation-view {
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
  display: flex;
  gap: 24px;
}

.form-panel {
  flex: 5.5;
  min-width: 0;
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
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #27ae60, #229954);
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
  flex: 4.5;
  min-width: 0;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.letter-preview {
  max-width: 700px;
  margin: 0 auto;
  padding: 60px;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.letter-header {
  text-align: right;
  margin-bottom: 40px;
}

.date {
  font-size: 14px;
  color: #555;
  margin: 0;
}

.letter-content {
  margin: 30px 0;
}

.greeting {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #2c3e50;
}

.paragraph {
  font-size: 15px;
  line-height: 2;
  text-indent: 2em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.letter-footer {
  margin-top: 60px;
  text-align: right;
}

.letter-footer p {
  margin: 8px 0;
  font-size: 14px;
  color: #2c3e50;
}

.signature {
  font-weight: 600;
  font-size: 15px;
}

.position, .organization, .contact {
  font-size: 13px;
  color: #555;
}
</style>
