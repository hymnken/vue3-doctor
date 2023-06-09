import { OrderType } from '@/enums'
import { cancelOrder, deleteOrder, followOrUnfollow, getPrescriptionPic } from '@/api/consult'
import { getMedicalOrderDetail } from '@/api/order'
import { sendMobileCode } from '@/api/user'
import type { ConsultOrderItem, FollowType } from '@/types/consult'
import type { OrderDetail } from '@/types/order'
import type { CodeType } from '@/types/user'
import { showFailToast, showImagePreview, showSuccessToast, type FormInstance, showToast } from 'vant'
import type { Ref } from 'vue'
import { onUnmounted } from 'vue'
import { ref, onMounted } from 'vue'

// Vue3概念：通过组合式API封装 数据逻辑 在一起的函数，组合式函数 useXxx
// composable
// 关注逻辑
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  // 执行回调函数
  const follow = async (item: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followOrUnfollow(item.id, type)
      item.likeFlag = item.likeFlag === 1 ? 0 : 1
      showSuccessToast(item.likeFlag === 1 ? '关注成功' : '取关成功')
    } finally {
      // 无论执行成功还是错误 finally都会执行
      loading.value = false
    }
  }
  return { loading, follow }
}

// 提供查看处方hooks
export const useShowPrescription = () => {
  const onShowPrescription = async (id?: string) => {
    // 排除undefined
    if (id) {
      const res = await getPrescriptionPic(id)
      // vant中实现图片预览组件
      showImagePreview([res.data.url])
    }
  }
  return { onShowPrescription }
}

// 取消订单  待支付 待接诊
export const useCancelOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = async (item: ConsultOrderItem) => {
    try {
      loading.value = true
      // 后台数据库取消
      await cancelOrder(item.id)
      // 局部刷新下 当前订单的状态 不需要重新刷新列表 局部刷新即可
      item.status = OrderType.ConsultCancel
      item.statusValue = '已取消'
      showSuccessToast('取消成功')
    } catch (error) {
      showFailToast('取消失败')
    } finally {
      loading.value = false
    }
  }
  return { loading, cancelConsultOrder }
}

// 删除订单  已完成 已取消
export const useDeleteOrder = (cb: () => void) => {
  const loading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem) => {
    try {
      loading.value = true
      await deleteOrder(item.id)
      showSuccessToast('删除成功')
      cb && cb()
    } catch (error) {
      showFailToast('删除失败')
    } finally {
      loading.value = false
    }
  }
  return { loading, deleteConsultOrder }
}

// 获取药品订单详情
export const useOrderDetail = (id: string) => {
  const order = ref<OrderDetail>()
  const loading = ref(false)
  onMounted(async () => {
    try {
      loading.value = true
      const res = await getMedicalOrderDetail(id)
      order.value = res.data
    } finally {
      loading.value = false
    }
  })
  return { loading, order }
}

// 发送短信验证码
export const useMobileCode = (mobile: Ref<string>, type: CodeType = 'login') => {
  const time = ref(0)
  const form = ref<FormInstance>()
  let timer: number
  const onSend = async () => {
    // 验证：倒计时 手机号
    if (time.value > 0) return
    await form.value?.validate('mobile')
    await sendMobileCode(mobile.value, type)
    showToast('发送成功')
    time.value = 60
    // 开启倒计时
    if (timer) clearInterval(timer)
    timer = window.setInterval(() => {
      time.value--
      if (time.value <= 0) clearInterval(timer)
    }, 1000)
  }

  onUnmounted(() => {
    clearInterval(timer)
  })

  return { onSend, time, form }
}
