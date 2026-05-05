<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useDriverStore } from '@/stores/driver'

const store = useDriverStore()
const canvasRef = ref<HTMLCanvasElement>()
const templateImage = ref<string>('')
const fileInputRef = ref<HTMLInputElement>()

const formatDate = (date: string) => {
  if (!date) return '01/01/1990'
  const d = new Date(date)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}

// 处理模板图片上传
const handleTemplateUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      templateImage.value = e.target?.result as string
      // 保存到localStorage
      localStorage.setItem('driverLicenseTemplate', templateImage.value)
      drawLicense()
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 触发文件选择
const triggerUpload = () => {
  fileInputRef.value?.click()
}

// 清除模板
const clearTemplate = () => {
  templateImage.value = ''
  localStorage.removeItem('driverLicenseTemplate')
  drawLicense()
}

// 文字位置配置 - 基于真实Virginia驾照图片的精确位置
// 这些位置是按照1080x680画布尺寸计算的
const textPositions = {
  // Customer identifier (驾照号码)
  licenseNumber: { x: 380, y: 108, font: 'bold 28px Arial', color: '#000' },
  
  // Name (姓名)
  lastName: { x: 380, y: 158, font: 'bold 24px Arial', color: '#000' },
  firstName: { x: 380, y: 185, font: '22px Arial', color: '#000' },
  
  // Address (地址)
  address: { x: 380, y: 238, font: 'bold 22px Arial', color: '#000' },
  cityStateZip: { x: 380, y: 265, font: '20px Arial', color: '#000' },
  
  // 左列 - Sex, Eyes, Height
  sex: { x: 380, y: 345, font: 'bold 24px Arial', color: '#000' },
  eyes: { x: 380, y: 395, font: 'bold 24px Arial', color: '#000' },
  height: { x: 380, y: 448, font: 'bold 22px Arial', color: '#000' },
  
  // 中列 - Class, Endorsements, Restrictions
  class: { x: 530, y: 345, font: 'bold 24px Arial', color: '#000' },
  endorsements: { x: 530, y: 395, font: 'bold 22px Arial', color: '#000' },
  restrictions: { x: 530, y: 448, font: 'bold 22px Arial', color: '#000' },
  
  // 右列 - DOB, Iss, Exp
  dob: { x: 700, y: 345, font: 'bold 22px Arial', color: '#000' },
  issueDate: { x: 700, y: 395, font: 'bold 22px Arial', color: '#000' },
  expiryDate: { x: 700, y: 448, font: 'bold 22px Arial', color: '#c41e3a' },
  
  // 照片位置
  photo: { x: 48, y: 115, width: 205, height: 255 },
  
  // 签名
  signature: { x: 58, y: 400, font: 'italic 24px "Brush Script MT", cursive', color: '#00008B' },
  
  // Organ Donor
  donor: { x: 58, y: 430, font: 'bold 16px Arial', color: '#c41e3a' },
  
  // DD编码
  dd: { x: 58, y: 458, font: '14px monospace', color: '#000' },
  
  // 右侧小圆照片
  smallPhoto: { x: 815, y: 185, radius: 48 }
}

// 遮盖区域配置 - 用于覆盖原图上的文字
const coverAreas = [
  // 驾照号码区域
  { x: 375, y: 85, width: 180, height: 30 },
  // 姓名区域
  { x: 375, y: 135, width: 280, height: 60 },
  // 地址区域  
  { x: 375, y: 210, width: 320, height: 65 },
  // 详细信息区域 (Sex, Class, DOB等)
  { x: 375, y: 320, width: 500, height: 145 },
  // 签名、Donor、DD区域
  { x: 48, y: 375, width: 215, height: 95 },
  // 右侧小圆照片区域
  { x: 760, y: 130, width: 120, height: 130 },
]

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

const drawLicense = async () => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 1. 如果有模板图片，绘制它
  if (templateImage.value) {
    try {
      const bgImg = await loadImage(templateImage.value)
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
      
      // 2. 用与背景相近的颜色覆盖需要修改的区域
      // 使用取样背景色或半透明白色
      coverAreas.forEach(area => {
        // 获取该区域的背景色（取左上角像素）
        const imageData = ctx.getImageData(area.x, area.y, 1, 1)
        const bgColor = `rgba(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}, 0.92)`
        ctx.fillStyle = bgColor
        ctx.fillRect(area.x, area.y, area.width, area.height)
      })
    } catch (e) {
      console.error('Failed to load template:', e)
      drawDefaultBackground(ctx)
    }
  } else {
    drawDefaultBackground(ctx)
  }

  // 3. 绘制照片
  if (store.driverInfo.portrait) {
    try {
      const img = await loadImage(store.driverInfo.portrait)
      const pos = textPositions.photo
      
      // 主照片
      ctx.save()
      ctx.beginPath()
      ctx.rect(pos.x, pos.y, pos.width, pos.height)
      ctx.clip()
      const scale = Math.max(pos.width / img.width, pos.height / img.height)
      const x = pos.x + (pos.width - img.width * scale) / 2
      const y = pos.y + (pos.height - img.height * scale) / 2
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      ctx.restore()
      
      // 右侧小圆照片
      const sp = textPositions.smallPhoto
      ctx.save()
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, sp.x - sp.radius, sp.y - sp.radius, sp.radius * 2, sp.radius * 2)
      ctx.restore()
      
      // 小圆照片边框
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2)
      ctx.stroke()
    } catch (e) {
      console.error('Failed to load portrait:', e)
    }
  }

  // 4. 绘制签名
  ctx.font = textPositions.signature.font
  ctx.fillStyle = textPositions.signature.color
  const nameParts = (store.driverInfo.fullName || 'Tyler James').split(' ')
  ctx.fillText(`${nameParts[0]} ${nameParts[nameParts.length - 1]}`, textPositions.signature.x, textPositions.signature.y)

  // 5. Organ Donor 标记
  if (store.driverInfo.isDonor) {
    ctx.fillStyle = textPositions.donor.color
    ctx.font = textPositions.donor.font
    ctx.fillText('♥ Organ Donor', textPositions.donor.x, textPositions.donor.y)
  }

  // 6. DD编码
  ctx.fillStyle = '#000'
  ctx.font = textPositions.dd.font
  ctx.fillText(`DD ${store.driverInfo.dd || '061234567'}`, textPositions.dd.x, textPositions.dd.y)

  // 7. 绘制所有文字信息
  // License Number
  ctx.font = textPositions.licenseNumber.font
  ctx.fillStyle = textPositions.licenseNumber.color
  ctx.fillText(store.driverInfo.licenseNumber || 'T16700185', textPositions.licenseNumber.x, textPositions.licenseNumber.y)

  // Name
  const fullName = (store.driverInfo.fullName || 'JAMES JR').toUpperCase()
  const parts = fullName.split(' ')
  const lastName = parts.length > 1 ? parts.slice(-1)[0] : parts[0]
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(', ') : ''
  
  ctx.font = textPositions.lastName.font
  ctx.fillStyle = textPositions.lastName.color
  ctx.fillText(lastName, textPositions.lastName.x, textPositions.lastName.y)
  
  ctx.font = textPositions.firstName.font
  ctx.fillText(firstName, textPositions.firstName.x, textPositions.firstName.y)

  // Address
  ctx.font = textPositions.address.font
  ctx.fillStyle = textPositions.address.color
  ctx.fillText((store.driverInfo.address || '103 COMMONWEALTH BLVD.').toUpperCase(), textPositions.address.x, textPositions.address.y)
  
  ctx.font = textPositions.cityStateZip.font
  const cityStateZip = `${(store.driverInfo.city || 'EMPORIA').toUpperCase()}, ${store.selectedTemplate} ${store.driverInfo.zipCode || '23847'}`
  ctx.fillText(cityStateZip, textPositions.cityStateZip.x, textPositions.cityStateZip.y)

  // 左列
  ctx.font = textPositions.sex.font
  ctx.fillStyle = textPositions.sex.color
  ctx.fillText(store.driverInfo.sex || 'M', textPositions.sex.x, textPositions.sex.y)
  
  ctx.font = textPositions.eyes.font
  ctx.fillText(store.driverInfo.eyeColor || 'BRN', textPositions.eyes.x, textPositions.eyes.y)
  
  ctx.font = textPositions.height.font
  ctx.fillText(store.driverInfo.height || '6FT 3IN', textPositions.height.x, textPositions.height.y)

  // 中列
  ctx.font = textPositions.class.font
  ctx.fillText(store.driverInfo.licenseClass || 'M', textPositions.class.x, textPositions.class.y)
  
  ctx.font = textPositions.endorsements.font
  ctx.fillText(store.driverInfo.endorsements || 'NONE', textPositions.endorsements.x, textPositions.endorsements.y)
  
  ctx.font = textPositions.restrictions.font
  ctx.fillText(store.driverInfo.restrictions || 'NONE', textPositions.restrictions.x, textPositions.restrictions.y)

  // 右列
  ctx.font = textPositions.dob.font
  ctx.fillStyle = textPositions.dob.color
  ctx.fillText(formatDate(store.driverInfo.dateOfBirth), textPositions.dob.x, textPositions.dob.y)
  
  ctx.font = textPositions.issueDate.font
  ctx.fillText(formatDate(store.driverInfo.issueDate), textPositions.issueDate.x, textPositions.issueDate.y)
  
  ctx.font = textPositions.expiryDate.font
  ctx.fillStyle = textPositions.expiryDate.color
  ctx.fillText(formatDate(store.driverInfo.expiryDate), textPositions.expiryDate.x, textPositions.expiryDate.y)
}

// 默认背景（没有模板时显示）
const drawDefaultBackground = (ctx: CanvasRenderingContext2D) => {
  const canvas = canvasRef.value!
  
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  gradient.addColorStop(0, '#e8f4fc')
  gradient.addColorStop(0.5, '#fff5e6')
  gradient.addColorStop(1, '#ffe8d6')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 顶部横幅
  ctx.fillStyle = '#5b6abf'
  ctx.fillRect(0, 0, canvas.width, 80)
  
  ctx.fillStyle = '#fff'
  ctx.font = 'italic bold 40px Georgia, serif'
  ctx.fillText('Virginia', 40, 55)
  
  ctx.font = 'bold 28px Arial'
  ctx.fillText("DRIVER'S LICENSE", 360, 55)
  
  ctx.font = '16px Arial'
  ctx.fillText('VA, USA', 750, 35)
  
  // 星形徽章
  ctx.beginPath()
  const starX = 850, starY = 50
  ctx.arc(starX, starY, 30, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 32px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('★', starX, starY + 12)
  ctx.textAlign = 'left'
  
  // 提示文字
  ctx.fillStyle = '#666'
  ctx.font = '18px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('请上传真实驾照模板图片', canvas.width / 2, canvas.height / 2)
  ctx.fillText('点击下方 "上传驾照模板" 按钮', canvas.width / 2, canvas.height / 2 + 30)
  ctx.textAlign = 'left'
}

// 初始加载
onMounted(() => {
  // 从localStorage恢复模板
  const savedTemplate = localStorage.getItem('driverLicenseTemplate')
  if (savedTemplate) {
    templateImage.value = savedTemplate
  }
  drawLicense()
})

// 监听数据变化
watch(() => [store.driverInfo, store.selectedTemplate], () => {
  setTimeout(drawLicense, 50)
}, { deep: true })
</script>

<template>
  <div class="license-preview-container">
    <!-- 模板上传控制 -->
    <div class="template-controls">
      <input 
        ref="fileInputRef"
        type="file" 
        accept="image/*" 
        @change="handleTemplateUpload"
        style="display: none"
      />
      <button class="upload-btn" @click="triggerUpload">
        📷 上传驾照模板
      </button>
      <button v-if="templateImage" class="clear-btn" @click="clearTemplate">
        ✕ 清除模板
      </button>
      <span v-if="templateImage" class="template-status">✓ 已加载模板</span>
    </div>

    <!-- Canvas预览 -->
    <div class="canvas-wrapper">
      <canvas 
        ref="canvasRef" 
        :width="900" 
        :height="560"
        class="license-canvas"
      />
    </div>

    <!-- 使用说明 -->
    <div class="instructions" v-if="!templateImage">
      <p>💡 <strong>使用方法：</strong></p>
      <ol>
        <li>点击 "上传驾照模板" 上传真实驾照图片</li>
        <li>系统会自动在图片上覆盖您填写的信息</li>
        <li>上传头像后会替换原照片位置</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.license-preview-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.upload-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.clear-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #dc2626;
}

.template-status {
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
}

.canvas-wrapper {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
}

.license-canvas {
  width: 100%;
  max-width: 900px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  background: white;
}

.instructions {
  padding: 16px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #fcd34d;
}

.instructions p {
  margin: 0 0 8px 0;
  color: #92400e;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
  color: #78350f;
}

.instructions li {
  margin: 4px 0;
}
</style>
