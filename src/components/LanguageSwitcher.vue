<template>
  <div class="language-switcher">
    <button 
      :class="['lang-btn', { active: currentLanguage === 'zh' }]" 
      @click="setLanguage('zh')"
      title="切换到中文"
    >
      中文
    </button>
    <button 
      :class="['lang-btn', { active: currentLanguage === 'en' }]" 
      @click="setLanguage('en')"
      title="Switch to English"
    >
      EN
    </button>
  </div>
</template>

<script setup lang="ts">
import { currentLanguage, setLanguage } from '@/utils/i18n'
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 8px;
}

.lang-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.lang-btn.active {
  background: #2563eb;
  color: white;
}
</style>
