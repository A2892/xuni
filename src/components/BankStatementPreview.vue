<template>
  <div class="bank-statement-preview" :class="`size-${previewSize}`" :style="previewStyle">
    <div 
      ref="statementRef"
      class="statement-page" 
      :class="{ 'has-border': bankStore.settings.showBorder }"
      :style="{
        border: bankStore.settings.showBorder ? `${bankStore.settings.borderWidth}px ${bankStore.settings.borderStyle || 'solid'} ${bankStore.settings.borderColor}` : 'none',
        position: 'relative',
        overflow: 'hidden'
      }"
    >
      <!-- 水印层：分为两个层，便于只将需要覆盖的类型抬到内容之上 -->
      <!-- 1) 背景水印层：非覆盖模式（在内容下方） -->
      <div v-if="showWatermarkLayer" class="watermark-layer-below" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }">
        <DiagonalWatermark
          v-if="diagEnabled && !diagOverlayFlag"
          :key="'diag-bs-'+diagKey"
          :lineWidth="diagWidth"
          :lineSpacing="diagSpacing"
          :color="diagColor"
          :opacity="diagOpacity / 100"
          :rotation="diagRotation"
          :overlay="false"
        />

        <!-- 非覆盖的全屏/文字水印（通常不常用，但保持兼容） -->
        <FullScreenWatermark
          v-if="fullEnabled && !fullOverlayFlag"
          :text="bankStore.settings.fullScreenWatermarkText ?? watermark.settings.fullScreenWatermarkText"
          :fontSize="bankStore.settings.fullScreenWatermarkSize ?? watermark.settings.fullScreenWatermarkSize ?? 48"
          :spacing="bankStore.settings.fullScreenWatermarkSpacing ?? watermark.settings.fullScreenWatermarkSpacing ?? bankStore.settings.watermarkSpacingX ?? 200"
          :rotation="bankStore.settings.fullScreenWatermarkAngle ?? bankStore.settings.fullScreenWatermarkRotation ?? watermark.settings.fullScreenWatermarkAngle ?? watermark.settings.fullScreenWatermarkRotation ?? -45"
          :color="bankStore.settings.fullScreenWatermarkColor ?? watermark.settings.fullScreenWatermarkColor ?? '#000000'"
          :opacity="((bankStore.settings.fullScreenWatermarkOpacity ?? watermark.settings.fullScreenWatermarkOpacity) || 8) / 100"
          :fontFamily="bankStore.settings.fullScreenWatermarkFontFamily ?? watermark.settings.fullScreenWatermarkFontFamily ?? 'Times New Roman'"
          :overlay="false"
        />

        <div v-if="textEnabled && !textOverlayFlag"
          class="single-watermark"
          :style="{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${(bankStore.settings.textWatermarkRotation ?? watermark.settings.textWatermarkRotation) || 0}deg)`,
            opacity: ((bankStore.settings.textWatermarkOpacity ?? watermark.settings.textWatermarkOpacity) || 0) / 100,
            color: bankStore.settings.textWatermarkColor ?? watermark.settings.textWatermarkColor,
            fontSize: `${(bankStore.settings.textWatermarkSize ?? watermark.settings.textWatermarkSize ?? 14) * 2}px`,
            fontWeight: 'bold',
            fontFamily: (bankStore.settings.textWatermarkFontFamily ?? watermark.settings.textWatermarkFontFamily) || 'Arial',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            zIndex: 1,
            mixBlendMode: 'multiply'
          }">
          {{ bankStore.settings.textWatermarkText ?? watermark.settings.textWatermarkText }}
        </div>
      </div>

      <!-- 2) 覆盖水印层：仅放 overlay 模式下需要覆盖内容的元素 -->
      <div v-if="showWatermarkLayer" class="watermark-layer-above" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 60 }">
        <DiagonalWatermark
          v-if="diagEnabled && diagOverlayFlag"
          :key="'diag-bs-overlay-'+diagKey"
          :lineWidth="diagWidth"
          :lineSpacing="diagSpacing"
          :color="diagColor"
          :opacity="diagOpacity / 100"
          :rotation="diagRotation"
          :overlay="true"
        />

        <FullScreenWatermark
          v-if="fullEnabled && fullOverlayFlag"
          :text="bankStore.settings.fullScreenWatermarkText ?? watermark.settings.fullScreenWatermarkText"
          :fontSize="bankStore.settings.fullScreenWatermarkSize ?? watermark.settings.fullScreenWatermarkSize ?? 48"
          :spacing="bankStore.settings.fullScreenWatermarkSpacing ?? watermark.settings.fullScreenWatermarkSpacing ?? bankStore.settings.watermarkSpacingX ?? 200"
          :rotation="bankStore.settings.fullScreenWatermarkAngle ?? bankStore.settings.fullScreenWatermarkRotation ?? watermark.settings.fullScreenWatermarkAngle ?? watermark.settings.fullScreenWatermarkRotation ?? -45"
          :color="bankStore.settings.fullScreenWatermarkColor ?? watermark.settings.fullScreenWatermarkColor ?? '#000000'"
          :opacity="((bankStore.settings.fullScreenWatermarkOpacity ?? watermark.settings.fullScreenWatermarkOpacity) || 8) / 100"
          :fontFamily="bankStore.settings.fullScreenWatermarkFontFamily ?? watermark.settings.fullScreenWatermarkFontFamily ?? 'Times New Roman'"
          :overlay="true"
        />

        <div v-if="textEnabled && textOverlayFlag"
          class="single-watermark overlay"
          :style="{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${(bankStore.settings.textWatermarkRotation ?? watermark.settings.textWatermarkRotation) || 0}deg)`,
            opacity: ((bankStore.settings.textWatermarkOpacity ?? watermark.settings.textWatermarkOpacity) || 0) / 100,
            color: bankStore.settings.textWatermarkColor ?? watermark.settings.textWatermarkColor,
            fontSize: `${(bankStore.settings.textWatermarkSize ?? watermark.settings.textWatermarkSize ?? 14) * 2}px`,
            fontWeight: 'bold',
            fontFamily: (bankStore.settings.textWatermarkFontFamily ?? watermark.settings.textWatermarkFontFamily) || 'Arial',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            zIndex: 100,
            mixBlendMode: 'normal'
          }">
          {{ bankStore.settings.textWatermarkText ?? watermark.settings.textWatermarkText }}
        </div>
      </div>

      <!-- 内容层 -->
      <div :style="{ position: 'relative', zIndex: 2 }">
        <!-- 银行Logo和头部 -->
        <div class="statement-header" :style="{ borderBottomColor: bankStore.settings.primaryColor }">
          <div class="header-content-wrapper">
            <!-- 左侧 Logo -->
            <div v-if="bankStore.settings.showLogo && bankStore.settings.logoUrl" class="bank-logo-container">
              <img :src="bankStore.settings.logoUrl" alt="Bank Logo" class="bank-logo-img" />
            </div>

            <!-- 中间 银行信息 -->
            <div class="bank-info-center">
              <h1 class="bank-title">{{ bankStore.cardInfo.bank }}</h1>
              <p class="statement-subtitle">{{ bankStore.settings.language === 'en' ? 'ACCOUNT STATEMENT' : '账户对账单' }}</p>
              <p v-if="bankStore.cardInfo.branch" class="branch-text">{{ bankStore.cardInfo.branch }}</p>
              <div class="bank-contact-text">
                <p v-if="bankStore.cardInfo.bankAddress">{{ bankStore.cardInfo.bankAddress }}</p>
                <p>
                  <span v-if="bankStore.cardInfo.bankPhone">{{ bankStore.cardInfo.bankPhone }}</span>
                  <span v-if="bankStore.cardInfo.bankPhone && bankStore.cardInfo.bankWebsite"> | </span>
                  <span v-if="bankStore.cardInfo.bankWebsite">{{ bankStore.cardInfo.bankWebsite }}</span>
                </p>
              </div>
            </div>

            <!-- 右侧 账单周期 -->
            <div class="statement-period-right">
              <div class="period-label">{{ bankStore.settings.language === 'en' ? 'Statement Period' : '账单周期' }}</div>
              <div class="period-value">{{ formatStatementPeriod() }}</div>
            </div>
          </div>
        </div>

        <!-- 卡片信息 -->
        <div class="card-info-section">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">{{ bankStore.settings.language === 'en' ? 'Card Holder' : '持卡人' }}</span>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img v-if="bankStore.cardInfo.cardHolderPhoto" :src="bankStore.cardInfo.cardHolderPhoto" alt="Photo" class="holder-photo" />
                <span class="info-value">{{ bankStore.cardInfo.cardHolder }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">{{ bankStore.settings.language === 'en' ? 'Card Number' : '卡号' }}</span>
              <span class="info-value">{{ bankStore.cardInfo.cardNumber }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">{{ bankStore.settings.language === 'en' ? 'Card Type' : '卡类型' }}</span>
              <span class="info-value">{{ formatCardType(bankStore.cardInfo.cardType) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ bankStore.settings.language === 'en' ? 'Expiry Date' : '有效期' }}</span>
              <span class="info-value">{{ bankStore.cardInfo.expiryDate }}</span>
            </div>
          </div>
          <div class="info-row" v-if="bankStore.cardInfo.accountType || bankStore.cardInfo.status">
            <div class="info-item" v-if="bankStore.cardInfo.accountType">
              <span class="info-label">{{ bankStore.settings.language === 'en' ? 'Account Type' : '账户类型' }}</span>
              <span class="info-value">{{ bankStore.cardInfo.accountType }}</span>
            </div>
            <div class="info-item" v-if="bankStore.cardInfo.status">
              <span class="info-label">{{ bankStore.settings.language === 'en' ? 'Status' : '状态' }}</span>
              <span class="info-value">{{ bankStore.cardInfo.status }}</span>
            </div>
          </div>
          <div class="info-row" v-if="bankStore.cardInfo.iban || bankStore.cardInfo.swift">
            <div class="info-item" v-if="bankStore.cardInfo.iban">
              <span class="info-label">IBAN</span>
              <span class="info-value">{{ bankStore.cardInfo.iban }}</span>
            </div>
            <div class="info-item" v-if="bankStore.cardInfo.swift">
              <span class="info-label">SWIFT/BIC</span>
              <span class="info-value">{{ bankStore.cardInfo.swift }}</span>
            </div>
          </div>
          <div class="info-item full-width">
            <span class="info-label">{{ bankStore.settings.language === 'en' ? 'Billing Address' : '账单地址' }}</span>
            <span class="info-value">{{ bankStore.cardInfo.billingAddress }}</span>
          </div>
        </div>

      <!-- 账单摘要 -->
      <div v-if="bankStore.settings.includeSummary" class="summary-section">
        <h2>{{ bankStore.settings.language === 'en' ? 'Account Summary' : '账户摘要' }}</h2>
        <div class="summary-grid">
          <div class="summary-item" v-if="bankStore.cardInfo.openingBalance !== undefined">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Opening Balance' : '期初余额' }}</div>
            <div class="summary-value">{{ formatCurrency(bankStore.cardInfo.openingBalance) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Total Payments' : '支付总额' }}</div>
            <div class="summary-value expense">
              <span class="amount-wrapper">-{{ formatCurrency(bankStore.totalSpent) }}</span>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Total Deposits' : '存款总额' }}</div>
            <div class="summary-value income">
              <span class="amount-wrapper">+{{ formatCurrency(bankStore.totalIncome) }}</span>
            </div>
          </div>
          <div class="summary-item" v-if="bankStore.cardInfo.interestEarned !== undefined">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Interest Earned' : '本期利息' }}</div>
            <div class="summary-value income">
              <span class="amount-wrapper">+{{ formatCurrency(bankStore.cardInfo.interestEarned) }}</span>
            </div>
            <div class="summary-sublabel" v-if="bankStore.cardInfo.interestYTD">YTD: {{ formatCurrency(bankStore.cardInfo.interestYTD) }}</div>
          </div>
          <div class="summary-item highlight" :style="{ background: `linear-gradient(135deg, ${bankStore.settings.primaryColor} 0%, ${bankStore.settings.secondaryColor} 100%)` }">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Closing Balance' : '期末余额' }}</div>
            <div class="summary-value">{{ formatCurrency(bankStore.calculatedClosingBalance) }}</div>
          </div>
          <div class="summary-item" v-if="bankStore.cardInfo.availableBalance !== undefined">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Available Balance' : '可用余额' }}</div>
            <div class="summary-value">{{ formatCurrency(bankStore.cardInfo.availableBalance) }}</div>
          </div>
        </div>

        <!-- 新增：月度统计信息 -->
        <div v-if="bankStore.settings.showMonthlyStatistics" class="monthly-stats">
          <h3>{{ bankStore.settings.language === 'en' ? 'Monthly Statistics' : '本月统计' }}</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-content">
                <div class="stat-label">{{ bankStore.settings.language === 'en' ? 'Total Transactions' : '交易笔数' }}</div>
                <div class="stat-value">{{ bankStore.transactionCount.total }}</div>
                <div class="stat-detail">
                  {{ bankStore.settings.language === 'en' ? 'Debits' : '支出' }}: {{ bankStore.transactionCount.debit }} | 
                  {{ bankStore.settings.language === 'en' ? 'Credits' : '收入' }}: {{ bankStore.transactionCount.credit }}
                </div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <div class="stat-label">{{ bankStore.settings.language === 'en' ? 'Avg Transaction' : '平均交易额' }}</div>
                <div class="stat-value">{{ formatCurrency(bankStore.averageTransaction.debit) }}</div>
                <div class="stat-detail">
                  {{ bankStore.settings.language === 'en' ? 'Per Debit' : '单笔支出' }}
                </div>
              </div>
            </div>
            <div class="stat-card" v-if="bankStore.totalFees > 0">
              <div class="stat-content">
                <div class="stat-label">{{ bankStore.settings.language === 'en' ? 'Total Fees' : '总手续费' }}</div>
                <div class="stat-value expense">{{ formatCurrency(bankStore.totalFees) }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <div class="stat-label">{{ bankStore.settings.language === 'en' ? 'Largest Purchase' : '最大支出' }}</div>
                <div class="stat-value" v-if="bankStore.largestTransactions.debit">
                  {{ formatCurrency(Math.abs(bankStore.largestTransactions.debit.amount)) }}
                </div>
                <div class="stat-detail" v-if="bankStore.largestTransactions.debit">
                  {{ bankStore.largestTransactions.debit.merchant }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表分析 -->
      <div v-if="bankStore.settings.showCharts" class="charts-section">
        <div class="chart-container">
          <h3>{{ bankStore.settings.language === 'en' ? 'Spending Analysis' : '支出分析' }}</h3>
          <div class="pie-chart-wrapper">
            <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg" viewBox="-1.1 -1.1 2.2 2.2" style="transform: rotate(-90deg)">
              <path v-for="(slice, index) in pieChartData" :key="index" :d="slice.path" :fill="slice.color" stroke="white" stroke-width="0.02" />
            </svg>
            <div class="chart-legend">
              <div v-for="(slice, index) in pieChartData" :key="index" class="legend-item">
                <span class="legend-color" :style="{ background: slice.color }"></span>
                <span class="legend-label">{{ translateCategory(slice.category) }} ({{ slice.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <h3>{{ bankStore.settings.language === 'en' ? 'Balance History' : '余额趋势' }}</h3>
          <div class="line-chart-wrapper">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="0" y1="0" x2="100" y2="0" stroke="#eee" stroke-width="0.5" />
              <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#eee" stroke-width="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="#eee" stroke-width="0.5" />
              <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#eee" stroke-width="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#eee" stroke-width="0.5" />
              
              <!-- Area under line -->
              <polygon :points="lineChartArea" :fill="bankStore.settings.primaryColor" opacity="0.1" />

              <!-- Line -->
              <polyline :points="lineChartPoints" fill="none" :stroke="bankStore.settings.primaryColor" stroke-width="1" vector-effect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 交易记录 -->
      <div class="transactions-section">
        <!-- 汇总视图 -->
        <template v-if="bankStore.settings.consolidatedDisplayMode === 'summary'">
          <h2>{{ bankStore.settings.language === 'en' ? 'Transaction Summary' : '交易汇总' }}</h2>
          <p class="summary-note">
            {{ bankStore.settings.language === 'en' 
              ? `Showing summary for ${sortedTransactions.length} transactions.` 
              : `共 ${sortedTransactions.length} 笔交易的汇总统计。` }}
          </p>

          <!-- 按月份汇总 -->
          <div class="monthly-summary">
            <h3>{{ bankStore.settings.language === 'en' ? 'Monthly Summary' : '月度汇总' }}</h3>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>{{ bankStore.settings.language === 'en' ? 'Month' : '月份' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Income' : '收入' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Expenses' : '支出' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Net' : '净额' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Transactions' : '笔数' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="month in monthlySummary" :key="month.month">
                  <td>{{ month.month }}</td>
                  <td class="text-right income">+{{ formatCurrency(month.income) }}</td>
                  <td class="text-right expense">-{{ formatCurrency(month.expenses) }}</td>
                  <td class="text-right" :class="month.net >= 0 ? 'income' : 'expense'">
                    {{ month.net >= 0 ? '+' : '' }}{{ formatCurrency(month.net) }}
                  </td>
                  <td class="text-right">{{ month.count }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 按类别汇总 -->
          <div class="category-summary">
            <h3>{{ bankStore.settings.language === 'en' ? 'Spending by Category' : '分类支出汇总' }}</h3>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>{{ bankStore.settings.language === 'en' ? 'Category' : '类别' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Amount' : '金额' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Count' : '笔数' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Avg' : '平均' }}</th>
                  <th>{{ bankStore.settings.language === 'en' ? 'Percentage' : '占比' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in categorySummary" :key="cat.category">
                  <td>
                    <span class="category-indicator" :style="{ backgroundColor: cat.color }"></span>
                    {{ translateCategory(cat.category) }}
                  </td>
                  <td class="text-right expense">-{{ formatCurrency(cat.amount) }}</td>
                  <td class="text-right">{{ cat.count }}</td>
                  <td class="text-right">{{ formatCurrency(cat.average) }}</td>
                  <td>
                    <div class="percentage-bar">
                      <div class="percentage-fill" :style="{ width: cat.percentage + '%', backgroundColor: cat.color }"></div>
                      <span class="percentage-text">{{ cat.percentage.toFixed(1) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- 明细视图 -->
        <template v-if="bankStore.settings.consolidatedDisplayMode === 'detail'">
          <h2>{{ bankStore.settings.language === 'en' ? 'Transaction Details' : '交易明细' }}</h2>
        
          <!-- 表格式布局 -->
          <table class="transactions-table-modern">
          <thead>
            <tr>
              <th class="th-date">{{ bankStore.settings.language === 'en' ? 'Date' : '日期' }}</th>
              <th class="th-code">{{ bankStore.settings.language === 'en' ? 'Code' : '代码' }}</th>
              <th class="th-merchant">{{ bankStore.settings.language === 'en' ? 'Merchant' : '商户' }}</th>
              <th class="th-category">{{ bankStore.settings.language === 'en' ? 'Category' : '类别' }}</th>
              <th class="th-amount">{{ bankStore.settings.language === 'en' ? 'Amount' : '金额' }}</th>
              <th class="th-status">{{ bankStore.settings.language === 'en' ? 'Status' : '状态' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in paginatedTransactions" :key="transaction.id" class="transaction-row-modern">
              <!-- 日期 -->
              <td class="td-date">
                {{ formatDate(transaction.date) }}
              </td>
              
              <!-- 代码 -->
              <td class="td-code">
                {{ transaction.code || 'POS' }}
              </td>
              
              <!-- 商户信息 -->
              <td class="td-merchant">
                <div class="merchant-main">{{ transaction.merchant }}</div>
                <div v-if="transaction.description" class="merchant-sub">{{ transaction.description }}</div>
                <div v-if="transaction.location" class="merchant-sub">{{ transaction.location }}</div>
                <div
                  v-if="(bankStore.viewMode === 'single' && (bankStore.cardInfo.cardType || transaction.cardNumber)) || (bankStore.viewMode !== 'single' && (transaction.cardType || transaction.cardNumber))"
                  class="merchant-sub"
                >
                  <span v-if="bankStore.viewMode === 'single' && bankStore.cardInfo.cardType">
                    {{ formatCardType(String(bankStore.cardInfo.cardType).toLowerCase()) }}
                  </span>
                  <span v-else-if="transaction.cardType">{{ transaction.cardType }}</span>
                  <span v-if="(bankStore.viewMode === 'single' && bankStore.cardInfo.cardType && transaction.cardNumber) || (bankStore.viewMode !== 'single' && transaction.cardType && transaction.cardNumber)">
                    -
                  </span>
                  <span v-if="transaction.cardNumber">{{ transaction.cardNumber }}</span>
                </div>
              </td>
              
              <!-- 类别 -->
              <td class="td-category">
                {{ translateCategory(transaction.category) }}
              </td>
              
              <!-- 金额 -->
              <td class="td-amount">
                <span :class="transaction.amount < 0 ? 'amount-negative' : 'amount-positive'">
                  {{ transaction.amount < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(transaction.amount)) }}
                </span>
              </td>
              
              <!-- 状态 -->
              <td class="td-status">
                <span class="status-badge-modern" :class="`status-${transaction.status}`">
                  {{ translateStatus(transaction.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- 分页控件（仅在非打印模式显示） -->
        <div v-if="!isPrintMode && totalPages > 1" class="pagination-controls">
          <div class="pagination-info">
            显示 {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, sortedTransactions.length) }} 条，共 {{ sortedTransactions.length }} 条交易记录
          </div>
          <div class="pagination-buttons">
            <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
              <span>上一页</span>
            </button>
            
            <div class="page-numbers">
              <template v-for="page in getPageNumbers()" :key="page">
                <button 
                  v-if="page > 0"
                  @click="goToPage(page)"
                  :class="['page-num', { active: currentPage === page }]"
                >
                  {{ page }}
                </button>
                <span v-else class="page-ellipsis">...</span>
              </template>
            </div>
            
            <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
              <span>下一页</span>
            </button>
          </div>
        </div>
        </template>

      </div>

      <!-- 银行公告 -->
      <div v-if="bankStore.settings.bankMessage" class="bank-message-section">
        <div class="message-content">
          {{ bankStore.settings.bankMessage }}
        </div>
      </div>

      <!-- 页脚 -->
      <div class="statement-footer">
        <div class="footer-content">
          <div class="footer-left">
            <p class="footer-text">
              {{ bankStore.settings.footerText }}
            </p>
            <p class="footer-contact">
              {{ bankStore.settings.footerContact }}
            </p>
          </div>
          
          <div class="footer-right">
            <!-- 条形码 -->
            <div v-if="bankStore.settings.showBarcode" class="barcode-section">
              <img v-if="bankStore.settings.barcodeSource === 'upload' && bankStore.settings.barcodeImage" 
                   :src="bankStore.settings.barcodeImage" 
                   class="custom-barcode-img" 
                   alt="Barcode" />
              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" ref="barcodeRef" class="barcode-svg" version="1.1"></svg>
                <span class="barcode-text">{{ bankStore.settings.barcodeContent || bankStore.cardInfo.cardNumber?.slice(-4) || '1234' }}</span>
              </template>
            </div>
            <!-- 二维码 -->
            <div v-if="bankStore.settings.showQR" class="qr-section">
              <img v-if="bankStore.settings.qrSource === 'upload' && bankStore.settings.qrImage" 
                   :src="bankStore.settings.qrImage" 
                   class="custom-qr-img" 
                   alt="QR Code" />
              <template v-else>
                <canvas ref="qrCanvas" width="80" height="80" class="qr-canvas"></canvas>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, defineExpose, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useBankStore } from '@/stores/bank'
import { useWatermarkStore } from '@/stores/watermark'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import FullScreenWatermark from '@/components/FullScreenWatermark.vue'
import DiagonalWatermark from '@/components/DiagonalWatermark.vue'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const bankStore = useBankStore()
const watermark = useWatermarkStore()

// 覆盖模式：当任一全局或组件专属覆盖开关开启时，视为覆盖（用于 z-index 控制）
const overlayActive = computed(() => {
  try {
    const wm = watermark && watermark.settings ? watermark.settings : {}
    const bs = bankStore && bankStore.settings ? bankStore.settings : {}
    return Boolean(
      // global overlay (keep generic/global overlay and other per-type global overlays)
      wm.watermarkOverlay || bs.watermarkOverlay ||
      // per-type overlays (do NOT include global diagonal overlay)
      wm.textWatermarkOverlay || wm.fullScreenWatermarkOverlay ||
      (bs as any).diagonalOverlay || (bs as any).textWatermarkOverlay || (bs as any).fullScreenWatermarkOverlay
    )
  } catch (e) { return false }
})

// 决定是否显示水印层：如果页面级显式设置为 false 则隐藏，
// 否则当任一水印类型启用时显示（更宽松，以兼容不同面板字段）
const showWatermarkLayer = computed(() => {
  try {
    const explicit = bankStore?.settings?.showWatermark
    if (explicit === false) return false
    return Boolean(anyEnabled.value)
  } catch (e) { return Boolean(anyEnabled.value) }
})

// 统一的启用检测：优先使用页面级设置（bankStore.settings），回退到全局 watermark.settings
const diagEnabled = computed(() => {
  try {
    const bs = bankStore?.settings || {}
    return Boolean(bs.diagonalWatermarkEnabled)
  } catch (e) { return false }
})

// 斜线水印参数
const diagWidth = computed(() => Number((bankStore?.settings as any)?.diagonalLineWidth ?? 20))
const diagSpacing = computed(() => Number((bankStore?.settings as any)?.diagonalLineSpacing ?? 40))
const diagColor = computed(() => String((bankStore?.settings as any)?.diagonalLineColor ?? '#000000'))
const diagOpacity = computed(() => Number((bankStore?.settings as any)?.diagonalLineOpacity ?? 5))
const diagRotation = computed(() => Number((bankStore?.settings as any)?.diagonalLineRotation ?? -30))

const diagKey = ref(0)
watch([diagEnabled, diagWidth, diagSpacing, diagColor, diagOpacity, diagRotation], () => {
  diagKey.value++
})

// Diagonal gradient/style handled by DiagonalWatermark component

const textEnabled = computed(() => {
  try {
    const bs = bankStore?.settings || {}
    const wm = watermark?.settings || {}
    return Boolean(bs.textWatermarkEnabled ?? wm.textWatermarkEnabled)
  } catch (e) { return false }
})

const fullEnabled = computed(() => {
  try {
    const bs = bankStore?.settings || {}
    const wm = watermark?.settings || {}
    // 接受多种兼容字段
    return Boolean(bs.fullScreenWatermarkEnabled ?? bs.fullScreenWatermark ?? wm.fullScreenWatermarkEnabled ?? wm.fullScreenWatermark)
  } catch (e) { return false }
})

const anyEnabled = computed(() => Boolean(diagEnabled.value || textEnabled.value || fullEnabled.value))

// Per-type overlay flags (prefer page-level bankStore.settings, then global watermark.settings)
const diagOverlayFlag = computed(() => {
  try {
    return Boolean((bankStore?.settings as any)?.diagonalOverlay ?? false)
  } catch (e) { return false }
})

const textOverlayFlag = computed(() => {
  try {
    return Boolean((bankStore?.settings as any)?.textWatermarkOverlay ?? watermark?.settings?.textWatermarkOverlay ?? watermark?.settings?.textOverlay)
  } catch (e) { return false }
})

const fullOverlayFlag = computed(() => {
  try {
    return Boolean((bankStore?.settings as any)?.fullScreenWatermarkOverlay ?? (bankStore?.settings as any)?.fullOverlay ?? watermark?.settings?.fullScreenWatermarkOverlay ?? watermark?.settings?.fullOverlay)
  } catch (e) { return false }
})

// 运行时用于调试的 z-index（如果 diagEnabled 为真，则强制为更高优先级帮助排查）
const watermarkZIndex = computed(() => ((diagOverlayFlag.value || textOverlayFlag.value || fullOverlayFlag.value) ? 50 : (diagEnabled.value ? 9999 : 1)))


// 条形码和二维码引用
const barcodeRef = ref<SVGElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
// 页面元素引用，用于测量实际渲染尺寸以计算水印布局
const statementRef = ref<HTMLElement | null>(null)
const measuredWidth = ref<number>(794)
const measuredHeight = ref<number>(1123)

// overlay teleport positioning
const overlayRect = ref({ top: 0, left: 0, width: 0, height: 0 })

function updateOverlayRect() {
  const el = statementRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  overlayRect.value = {
    top: r.top + window.scrollY,
    left: r.left + window.scrollX,
    width: r.width,
    height: r.height
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    if (statementRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measuredWidth.value = statementRef.value?.clientWidth || measuredWidth.value
        measuredHeight.value = statementRef.value?.clientHeight || measuredHeight.value
          updateOverlayRect()
      })
      resizeObserver.observe(statementRef.value)
      // 初始化一次
      measuredWidth.value = statementRef.value.clientWidth || measuredWidth.value
      measuredHeight.value = statementRef.value.clientHeight || measuredHeight.value
        updateOverlayRect()
    }
  })

  // 输出运行时调试信息，便于在浏览器控制台验证实际值
  nextTick(() => {
    try {
      console.debug('[Watermark Debug] diagEnabled=', diagEnabled.value, 'diagKey=', diagKey.value)
      console.debug('[Watermark Debug] diagParams=', { width: diagWidth.value, spacing: diagSpacing.value, color: diagColor.value, opacity: diagOpacity.value, rotation: diagRotation.value })
      console.debug('[Watermark Debug] showWatermarkLayer=', showWatermarkLayer.value, 'watermarkZIndex=', watermarkZIndex.value)
    } catch (e) { console.error('Watermark debug error', e) }
  })

  // keep overlay rect in sync on scroll/resize
  window.addEventListener('scroll', updateOverlayRect, { passive: true })
  window.addEventListener('resize', updateOverlayRect)
})

onBeforeUnmount(() => {
  if (resizeObserver && statementRef.value) resizeObserver.unobserve(statementRef.value)
  resizeObserver = null
  window.removeEventListener('scroll', updateOverlayRect)
  window.removeEventListener('resize', updateOverlayRect)
})

// 渲染条形码
const renderBarcode = () => {
  if (!bankStore.settings.showBarcode || bankStore.settings.barcodeSource === 'upload') return
  
  nextTick(() => {
    if (barcodeRef.value) {
      try {
        JsBarcode(barcodeRef.value, bankStore.settings.barcodeContent || bankStore.cardInfo.cardNumber?.slice(-4) || '1234', {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 0,
          background: "transparent",
          lineColor: "#000000"
        })
      } catch (e) {
        console.error('Barcode render error:', e)
      }
    }
  })
}

// 渲染二维码
const renderQRCode = () => {
  if (!bankStore.settings.showQR || bankStore.settings.qrSource === 'upload') return

  nextTick(() => {
    if (qrCanvas.value) {
      try {
        const content = bankStore.settings.qrContent || 
                       `Bank: ${bankStore.cardInfo.bank}\nAccount: ${bankStore.cardInfo.cardNumber}\nBalance: ${bankStore.calculatedClosingBalance}`
        
        QRCode.toCanvas(qrCanvas.value, content, {
          width: 80,
          margin: 0,
          color: {
            dark: '#000000',
            light: '#00000000'
          }
        }, (error) => {
          if (error) console.error('QR render error:', error)
        })
      } catch (e) {
        console.error('QR render error:', e)
      }
    }
  })
}

// 监听变化重新渲染
watch(() => [
  bankStore.settings.showBarcode,
  bankStore.settings.barcodeSource,
  bankStore.settings.barcodeContent,
  bankStore.cardInfo.cardNumber
], () => {
  renderBarcode()
})

watch(() => [
  bankStore.settings.showQR,
  bankStore.settings.qrSource,
  bankStore.settings.qrContent,
  bankStore.cardInfo.bank,
  bankStore.calculatedClosingBalance
], () => {
  renderQRCode()
})

onMounted(() => {
  renderBarcode()
  renderQRCode()
})


// 分页相关
const currentPage = ref(1)
const itemsPerPage = ref(20) // 每页显示20条交易
const isPrintMode = ref(false) // 下载模式标志

// 暴露方法给父组件
defineExpose({
  enablePrintMode: () => { isPrintMode.value = true },
  disablePrintMode: () => { isPrintMode.value = false }
})

// 匹配卡号（优先匹配后4位）
const matchesCurrentCard = (transactionCardNumber: string | undefined) => {
  // 在单个账户模式下，如果交易没有卡号信息，不显示它
  // 因为我们无法确定它属于哪个账户
  if (!transactionCardNumber) return false
  
  const currentCard = bankStore.cardInfo.cardNumber.replace(/[^\d]/g, '') // 移除所有非数字字符
  const transCard = transactionCardNumber.replace(/[^\d]/g, '')
  
  // 如果当前卡号没有数字，无法匹配
  if (!currentCard || currentCard.length === 0) return false
  
  // 如果完全匹配
  if (currentCard === transCard) return true
  
  // 优先匹配后4位
  const currentLast4 = currentCard.slice(-4)
  const transLast4 = transCard.slice(-4)
  
  if (currentLast4 && transLast4 && currentLast4 === transLast4) return true
  
  // 如果交易卡号只有后4位，也尝试匹配
  if (transCard.length === 4 && transCard === currentLast4) return true
  
  return false
}

const sortedTransactions = computed(() => {
  let transactions = [...bankStore.transactions]
  
  // 在单个账户视图下，只显示当前卡号的交易
  if (bankStore.viewMode === 'single') {
    transactions = transactions.filter(t => matchesCurrentCard(t.cardNumber))
  }
  
  return transactions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

// 按月份汇总
const monthlySummary = computed(() => {
  const monthMap = new Map<string, { income: number; expenses: number; count: number }>()
  
  sortedTransactions.value.forEach(t => {
    const date = new Date(t.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { income: 0, expenses: 0, count: 0 })
    }
    
    const data = monthMap.get(monthKey)!
    if (t.amount >= 0) {
      data.income += t.amount
    } else {
      data.expenses += Math.abs(t.amount)
    }
    data.count++
  })
  
  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
      count: data.count
    }))
    .sort((a, b) => b.month.localeCompare(a.month))
})

// 按类别汇总
const categorySummary = computed(() => {
  const catMap = new Map<string, { amount: number; count: number }>()
  let totalExpenses = 0
  
  sortedTransactions.value.forEach(t => {
    if (t.amount < 0) {
      const category = t.category || 'Other'
      if (!catMap.has(category)) {
        catMap.set(category, { amount: 0, count: 0 })
      }
      const data = catMap.get(category)!
      data.amount += Math.abs(t.amount)
      data.count++
      totalExpenses += Math.abs(t.amount)
    }
  })
  
  const colors = ['#667eea', '#28a745', '#fd7e14', '#17a2b8', '#6f42c1', '#e83e8c', '#20c997', '#ffc107']
  
  return Array.from(catMap.entries())
    .map(([category, data], index) => ({
      category,
      amount: data.amount,
      count: data.count,
      average: data.amount / data.count,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.amount - a.amount)
})

// 分页后的交易记录（用于预览）
const paginatedTransactions = computed(() => {
  // 如果是打印/下载模式，返回所有交易
  if (isPrintMode.value) {
    return sortedTransactions.value
  }
  
  // 计算分页
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedTransactions.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(sortedTransactions.value.length / itemsPerPage.value)
})

// 分页控制
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// 获取要显示的页码
const getPageNumbers = () => {
  const pages: number[] = []
  const maxVisible = 7 // 最多显示7个页码
  
  if (totalPages.value <= maxVisible) {
    // 如果总页数少于最大显示数，显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // 总是显示第一页
    pages.push(1)
    
    let start = Math.max(2, currentPage.value - 2)
    let end = Math.min(totalPages.value - 1, currentPage.value + 2)
    
    // 调整范围以保持5个中间页码
    if (currentPage.value <= 3) {
      end = Math.min(totalPages.value - 1, 6)
    } else if (currentPage.value >= totalPages.value - 2) {
      start = Math.max(2, totalPages.value - 5)
    }
    
    // 添加省略号
    if (start > 2) {
      pages.push(-1) // -1 表示省略号
    }
    
    // 添加中间页码
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    // 添加省略号
    if (end < totalPages.value - 1) {
      pages.push(-1)
    }
    
    // 总是显示最后一页
    pages.push(totalPages.value)
  }
  
  return pages
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const format = bankStore.settings.dateFormat
  
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = date.getFullYear()
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`
    default:
      return `${mm}/${dd}/${yyyy}`
  }
}

const formatCurrency = (amount: number, showSign: boolean = false) => {
  const currency = bankStore.cardInfo.currency
  const absAmount = Math.abs(amount)
  
  // 获取货币符号
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'HKD': 'HK$',
    'SGD': 'S$',
    'NZD': 'NZ$',
    'KRW': '₩',
    'INR': '₹',
    'RUB': '₽',
    'BRL': 'R$',
    'MXN': 'MX$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'THB': '฿',
    'MYR': 'RM',
    'IDR': 'Rp',
    'PHP': '₱',
    'VND': '₫',
    'AED': 'د.إ',
    'SAR': '﷼',
    'ZAR': 'R',
    'TRY': '₺',
    'TWD': 'NT$'
  }
  
  const symbol = currencySymbols[currency] || currency + ' '
  
  // 格式化数字（千位分隔符，保留2位小数）
  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  // 组合符号和数字（无空格）
  return `${symbol}${formattedNumber}`
}

// 格式化带符号的金额（用于收入/支出显示）
const formatSignedAmount = (amount: number) => {
  const formatted = formatCurrency(Math.abs(amount))
  if (amount < 0) {
    return `-${formatted}`
  } else if (amount > 0) {
    return `+${formatted}`
  }
  return formatted
}

const formatCardType = (type: string) => {
  const types: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    unionpay: '银联 UnionPay'
  }
  return types[type] || type
}

const formatStatementPeriod = () => {
  const { periodType, statementPeriod, customStartDate, customEndDate } = bankStore.settings
  
  if (periodType === 'monthly') {
    return formatPeriod(statementPeriod)
  } else if (periodType === 'yearly') {
    return statementPeriod
  } else {
    return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`
  }
}

const previewStyle = computed(() => {
  return {
    fontFamily: bankStore.settings.fontFamily,
    '--primary-color': bankStore.settings.primaryColor,
    '--secondary-color': bankStore.settings.secondaryColor,
    fontSize: `${bankStore.settings.fontSize}px`,
    lineHeight: bankStore.settings.lineHeight
  }
})


const formatPeriod = (period: string) => {
  if (!period) return ''
  const [year, month] = period.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  const monthName = date.toLocaleString('en-US', { month: 'long' })
  return `${monthName} ${year}`
}

const translateCategory = (category: string) => {
  if (bankStore.settings.language === 'zh') {
    const translations: Record<string, string> = {
      'Shopping': '购物',
      'Food & Dining': '餐饮',
      'Transportation': '交通',
      'Entertainment': '娱乐',
      'Travel': '旅行',
      'Utilities': '公用事业',
      'Other': '其他'
    }
    return translations[category] || category
  }
  return category
}

const translateStatus = (status: string) => {
  if (bankStore.settings.language === 'zh') {
    const translations: Record<string, string> = {
      'completed': '已完成',
      'pending': '处理中',
      'failed': '失败'
    }
    return translations[status] || status
  }
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// 新增：格式化交易类型
const formatTransactionType = (type: string) => {
  const types: Record<string, { en: string; zh: string }> = {
    'debit': { en: 'Debit', zh: '支出' },
    'credit': { en: 'Credit', zh: '收入' },
    'transfer': { en: 'Transfer', zh: '转账' },
    'fee': { en: 'Fee', zh: '费用' },
    'interest': { en: 'Interest', zh: '利息' },
    'refund': { en: 'Refund', zh: '退款' }
  }
  const lang = bankStore.settings.language
  return types[type]?.[lang] || type
}

// 新增：格式化渠道
const formatChannel = (channel: string) => {
  const channels: Record<string, { en: string; zh: string; icon: string }> = {
    'atm': { en: 'ATM', zh: 'ATM', icon: '🏧' },
    'pos': { en: 'POS', zh: 'POS机', icon: '💳' },
    'online': { en: 'Online', zh: '网上银行', icon: '💻' },
    'mobile': { en: 'Mobile', zh: '手机银行', icon: '📱' },
    'branch': { en: 'Branch', zh: '柜台', icon: '🏦' },
    'wire': { en: 'Wire', zh: '电汇', icon: '💸' }
  }
  const lang = bankStore.settings.language
  const ch = channels[channel]
  return ch ? `${ch.icon} ${ch[lang]}` : channel
}

// 新增：获取分类图标
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    'Income': '💰',
    'Housing': '🏠',
    'Auto & Transport': '🚗',
    'Shopping': '🛍️',
    'Food & Dining': '🍽️',
    'Travel': '✈️',
    'Groceries': '🛒',
    'Electronics': '📱',
    'Entertainment': '🎬',
    'Health & Fitness': '💪',
    'Personal Care': '💅',
    'Home & Garden': '🏡',
    'Services': '🔧',
    'Charity': '❤️',
    'Education': '📚',
    'Transportation': '🚌',
    'Utilities': '⚡',
    'Cash Withdrawal': '💵',
    'Interest': '📈',
    'Other': '📄'
  }
  return icons[category] || '📄'
}

// 新增：获取分类颜色
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Income': '#48c774',
    'Housing': '#8b5cf6',
    'Auto & Transport': '#4facfe',
    'Shopping': '#667eea',
    'Food & Dining': '#f093fb',
    'Travel': '#30cfd0',
    'Groceries': '#10b981',
    'Electronics': '#6366f1',
    'Entertainment': '#fa709a',
    'Health & Fitness': '#ef4444',
    'Personal Care': '#ec4899',
    'Home & Garden': '#84cc16',
    'Services': '#f59e0b',
    'Charity': '#dc2626',
    'Education': '#0891b2',
    'Transportation': '#3b82f6',
    'Utilities': '#a8edea',
    'Cash Withdrawal': '#ffdd57',
    'Interest': '#3273dc',
    'Other': '#b5b5b5'
  }
  return colors[category] || '#b5b5b5'
}

// 新增：按日期分组交易
const groupedTransactions = computed(() => {
  const grouped: Record<string, any[]> = {}
  sortedTransactions.value.forEach(t => {
    if (!grouped[t.date]) {
      grouped[t.date] = []
    }
    grouped[t.date].push(t)
  })
  return grouped
})

// Charts Logic
// 全屏水印计算
const watermarkCount = computed(() => {
  if (!bankStore.settings.fullScreenWatermark) return 0
  const containerWidth = measuredWidth.value || 794
  const containerHeight = measuredHeight.value || 1123
  const spacingX = bankStore.settings.watermarkSpacingX || 200
  const spacingY = bankStore.settings.watermarkSpacingY || 200
  const cols = Math.ceil(containerWidth / spacingX) + 2
  const rows = Math.ceil(containerHeight / spacingY) + 2
  return cols * rows
})

const watermarkPositions = computed(() => {
  if (!bankStore.settings.fullScreenWatermark) return []
  const positions: { x: number; y: number }[] = []
  const containerWidth = measuredWidth.value || 794
  const containerHeight = measuredHeight.value || 1123
  const spacingX = bankStore.settings.watermarkSpacingX || 200
  const spacingY = bankStore.settings.watermarkSpacingY || 200
  const cols = Math.ceil(containerWidth / spacingX) + 2
  const rows = Math.ceil(containerHeight / spacingY) + 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // center on grid but allow a small negative offset to avoid cropping
      positions.push({
        x: col * spacingX - Math.floor(spacingX / 2),
        y: row * spacingY - Math.floor(spacingY / 2)
      })
    }
  }

  return positions
})

const pieChartData = computed(() => {
  // 使用筛选后的交易（只显示当前账户的）
  const expenses = sortedTransactions.value.filter(t => t.amount < 0)
  const totalExpense = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0))
  
  if (totalExpense === 0) return []
  
  const byCategory = expenses.reduce((acc, t) => {
    const cat = t.category
    acc[cat] = (acc[cat] || 0) + Math.abs(t.amount)
    return acc
  }, {} as Record<string, number>)
  
  let cumulativePercent = 0
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF']
  
  return Object.entries(byCategory).map(([category, amount], index) => {
    const percent = amount / totalExpense
    
    // Handle 100% case
    if (percent >= 0.999) {
      return {
        category,
        amount,
        percentage: '100.0',
        color: colors[index % colors.length],
        path: 'M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z' // Full circle
      }
    }

    const startX = Math.cos(2 * Math.PI * cumulativePercent)
    const startY = Math.sin(2 * Math.PI * cumulativePercent)
    cumulativePercent += percent
    const endX = Math.cos(2 * Math.PI * cumulativePercent)
    const endY = Math.sin(2 * Math.PI * cumulativePercent)
    
    const largeArcFlag = percent > 0.5 ? 1 : 0
    
    const path = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
    
    return {
      category,
      amount,
      percentage: (percent * 100).toFixed(1),
      color: colors[index % colors.length],
      path
    }
  })
})

const lineChartData = computed(() => {
  // 使用筛选后的交易（只显示当前账户的）
  const transactions = [...sortedTransactions.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (transactions.length === 0) return []

  const { periodType, customStartDate, customEndDate } = bankStore.settings
  
  // Determine date range from transactions
  const firstDate = new Date(transactions[0].date)
  const lastDate = new Date(transactions[transactions.length - 1].date)
  
  let granularity = 'day'
  
  if (periodType === 'yearly') {
    granularity = 'month'
  } else if (periodType === 'monthly') {
    granularity = 'day'
  } else {
    // Custom logic
    const start = customStartDate ? new Date(customStartDate) : firstDate
    const end = customEndDate ? new Date(customEndDate) : lastDate
    
    if (start.getFullYear() !== end.getFullYear()) {
      granularity = 'year'
    } else if (start.getMonth() !== end.getMonth()) {
      granularity = 'month'
    } else {
      granularity = 'day'
    }
  }

  // Group transactions
  const getDateKey = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    if (granularity === 'year') return `${year}`
    if (granularity === 'month') return `${year}-${month}`
    return `${year}-${month}-${day}`
  }

  const grouped: Record<string, number> = {}
  transactions.forEach(t => {
    const key = getDateKey(new Date(t.date))
    grouped[key] = (grouped[key] || 0) + t.amount
  })

  // Generate continuous points
  const points: { date: string, balance: number }[] = []
  let currentBalance = bankStore.cardInfo.openingBalance || 0
  
  let iterDate = new Date(firstDate)
  let endDate = new Date(lastDate)

  // Align start/end to boundaries for cleaner charts
  if (granularity === 'year') {
    iterDate = new Date(iterDate.getFullYear(), 0, 1)
    endDate = new Date(endDate.getFullYear(), 11, 31)
  } else if (granularity === 'month') {
    iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth(), 1)
    endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)
  }

  // Safety limit
  let loops = 0
  const maxLoops = 366 * 10 

  while (loops < maxLoops) {
    const key = getDateKey(iterDate)
    
    if (grouped[key]) {
      currentBalance += grouped[key]
    }
    
    points.push({ date: key, balance: currentBalance })
    
    if (getDateKey(iterDate) === getDateKey(endDate)) break;
    if (iterDate > endDate) break;

    if (granularity === 'year') {
      iterDate.setFullYear(iterDate.getFullYear() + 1)
    } else if (granularity === 'month') {
      iterDate.setMonth(iterDate.getMonth() + 1)
    } else {
      iterDate.setDate(iterDate.getDate() + 1)
    }
    loops++
  }
  
  return points
})

const lineChartPoints = computed(() => {
  const data = lineChartData.value
  if (data.length < 2) return ''
  
  const balances = data.map(d => d.balance)
  const min = Math.min(...balances)
  const max = Math.max(...balances)
  // Add padding to range to avoid flat lines at top/bottom
  const padding = (max - min) * 0.1 || 100
  const range = (max - min) + 2 * padding
  const effectiveMin = min - padding
  
  return data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 50 - ((d.balance - effectiveMin) / range) * 50
    return `${x},${y}`
  }).join(' ')
})

const lineChartArea = computed(() => {
  const points = lineChartPoints.value
  if (!points) return ''
  return `0,50 ${points} 100,50`
})
</script>

<style scoped>
.bank-statement-preview {
  width: 210mm;
  min-height: 297mm;
  background: white;
  padding: 0;
  display: flex;
  justify-content: center;
  overflow: auto;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
}

.statement-page {
  width: 210mm;
  min-height: 297mm;
  background: white;
  padding: 20mm;
  box-shadow: none;
  position: relative;
  box-sizing: border-box;
}

.statement-page.has-border {
  /* Border styles are now handled inline in the template */
}

.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.single-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 80px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

.statement-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 3px solid var(--primary-color, #667eea);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.bank-logo-container {
  flex: 0 0 80px;
  margin-right: 20px;
}

.bank-logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 12px;
}

.holder-photo {
  max-width: 50px;
  max-height: 50px;
  border-radius: 50%;
  object-fit: contain;
}

.default-logo-box {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-info-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 5px;
}

.bank-title {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 5px 0;
  line-height: 1.2;
}

.statement-subtitle {
  font-size: 14px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px 0;
}

.branch-text {
  font-size: 14px;
  color: #212529;
  margin: 0 0 5px 0;
}

.bank-contact-text {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
}

.bank-contact-text p {
  margin: 0;
}

.statement-period-right {
  flex: 0 0 auto;
  text-align: right;
  padding-top: 10px;
}

.period-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.period-value {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
}

.bank-info h1 {
  margin: 0 0 5px 0;
  font-size: 28px;
  color: #212529;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.statement-period {
  text-align: right;
}

.period-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.period-value {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.card-info-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.full-width {
  margin-top: 5px;
}

.info-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #212529;
  font-weight: 600;
}

.summary-section {
  margin-bottom: 30px;
}

.summary-section h2 {
  font-size: 18px;
  color: #212529;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.summary-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.summary-item.highlight {
  background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%);
  color: white;
}

.summary-item.highlight .summary-label,
.summary-item.highlight .summary-value {
  color: white;
}

.summary-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #212529;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.summary-value .amount-wrapper {
  display: inline-block;
  white-space: nowrap;
}

.summary-value.expense {
  color: #dc3545;
}

.summary-value.income {
  color: #28a745;
}

.summary-sublabel {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  font-weight: 500;
}

.transactions-section {
  margin-bottom: 30px;
}

.transactions-section h2 {
  font-size: 18px;
  color: #212529;
  margin: 0 0 15px 0;
  font-weight: 700;
}

/* 汇总视图样式 */
.summary-note {
  text-align: center;
  color: #6c757d;
  font-size: 13px;
  margin-bottom: 24px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.monthly-summary,
.category-summary {
  margin-bottom: 24px;
}

.monthly-summary h3,
.category-summary h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #212529;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.summary-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.summary-table th.text-right {
  text-align: right;
}

.summary-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.summary-table td.text-right {
  text-align: right;
}

.summary-table .income {
  color: #28a745;
  white-space: nowrap;
}

.summary-table .expense {
  color: #dc3545;
  white-space: nowrap;
}

.category-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.percentage-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.percentage-fill {
  height: 8px;
  border-radius: 4px;
  min-width: 4px;
}

.percentage-text {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.transactions-table thead {
  background: #f8f9fa;
}

.transactions-table th {
  padding: 12px 10px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.transactions-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #e9ecef;
  color: #212529;
}

.transactions-table tbody tr:hover {
  background: #f8f9fa;
}

.text-right {
  text-align: right !important;
}

.merchant-info {
  display: flex;
  flex-direction: column;
}

.merchant-name {
  font-weight: 600;
}

.merchant-desc {
  font-size: 11px;
  color: #6c757d;
  margin-top: 2px;
}

.expense {
  color: #dc3545;
  font-weight: 600;
}

.income {
  color: #28a745;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.statement-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.footer-left {
  flex: 1;
  text-align: left;
}

.footer-right {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.barcode-section, .qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-barcode-img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.barcode-svg {
  height: 40px;
  width: auto;
}

.barcode-text {
  font-size: 10px;
  margin-top: 2px;
  font-family: 'Courier New', Courier, monospace;
}

.custom-qr-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.qr-canvas {
  width: 60px !important;
  height: 60px !important;
}

.footer-text {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 5px 0;
}

.footer-contact {
  font-size: 11px;
  color: #adb5bd;
  margin: 0;
}

/* Charts Styles */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  page-break-inside: avoid;
}

.chart-container h3 {
  font-size: 16px;
  color: #212529;
  margin: 0 0 15px 0;
  font-weight: 600;
  text-align: center;
}

.pie-chart-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
}

.pie-chart-wrapper svg {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #495057;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.line-chart-wrapper {
  height: 120px;
  width: 100%;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
  box-sizing: border-box;
}

.line-chart-wrapper svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.bank-contact-info {
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
}

.bank-contact-info p {
  margin: 2px 0;
}

.summary-sublabel {
  font-size: 10px;
  margin-top: 2px;
  opacity: 0.8;
}

.bank-message-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  color: #856404;
  font-size: 12px;
  line-height: 1.5;
}

.message-content {
  white-space: pre-wrap;
}

/* 新增：月度统计样式 */
.monthly-stats {
  margin-top: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
}

.monthly-stats h3 {
  font-size: 16px;
  color: #212529;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-content {
  width: 100%;
}

.stat-label {
  font-size: 11px;
  color: #6c757d;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  color: #212529;
  font-weight: 700;
  margin-bottom: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
}

.stat-value.expense {
  color: #dc3545;
}

.stat-value.income {
  color: #28a745;
}

.stat-detail {
  font-size: 10px;
  color: #adb5bd;
}

/* 新表格样式 - 完全按照图片设计 */
.transactions-table-modern {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
}

.transactions-table-modern thead {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.transactions-table-modern th {
  padding: 12px 16px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  text-transform: capitalize;
}

.transactions-table-modern th:nth-child(3),
.transactions-table-modern th:nth-child(4) {
  text-align: left;
}

.transactions-table-modern th:nth-child(5) {
  text-align: right;
}

.transactions-table-modern tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s ease;
}

.transactions-table-modern tbody tr:hover {
  background: #fafafa;
}

.transactions-table-modern tbody tr:last-child {
  border-bottom: none;
}

.transactions-table-modern td {
  padding: 12px 16px;
  font-size: 13px;
  color: #212529;
  vertical-align: top;
  text-align: center;
}

.transactions-table-modern td:nth-child(3),
.transactions-table-modern td:nth-child(4) {
  text-align: left;
}

.transactions-table-modern td:nth-child(5) {
  text-align: right;
}

.td-date {
  font-weight: 500;
  color: #495057;
}

.td-code {
  font-family: monospace;
  font-size: 11px;
  color: #6c757d;
}

.td-merchant {
  line-height: 1.5;
}

.merchant-main {
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.merchant-sub {
  font-size: 11px;
  color: #6c757d;
  margin-top: 2px;
}

.td-category {
  color: #495057;
}

.td-amount {
  font-weight: 600;
  text-align: right !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.amount-negative {
  color: #212529;
}

.amount-negative .amount-sign {
  color: #212529;
}

.amount-positive {
  color: #28a745;
}

.amount-positive .amount-sign {
  color: #28a745;
}

.amount-sign {
  display: inline;
  margin-right: 0;
}

.status-badge-modern {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge-modern.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-badge-modern.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge-modern.status-failed {
  background: #f8d7da;
  color: #721c24;
}

/* 分页控件样式 */
.pagination-controls {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.pagination-info {
  color: #495057;
  font-size: 14px;
  font-weight: 500;
}

.pagination-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-num {
  min-width: 40px;
  height: 40px;
  padding: 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-num:hover:not(.active) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.page-num.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  font-weight: 600;
}

.page-ellipsis {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 14px;
}

/* 打印时隐藏分页控件 */
@media print {
  .pagination-controls {
    display: none !important;
  }
}

/* ==================== 响应式预览尺寸 ==================== */

/* 手机尺寸 - 375px */
.bank-statement-preview.size-mobile {
  width: 375px;
  min-height: auto;
  font-size: 11px;
}

.size-mobile .statement-page {
  padding: 16px;
}

.size-mobile .statement-header {
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.size-mobile .header-content-wrapper {
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.size-mobile .bank-logo-container {
  justify-content: center;
}

.size-mobile .bank-logo-img {
  max-height: 40px;
}

.size-mobile .bank-info-center {
  text-align: center;
}

.size-mobile .bank-title {
  font-size: 18px;
}

.size-mobile .statement-subtitle {
  font-size: 12px;
}

.size-mobile .branch-text {
  font-size: 10px;
}

.size-mobile .bank-contact-text {
  font-size: 9px;
}

.size-mobile .statement-period-right {
  align-items: center;
}

.size-mobile .period-label {
  font-size: 10px;
}

.size-mobile .period-value {
  font-size: 12px;
}

.size-mobile .card-info-section {
  padding: 12px;
  margin: 12px 0;
}

.size-mobile .info-row {
  flex-direction: column;
  gap: 8px;
}

.size-mobile .info-item {
  flex: none;
  width: 100%;
}

.size-mobile .info-label {
  font-size: 10px;
}

.size-mobile .info-value {
  font-size: 12px;
}

.size-mobile .holder-photo {
  width: 32px;
  height: 32px;
}

.size-mobile .balance-section {
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.size-mobile .balance-item {
  text-align: center;
  padding: 8px;
}

.size-mobile .balance-label {
  font-size: 10px;
}

.size-mobile .balance-value {
  font-size: 16px;
}

/* 手机尺寸交易表格 - 卡片式布局 */
.size-mobile .transaction-table {
  display: block;
}

.size-mobile .transaction-table thead {
  display: none;
}

.size-mobile .transaction-table tbody {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.size-mobile .transaction-table tr {
  display: flex;
  flex-wrap: wrap;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  gap: 4px;
}

.size-mobile .transaction-table td {
  padding: 2px 4px;
  text-align: left !important;
  border: none;
  font-size: 11px;
}

.size-mobile .transaction-table td:nth-child(1) { /* 日期 */
  width: 100%;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
}

.size-mobile .transaction-table td:nth-child(2) { /* 描述 */
  width: 100%;
  font-size: 11px;
  color: #6b7280;
}

.size-mobile .transaction-table td:nth-child(3),
.size-mobile .transaction-table td:nth-child(4) { /* 金额/余额 */
  width: calc(50% - 4px);
  font-size: 13px;
  font-weight: 600;
}

.size-mobile .transaction-table .amount-positive {
  color: #16a34a;
}

.size-mobile .transaction-table .amount-negative {
  color: #dc2626;
}

.size-mobile .summary-section {
  flex-direction: column;
  gap: 12px;
}

.size-mobile .summary-card {
  padding: 12px;
}

.size-mobile .summary-card h4 {
  font-size: 12px;
}

.size-mobile .summary-value {
  font-size: 14px;
}

.size-mobile .statement-footer {
  padding-top: 12px;
}

.size-mobile .footer-text {
  font-size: 9px;
  text-align: center;
}

.size-mobile .pagination-controls {
  flex-direction: column;
  gap: 10px;
}

.size-mobile .pagination-info {
  font-size: 11px;
}

.size-mobile .page-btn {
  padding: 6px 12px;
  font-size: 12px;
}

.size-mobile .page-num {
  min-width: 32px;
  height: 32px;
  font-size: 12px;
}

/* 电脑尺寸 - 900px 横向布局 */
.bank-statement-preview.size-desktop {
  width: 900px;
  min-height: auto;
  font-size: 13px;
}

.size-desktop .statement-page {
  padding: 32px 40px;
}

.size-desktop .header-content-wrapper {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
}

.size-desktop .bank-logo-img {
  max-height: 60px;
}

.size-desktop .bank-title {
  font-size: 26px;
}

.size-desktop .statement-subtitle {
  font-size: 14px;
}

.size-desktop .card-info-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
}

.size-desktop .info-row {
  display: contents;
}

.size-desktop .info-item {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
}

.size-desktop .balance-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px;
}

.size-desktop .balance-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.size-desktop .balance-value {
  font-size: 24px;
}

.size-desktop .transaction-table th {
  padding: 14px 12px;
  font-size: 12px;
}

.size-desktop .transaction-table td {
  padding: 14px 12px;
  font-size: 13px;
}

.size-desktop .summary-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.size-desktop .summary-card {
  padding: 20px;
}

.size-desktop .summary-card h4 {
  font-size: 14px;
}

.size-desktop .summary-value {
  font-size: 20px;
}

/* 原尺寸 */
.bank-statement-preview.size-original {
  width: 210mm;
  min-height: 297mm;
}

/* iPhone尺寸 - 393px (iPhone 17 Pro) */
.bank-statement-preview.size-iphone {
  width: 393px;
  min-height: auto;
  font-size: 12px;
}

.size-iphone .statement-page {
  padding: 18px;
}

.size-iphone .statement-header {
  padding-bottom: 14px;
  margin-bottom: 14px;
}

.size-iphone .header-content-wrapper {
  flex-direction: column;
  gap: 14px;
  text-align: center;
}

.size-iphone .bank-logo-container {
  justify-content: center;
}

.size-iphone .bank-logo-img {
  max-height: 45px;
}

.size-iphone .bank-info-center {
  text-align: center;
}

.size-iphone .bank-title {
  font-size: 20px;
}

.size-iphone .statement-subtitle {
  font-size: 13px;
}

.size-iphone .branch-text {
  font-size: 11px;
}

.size-iphone .bank-contact-text {
  font-size: 10px;
}

.size-iphone .statement-period-right {
  text-align: center;
}

.size-iphone .card-info-section {
  padding: 14px;
}

.size-iphone .info-row {
  flex-direction: column;
  gap: 8px;
}

.size-iphone .info-item {
  min-width: 100%;
}

.size-iphone .info-label {
  font-size: 11px;
}

.size-iphone .info-value {
  font-size: 13px;
}

.size-iphone .balance-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 14px;
}

.size-iphone .balance-item {
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.size-iphone .balance-value {
  font-size: 16px;
}

.size-iphone .transaction-table th {
  padding: 10px 8px;
  font-size: 10px;
}

.size-iphone .transaction-table td {
  padding: 10px 8px;
  font-size: 11px;
}

.size-iphone .summary-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.size-iphone .summary-card {
  padding: 14px;
}

.size-iphone .summary-card h4 {
  font-size: 12px;
}

.size-iphone .summary-value {
  font-size: 16px;
}

/* 水印样式（与 AcademicReport 保持一致） */
.diagonal-watermark { pointer-events: none; position: absolute; inset: 0; }
.diagonal-overlay-teleport { pointer-events: none; }
.diagonal-overlay-teleport .diagonal-watermark { pointer-events: none; }
.overlay-bridge-teleport { pointer-events: none; will-change: transform; z-index: 2147483646 !important; }
.overlay-bridge-teleport .diagonal-watermark { pointer-events: none; }
</style>

