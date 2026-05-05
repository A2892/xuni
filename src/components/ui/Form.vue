<template>
  <form 
    class="form"
    :class="[
      `form--${layout}`,
      `form--${labelPosition}`,
      `form--${size}`
    ]"
    @submit.prevent="handleSubmit"
  >
    <slot />
  </form>
</template>

<script setup lang="ts">
import { provide, reactive, toRefs } from 'vue'
import type { FormItemRule } from './FormItem.vue'

interface Props {
  // 表单数据对象
  model?: Record<string, any>
  // 验证规则
  rules?: Record<string, FormItemRule[]>
  // 标签位置
  labelPosition?: 'left' | 'right' | 'top'
  // 标签宽度
  labelWidth?: string | number
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 布局
  layout?: 'horizontal' | 'vertical' | 'inline'
  // 是否禁用
  disabled?: boolean
  // 是否显示冒号
  colon?: boolean
  // 是否显示必填标记
  showRequiredMark?: boolean
  // 验证触发方式
  validateTrigger?: 'blur' | 'change'
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'right',
  size: 'default',
  layout: 'horizontal',
  disabled: false,
  colon: true,
  showRequiredMark: true,
  validateTrigger: 'blur'
})

const emit = defineEmits<{
  (e: 'submit', values: Record<string, any>): void
  (e: 'validate', valid: boolean, values: Record<string, any>): void
  (e: 'finish', values: Record<string, any>): void
  (e: 'finishFailed', errors: any[]): void
}>()

// 表单项集合
const fields: any[] = reactive([])

// 添加表单项
function addField(field: any) {
  if (field.prop) {
    fields.push(field)
  }
}

// 移除表单项
function removeField(field: any) {
  const index = fields.indexOf(field)
  if (index !== -1) {
    fields.splice(index, 1)
  }
}

// 验证表单
async function validate(): Promise<boolean> {
  const results = await Promise.all(
    fields.map(field => field.validate())
  )
  
  const valid = results.every(result => result === true)
  emit('validate', valid, props.model || {})
  
  return valid
}

// 验证指定字段
async function validateFields(fieldNames: string[]): Promise<boolean> {
  const targetFields = fields.filter(field => 
    fieldNames.includes(field.prop)
  )
  
  const results = await Promise.all(
    targetFields.map(field => field.validate())
  )
  
  return results.every(result => result === true)
}

// 重置表单
function resetFields() {
  fields.forEach(field => field.resetField())
}

// 清除验证
function clearValidate(fieldNames?: string[]) {
  const targetFields = fieldNames
    ? fields.filter(field => fieldNames.includes(field.prop))
    : fields
  
  targetFields.forEach(field => field.clearValidate())
}

// 提交表单
async function handleSubmit() {
  const valid = await validate()
  
  if (valid) {
    emit('submit', props.model || {})
    emit('finish', props.model || {})
  } else {
    emit('finishFailed', [])
  }
}

// 滚动到第一个错误字段
function scrollToField(fieldName: string) {
  const field = fields.find(f => f.prop === fieldName)
  if (field) {
    // TODO: 实现滚动
  }
}

// 提供给子组件的上下文
provide('formContext', {
  model: props.model,
  rules: props.rules,
  labelPosition: props.labelPosition,
  labelWidth: props.labelWidth,
  size: props.size,
  disabled: props.disabled,
  colon: props.colon,
  showRequiredMark: props.showRequiredMark,
  validateTrigger: props.validateTrigger,
  addField,
  removeField
})

// 暴露方法
defineExpose({
  validate,
  validateFields,
  resetFields,
  clearValidate,
  scrollToField
})
</script>

<style scoped>
.form {
  width: 100%;
}

/* 水平布局 */
.form--horizontal {
  display: flex;
  flex-direction: column;
}

/* 垂直布局 */
.form--vertical :deep(.form-item) {
  flex-direction: column;
}

.form--vertical :deep(.form-item__label) {
  padding-right: 0;
  padding-bottom: 8px;
  line-height: 1;
  justify-content: flex-start;
}

/* 内联布局 */
.form--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.form--inline :deep(.form-item) {
  margin-bottom: 0;
}

/* 尺寸 */
.form--small :deep(.form-item__label) {
  line-height: 24px;
  font-size: 12px;
}

.form--large :deep(.form-item__label) {
  line-height: 40px;
  font-size: 16px;
}
</style>
