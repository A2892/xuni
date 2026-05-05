<script setup lang="ts">
import { ref } from 'vue'
import { useDriverStore } from '@/stores/driver'
import DriverLicensePreview from '@/components/DriverLicensePreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'

const store = useDriverStore()

const photoInput = ref<HTMLInputElement>()

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      store.updateDriverInfo({ portrait: result })
    }
    reader.readAsDataURL(file)
  }
}

const triggerPhotoUpload = () => photoInput.value?.click()

const getDriverData = () => ({ driverInfo: store.driverInfo, template: store.selectedTemplate })
const setDriverData = (data: any) => {
  if (data.driverInfo) store.updateDriverInfo(data.driverInfo)
  if (data.template) store.setTemplate(data.template)
}
</script>

<template>
  <div class="driver-license-page">
    <div class="page-container">
      <div class="form-section panel-card">
        <SaveLoadPanel document-type="driver_license" :get-data="getDriverData" :set-data="setDriverData" />

        <section class="form-group" style="margin-top:16px">
          <h3 class="section-title">📋 基本信息</h3>
          <div class="form-row">
            <div class="form-field">
              <label>姓名 *</label>
              <input v-model="store.driverInfo.fullName" type="text" placeholder="例：John Smith" />
            </div>
            <div class="form-field">
              <label>驾驶证号 *</label>
              <input v-model="store.driverInfo.licenseNumber" type="text" placeholder="例：D1234567" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>出生日期 *</label>
              <input v-model="store.driverInfo.dateOfBirth" type="date" />
            </div>
            <div class="form-field">
              <label>性别</label>
              <select v-model="store.driverInfo.sex">
                <option value="M">男 (M)</option>
                <option value="F">女 (F)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>身高</label>
              <input v-model="store.driverInfo.height" type="text" placeholder="例：5'10\"" />
            </div>
            <div class="form-field">
              <label>体重</label>
              <input v-model="store.driverInfo.weight" type="text" placeholder="例：160 lb" />
            </div>
            <div class="form-field">
              <label>眼睛颜色</label>
              <select v-model="store.driverInfo.eyeColor">
                <option value="BRN">棕色 (BRN)</option>
                <option value="BLU">蓝色 (BLU)</option>
                <option value="GRN">绿色 (GRN)</option>
                <option value="GRY">灰色 (GRY)</option>
                <option value="BLK">黑色 (BLK)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field full-width">
              <label>街道地址 *</label>
              <input v-model="store.driverInfo.address" type="text" placeholder="例如：123 NORTH STREET" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>城市</label>
              <input v-model="store.driverInfo.city" type="text" placeholder="例如：HOLTON" />
            </div>
            <div class="form-field">
              <label>邮编</label>
              <input v-model="store.driverInfo.zipCode" type="text" placeholder="例如：66436" />
            </div>
          </div>
        </section>

        <section class="form-group" style="margin-top:16px">
          <h3 class="section-title">📅 日期信息</h3>
          <div class="form-row">
            <div class="form-field">
              <label>签发日期</label>
              <input v-model="store.driverInfo.issueDate" type="date" />
            </div>
            <div class="form-field">
              <label>有效期至 *</label>
              <input v-model="store.driverInfo.expiryDate" type="date" />
            </div>
          </div>
        </section>

        <section class="form-group" style="margin-top:16px">
          <h3 class="section-title">🚗 驾驶信息</h3>
          <div class="form-row">
            <div class="form-field">
              <label>准驾车型 *</label>
              <select v-model="store.driverInfo.licenseClass">
                <option value="A">A - 摩托车</option>
                <option value="B">B - 小型汽车</option>
                <option value="C">C - 非商用车辆</option>
                <option value="D">D - 出租车</option>
                <option value="E">E - 商用车辆</option>
              </select>
            </div>
            <div class="form-field">
              <label>限制条件</label>
              <input v-model="store.driverInfo.restrictions" type="text" placeholder="例：NONE 或 CORRECTIVE LENSES" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>背书/认证</label>
              <input v-model="store.driverInfo.endorsements" type="text" placeholder="例如：NONE 或 H (危险品)" />
            </div>
            <div class="form-field">
              <label>器官捐献者</label>
              <select v-model="store.driverInfo.isDonor">
                <option :value="true">是 ❤</option>
                <option :value="false">否</option>
              </select>
            </div>
          </div>        </section>

        <section class="form-group" style="margin-top:16px">
          <h3 class="section-title">🌍 模板与照片</h3>
          <div class="form-row">
            <div class="form-field">
              <label>国家/地区模板 *</label>
              <select v-model="store.selectedTemplate">
                <option v-for="t in store.templates" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
          </div>
          
          <div class="photo-upload-section">
            <label>驾驶证照片</label>
            <div class="upload-container">
              <div class="photo-preview-large">
                <img v-if="store.driverInfo.portrait" :src="store.driverInfo.portrait" alt="portrait" />
                <div v-else class="preview-placeholder">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>上传照片</span>
                </div>
              </div>
              <button class="upload-btn-large" @click="triggerPhotoUpload">
                <span>📸</span>
                <span>{{ store.driverInfo.portrait ? '更换照片' : '选择照片' }}</span>
              </button>
              <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload" />
            </div>
            <p class="upload-hint">建议上传正面免冠照片，尺寸 140x170 像素</p>
          </div>
        </section>
      </div>

      <div class="preview-section">
        <div class="preview-header">
          <h3 class="section-title">👁️ 驾驶证预览</h3>
          <span class="preview-badge">实时预览</span>
        </div>
        <DriverLicensePreview />
      </div>
    </div>
  </div>
</template>

<style scoped>
.driver-license-page {
  padding: 24px;
  background: #f8fafc;
}

.page-container {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.form-section {
  flex: 1;
  min-width: 500px;
}

.panel-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-width {
  flex: 1 1 100%;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.form-field input,
.form-field select {
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-field input::placeholder {
  color: #94a3b8;
}

.photo-upload-section {
  margin-top: 12px;
}

.photo-upload-section > label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.upload-container {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
}

.photo-preview-large {
  width: 140px;
  height: 170px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  border: 3px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.photo-preview-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.preview-placeholder span {
  font-size: 12px;
  font-weight: 600;
}

.upload-btn-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.upload-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.upload-btn-large span:first-child {
  font-size: 24px;
}

.upload-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

.preview-section {
  width: 600px;
  position: sticky;
  top: 24px;
  height: fit-content;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

@media (max-width: 1200px) {
  .page-container {
    flex-direction: column;
  }
  
  .preview-section {
    width: 100%;
    position: relative;
    top: 0;
  }
}
</style>
