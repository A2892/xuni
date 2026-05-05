<template>
  <div class="rich-text-editor" :class="{ focused: isFocused }">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('bold') }"
          @click="execCommand('bold')"
          title="加粗"
        >
          <IconLib name="bold" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('italic') }"
          @click="execCommand('italic')"
          title="斜体"
        >
          <IconLib name="italic" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('underline') }"
          @click="execCommand('underline')"
          title="下划线"
        >
          <IconLib name="underline" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('strikeThrough') }"
          @click="execCommand('strikeThrough')"
          title="删除线"
        >
          <IconLib name="strikethrough" :size="16" />
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <select 
          class="toolbar-select"
          @change="setHeading($event)"
        >
          <option value="">正文</option>
          <option value="h1">标题 1</option>
          <option value="h2">标题 2</option>
          <option value="h3">标题 3</option>
          <option value="h4">标题 4</option>
        </select>
        
        <select 
          class="toolbar-select"
          @change="setFontSize($event)"
        >
          <option value="">字号</option>
          <option value="1">12px</option>
          <option value="2">14px</option>
          <option value="3">16px</option>
          <option value="4">18px</option>
          <option value="5">24px</option>
          <option value="6">32px</option>
          <option value="7">48px</option>
        </select>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('justifyLeft') }"
          @click="execCommand('justifyLeft')"
          title="左对齐"
        >
          <IconLib name="align-left" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('justifyCenter') }"
          @click="execCommand('justifyCenter')"
          title="居中"
        >
          <IconLib name="align-center" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('justifyRight') }"
          @click="execCommand('justifyRight')"
          title="右对齐"
        >
          <IconLib name="align-right" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('justifyFull') }"
          @click="execCommand('justifyFull')"
          title="两端对齐"
        >
          <IconLib name="align-justify" :size="16" />
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('insertUnorderedList') }"
          @click="execCommand('insertUnorderedList')"
          title="无序列表"
        >
          <IconLib name="list" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          :class="{ active: isActive('insertOrderedList') }"
          @click="execCommand('insertOrderedList')"
          title="有序列表"
        >
          <IconLib name="list-ordered" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          @click="execCommand('indent')"
          title="增加缩进"
        >
          <IconLib name="indent" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          @click="execCommand('outdent')"
          title="减少缩进"
        >
          <IconLib name="outdent" :size="16" />
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          @click="insertLink"
          title="插入链接"
        >
          <IconLib name="link" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          @click="triggerImageUpload"
          title="插入图片"
        >
          <IconLib name="image" :size="16" />
        </button>
        <input 
          ref="imageInputRef"
          type="file" 
          hidden 
          accept="image/*"
          @change="handleImageUpload"
        />
        <button 
          class="toolbar-btn"
          @click="insertTable"
          title="插入表格"
        >
          <IconLib name="table" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          @click="insertCodeBlock"
          title="代码块"
        >
          <IconLib name="code" :size="16" />
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <div class="color-picker-wrapper">
          <button class="toolbar-btn" title="文字颜色">
            <IconLib name="type" :size="16" />
            <span class="color-indicator" :style="{ background: textColor }"></span>
          </button>
          <input 
            type="color" 
            v-model="textColor"
            @change="setTextColor"
            class="color-input"
          />
        </div>
        <div class="color-picker-wrapper">
          <button class="toolbar-btn" title="背景颜色">
            <IconLib name="highlight" :size="16" />
            <span class="color-indicator" :style="{ background: bgColor }"></span>
          </button>
          <input 
            type="color" 
            v-model="bgColor"
            @change="setBackgroundColor"
            class="color-input"
          />
        </div>
      </div>
      
      <div class="toolbar-spacer"></div>
      
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          @click="execCommand('undo')"
          title="撤销"
        >
          <IconLib name="undo" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          @click="execCommand('redo')"
          title="重做"
        >
          <IconLib name="redo" :size="16" />
        </button>
        <button 
          class="toolbar-btn"
          @click="clearFormat"
          title="清除格式"
        >
          <IconLib name="eraser" :size="16" />
        </button>
      </div>
    </div>
    
    <!-- 编辑器内容区 -->
    <div 
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="isFocused = true"
      @blur="handleBlur"
      @paste="handlePaste"
      @keydown="handleKeydown"
    ></div>
    
    <!-- 字数统计 -->
    <div v-if="showWordCount" class="editor-footer">
      <span class="word-count">
        {{ wordCount }} 字
        <span v-if="maxLength"> / {{ maxLength }}</span>
      </span>
    </div>
    
    <!-- 链接弹窗 -->
    <div v-if="showLinkModal" class="modal-overlay" @click.self="showLinkModal = false">
      <div class="modal-content">
        <h3>插入链接</h3>
        <div class="modal-body">
          <div class="form-group">
            <label>链接文字</label>
            <input v-model="linkText" placeholder="请输入链接文字" />
          </div>
          <div class="form-group">
            <label>链接地址</label>
            <input v-model="linkUrl" placeholder="https://" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showLinkModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmLink">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Props
interface Props {
  modelValue?: string
  placeholder?: string
  maxLength?: number
  showWordCount?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  showWordCount: true,
  disabled: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'focus': []
  'blur': []
}>()

// Refs
const editorRef = ref<HTMLDivElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)

// State
const isFocused = ref(false)
const textColor = ref('#333333')
const bgColor = ref('#FFFF00')
const showLinkModal = ref(false)
const linkText = ref('')
const linkUrl = ref('')
const savedSelection = ref<Range | null>(null)

// Computed
const wordCount = computed(() => {
  if (!editorRef.value) return 0
  const text = editorRef.value.innerText || ''
  return text.replace(/\s/g, '').length
})

// Methods
function execCommand(command: string, value: string | null = null) {
  editorRef.value?.focus()
  document.execCommand(command, false, value || undefined)
  handleInput()
}

function isActive(command: string): boolean {
  return document.queryCommandState(command)
}

function setHeading(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  
  if (value) {
    document.execCommand('formatBlock', false, value)
  } else {
    document.execCommand('formatBlock', false, 'p')
  }
  
  target.value = ''
  handleInput()
}

function setFontSize(event: Event) {
  const target = event.target as HTMLSelectElement
  if (target.value) {
    document.execCommand('fontSize', false, target.value)
  }
  target.value = ''
  handleInput()
}

function setTextColor() {
  execCommand('foreColor', textColor.value)
}

function setBackgroundColor() {
  execCommand('hiliteColor', bgColor.value)
}

function insertLink() {
  // 保存当前选区
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    savedSelection.value = selection.getRangeAt(0).cloneRange()
    linkText.value = selection.toString()
  }
  linkUrl.value = ''
  showLinkModal.value = true
}

function confirmLink() {
  if (!linkUrl.value) return
  
  // 恢复选区
  if (savedSelection.value) {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(savedSelection.value)
  }
  
  const text = linkText.value || linkUrl.value
  const html = `<a href="${linkUrl.value}" target="_blank">${text}</a>`
  document.execCommand('insertHTML', false, html)
  
  showLinkModal.value = false
  handleInput()
}

function triggerImageUpload() {
  imageInputRef.value?.click()
}

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imgSrc = e.target?.result as string
      document.execCommand('insertImage', false, imgSrc)
      handleInput()
    }
    reader.readAsDataURL(file)
  }
  
  input.value = ''
}

function insertTable() {
  const html = `
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>
        <td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>
        <td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>
        <td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>
        <td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>
      </tr>
    </table>
    <p></p>
  `
  document.execCommand('insertHTML', false, html)
  handleInput()
}

function insertCodeBlock() {
  const html = `<pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;"><code>// 在此输入代码</code></pre><p></p>`
  document.execCommand('insertHTML', false, html)
  handleInput()
}

function clearFormat() {
  document.execCommand('removeFormat')
  handleInput()
}

function handleInput() {
  const content = editorRef.value?.innerHTML || ''
  emit('update:modelValue', content)
  emit('change', content)
}

function handleBlur() {
  isFocused.value = false
  emit('blur')
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  
  // 获取纯文本
  const text = event.clipboardData?.getData('text/plain') || ''
  
  // 保持换行
  const html = text
    .split('\n')
    .map(line => line ? `<p>${line}</p>` : '<p><br></p>')
    .join('')
  
  document.execCommand('insertHTML', false, html)
  handleInput()
}

function handleKeydown(event: KeyboardEvent) {
  // Tab 键缩进
  if (event.key === 'Tab') {
    event.preventDefault()
    if (event.shiftKey) {
      document.execCommand('outdent')
    } else {
      document.execCommand('indent')
    }
  }
  
  // Ctrl/Cmd + B/I/U 快捷键
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        execCommand('bold')
        break
      case 'i':
        event.preventDefault()
        execCommand('italic')
        break
      case 'u':
        event.preventDefault()
        execCommand('underline')
        break
    }
  }
}

// 获取/设置内容方法
function getContent(): string {
  return editorRef.value?.innerHTML || ''
}

function setContent(html: string) {
  if (editorRef.value) {
    editorRef.value.innerHTML = html
  }
}

function clear() {
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
    handleInput()
  }
}

function focus() {
  editorRef.value?.focus()
}

// Watch model value
watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && editorRef.value.innerHTML !== newValue) {
    editorRef.value.innerHTML = newValue
  }
})

// Initialize
onMounted(() => {
  if (props.modelValue && editorRef.value) {
    editorRef.value.innerHTML = props.modelValue
  }
})

// Expose methods
defineExpose({
  getContent,
  setContent,
  clear,
  focus,
  execCommand
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.rich-text-editor.focused {
  border-color: var(--primary-color, #4B6EF5);
}

/* 工具栏 */
.editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 4px;
}

.toolbar-spacer {
  flex: 1;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.toolbar-btn.active {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.toolbar-select {
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
}

.color-picker-wrapper {
  position: relative;
}

.color-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 3px;
  border-radius: 1px;
}

.color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* 编辑器内容 */
.editor-content {
  min-height: 200px;
  max-height: 500px;
  padding: 16px;
  overflow-y: auto;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
}

.editor-content :deep(p) {
  margin: 0 0 8px;
}

.editor-content :deep(h1),
.editor-content :deep(h2),
.editor-content :deep(h3),
.editor-content :deep(h4) {
  margin: 16px 0 8px;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.editor-content :deep(a) {
  color: var(--primary-color, #4B6EF5);
  text-decoration: underline;
}

.editor-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.editor-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.editor-content :deep(td),
.editor-content :deep(th) {
  border: 1px solid #ccc;
  padding: 8px;
}

.editor-content :deep(pre) {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

/* 底部 */
.editor-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.word-count {
  font-size: 12px;
  color: #999;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 400px;
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.modal-content h3 {
  margin: 0 0 16px;
  font-size: 16px;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 13px;
  color: #666;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>
