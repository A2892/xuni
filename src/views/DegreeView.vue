<template>
  <div class="degree-view">
    <div class="view-container">
      <div class="page-header">
        <h1>🎓 学位证书生成器</h1>
        <p>生成正式的学位证书</p>
      </div>

      <div class="content-grid">
        <!-- 左侧表单 -->
        <div class="form-panel">
          <div class="form-section">
            <h3>学位信息</h3>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" placeholder="张三" class="input-field" />
            </div>
            <div class="form-group">
              <label>学号</label>
              <input type="text" placeholder="2020001001" class="input-field" />
            </div>
            <div class="form-group">
              <label>学位类型</label>
              <select class="input-field">
                <option>学士学位</option>
                <option>硕士学位</option>
                <option>博士学位</option>
              </select>
            </div>
            <div class="form-group">
              <label>专业</label>
              <input type="text" placeholder="计算机科学与技术" class="input-field" />
            </div>
            <div class="form-group">
              <label>学院</label>
              <input type="text" placeholder="计算机学院" class="input-field" />
            </div>
            <div class="form-group">
              <label>毕业日期</label>
              <input type="date" class="input-field" />
            </div>
            <div class="form-group">
              <label>证书编号</label>
              <input type="text" placeholder="2024001001" class="input-field" />
            </div>
          </div>

          <button class="btn-primary">生成学位证书</button>
        </div>

        <!-- 右侧预览 -->
        <div class="preview-panel">
          <div class="certificate-preview">
            <div class="certificate-header">
              <h2>学位证书</h2>
              <p class="university-name">某某大学</p>
            </div>
            <div class="certificate-body">
              <p class="certificate-text">兹证明</p>
              <p class="student-name">张三</p>
              <p class="certificate-text">
                在本校完成了计算机科学与技术专业的学习，成绩合格，准予毕业。
                经审核，符合《中华人民共和国学位条例》的规定，授予<strong>学士学位</strong>。
              </p>
            </div>
            <div class="certificate-footer">
              <div class="signature-section">
                <p>校长签名：___________</p>
                <p>日期：2024年6月30日</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.degree-view {
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
}

.form-section {
  margin-bottom: 24px;
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
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4B6EF5, #6C5CE7);
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.certificate-preview {
  width: 600px;
  padding: 60px;
  background: linear-gradient(135deg, #fff9e6 0%, #ffe4e1 100%);
  border: 8px double #d4af37;
  border-radius: 8px;
  text-align: center;
}

.certificate-header h2 {
  font-size: 36px;
  color: #d4af37;
  margin: 0 0 16px 0;
  font-weight: 900;
  letter-spacing: 8px;
}

.university-name {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 40px 0;
}

.certificate-body {
  margin: 40px 0;
  line-height: 2;
}

.certificate-text {
  font-size: 16px;
  color: #2c3e50;
  margin: 16px 0;
}

.student-name {
  font-size: 28px;
  font-weight: 700;
  color: #c0392b;
  margin: 24px 0;
}

.signature-section {
  margin-top: 60px;
  text-align: right;
}

.signature-section p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}
</style>
