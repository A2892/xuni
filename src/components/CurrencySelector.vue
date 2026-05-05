<template>
  <div class="currency-selector" @keydown.esc="close">
    <div class="selector" @click="toggle" :class="{open: open}">
        <div class="left">
          <span class="selected-flag">{{ selected?.flag || '🌐' }}</span>
          <div class="selected-info">
            <div class="code-name">
              <span class="code">{{ selected?.code || '选择货币' }}</span>
              <span class="name">{{ selected?.nameCn || selected?.name || '' }}</span>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="symbol">{{ selected?.symbol || '' }}</div>
          <svg class="caret" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
        </div>
      </div>

    <transition name="fade">
      <div v-if="open" class="dropdown" @click.stop>
        <div class="list" ref="listRef">
          <div v-for="c in currenciesList" :key="c.code" class="item" @click="select(c.code)">
            <span class="flag">{{ c.flag || ' ' }}</span>
            <div class="meta">
              <div class="title">{{ c.nameCn || c.name }}</div>
              <div class="subtitle">{{ c.code }} · {{ c.symbol || '' }}</div>
            </div>
          </div>
        </div>

        <div class="add-row">
          <button class="add-btn" @click="showAdd = !showAdd">+ 添加自定义货币</button>

          <div v-if="showAdd" class="add-form" @click.stop>
            <input v-model="newC.code" placeholder="代码 (USD)" maxlength="6" />
            <input v-model="newC.name" placeholder="名称 (US Dollar)" />
            <input v-model="newC.symbol" placeholder="符号 ($)" style="width:70px" />
            <input v-model="newC.flag" placeholder="国旗 (🇺🇸)" style="width:70px" />
            <div class="add-actions">
              <button class="ok" @click="addCurrency">添加</button>
              <button class="cancel" @click="cancelAdd">取消</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { sharedCurrencies as initialCurrencies } from '../lib/currencies'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const showAdd = ref(false)
const listRef = ref<HTMLElement | null>(null)
const storageKey = 'app.currencies'

const persisted = ref<any[]>(JSON.parse(localStorage.getItem(storageKey) || '[]'))

const currenciesList = computed(() => {
  const merged = [...initialCurrencies, ...persisted.value]
  const uniq = new Map<string, any>()
  for (const c of merged) {
    const code = (c.code || (c.name + (c.symbol || ''))).toString()
    if (!uniq.has(code)) uniq.set(code, c)
  }
  return Array.from(uniq.values())
})

const selected = computed(() => currenciesList.value.find(c => c.code === props.modelValue) || currenciesList.value[0])

watch(persisted, (v) => localStorage.setItem(storageKey, JSON.stringify(v)), { deep: true })

function toggle() { open.value = !open.value }
function close() { open.value = false; showAdd.value = false }
function select(code: string) { emit('update:modelValue', code); close() }

const newC = ref({ code: '', name: '', symbol: '', flag: '' })
function addCurrency() {
  if (!newC.value.code) return
  const item = { code: newC.value.code.toUpperCase(), name: newC.value.name || newC.value.code, symbol: newC.value.symbol || '', flag: newC.value.flag || '' }
  persisted.value = [item, ...persisted.value]
  newC.value = { code: '', name: '', symbol: '', flag: '' }
  showAdd.value = false
  emit('update:modelValue', item.code)
}
function cancelAdd() { newC.value = { code: '', name: '', symbol: '', flag: '' }; showAdd.value = false }

onMounted(() => {
  if (listRef.value) listRef.value.style.maxHeight = '260px'
})
</script>

<style scoped>
.currency-selector{position:relative;width:280px;font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial}
.selector{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border:1px solid #e8edf3;border-radius:8px;background:#fff;cursor:pointer}
.selector .left{display:flex;align-items:center;gap:8px}
.selected-flag{font-size:16px}
.selected-info{min-width:0}
.code-name{display:flex;align-items:center;gap:8px}
.selected-info .code{font-weight:700;font-size:13px}
.selected-info .name{font-size:12px;color:#68707a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.right{display:flex;align-items:center;gap:8px}
.symbol{color:#2b2f36;font-weight:700}
.caret{color:#9aa4b2}
.dropdown{position:absolute;top:48px;left:0;z-index:50;width:320px;background:#fff;border:1px solid #eef2f6;border-radius:10px;box-shadow:0 10px 30px rgba(16,24,40,0.08);padding:6px}
.list{max-height:220px;overflow:auto}
.item{display:flex;align-items:center;padding:6px;border-radius:8px;cursor:pointer;gap:10px}
.item + .item{margin-top:4px}
.item:hover{background:#f6f8fb}
.flag{width:32px;font-size:16px;text-align:center;margin-right:8px}
.meta{display:flex;flex-direction:row;align-items:center;gap:8px}
.meta .title{font-weight:600;font-size:13px}
.meta .subtitle{font-size:12px;color:#7b8794}
.add-row{padding-top:6px;border-top:1px solid #f2f5f8;margin-top:6px;display:flex;flex-direction:column;gap:6px}
.add-btn{background:transparent;border:none;color:#1f7bea;cursor:pointer;padding:6px;text-align:left}
.add-form{display:flex;gap:6px;flex-wrap:wrap}
.add-form input{flex:1;padding:6px;border:1px solid #e9eef4;border-radius:8px}
.add-actions{display:flex;gap:6px}
.add-actions .ok{background:#1f7bea;color:#fff;border:none;padding:6px 10px;border-radius:8px}
.add-actions .cancel{background:#f3f5f7;border:none;padding:6px 10px;border-radius:8px}
.fade-enter-active,.fade-leave-active{transition:opacity .12s}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
