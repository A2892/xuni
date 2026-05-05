<template>
  <div class="business-card-preview" :class="store.settings.template">
    <!-- Modern Template -->
    <div v-if="store.settings.template === 'modern'" class="card modern" :style="{ '--primary': store.settings.primaryColor, '--secondary': store.settings.secondaryColor }">
      <div class="card-left">
        <div v-if="store.settings.showPhoto && store.photo" class="photo">
          <img :src="store.photo" alt="Photo" />
        </div>
        <div v-if="store.settings.showLogo && store.logo" class="logo">
          <img :src="store.logo" alt="Logo" />
        </div>
      </div>
      <div class="card-right">
        <h1>{{ store.fullName || '您的姓名' }}</h1>
        <p class="title">{{ store.title || '职位' }}</p>
        <p class="company">{{ store.company || '公司名称' }}</p>
        <div class="contact-info">
          <div v-if="store.phone"><span>📞</span> {{ store.phone }}</div>
          <div v-if="store.email"><span>✉️</span> {{ store.email }}</div>
          <div v-if="store.website"><span>🌐</span> {{ store.website }}</div>
          <div v-if="store.address"><span>📍</span> {{ store.address }}</div>
        </div>
      </div>
    </div>

    <!-- Classic Template -->
    <div v-else-if="store.settings.template === 'classic'" class="card classic" :style="{ '--primary': store.settings.primaryColor }">
      <div class="header">
        <img v-if="store.settings.showLogo && store.logo" :src="store.logo" class="logo" />
        <div class="title-block">
          <h1>{{ store.fullName || '您的姓名' }}</h1>
          <p class="title">{{ store.title || '职位' }} | {{ store.company || '公司' }}</p>
        </div>
      </div>
      <div class="divider"></div>
      <div class="contact-grid">
        <div v-if="store.phone"><span>电话:</span> {{ store.phone }}</div>
        <div v-if="store.mobile"><span>手机:</span> {{ store.mobile }}</div>
        <div v-if="store.email"><span>邮箱:</span> {{ store.email }}</div>
        <div v-if="store.website"><span>网站:</span> {{ store.website }}</div>
      </div>
      <div v-if="store.address" class="address">{{ store.address }}</div>
    </div>

    <!-- Minimal Template -->
    <div v-else-if="store.settings.template === 'minimal'" class="card minimal" :style="{ '--primary': store.settings.primaryColor }">
      <div class="left">
        <h1>{{ store.fullName || '您的姓名' }}</h1>
        <p>{{ store.title || '职位' }}</p>
      </div>
      <div class="right">
        <div v-if="store.phone">{{ store.phone }}</div>
        <div v-if="store.email">{{ store.email }}</div>
        <div v-if="store.website">{{ store.website }}</div>
      </div>
    </div>

    <!-- Corporate Template -->
    <div v-else-if="store.settings.template === 'corporate'" class="card corporate" :style="{ '--primary': store.settings.primaryColor, '--secondary': store.settings.secondaryColor }">
      <div class="accent-bar"></div>
      <div class="content">
        <div class="header">
          <img v-if="store.settings.showLogo && store.logo" :src="store.logo" class="logo" />
          <div class="name-block">
            <h1>{{ store.fullName || '您的姓名' }}</h1>
            <p class="title">{{ store.title || '职位' }}</p>
            <p class="dept">{{ store.department || '' }} {{ store.company || '公司' }}</p>
          </div>
        </div>
        <div class="contact">
          <div v-if="store.phone"><strong>T</strong> {{ store.phone }}</div>
          <div v-if="store.mobile"><strong>M</strong> {{ store.mobile }}</div>
          <div v-if="store.email"><strong>E</strong> {{ store.email }}</div>
          <div v-if="store.website"><strong>W</strong> {{ store.website }}</div>
        </div>
      </div>
    </div>

    <!-- Creative Template -->
    <div v-else-if="store.settings.template === 'creative'" class="card creative" :style="{ '--primary': store.settings.primaryColor, '--secondary': store.settings.secondaryColor }">
      <div class="bg-shape"></div>
      <div class="content">
        <div v-if="store.settings.showPhoto && store.photo" class="photo-circle">
          <img :src="store.photo" />
        </div>
        <h1>{{ store.fullName || '您的姓名' }}</h1>
        <p class="title">{{ store.title || '职位' }}</p>
        <div class="social" v-if="store.settings.showSocialIcons">
          <span v-if="store.linkedin">in</span>
          <span v-if="store.twitter">𝕏</span>
          <span v-if="store.instagram">📷</span>
          <span v-if="store.wechat">💬</span>
        </div>
        <div class="contact-line">
          <span v-if="store.phone">{{ store.phone }}</span>
          <span v-if="store.email">{{ store.email }}</span>
        </div>
      </div>
    </div>

    <!-- Vertical Template -->
    <div v-else-if="store.settings.template === 'vertical'" class="card vertical" :style="{ '--primary': store.settings.primaryColor }">
      <div class="top-section">
        <img v-if="store.settings.showLogo && store.logo" :src="store.logo" class="logo" />
        <h2>{{ store.company || '公司名称' }}</h2>
      </div>
      <div class="middle-section">
        <h1>{{ store.fullName || '您的姓名' }}</h1>
        <p>{{ store.title || '职位' }}</p>
      </div>
      <div class="bottom-section">
        <div v-if="store.phone">{{ store.phone }}</div>
        <div v-if="store.email">{{ store.email }}</div>
        <div v-if="store.website">{{ store.website }}</div>
      </div>
    </div>

    <!-- Elegant Template -->
    <div v-else-if="store.settings.template === 'elegant'" class="card elegant" :style="{ '--primary': store.settings.primaryColor }">
      <div class="border-frame">
        <h1>{{ store.fullName || '您的姓名' }}</h1>
        <div class="ornament">✦</div>
        <p class="title">{{ store.title || '职位' }}</p>
        <p class="company">{{ store.company || '公司名称' }}</p>
        <div class="contact-elegant">
          <span v-if="store.phone">{{ store.phone }}</span>
          <span v-if="store.email">{{ store.email }}</span>
        </div>
      </div>
    </div>

    <!-- Tech Template -->
    <div v-else-if="store.settings.template === 'tech'" class="card tech" :style="{ '--primary': store.settings.primaryColor, '--secondary': store.settings.secondaryColor }">
      <div class="circuit-lines"></div>
      <div class="content">
        <div class="name-section">
          <h1>{{ store.fullName || '您的姓名' }}</h1>
          <span class="badge">{{ store.title || '职位' }}</span>
        </div>
        <div class="company-row">
          <img v-if="store.settings.showLogo && store.logo" :src="store.logo" class="logo" />
          <span>{{ store.company || '公司' }}</span>
        </div>
        <div class="contact-tech">
          <div v-if="store.phone"><span>📱</span>{{ store.phone }}</div>
          <div v-if="store.email"><span>📧</span>{{ store.email }}</div>
          <div v-if="store.website"><span>🔗</span>{{ store.website }}</div>
        </div>
      </div>
    </div>

    <!-- Default Template -->
    <div v-else class="card default" :style="{ '--primary': store.settings.primaryColor }">
      <div class="card-header">
        <img v-if="store.settings.showLogo && store.logo" :src="store.logo" class="logo" />
        <div>
          <h1>{{ store.fullName || '您的姓名' }}</h1>
          <p>{{ store.title || '职位' }} - {{ store.company || '公司' }}</p>
        </div>
      </div>
      <div class="card-body">
        <div v-if="store.phone">📞 {{ store.phone }}</div>
        <div v-if="store.email">✉️ {{ store.email }}</div>
        <div v-if="store.website">🌐 {{ store.website }}</div>
        <div v-if="store.address">📍 {{ store.address }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBusinessCardStore } from '@/stores/businessCard'
const store = useBusinessCardStore()
</script>

<style scoped>
.business-card-preview { display: flex; justify-content: center; align-items: center; }
.card { width: 350px; height: 200px; border-radius: 10px; overflow: hidden; font-family: 'Segoe UI', sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }

/* Modern */
.card.modern { display: flex; background: white; }
.card.modern .card-left { width: 100px; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.card.modern .photo img, .card.modern .logo img { width: 60px; height: 60px; object-fit: cover; border-radius: 50%; border: 2px solid white; }
.card.modern .card-right { flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: center; }
.card.modern h1 { font-size: 18px; margin: 0 0 4px 0; color: #1f2937; }
.card.modern .title { font-size: 12px; color: var(--primary); margin: 0 0 2px 0; font-weight: 600; }
.card.modern .company { font-size: 11px; color: #6b7280; margin: 0 0 10px 0; }
.card.modern .contact-info { font-size: 10px; color: #4b5563; }
.card.modern .contact-info div { margin: 2px 0; display: flex; gap: 6px; }

/* Classic */
.card.classic { background: white; padding: 20px; display: flex; flex-direction: column; }
.card.classic .header { display: flex; align-items: center; gap: 12px; }
.card.classic .logo { width: 50px; height: 50px; object-fit: contain; }
.card.classic h1 { font-size: 18px; margin: 0; color: var(--primary); }
.card.classic .title { font-size: 11px; color: #6b7280; margin: 4px 0 0 0; }
.card.classic .divider { height: 2px; background: linear-gradient(to right, var(--primary), transparent); margin: 12px 0; }
.card.classic .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; }
.card.classic .contact-grid span { color: var(--primary); font-weight: 600; }
.card.classic .address { font-size: 10px; color: #6b7280; margin-top: auto; }

/* Minimal */
.card.minimal { background: white; display: flex; justify-content: space-between; align-items: center; padding: 24px; border-left: 4px solid var(--primary); }
.card.minimal h1 { font-size: 20px; margin: 0; color: #1f2937; }
.card.minimal .left p { font-size: 12px; color: var(--primary); margin: 4px 0 0 0; }
.card.minimal .right { text-align: right; font-size: 11px; color: #4b5563; line-height: 1.8; }

/* Corporate */
.card.corporate { background: white; position: relative; display: flex; flex-direction: column; }
.card.corporate .accent-bar { height: 6px; background: linear-gradient(to right, var(--primary), var(--secondary)); }
.card.corporate .content { flex: 1; padding: 16px 20px; display: flex; flex-direction: column; }
.card.corporate .header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
.card.corporate .logo { width: 48px; height: 48px; object-fit: contain; }
.card.corporate h1 { font-size: 18px; margin: 0; color: #1f2937; }
.card.corporate .title { font-size: 12px; color: var(--primary); margin: 2px 0; font-weight: 500; }
.card.corporate .dept { font-size: 11px; color: #6b7280; margin: 0; }
.card.corporate .contact { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; margin-top: auto; }
.card.corporate .contact strong { color: var(--primary); margin-right: 6px; }

/* Creative */
.card.creative { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); position: relative; overflow: hidden; text-align: center; color: white; }
.card.creative .bg-shape { position: absolute; width: 300px; height: 300px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -150px; right: -100px; }
.card.creative .content { position: relative; z-index: 1; padding: 20px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.card.creative .photo-circle img { width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; object-fit: cover; }
.card.creative h1 { font-size: 20px; margin: 8px 0 4px 0; }
.card.creative .title { font-size: 12px; opacity: 0.9; margin: 0 0 8px 0; }
.card.creative .social { display: flex; gap: 12px; margin-bottom: 8px; }
.card.creative .social span { width: 24px; height: 24px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.card.creative .contact-line { font-size: 10px; opacity: 0.9; }
.card.creative .contact-line span { margin: 0 8px; }

/* Vertical */
.card.vertical { width: 200px; height: 340px; background: white; display: flex; flex-direction: column; }
.card.vertical .top-section { background: var(--primary); padding: 20px; text-align: center; color: white; }
.card.vertical .top-section .logo { width: 40px; height: 40px; object-fit: contain; }
.card.vertical .top-section h2 { font-size: 12px; margin: 8px 0 0 0; }
.card.vertical .middle-section { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; }
.card.vertical .middle-section h1 { font-size: 18px; margin: 0; color: #1f2937; }
.card.vertical .middle-section p { font-size: 12px; color: var(--primary); margin: 4px 0 0 0; }
.card.vertical .bottom-section { padding: 16px; background: #f9fafb; font-size: 10px; color: #4b5563; text-align: center; line-height: 1.8; }

/* Elegant */
.card.elegant { background: linear-gradient(135deg, #faf5f0, #fff); display: flex; justify-content: center; align-items: center; }
.card.elegant .border-frame { border: 1px solid var(--primary); padding: 20px 30px; text-align: center; width: 280px; height: 160px; display: flex; flex-direction: column; justify-content: center; }
.card.elegant h1 { font-size: 20px; margin: 0; color: var(--primary); font-family: Georgia, serif; }
.card.elegant .ornament { color: var(--primary); margin: 6px 0; font-size: 12px; }
.card.elegant .title { font-size: 11px; color: #6b7280; margin: 0; font-style: italic; }
.card.elegant .company { font-size: 12px; color: #374151; margin: 4px 0 10px 0; }
.card.elegant .contact-elegant { font-size: 10px; color: #4b5563; }
.card.elegant .contact-elegant span { margin: 0 8px; }

/* Tech */
.card.tech { background: #0f172a; position: relative; overflow: hidden; }
.card.tech .circuit-lines { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(var(--primary), 0.05) 30px, rgba(var(--primary), 0.05) 31px); }
.card.tech .content { position: relative; z-index: 1; padding: 20px; height: 100%; display: flex; flex-direction: column; }
.card.tech .name-section { margin-bottom: 8px; }
.card.tech h1 { font-size: 18px; margin: 0; color: white; }
.card.tech .badge { display: inline-block; background: var(--primary); color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-top: 4px; }
.card.tech .company-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.card.tech .company-row .logo { width: 24px; height: 24px; object-fit: contain; }
.card.tech .company-row span { color: #94a3b8; font-size: 12px; }
.card.tech .contact-tech { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; color: #94a3b8; margin-top: auto; }
.card.tech .contact-tech span { margin-right: 4px; }

/* Default */
.card.default { background: white; padding: 20px; display: flex; flex-direction: column; }
.card.default .card-header { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid var(--primary); }
.card.default .logo { width: 50px; height: 50px; object-fit: contain; }
.card.default h1 { font-size: 18px; margin: 0; color: #1f2937; }
.card.default p { font-size: 11px; color: #6b7280; margin: 4px 0 0 0; }
.card.default .card-body { font-size: 11px; color: #4b5563; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
</style>
