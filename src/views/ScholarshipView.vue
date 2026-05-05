<template>
  <div class="scholarship-view">
    <div class="view-container">
      <div class="page-header">
        <h1>🏆 奖学金证书生成器</h1>
        <p>生成精美的奖学金证书</p>
      </div>

      <div class="content-grid">
        <div class="form-panel">
          <div class="form-section">
            <h3>获奖信息</h3>
            <div class="form-group">
              <label>学生姓名</label>
              <input type="text" placeholder="王芳" class="input-field" />
            </div>
            <div class="form-group">
              <label>学号</label>
              <input type="text" placeholder="2021001001" class="input-field" />
            </div>
            <div class="form-group">
              <label>学院</label>
              <input type="text" placeholder="计算机学院" class="input-field" />
            </div>
            <div class="form-group">
              <label>专业</label>
              <input type="text" placeholder="计算机科学与技术" class="input-field" />
            </div>
            <div class="form-group">
              <label>奖学金类型</label>
              <select class="input-field">
                <option>国家奖学金</option>
                <option>国家励志奖学金</option>
                <option>校级一等奖学金</option>
                <option>校级二等奖学金</option>
                <option>校级三等奖学金</option>
                <option>企业奖学金</option>
              </select>
            </div>
            <div class="form-group">
              <label>奖金金额</label>
              <input type="text" placeholder="8000" class="input-field" />
            </div>
            <div class="form-group">
              <label>学年</label>
              <input type="text" placeholder="2023-2024学年" class="input-field" />
            </div>
            <div class="form-group">
              <label>颁发日期</label>
              <input type="date" class="input-field" />
            </div>
            <div class="form-group">
              <label>证书编号</label>
              <input type="text" placeholder="2024GJ001" class="input-field" />
            </div>
          </div>

          <button class="btn-primary">生成奖学金证书</button>
        </div>

        <div class="preview-panel">
          <div class="certificate-preview">
            <div class="certificate-border">
              <div class="certificate-corner tl"></div>
              <div class="certificate-corner tr"></div>
              <div class="certificate-corner bl"></div>
              <div class="certificate-corner br"></div>
              
              <div class="trophy-icon">🏆</div>
              
              <h2 class="certificate-title">奖学金证书</h2>
              <h3 class="scholarship-type">国家奖学金</h3>
              
              <div class="student-name">王芳</div>
              
              <div class="certificate-content">
                <p>该同学在2023-2024学年品学兼优，</p>
                <p>全面发展，成绩优异，</p>
                <p>经学校评审委员会评定，</p>
                <p>特授予<span class="highlight">国家奖学金</span></p>
                <p>奖金人民币<span class="amount">捌仟元整</span></p>
                <p>以资鼓励</p>
              </div>
              
              <div class="certificate-footer">
                <div class="info-row">
                  <span>学院：计算机学院</span>
                  <span>学号：2021001001</span>
                </div>
                <div class="info-row">
                  <span>专业：计算机科学与技术</span>
                </div>
                <div class="info-row">
                  <span>证书编号：2024GJ001</span>
                </div>
                <div class="seal-date">
                  <div class="university-seal">校印</div>
                  <p class="issue-date">2024年12月30日</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scholarship-view {
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
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
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
  width: 700px;
}

.certificate-border {
  padding: 50px;
  background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
  border: 8px double #d4af37;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.certificate-corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 3px solid #d4af37;
}

.tl {
  top: 20px;
  left: 20px;
  border-right: none;
  border-bottom: none;
}

.tr {
  top: 20px;
  right: 20px;
  border-left: none;
  border-bottom: none;
}

.bl {
  bottom: 20px;
  left: 20px;
  border-right: none;
  border-top: none;
}

.br {
  bottom: 20px;
  right: 20px;
  border-left: none;
  border-top: none;
}

.trophy-icon {
  text-align: center;
  font-size: 64px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.certificate-title {
  text-align: center;
  font-size: 40px;
  color: #d4af37;
  margin: 0 0 16px 0;
  font-weight: 900;
  letter-spacing: 12px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.scholarship-type {
  text-align: center;
  font-size: 24px;
  color: #c0392b;
  margin: 0 0 30px 0;
  font-weight: 700;
  letter-spacing: 4px;
}

.student-name {
  text-align: center;
  font-size: 32px;
  font-weight: 900;
  color: #2c3e50;
  margin: 30px 0;
  text-decoration: underline;
  text-decoration-color: #d4af37;
  text-underline-offset: 8px;
}

.certificate-content {
  text-align: center;
  margin: 40px 0;
  line-height: 2.2;
}

.certificate-content p {
  font-size: 16px;
  color: #2c3e50;
  margin: 8px 0;
}

.highlight {
  color: #c0392b;
  font-weight: 700;
  font-size: 18px;
}

.amount {
  color: #e67e22;
  font-weight: 900;
  font-size: 20px;
}

.certificate-footer {
  margin-top: 50px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
  margin: 8px 0;
}

.seal-date {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 40px;
}

.university-seal {
  width: 90px;
  height: 90px;
  border: 4px solid #c0392b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 900;
  color: #c0392b;
  opacity: 0.6;
}

.issue-date {
  font-size: 14px;
  color: #555;
  margin: 0;
}
</style>
