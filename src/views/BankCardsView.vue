<template>
  <div class="bank-cards-view">
    <div class="header-row">
      <h2>银行卡管理</h2>
      <button class="btn" @click="showAdd = !showAdd">{{ showAdd ? '关闭' : '新增卡片' }}</button>
    </div>

    <div v-if="showAdd" class="add-panel">
      <div class="form-row">
        <input v-model="newCard.bankName" placeholder="银行名称" />
        <input v-model="newCard.cardNumber" placeholder="卡号（尾号）" />
        <input v-model="newCard.holder" placeholder="持卡人" />
        <button class="btn-primary" @click="addCard">保存</button>
      </div>
    </div>

    <div class="cards-list">
      <div v-if="cards.length === 0" class="empty">暂无银行卡，点击“新增卡片”添加。</div>
      <div v-for="card in cards" :key="card.id" class="card-item">
        <div class="card-left">
          <div class="bank-name">{{ card.bankName }}</div>
          <div class="card-holder">{{ card.holder }}</div>
        </div>
        <div class="card-right">
          <div class="card-number">**** **** **** {{ card.cardNumber.slice(-4) }}</div>
          <div class="card-actions">
            <button @click="editCard(card.id)">编辑</button>
            <button @click="removeCard(card.id)" class="danger">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface BankCard { id: string; bankName: string; cardNumber: string; holder: string }

const showAdd = ref(false)
const cards = ref<BankCard[]>(JSON.parse(localStorage.getItem('bankCards') || '[]'))

const newCard = ref<BankCard>({ id: '', bankName: '', cardNumber: '', holder: '' })

const saveToStorage = () => localStorage.setItem('bankCards', JSON.stringify(cards.value))

const addCard = () => {
  if (!newCard.value.bankName || !newCard.value.cardNumber) return
  const card = { ...newCard.value, id: Date.now().toString() }
  cards.value.push(card)
  saveToStorage()
  newCard.value = { id: '', bankName: '', cardNumber: '', holder: '' }
  showAdd.value = false
}

const removeCard = (id: string) => {
  cards.value = cards.value.filter(c => c.id !== id)
  saveToStorage()
}

const editCard = (id: string) => {
  const c = cards.value.find(x => x.id === id)
  if (!c) return
  newCard.value = { ...c }
  showAdd.value = true
}
</script>

<style scoped>
.bank-cards-view { padding: 20px; }
.header-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px }
.add-panel .form-row { display:flex; gap:8px }
.cards-list { margin-top:12px }
.card-item { display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #e6e6e6; border-radius:8px; margin-bottom:8px; }
.card-left .bank-name { font-weight:600 }
.card-right .card-actions button { margin-left:8px }
.btn { padding:8px 12px; border-radius:6px; border:none; background:#eef2ff }
.btn-primary { background:#2563eb; color:white; padding:8px 12px; border-radius:6px; }
.danger { background:#fee2e2; color:#b91c1c; border:none; padding:6px 10px; border-radius:6px }
.empty { color:#6b7280 }
</style>
