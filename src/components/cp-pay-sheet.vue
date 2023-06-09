<script setup lang="ts">
import { getConsultOrderPayUrl } from '@/api/consult'
import { showLoadingToast, showToast } from 'vant'
import { ref } from 'vue'

// show 控制显示隐藏（支持v-model:show）
// orderId 订单ID
// actualPayment 实付金额
// onClose 关闭前的函数
const { payCallback, orderId } = defineProps<{
  show: boolean //控制支付弹层显示
  orderId: string //支付需要使用的订单ID
  actualPayment?: number // 支付钱数
  onClose?: () => void // 支付窗口关闭控制
  payCallback?: string //支付回跳地址
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

const paymentMethod = ref<0 | 1>()
// 支付逻辑
const pay = async () => {
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  showLoadingToast({ message: '跳转支付', duration: 0 })
  const res = await getConsultOrderPayUrl({
    paymentMethod: paymentMethod.value,
    orderId: orderId,
    // payCallback: import.meta.env.VITE_APP_CALLBACK + props.payCallback,
    payCallback: payCallback || 'http://127.0.0.1:5173/room', //跳转到问诊室
  })
  // 跳转到支付宝平台支付 成功后 跳转到问诊室
  window.location.href = res.data.payUrl
}
</script>

<template>
  <!-- 这里需要emit修改show 因为show是父组件定义的 这里不能直接修改 不然违背了单项数据流 -->
  <van-action-sheet
    :show="show"
    @update:show="emit('update:show', $event)"
    title="选择支付方式"
    :close-on-popstate="false"
    :closeable="false"
    :before-close="onClose"
  >
    <div class="pay-type">
      <p class="amount">￥ {{ actualPayment.toFixed(2) }}</p>
      <van-cell-group>
        <van-cell title="微信支付" @click="paymentMethod = 0">
          <template #icon><cp-icon name="consult-wechat" /></template>
          <template #extra>
            <van-checkbox :checked="paymentMethod === 0" />
          </template>
        </van-cell>
        <van-cell title="支付宝支付" @click="paymentMethod = 1">
          <template #icon><cp-icon name="consult-alipay" /></template>
          <template #extra>
            <van-checkbox :checked="paymentMethod === 1" />
          </template>
        </van-cell>
      </van-cell-group>
      <div class="btn">
        <van-button @click="pay" type="primary" round block> 立即支付 </van-button>
      </div>
    </div>
  </van-action-sheet>
</template>

<style lang="scss" scoped>
.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .btn {
    padding: 15px;
  }
  .van-cell {
    align-items: center;
    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
