import type { AddressItem, Logistics, OrderDetail, OrderPre } from '@/types/order'
import { request } from '@/utils/request'

// 查询药品预支付订单信息
export const getMedicalOrderPre = (params: { prescriptionId: string }) =>
  request<OrderPre>('patient/medicine/order/pre', 'GET', params)

// 获取收货地址列表
export const getAddresList = () => request<AddressItem[]>('patient/order/address')

// 创建药品订单
export const createMedicalOrder = (data: { id: string; addressId: string; couponId?: string }) =>
  request<{ id: string }>('patient/medicine/order', 'POST', data)

export const getMedicalOrderDetail = (id: string) => request<OrderDetail>(`patient/medicine/order/detail/${id}`)

export const getMedicalOrderLogistics = (id: string) => request<Logistics>(`patient/order/${id}/logistics`)
