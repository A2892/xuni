<script setup lang="ts">
import { computed } from 'vue'
import { useSealStore } from '@/stores/seal'

const store = useSealStore()

// 计算文字路径
const getTextPath = computed(() => {
  const radius = store.sealInfo.outerDiameter / 2 - 20
  return `M ${store.sealInfo.sealSize / 2},${store.sealInfo.sealSize / 2} m ${-radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 ${-radius * 2},0`
})

// 计算每个字符的旋转角度
const getCharacterRotations = computed(() => {
  const text = store.sealInfo.organizationName
  const chars = text.split('')
  const totalChars = chars.length
  const startAngle = 90 - (totalChars * 15) / 2
  
  return chars.map((char, index) => ({
    char,
    angle: startAngle + index * 15
  }))
})

// 生成五角星路径
const getStarPath = (cx: number, cy: number, size: number) => {
  const points = []
  const outerRadius = size / 2
  const innerRadius = outerRadius * 0.382
  
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    points.push(`${i === 0 ? 'M' : 'L'} ${x},${y}`)
  }
  points.push('Z')
  return points.join(' ')
}

// 纹理滤镜效果
const textureFilter = computed(() => {
  if (!store.sealInfo.enableTexture) return ''
  return 'url(#texture)'
})

// 墨迹效果类
const inkEffectClass = computed(() => {
  return `ink-effect-${store.sealInfo.inkEffect}`
})
</script>

<template>
  <div class="seal-preview-container">
    <div class="preview-wrapper">
      <svg 
        :width="store.sealInfo.sealSize" 
        :height="store.sealInfo.sealSize" 
        :viewBox="`0 0 ${store.sealInfo.sealSize} ${store.sealInfo.sealSize}`"
        class="official-seal"
        :class="inkEffectClass"
      >
        <!-- 定义滤镜 -->
        <defs>
          <!-- 纹理效果 -->
          <filter id="texture" x="0" y="0">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" result="monoNoise" />
            <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply" :opacity="store.sealInfo.textureOpacity / 100" />
          </filter>
          
          <!-- 浮雕效果 -->
          <filter v-if="store.sealInfo.enableEmbossEffect" id="emboss">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
            <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
            <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.5" specularExponent="10" lighting-color="white" result="specOut">
              <fePointLight x="-50" y="-50" z="200" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>

        <!-- 外圆 -->
        <circle
          :cx="store.sealInfo.sealSize / 2"
          :cy="store.sealInfo.sealSize / 2"
          :r="store.sealInfo.outerDiameter / 2 - store.sealInfo.borderWidth / 2"
          fill="none"
          :stroke="store.sealInfo.borderColor"
          :stroke-width="store.sealInfo.borderWidth"
          :filter="store.sealInfo.enableEmbossEffect ? 'url(#emboss)' : ''"
        />

        <!-- 内圆 -->
        <circle
          :cx="store.sealInfo.sealSize / 2"
          :cy="store.sealInfo.sealSize / 2"
          :r="store.sealInfo.innerDiameter / 2"
          fill="none"
          :stroke="store.sealInfo.borderColor"
          :stroke-width="store.sealInfo.borderWidth"
          :filter="store.sealInfo.enableEmbossEffect ? 'url(#emboss)' : ''"
        />

        <!-- 弧形文字 -->
        <g v-if="store.sealInfo.textArrangement === 'circular'">
          <text
            v-for="(item, index) in getCharacterRotations"
            :key="index"
            :x="store.sealInfo.sealSize / 2"
            :y="store.sealInfo.sealSize / 2"
            :transform="`rotate(${item.angle} ${store.sealInfo.sealSize / 2} ${store.sealInfo.sealSize / 2})`"
            :fill="store.sealInfo.textColor"
            :font-size="store.sealInfo.fontSize"
            :font-family="store.sealInfo.fontFamily"
            font-weight="bold"
            text-anchor="middle"
            dominant-baseline="middle"
            :dy="-store.sealInfo.outerDiameter / 2 + 20"
            :filter="textureFilter"
          >
            {{ item.char }}
          </text>
        </g>

        <!-- 水平文字（横排） -->
        <text
          v-if="store.sealInfo.textArrangement === 'horizontal'"
          :x="store.sealInfo.sealSize / 2"
          :y="store.sealInfo.sealSize / 2 - 20"
          :fill="store.sealInfo.textColor"
          :font-size="store.sealInfo.fontSize"
          :font-family="store.sealInfo.fontFamily"
          font-weight="bold"
          text-anchor="middle"
          dominant-baseline="middle"
          :filter="textureFilter"
        >
          {{ store.sealInfo.organizationName }}
        </text>

        <!-- 五角星 -->
        <path
          v-if="store.sealInfo.showStar"
          :d="getStarPath(store.sealInfo.sealSize / 2, store.sealInfo.sealSize / 2, store.sealInfo.starSize)"
          :fill="store.sealInfo.starColor"
          :filter="textureFilter"
        />

        <!-- 底部文字 -->
        <text
          v-if="store.sealInfo.bottomText"
          :x="store.sealInfo.sealSize / 2"
          :y="store.sealInfo.sealSize / 2 + 35"
          :fill="store.sealInfo.textColor"
          :font-size="store.sealInfo.fontSize - 4"
          :font-family="store.sealInfo.fontFamily"
          font-weight="bold"
          text-anchor="middle"
          :filter="textureFilter"
        >
          {{ store.sealInfo.bottomText }}
        </text>

        <!-- 编号 -->
        <text
          v-if="store.sealInfo.showSerialNumber"
          :x="store.sealInfo.sealSize / 2"
          :y="store.sealInfo.sealSize / 2 + 55"
          :fill="store.sealInfo.textColor"
          :font-size="10"
          :font-family="store.sealInfo.fontFamily"
          text-anchor="middle"
          :filter="textureFilter"
        >
          {{ store.sealInfo.sealNumber }}
        </text>
      </svg>
    </div>

    <!-- 使用示例区域 -->
    <div class="usage-example">
      <h3>使用效果预览</h3>
      <div class="document-sample">
        <div class="document-header">
          <h2>某某大学</h2>
          <p style="font-size: 18px; margin-top: 20px;">证 明 文 件</p>
        </div>
        <div class="document-body">
          <p style="text-indent: 2em; line-height: 2;">
            兹证明某某某同学（学号：2023001001）于2023年9月1日至2027年6月30日在我校计算机科学与技术学院攻读本科学位。
          </p>
          <p style="text-indent: 2em; line-height: 2; margin-top: 20px;">
            特此证明。
          </p>
          
          <div class="signature-section">
            <div class="seal-placement">
              <svg 
                width="120" 
                height="120" 
                :viewBox="`0 0 ${store.sealInfo.sealSize} ${store.sealInfo.sealSize}`"
                style="opacity: 0.9;"
                :class="inkEffectClass"
              >
                <circle
                  :cx="store.sealInfo.sealSize / 2"
                  :cy="store.sealInfo.sealSize / 2"
                  :r="store.sealInfo.outerDiameter / 2 - store.sealInfo.borderWidth / 2"
                  fill="none"
                  :stroke="store.sealInfo.borderColor"
                  :stroke-width="store.sealInfo.borderWidth"
                />
                <circle
                  :cx="store.sealInfo.sealSize / 2"
                  :cy="store.sealInfo.sealSize / 2"
                  :r="store.sealInfo.innerDiameter / 2"
                  fill="none"
                  :stroke="store.sealInfo.borderColor"
                  :stroke-width="store.sealInfo.borderWidth"
                />
                <g v-if="store.sealInfo.textArrangement === 'circular'">
                  <text
                    v-for="(item, index) in getCharacterRotations"
                    :key="index"
                    :x="store.sealInfo.sealSize / 2"
                    :y="store.sealInfo.sealSize / 2"
                    :transform="`rotate(${item.angle} ${store.sealInfo.sealSize / 2} ${store.sealInfo.sealSize / 2})`"
                    :fill="store.sealInfo.textColor"
                    :font-size="store.sealInfo.fontSize"
                    :font-family="store.sealInfo.fontFamily"
                    font-weight="bold"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    :dy="-store.sealInfo.outerDiameter / 2 + 20"
                  >
                    {{ item.char }}
                  </text>
                </g>
                <path
                  v-if="store.sealInfo.showStar"
                  :d="getStarPath(store.sealInfo.sealSize / 2, store.sealInfo.sealSize / 2, store.sealInfo.starSize)"
                  :fill="store.sealInfo.starColor"
                />
                <text
                  v-if="store.sealInfo.bottomText"
                  :x="store.sealInfo.sealSize / 2"
                  :y="store.sealInfo.sealSize / 2 + 35"
                  :fill="store.sealInfo.textColor"
                  :font-size="store.sealInfo.fontSize - 4"
                  :font-family="store.sealInfo.fontFamily"
                  font-weight="bold"
                  text-anchor="middle"
                >
                  {{ store.sealInfo.bottomText }}
                </text>
              </svg>
            </div>
            <div class="date-signature">
              <p style="margin-top: 80px; text-align: right;">
                某某大学（盖章）<br>
                2025年12月30日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seal-preview-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 20px;
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.official-seal {
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
}

/* 墨迹效果 */
.ink-effect-normal {
  opacity: 0.9;
}

.ink-effect-stamp {
  opacity: 0.85;
  filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3)) contrast(1.1);
}

.ink-effect-faded {
  opacity: 0.7;
  filter: drop-shadow(1px 1px 3px rgba(0,0,0,0.15));
}

.usage-example {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.usage-example h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.document-sample {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  padding: 40px;
  border-radius: 8px;
  min-height: 400px;
}

.document-header {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.document-header h2 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.document-body {
  font-size: 16px;
  color: #333;
  font-family: '宋体', SimSun, serif;
}

.signature-section {
  margin-top: 60px;
  position: relative;
}

.seal-placement {
  position: absolute;
  right: 80px;
  top: 20px;
}

.date-signature {
  text-align: right;
  padding-right: 40px;
}
</style>
