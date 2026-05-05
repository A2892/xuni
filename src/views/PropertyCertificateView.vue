<template>
  <div class="property-view">
    <div class="view-header">
      <h2>🏠 房产证生成器</h2>
      <p>生成中华人民共和国不动产权证书</p>
    </div>
    <div class="coming-soon">
      <div class="icon">🚧</div>
      <h3>功能开发中...</h3>
      <p>房产证生成器正在开发中，敬请期待！</p>
      <p class="hint">Store 已创建完成，视图组件即将上线</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePropertyStore } from '@/stores/property'

const propertyStore = usePropertyStore()
</script>

<style scoped>
.property-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.view-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.view-header h2 {
  font-size: 32px;
  margin: 0 0 10px 0;
}

.view-header p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.coming-soon {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.coming-soon h3 {
  font-size: 28px;
  color: #212529;
  margin: 0 0 15px 0;
}

.coming-soon p {
  font-size: 16px;
  color: #6c757d;
  margin: 10px 0;
}

.hint {
  margin-top: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #495057;
}
</style>
