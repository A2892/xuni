<template>
  <Teleport to="body">
    <div v-if="visible" class="email-modal-overlay" @click.self="close">
      <div class="email-modal">
        <div class="modal-header">
          <h3>📧 发送到邮箱</h3>
          <button class="close-btn" @click="close">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 发送方式选择 -->
          <div class="form-group">
            <label>发送方式</label>
            <div class="send-method-options">
              <label class="method-option">
                <input type="radio" v-model="sendMethod" value="direct" />
                <span class="method-card" :class="{ active: sendMethod === 'direct' }">
                  <span class="method-icon">🚀</span>
                  <span class="method-name">直接发送</span>
                  <span class="method-desc">从网站直接发送邮件</span>
                </span>
              </label>
              <label class="method-option">
                <input type="radio" v-model="sendMethod" value="download" />
                <span class="method-card" :class="{ active: sendMethod === 'download' }">
                  <span class="method-icon">📥</span>
                  <span class="method-name">下载后发送</span>
                  <span class="method-desc">下载文件并打开邮件客户端</span>
                </span>
              </label>
            </div>
          </div>

          <!-- EmailJS 配置提示（当选择直接发送时） -->
          <div v-if="sendMethod === 'direct' && !isConfigured" class="config-warning">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
              <p><strong>需要配置 EmailJS</strong></p>
              <p>直接发送需要配置 EmailJS 服务。</p>
              <button @click="showConfigModal = true" class="btn-config">配置 EmailJS</button>
              <a href="https://www.emailjs.com/" target="_blank" class="config-link">创建免费账户</a>
            </div>
          </div>

          <!-- 收件人 -->
          <div class="form-group">
            <label>收件人邮箱 <span class="required">*</span></label>
            <input 
              v-model="emailTo" 
              type="email" 
              placeholder="example@email.com"
              :class="{ error: emailError }"
            />
            <span v-if="emailError" class="error-text">{{ emailError }}</span>
          </div>

          <!-- 邮件主题 -->
          <div class="form-group">
            <label>邮件主题</label>
            <input v-model="emailSubject" type="text" :placeholder="defaultSubject" />
          </div>

          <!-- 邮件正文 -->
          <div class="form-group">
            <label>邮件正文</label>
            <textarea v-model="emailBody" rows="3" placeholder="可选：添加邮件正文内容"></textarea>
          </div>

          <!-- 格式选择 -->
          <div class="form-group">
            <label>附件格式</label>
            <div class="format-options">
              <label v-for="fmt in formats" :key="fmt.value" class="format-option">
                <input type="radio" v-model="selectedFormat" :value="fmt.value" />
                <span class="format-card" :class="{ active: selectedFormat === fmt.value }">
                  <span class="format-icon">{{ fmt.icon }}</span>
                  <span class="format-name">{{ fmt.label }}</span>
                </span>
              </label>
            </div>
          </div>

          <!-- 质量选择 -->
          <div class="form-group">
            <label>导出质量</label>
            <div class="quality-options">
              <label v-for="q in qualities" :key="q.value" class="quality-option">
                <input type="radio" v-model="selectedQuality" :value="q.value" />
                <span class="quality-card" :class="{ recommended: q.recommended, active: selectedQuality === q.value }">
                  <span class="quality-name">{{ q.label }}</span>
                  <span class="quality-desc">{{ q.desc }}</span>
                  <span v-if="q.recommended" class="quality-badge">推荐</span>
                </span>
              </label>
            </div>
          </div>

          <!-- 预估文件大小 -->
          <div class="file-size-info">
            <span class="label">预估文件大小:</span>
            <span class="value">{{ estimatedSize }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="close">取消</button>
          <button class="btn-copy" @click="copyToClipboard" :disabled="sending">
            📋 复制图片
          </button>
          <button 
            class="btn-primary" 
            @click="handleSend" 
            :disabled="sending || !isValid || (sendMethod === 'direct' && !isConfigured)"
          >
            <span v-if="sending" class="spinner"></span>
            {{ sendButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- EmailJS 配置弹窗 -->
    <div v-if="showConfigModal" class="config-modal-overlay" @click.self="showConfigModal = false">
      <div class="config-modal">
        <div class="config-header">
          <h3>⚙️ 配置 EmailJS</h3>
          <button class="close-btn" @click="showConfigModal = false">×</button>
        </div>
        <div class="config-body">
          <p class="config-intro">
            EmailJS 允许从前端直接发送邮件。请访问 
            <a href="https://www.emailjs.com/" target="_blank">emailjs.com</a> 
            创建免费账户并获取以下信息：
          </p>
          <div class="form-group">
            <label>Service ID</label>
            <input v-model="configServiceId" type="text" placeholder="service_xxxxxx" />
          </div>
          <div class="form-group">
            <label>Template ID</label>
            <input v-model="configTemplateId" type="text" placeholder="template_xxxxxx" />
          </div>
          <div class="form-group">
            <label>Public Key</label>
            <input v-model="configPublicKey" type="text" placeholder="your_public_key" />
          </div>
          <div class="config-help">
            <h4>📝 配置步骤：</h4>
            <ol>
              <li>访问 <a href="https://www.emailjs.com/" target="_blank">emailjs.com</a> 注册</li>
              <li>添加邮件服务（Gmail、Outlook等）</li>
              <li>创建邮件模板，包含变量：<code>to_email</code>, <code>subject</code>, <code>message</code></li>
              <li>复制 Service ID、Template ID 和 Public Key</li>
            </ol>
          </div>
        </div>
        <div class="config-footer">
          <button class="btn-secondary" @click="showConfigModal = false">取消</button>
          <button class="btn-primary" @click="saveConfig" :disabled="!isConfigValid">
            保存配置
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  sendEmailDirect, 
  downloadAndMailto, 
  shareViaWebShare,
  isEmailJSConfigured, 
  saveEmailJSConfig, 
  getEmailJSConfig,
  initEmailJS,
  estimateFileSize 
} from '@/utils/directEmailService'
import { copyImageToClipboard } from '@/utils/emailService'

const props = defineProps<{
  visible: boolean
  documentName: string
  defaultSubject?: string
  previewSelector: string
}>()

const emit = defineEmits(['close', 'sent'])

// 表单状态
const emailTo = ref('')
const emailSubject = ref('')
const emailBody = ref('')
const selectedFormat = ref<'PDF' | 'PNG' | 'JPEG'>('PNG')
const selectedQuality = ref<'standard' | 'high' | 'ultra' | 'max'>('ultra')
const sendMethod = ref<'direct' | 'download'>('download')
const sending = ref(false)
const estimatedSize = ref('计算中...')
const emailError = ref('')

// 配置弹窗
const showConfigModal = ref(false)
const configServiceId = ref('')
const configTemplateId = ref('')
const configPublicKey = ref('')

const formats = [
  { value: 'PDF', label: 'PDF 文档', icon: '📄' },
  { value: 'PNG', label: 'PNG 图片', icon: '🖼️' },
  { value: 'JPEG', label: 'JPEG 图片', icon: '📷' }
]

const qualities = [
  { value: 'standard', label: '标准质量', desc: '文件较小，快速分享', recommended: false },
  { value: 'high', label: '高清质量', desc: '清晰度好，文件适中', recommended: false },
  { value: 'ultra', label: '超高清', desc: '非常清晰，推荐', recommended: true },
  { value: 'max', label: '最高质量', desc: '极致清晰，文件大', recommended: false }
]

const isValid = computed(() => {
  return emailTo.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo.value)
})

const isConfigured = computed(() => isEmailJSConfigured())

const isConfigValid = computed(() => {
  return configServiceId.value && configTemplateId.value && configPublicKey.value
})

const sendButtonText = computed(() => {
  if (sending.value) return '处理中...'
  if (sendMethod.value === 'direct') {
    return isConfigured.value ? '🚀 直接发送' : '⚠️ 需要配置'
  }
  return '📥 下载并发送'
})

watch(emailTo, (val) => {
  if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    emailError.value = '请输入有效的邮箱地址'
  } else {
    emailError.value = ''
  }
})

watch([() => props.visible, selectedFormat, selectedQuality], async () => {
  if (props.visible) {
    await updateEstimatedSize()
  }
})

onMounted(() => {
  emailSubject.value = props.defaultSubject || `${props.documentName} - 文档分享`
  
  // 加载已保存的配置
  const config = getEmailJSConfig()
  configServiceId.value = config.serviceId
  configTemplateId.value = config.templateId
  configPublicKey.value = config.publicKey
  
  // 初始化 EmailJS
  initEmailJS()
})

function getPreviewElement(): HTMLElement | null {
  const selectors = props.previewSelector.split(',').map(s => s.trim())
  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement
    if (element) return element
  }
  return null
}

async function updateEstimatedSize() {
  const element = getPreviewElement()
  if (element) {
    estimatedSize.value = '计算中...'
    try {
      estimatedSize.value = await estimateFileSize(element, selectedFormat.value, selectedQuality.value)
    } catch {
      estimatedSize.value = '无法计算'
    }
  } else {
    estimatedSize.value = '等待预览加载...'
  }
}

async function handleSend() {
  if (!isValid.value) {
    emailError.value = '请输入有效的邮箱地址'
    return
  }

  const element = getPreviewElement()
  if (!element) {
    alert('无法找到预览内容，请确保预览区域已显示')
    return
  }

  sending.value = true

  const options = {
    to: emailTo.value,
    subject: emailSubject.value || props.defaultSubject || `${props.documentName} - 文档分享`,
    body: emailBody.value,
    format: selectedFormat.value,
    quality: selectedQuality.value
  }

  try {
    if (sendMethod.value === 'direct') {
      // 直接发送
      const result = await sendEmailDirect(element, props.documentName, options)
      if (result.success) {
        alert('✅ 邮件发送成功！')
        emit('sent')
        close()
      } else {
        alert(`❌ ${result.message}`)
      }
    } else {
      // 先尝试 Web Share API
      const shared = await shareViaWebShare(element, props.documentName, options)
      if (!shared) {
        // 降级到下载+mailto
        await downloadAndMailto(element, props.documentName, options)
        alert('✅ 文件已下载，邮件客户端已打开。\n请将下载的文件作为附件添加到邮件中。')
      }
      emit('sent')
    }
  } catch (error: any) {
    console.error('发送失败:', error)
    alert(`发送失败: ${error?.message || '未知错误'}`)
  } finally {
    sending.value = false
  }
}

async function copyToClipboard() {
  const element = getPreviewElement()
  if (!element) {
    alert('无法找到预览内容，请确保预览区域已显示')
    return
  }

  sending.value = true

  try {
    const success = await copyImageToClipboard(element, selectedQuality.value)
    if (success) {
      alert('✅ 图片已复制到剪贴板！\n您可以直接粘贴(Ctrl+V / Cmd+V)到邮件中')
    } else {
      alert('复制失败，请尝试使用下载方式')
    }
  } catch (error: any) {
    console.error('复制失败:', error)
    alert(`复制失败: ${error?.message || '未知错误'}`)
  } finally {
    sending.value = false
  }
}

function saveConfig() {
  saveEmailJSConfig(configServiceId.value, configTemplateId.value, configPublicKey.value)
  initEmailJS()
  showConfigModal.value = false
  alert('✅ 配置已保存！现在可以直接发送邮件了。')
}

function close() {
  emit('close')
}
</script>

<style scoped>
.email-modal-overlay,
.config-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.email-modal,
.config-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header,
.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3,
.config-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body,
.config-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 180px);
}

/* 发送方式选择 */
.send-method-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.method-option {
  cursor: pointer;
}

.method-option input {
  display: none;
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
  text-align: center;
}

.method-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.method-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.method-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.method-desc {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

/* 配置警告 */
.config-warning {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  margin-bottom: 16px;
}

.warning-icon {
  font-size: 24px;
}

.warning-content p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #92400e;
}

.btn-config {
  padding: 6px 12px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 8px;
}

.btn-config:hover {
  background: #d97706;
}

.config-link {
  font-size: 12px;
  color: #92400e;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.error-text {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

/* 格式选择 */
.format-options {
  display: flex;
  gap: 12px;
}

.format-option {
  flex: 1;
  cursor: pointer;
}

.format-option input {
  display: none;
}

.format-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.format-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.format-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.format-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

/* 质量选择 */
.quality-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quality-option {
  cursor: pointer;
}

.quality-option input {
  display: none;
}

.quality-card {
  position: relative;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s;
}

.quality-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.quality-card.recommended {
  border-color: #10b981;
}

.quality-card.recommended.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.quality-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.quality-desc {
  display: block;
  font-size: 11px;
  color: #6b7280;
}

.quality-badge {
  position: absolute;
  top: -8px;
  right: 8px;
  padding: 2px 8px;
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 10px;
}

.file-size-info {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 10px;
}

.file-size-info .label {
  color: #6b7280;
  font-size: 13px;
}

.file-size-info .value {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.modal-footer,
.config-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-secondary {
  padding: 12px 20px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-copy {
  padding: 12px 20px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 配置弹窗额外样式 */
.config-intro {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.6;
}

.config-intro a {
  color: #667eea;
}

.config-help {
  margin-top: 20px;
  padding: 16px;
  background: #f3f4f6;
  border-radius: 10px;
}

.config-help h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

.config-help ol {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.8;
}

.config-help code {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.config-help a {
  color: #667eea;
}
</style>
