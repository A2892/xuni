<template>
  <div class="config-provider">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, reactive, watch, computed } from 'vue'

interface Locale {
  locale: string
  // 通用
  confirm: string
  cancel: string
  ok: string
  clear: string
  search: string
  loading: string
  // 分页
  pagination: {
    total: string
    page: string
    pageSize: string
    goto: string
  }
  // 日期选择器
  datePicker: {
    placeholder: string
    today: string
    now: string
    selectDate: string
    selectTime: string
    startDate: string
    endDate: string
    weekdays: string[]
    months: string[]
  }
  // 表格
  table: {
    empty: string
    loading: string
    selectAll: string
  }
  // 上传
  upload: {
    uploadText: string
    uploading: string
    success: string
    failed: string
  }
  // 模态框
  modal: {
    confirmTitle: string
  }
  // 空状态
  empty: {
    description: string
  }
  // 输入框
  input: {
    placeholder: string
  }
  // 选择器
  select: {
    placeholder: string
    noData: string
  }
  // 时间相关
  time: {
    before: string
    after: string
    just: string
    seconds: string
    minutes: string
    hours: string
    days: string
    weeks: string
    months: string
    years: string
  }
}

// 默认中文配置
const zhCN: Locale = {
  locale: 'zh-CN',
  confirm: '确定',
  cancel: '取消',
  ok: '好的',
  clear: '清除',
  search: '搜索',
  loading: '加载中...',
  pagination: {
    total: '共 {total} 条',
    page: '页',
    pageSize: '条/页',
    goto: '前往'
  },
  datePicker: {
    placeholder: '请选择日期',
    today: '今天',
    now: '此刻',
    selectDate: '选择日期',
    selectTime: '选择时间',
    startDate: '开始日期',
    endDate: '结束日期',
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  },
  table: {
    empty: '暂无数据',
    loading: '加载中...',
    selectAll: '全选'
  },
  upload: {
    uploadText: '点击上传',
    uploading: '上传中...',
    success: '上传成功',
    failed: '上传失败'
  },
  modal: {
    confirmTitle: '确认'
  },
  empty: {
    description: '暂无数据'
  },
  input: {
    placeholder: '请输入'
  },
  select: {
    placeholder: '请选择',
    noData: '无匹配数据'
  },
  time: {
    before: '前',
    after: '后',
    just: '刚刚',
    seconds: '秒',
    minutes: '分钟',
    hours: '小时',
    days: '天',
    weeks: '周',
    months: '个月',
    years: '年'
  }
}

// 英文配置
const enUS: Locale = {
  locale: 'en-US',
  confirm: 'Confirm',
  cancel: 'Cancel',
  ok: 'OK',
  clear: 'Clear',
  search: 'Search',
  loading: 'Loading...',
  pagination: {
    total: 'Total {total}',
    page: 'Page',
    pageSize: ' / page',
    goto: 'Go to'
  },
  datePicker: {
    placeholder: 'Select date',
    today: 'Today',
    now: 'Now',
    selectDate: 'Select date',
    selectTime: 'Select time',
    startDate: 'Start date',
    endDate: 'End date',
    weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  table: {
    empty: 'No data',
    loading: 'Loading...',
    selectAll: 'Select all'
  },
  upload: {
    uploadText: 'Click to upload',
    uploading: 'Uploading...',
    success: 'Upload success',
    failed: 'Upload failed'
  },
  modal: {
    confirmTitle: 'Confirm'
  },
  empty: {
    description: 'No data'
  },
  input: {
    placeholder: 'Please input'
  },
  select: {
    placeholder: 'Please select',
    noData: 'No data'
  },
  time: {
    before: 'ago',
    after: 'later',
    just: 'Just now',
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    years: 'years'
  }
}

// 日语配置
const jaJP: Locale = {
  locale: 'ja-JP',
  confirm: '確認',
  cancel: 'キャンセル',
  ok: 'OK',
  clear: 'クリア',
  search: '検索',
  loading: '読み込み中...',
  pagination: {
    total: '合計 {total} 件',
    page: 'ページ',
    pageSize: '件/ページ',
    goto: '移動'
  },
  datePicker: {
    placeholder: '日付を選択',
    today: '今日',
    now: '現在',
    selectDate: '日付を選択',
    selectTime: '時間を選択',
    startDate: '開始日',
    endDate: '終了日',
    weekdays: ['日', '月', '火', '水', '木', '金', '土'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  },
  table: {
    empty: 'データなし',
    loading: '読み込み中...',
    selectAll: 'すべて選択'
  },
  upload: {
    uploadText: 'アップロード',
    uploading: 'アップロード中...',
    success: 'アップロード成功',
    failed: 'アップロード失敗'
  },
  modal: {
    confirmTitle: '確認'
  },
  empty: {
    description: 'データなし'
  },
  input: {
    placeholder: '入力してください'
  },
  select: {
    placeholder: '選択してください',
    noData: 'データなし'
  },
  time: {
    before: '前',
    after: '後',
    just: 'たった今',
    seconds: '秒',
    minutes: '分',
    hours: '時間',
    days: '日',
    weeks: '週間',
    months: 'ヶ月',
    years: '年'
  }
}

// 预设语言包
const locales: Record<string, Locale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP
}

interface Theme {
  primaryColor: string
  successColor: string
  warningColor: string
  errorColor: string
  infoColor: string
  textColor: string
  textSecondary: string
  borderColor: string
  backgroundColor: string
  borderRadius: string
  fontSize: string
}

interface Props {
  locale?: string | Locale
  theme?: Partial<Theme>
  componentSize?: 'small' | 'default' | 'large'
  autoInsertSpaceInButton?: boolean
  direction?: 'ltr' | 'rtl'
  virtual?: boolean
  dropdownMatchSelectWidth?: boolean | number
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'zh-CN',
  theme: () => ({}),
  componentSize: 'default',
  autoInsertSpaceInButton: false,
  direction: 'ltr',
  virtual: true,
  dropdownMatchSelectWidth: true
})

// 获取语言配置
const getLocale = computed(() => {
  if (typeof props.locale === 'string') {
    return locales[props.locale] || zhCN
  }
  return { ...zhCN, ...props.locale }
})

// 主题配置
const themeConfig = computed<Theme>(() => ({
  primaryColor: '#4B6EF5',
  successColor: '#52c41a',
  warningColor: '#faad14',
  errorColor: '#ff4d4f',
  infoColor: '#1890ff',
  textColor: 'rgba(0, 0, 0, 0.88)',
  textSecondary: 'rgba(0, 0, 0, 0.45)',
  borderColor: '#d9d9d9',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  fontSize: '14px',
  ...props.theme
}))

// 应用 CSS 变量
const applyTheme = () => {
  const root = document.documentElement
  root.style.setProperty('--primary-color', themeConfig.value.primaryColor)
  root.style.setProperty('--success-color', themeConfig.value.successColor)
  root.style.setProperty('--warning-color', themeConfig.value.warningColor)
  root.style.setProperty('--error-color', themeConfig.value.errorColor)
  root.style.setProperty('--info-color', themeConfig.value.infoColor)
  root.style.setProperty('--text-color', themeConfig.value.textColor)
  root.style.setProperty('--text-secondary', themeConfig.value.textSecondary)
  root.style.setProperty('--border-color', themeConfig.value.borderColor)
  root.style.setProperty('--background-color', themeConfig.value.backgroundColor)
  root.style.setProperty('--border-radius', themeConfig.value.borderRadius)
  root.style.setProperty('--font-size', themeConfig.value.fontSize)
}

watch(themeConfig, applyTheme, { immediate: true, deep: true })

// 提供配置给子组件
const configContext = reactive({
  locale: getLocale,
  theme: themeConfig,
  componentSize: computed(() => props.componentSize),
  autoInsertSpaceInButton: computed(() => props.autoInsertSpaceInButton),
  direction: computed(() => props.direction),
  virtual: computed(() => props.virtual),
  dropdownMatchSelectWidth: computed(() => props.dropdownMatchSelectWidth)
})

provide('configProvider', configContext)

// 导出给外部使用
defineExpose({
  locale: getLocale,
  theme: themeConfig
})
</script>

<style scoped>
.config-provider {
  width: 100%;
  height: 100%;
}
</style>
