<template>
  <div class="student-photo-view">
    <div class="view-container">
      <div class="main-tabs">
        <button 
          :class="['main-tab-btn', { active: mainTab === 'gallery' }]"
          @click="mainTab = 'gallery'"
        >
          📚 照片库
        </button>
        <button 
          :class="['main-tab-btn', { active: mainTab === 'upload' }]"
          @click="mainTab = 'upload'"
        >
          📤 上传文件
        </button>
        <button 
          :class="['main-tab-btn', { active: mainTab === 'generator' }]"
          @click="mainTab = 'generator'"
        >
          🎨 证件照生成器
        </button>
      </div>

      <!-- 照片库 -->
      <div v-show="mainTab === 'gallery'" class="tab-content">
        <MediaGallery />
      </div>

      <!-- 上传文件 -->
      <div v-show="mainTab === 'upload'" class="tab-content">
        <MediaUpload />
      </div>

      <!-- 证件照生成器 -->
      <div v-show="mainTab === 'generator'" class="tab-content">
        <div class="content-grid">
          <!-- Left Form Panel -->
          <div class="form-panel">
            <div class="tabs">
              <button 
                :class="['tab-btn', { active: activeTab === 'photo' }]"
                @click="activeTab = 'photo'"
              >
                照片设置
              </button>
              <button 
                :class="['tab-btn', { active: activeTab === 'design' }]"
                @click="activeTab = 'design'"
              >
                设计选项
              </button>
              <button 
                :class="['tab-btn', { active: activeTab === 'download' }]"
                @click="activeTab = 'download'"
              >
                下载
              </button>
            </div>

          <!-- 照片设置 -->
          <div v-show="activeTab === 'photo'" class="form-section">
            <h3>上传照片</h3>
            <div class="form-group">
              <label>选择照片</label>
              <input type="file" @change="handlePhotoUpload" accept="image/*" class="input-field" />
              <p class="hint">支持 JPG、PNG 格式</p>
            </div>

            <h3>照片信息</h3>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" v-model="studentName" placeholder="张三" class="input-field" />
            </div>
            <div class="form-group">
              <label>学号</label>
              <input type="text" v-model="studentId" placeholder="2024001001" class="input-field" />
            </div>
            <div class="form-group">
              <label>拍摄日期</label>
              <input type="date" v-model="photoDate" class="input-field" />
            </div>
          </div>

          <!-- 设计选项 -->
          <div v-show="activeTab === 'design'" class="form-section">
            <h3>照片尺寸</h3>
            <div class="form-group">
              <label>尺寸规格</label>
              <select v-model="photoSize" class="input-field">
                <option>一寸 (25mm × 35mm)</option>
                <option>小二寸 (33mm × 48mm)</option>
                <option>二寸 (35mm × 53mm)</option>
                <option>护照 (33mm × 48mm)</option>
              </select>
            </div>
            <div class="form-group">
              <label>背景颜色</label>
              <div class="color-input">
                <input type="color" v-model="bgColor" />
                <input type="text" v-model="bgColor" placeholder="#FFFFFF" />
              </div>
            </div>
          </div>

          <!-- 下载 -->
          <div v-show="activeTab === 'download'" class="form-section">
            <h3>导出设置</h3>
            <div class="form-group">
              <label>导出格式</label>
              <select v-model="exportFormat" class="input-field">
                <option>PNG</option>
                <option>JPG</option>
              </select>
            </div>
            <div class="form-group">
              <label>导出质量</label>
              <select v-model="exportQuality" class="input-field">
                <option>标准质量</option>
                <option>高清质量</option>
                <option>超高清 (推荐)</option>
              </select>
            </div>
            <button class="btn-primary" @click="downloadPhoto">⬇ 下载证件照</button>
          </div>
        </div>

        <!-- Right Preview Panel -->
        <div class="preview-panel">
          <div class="photo-preview" :style="{ backgroundColor: bgColor }">
            <div v-if="photoPreview" class="photo-container">
              <img :src="photoPreview" alt="Student Photo" class="student-photo" />
            </div>
            <div v-else class="photo-placeholder">
              <span>📷</span>
              <p>请上传照片</p>
            </div>
            
            <div class="photo-info">
              <p>{{ studentName || '学生姓名' }}</p>
              <p>{{ studentId || '学号' }}</p>
              <p>{{ photoDate || '日期' }}</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MediaGallery from '@/components/MediaGallery.vue'
import MediaUpload from '@/components/MediaUpload.vue'

const mainTab = ref('gallery')
const activeTab = ref('photo')
const photoPreview = ref('')
const studentName = ref('')
const studentId = ref('')
const photoDate = ref(new Date().toISOString().split('T')[0])
const photoSize = ref('二寸 (35mm × 53mm)')
const bgColor = ref('#FFFFFF')
const exportFormat = ref('PNG')
const exportQuality = ref('超高清 (推荐)')

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const downloadPhoto = async () => {
  const element = document.querySelector('.photo-preview') as HTMLElement
  if (!element) return

  try {
    const { default: html2canvas } = await import('html2canvas')
    
    const qualitySettings: Record<string, number> = {
      '标准质量': 2,
      '高清质量': 3,
      '超高清 (推荐)': 4
    }
    
    const scale = qualitySettings[exportQuality.value] || 4

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: bgColor.value
    })

    const mimeType = exportFormat.value === 'PNG' ? 'image/png' : 'image/jpeg'
    const extension = exportFormat.value === 'PNG' ? 'png' : 'jpg'
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${studentName.value || '学生照片'}.${extension}`
        link.click()
        URL.revokeObjectURL(url)
      }
    }, mimeType, 0.95)
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败，请重试')
  }
}
</script>

<style scoped>
.student-photo-view {
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

.main-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.main-tab-btn {
  flex: 1;
  padding: 14px 20px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.main-tab-btn:hover {
  background: #f5f5f5;
  border-color: #4B6EF5;
  color: #4B6EF5;
}

.main-tab-btn.active {
  background: #4B6EF5;
  color: white;
  border-color: #4B6EF5;
  box-shadow: 0 2px 8px rgba(75, 110, 245, 0.3);
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
}

.form-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #003d82;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #003d82;
  font-weight: 600;
  border-bottom-color: #003d82;
  background: #f0f4f8;
}

.form-section {
  padding: 24px;
  max-height: 600px;
  overflow-y: auto;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
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
  transition: all 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #003d82;
  box-shadow: 0 0 0 3px rgba(0, 61, 130, 0.1);
}

.hint {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0 0;
}

.color-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input input[type="color"] {
  width: 50px;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-input input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.btn-primary {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #003d82, #0052a8);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 61, 130, 0.4);
}

.preview-panel {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
}

.photo-preview {
  width: 350px;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.photo-container {
  width: 100%;
  aspect-ratio: 35 / 53;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 20px;
}

.student-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  aspect-ratio: 35 / 53;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
}

.photo-placeholder span {
  font-size: 48px;
  margin-bottom: 12px;
}

.photo-placeholder p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.photo-info {
  margin-top: 20px;
}

.photo-info p {
  margin: 8px 0;
  font-size: 13px;
  color: #666;
}
</style>
