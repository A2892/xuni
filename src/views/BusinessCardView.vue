<template>
  <div class="business-card-view">
    <div class="view-content">
      <div class="edit-panel">
        <div class="panel-header">
          <h2>💳 名片生成器</h2>
          <p>设计专业名片</p>
        </div>
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="activeTab = tab">{{ tab }}</button>
        </div>
        <div class="tab-content">
          <div v-show="activeTab === '个人信息'" class="form-section">
            <div class="form-group">
              <label>姓名</label>
              <input v-model="store.fullName" type="text" />
            </div>
            <div class="form-group">
              <label>职位</label>
              <input v-model="store.title" type="text" />
            </div>
            <div class="form-group">
              <label>公司</label>
              <input v-model="store.company" type="text" />
            </div>
            <div class="form-group">
              <label>部门</label>
              <input v-model="store.department" type="text" />
            </div>
          </div>
          <div v-show="activeTab === '联系方式'" class="form-section">
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="store.email" type="email" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>电话</label>
                <input v-model="store.phone" type="tel" />
              </div>
              <div class="form-group">
                <label>手机</label>
                <input v-model="store.mobile" type="tel" />
              </div>
            </div>
            <div class="form-group">
              <label>传真</label>
              <input v-model="store.fax" type="text" />
            </div>
            <div class="form-group">
              <label>网站</label>
              <input v-model="store.website" type="text" />
            </div>
            <div class="form-group">
              <label>地址</label>
              <textarea v-model="store.address" rows="2"></textarea>
            </div>
          </div>
          <div v-show="activeTab === '社交媒体'" class="form-section">
            <div class="form-group">
              <label>LinkedIn</label>
              <input v-model="store.linkedin" type="text" />
            </div>
            <div class="form-group">
              <label>Twitter</label>
              <input v-model="store.twitter" type="text" />
            </div>
            <div class="form-group">
              <label>Instagram</label>
              <input v-model="store.instagram" type="text" />
            </div>
            <div class="form-group">
              <label>微信</label>
              <input v-model="store.wechat" type="text" />
            </div>
          </div>
          <div v-show="activeTab === '品牌'" class="form-section">
            <div class="form-group">
              <label>公司Logo</label>
              <input type="file" accept="image/*" @change="handleLogoUpload" />
              <div v-if="store.logo" class="image-preview">
                <img :src="store.logo" alt="Logo" />
                <button @click="store.logo = ''" class="btn-remove">删除</button>
              </div>
            </div>
            <div class="form-group">
              <label>个人照片</label>
              <input type="file" accept="image/*" @change="handlePhotoUpload" />
              <div v-if="store.photo" class="image-preview">
                <img :src="store.photo" alt="Photo" />
                <button @click="store.photo = ''" class="btn-remove">删除</button>
              </div>
            </div>
          </div>
          <div v-show="activeTab === '设计'" class="form-section">
            <h4>模板</h4>
            <div class="template-grid">
              <div v-for="t in store.templates" :key="t.id" :class="['template-card', { active: store.settings.template === t.id }]" @click="store.settings.template = t.id">
                <span>{{ t.name }}</span>
              </div>
            </div>
            <h4>颜色预设</h4>
            <div class="color-presets">
              <button v-for="c in store.colorPresets" :key="c.name" :style="{ background: c.primary }" :class="['color-btn', { active: store.settings.primaryColor === c.primary }]" @click="store.settings.primaryColor = c.primary; store.settings.secondaryColor = c.secondary"></button>
            </div>
            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label>主色</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
              <div class="form-group">
                <label>副色</label>
                <input v-model="store.settings.secondaryColor" type="color" />
              </div>
            </div>
            <div class="options-grid" style="margin-top: 16px;">
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showPhoto" /> 显示照片</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showLogo" /> 显示Logo</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showQR" /> 显示二维码</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showSocialIcons" /> 显示社交图标</label>
            </div>
          </div>
          <!-- 数据管理 -->
          <div v-show="activeTab === '数据管理'" class="form-section">
            <SaveLoadPanel 
              document-type="business_card"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>名片预览</span>
          <button @click="downloadCard" class="btn-download">下载 PNG</button>
        </div>
        <div class="preview-container">
          <BusinessCardPreview ref="previewRef" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBusinessCardStore } from '@/stores/businessCard'
import BusinessCardPreview from '@/components/BusinessCardPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import html2canvas from 'html2canvas'

const store = useBusinessCardStore()
const activeTab = ref('个人信息')
const tabs = ['个人信息', '联系方式', '社交媒体', '品牌', '设计', '数据管理']
const previewRef = ref()

const handleLogoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.logo = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handlePhotoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.photo = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const downloadCard = async () => {
  if (!previewRef.value?.$el) return
  const canvas = await html2canvas(previewRef.value.$el, { scale: 4, useCORS: true, backgroundColor: null })
  const link = document.createElement('a')
  link.download = `${store.fullName}_BusinessCard.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<style scoped>
.business-card-view { height: 100%; display: flex; flex-direction: column; }
.view-content { flex: 1; display: flex; gap: 24px; padding: 24px; overflow: hidden; }
.edit-panel { width: 380px; min-width: 380px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.panel-header h2 { margin: 0 0 4px 0; font-size: 20px; }
.panel-header p { margin: 0; font-size: 13px; color: #6b7280; }
.tabs { display: flex; gap: 4px; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; overflow-x: auto; }
.tab { padding: 8px 12px; border: none; background: transparent; color: #6b7280; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; white-space: nowrap; }
.tab:hover { background: #e5e7eb; }
.tab.active { background: #2563eb; color: white; }
.tab-content { flex: 1; padding: 20px; overflow-y: auto; }
.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #374151; }
.form-group input, .form-group select, .form-group textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
.image-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
.image-preview img { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
.btn-remove { padding: 4px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
h4 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.template-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.template-card { padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 8px; text-align: center; font-size: 11px; cursor: pointer; }
.template-card:hover { border-color: #2563eb; }
.template-card.active { border-color: #2563eb; background: #eff6ff; }
.color-presets { display: flex; gap: 8px; flex-wrap: wrap; }
.color-btn { width: 32px; height: 32px; border: 2px solid transparent; border-radius: 6px; cursor: pointer; }
.color-btn.active { border-color: #1f2937; }
.options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.checkbox-option { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.preview-panel { flex: 1; display: flex; flex-direction: column; background: #f1f5f9; border-radius: 16px; overflow: hidden; }
.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-bottom: 1px solid #e5e7eb; }
.preview-toolbar span { font-size: 14px; font-weight: 600; }
.btn-download { padding: 10px 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.preview-container { flex: 1; padding: 24px; overflow: auto; display: flex; justify-content: center; align-items: center; }
</style>
