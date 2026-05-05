<template>
  <div class="qrcode" :class="{ 'qrcode--bordered': bordered }">
    <canvas ref="canvasRef" :style="canvasStyle"></canvas>
    
    <!-- Logo -->
    <div v-if="logoSrc" class="qrcode__logo" :style="logoStyle">
      <img :src="logoSrc" :alt="logoAlt" />
    </div>
    
    <!-- 过期遮罩 -->
    <div v-if="status === 'expired'" class="qrcode__expired">
      <div class="qrcode__expired-icon">
        <IconLib name="warning" :size="32" />
      </div>
      <div class="qrcode__expired-text">二维码已过期</div>
      <button type="button" class="qrcode__refresh" @click="handleRefresh">
        点击刷新
      </button>
    </div>
    
    <!-- 加载中 -->
    <div v-if="status === 'loading'" class="qrcode__loading">
      <IconLib name="loading" :size="32" class="qrcode__loading-icon" />
    </div>
    
    <!-- 错误状态 -->
    <div v-if="status === 'error'" class="qrcode__error">
      <IconLib name="warning" :size="32" />
      <div class="qrcode__error-text">生成失败</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 二维码内容
  value: string
  // 尺寸
  size?: number
  // 前景色
  color?: string
  // 背景色
  bgColor?: string
  // 边距
  margin?: number
  // 纠错级别
  errorLevel?: 'L' | 'M' | 'Q' | 'H'
  // Logo 图片
  logoSrc?: string
  // Logo alt
  logoAlt?: string
  // Logo 大小
  logoSize?: number
  // 是否有边框
  bordered?: boolean
  // 状态
  status?: 'active' | 'loading' | 'expired' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  size: 160,
  color: '#000000',
  bgColor: '#ffffff',
  margin: 2,
  errorLevel: 'M',
  logoAlt: 'Logo',
  logoSize: 40,
  bordered: false,
  status: 'active'
})

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const canvasRef = ref<HTMLCanvasElement>()

const canvasStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

const logoStyle = computed(() => ({
  width: `${props.logoSize}px`,
  height: `${props.logoSize}px`
}))

// QR 码编码表
const QR_MODE = {
  NUMERIC: 1,
  ALPHANUMERIC: 2,
  BYTE: 4
}

// 字母数字表
const ALPHANUM_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'

// 纠错级别配置
const EC_LEVELS: Record<string, number> = {
  'L': 0,
  'M': 1,
  'Q': 2,
  'H': 3
}

// 简化版QR码生成 (用于演示)
function generateQRMatrix(text: string): number[][] {
  // 简化实现: 生成基于内容的伪随机矩阵
  // 实际项目中应使用专业的QR库如 qrcode
  const size = 25 // 版本1 QR码是21x21, 这里用25便于显示
  const matrix: number[][] = []
  
  // 生成种子
  let seed = 0
  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0
  }
  
  // 简单的伪随机函数
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  
  // 初始化矩阵
  for (let i = 0; i < size; i++) {
    matrix[i] = []
    for (let j = 0; j < size; j++) {
      matrix[i][j] = 0
    }
  }
  
  // 添加定位图案 (左上)
  addFinderPattern(matrix, 0, 0)
  // 添加定位图案 (右上)
  addFinderPattern(matrix, size - 7, 0)
  // 添加定位图案 (左下)
  addFinderPattern(matrix, 0, size - 7)
  
  // 添加时序图案
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0
    matrix[i][6] = i % 2 === 0 ? 1 : 0
  }
  
  // 填充数据区域
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (matrix[i][j] === 0 && isDataArea(i, j, size)) {
        matrix[i][j] = random() > 0.5 ? 1 : 0
      }
    }
  }
  
  return matrix
}

// 添加定位图案
function addFinderPattern(matrix: number[][], startX: number, startY: number) {
  // 7x7 定位图案
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ]
  
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (matrix[startY + i] && matrix[startY + i][startX + j] !== undefined) {
        matrix[startY + i][startX + j] = pattern[i][j]
      }
    }
  }
}

// 判断是否是数据区域
function isDataArea(x: number, y: number, size: number): boolean {
  // 排除定位图案区域
  if (x < 8 && y < 8) return false
  if (x >= size - 8 && y < 8) return false
  if (x < 8 && y >= size - 8) return false
  // 排除时序图案
  if (x === 6 || y === 6) return false
  return true
}

// 绘制二维码
function drawQRCode() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const matrix = generateQRMatrix(props.value)
  const moduleCount = matrix.length
  
  // 设置画布大小 (高清)
  const scale = 2
  const size = props.size * scale
  canvas.width = size
  canvas.height = size
  
  const moduleSize = (size - props.margin * 2 * scale) / moduleCount
  
  // 清空背景
  ctx.fillStyle = props.bgColor
  ctx.fillRect(0, 0, size, size)
  
  // 绘制模块
  ctx.fillStyle = props.color
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix[row][col]) {
        const x = props.margin * scale + col * moduleSize
        const y = props.margin * scale + row * moduleSize
        
        // 绘制圆角模块
        const radius = moduleSize * 0.2
        ctx.beginPath()
        ctx.roundRect(x, y, moduleSize - 0.5, moduleSize - 0.5, radius)
        ctx.fill()
      }
    }
  }
}

function handleRefresh() {
  emit('refresh')
}

// 监听值变化重新绘制
watch(() => [props.value, props.size, props.color, props.bgColor, props.margin, props.errorLevel], () => {
  drawQRCode()
}, { deep: true })

onMounted(() => {
  drawQRCode()
})

// 导出方法
defineExpose({
  refresh: drawQRCode
})
</script>

<style scoped>
.qrcode {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.qrcode--bordered {
  padding: 12px;
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 8px;
}

.qrcode canvas {
  display: block;
}

.qrcode__logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 4px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qrcode__logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 过期遮罩 */
.qrcode__expired,
.qrcode__loading,
.qrcode__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
}

.qrcode__expired-icon {
  color: var(--warning-color, #e6a23c);
  margin-bottom: 8px;
}

.qrcode__expired-text {
  font-size: 14px;
  color: var(--text-secondary, #606266);
  margin-bottom: 12px;
}

.qrcode__refresh {
  padding: 6px 16px;
  border: none;
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.qrcode__refresh:hover {
  background: var(--primary-hover, #3b5de7);
}

/* 加载中 */
.qrcode__loading-icon {
  animation: spin 1s linear infinite;
  color: var(--primary-color, #4B6EF5);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 错误 */
.qrcode__error {
  color: var(--danger-color, #f56c6c);
}

.qrcode__error-text {
  font-size: 14px;
  margin-top: 8px;
}
</style>
