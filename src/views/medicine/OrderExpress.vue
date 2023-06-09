<script setup lang="ts">
import { getMedicalOrderLogistics } from '@/api/order'
import type { Location, Logistics } from '@/types/order'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 高德地图
import AMapLoader from '@amap/amap-jsapi-loader'
import startImg from '@/assets/start.png'
import endImg from '@/assets/end.png'
import carImg from '@/assets/car.png'

const route = useRoute()
// 获取物流详情数据
const express = ref<Logistics>()
// 组件初始化的时候：加载高德地图需要的资源
onMounted(async () => {
  const res = await getMedicalOrderLogistics(route.params.id as string)
  express.value = res.data
  initMap()
})
// http://127.0.0.1:5173/medicine/express/6897245602689024
// v2.0 需要配置安全密钥jscode
window._AMapSecurityConfig = {
  securityJsCode: 'e52204c6c16eb7937769816e88c3a3ff',
}
const initMap = () => {
  AMapLoader.load({
    key: '44f5763073897cb6772265752e1da319',
    version: '2.0',
  }).then((AMap) => {
    // 初始化地图
    const map = new AMap.Map('map', {
      // 配置对象
      mapStyle: 'amap://styles/whitesmoke', // 地图样式风格
      zoom: 12, // 初始化地图层级  缩放级别
    })
    // 异步加载插件plugin //绘制物流轨迹
    AMap.plugin('AMap.Driving', function () {
      // var driving = new AMap.Driving({
      //   // 驾车路线规划策略，AMap.DrivingPolicy.LEAST_TIME是最快捷模式
      //   policy: AMap.DrivingPolicy.LEAST_TIME
      // })
      // var startLngLat = [116.379028, 39.865042]
      // var endLngLat = [116.427281, 39.903719]
      // driving.search(startLngLat, endLngLat, function (status, result) {
      //   // 未出错时，result即是对应的路线规划方案
      // })
      // 创建路线导航类
      const driving = new AMap.Driving({
        map, //指定哪个map
        showTraffic: false, // 关闭轨迹中的交通情况
        hideMarkers: true, // 关闭默认图标
      })
      //自定义坐标点的图标
      if (express.value?.logisticsInfo && express.value.logisticsInfo.length >= 2) {
        const list = [...express.value.logisticsInfo]
        // 创建标记函数
        const getMarker = (point: Location, image: string, width = 25, height = 30) => {
          const icon = new AMap.Icon({
            size: new AMap.Size(width, height),
            image,
            imageSize: new AMap.Size(width, height),
          })
          const marker = new AMap.Marker({
            position: [point?.longitude, point?.latitude],
            icon: icon,
            offset: new AMap.Pixel(-width / 2, -height),
          })
          return marker
        }
        // 轨迹起点
        const start = list.shift() // 取数组第一个 取出后 数组就剩其他了
        const startMarker = getMarker(start!, startImg)
        map.add(startMarker)
        // 轨迹终点
        const end = list.pop() // 取数组最后一个 取出后 数组就剩其他了
        const endMarker = getMarker(end!, endImg)
        map.add(endMarker)

        // 根据起点和终点经纬度规划驾车导航路线
        driving.search(
          [start?.longitude, start?.latitude],
          [end?.longitude, end?.latitude],
          // 轨迹途径点 二维数组  [[],[]]
          { waypoints: list.map((item) => [item.longitude, item.latitude]) },
          () => {
            // 规划完毕
            // 运输位置  当前的位置
            const curr = express.value?.currentLocationInfo
            const currMarker = getMarker(curr!, carImg, 33, 20)
            map.add(currMarker)
            // 3s后定位当中间进行缩放
            setTimeout(() => {
              map.setFitView([currMarker])
              map.setZoom(10)
            }, 3000)
          }
        )
      }
    })
  })
}
</script>

<template>
  <div class="order-logistics-page">
    <!-- 高德地图挂载渲染 -->
    <div id="map">
      <!-- 配送状态title -->
      <div class="title">
        <van-icon name="arrow-left" @click="$router.back()" />
        <span>{{ express?.statusValue }}</span>
        <van-icon name="service" />
      </div>
      <!-- 物流信息 -->
      <div class="current">
        <p class="status">订单{{ express?.statusValue }}中 预计{{ express?.estimatedTime }}送达</p>
        <p class="predict">
          <!-- 快递信息 -->
          <span>{{ express?.name }}</span>
          <span>{{ express?.awbNo }}</span>
        </p>
      </div>
    </div>
    <!-- 物流派送详细信息 时间轴形式 -->
    <div class="logistics">
      <p class="title">物流详情</p>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in express?.list" :key="item.id">
          <p class="status">{{ item.statusValue }}</p>
          <p class="content">
            {{ item.content }}
          </p>
          <p class="time">{{ item.createTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-logistics-page {
  --van-step-icon-size: 18px;
  --van-step-circle-size: 10px;
}
#map {
  height: 450px;
  background-color: var(--cp-bg);
  overflow: hidden;
  position: relative;
  .title {
    background-color: #fff;
    height: 46px;
    width: 355px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    font-size: 16px;
    position: absolute;
    left: 10px;
    top: 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    > span {
      flex: 1;
      text-align: center;
    }
    .van-icon {
      font-size: 18px;
      color: #666;
      &:last-child {
        color: var(--cp-primary);
      }
    }
  }
  .current {
    height: 80px;
    border-radius: 4px;
    background-color: #fff;
    height: 80px;
    width: 355px;
    box-sizing: border-box;
    padding: 15px;
    position: absolute;
    left: 10px;
    bottom: 10px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    .status {
      font-size: 15px;
      line-height: 26px;
    }
    .predict {
      color: var(--cp-tip);
      font-size: 13px;
      margin-top: 5px;
      > span {
        padding-right: 10px;
      }
    }
  }
}
.logistics {
  padding: 0 10px 20px;
  .title {
    font-size: 16px;
    padding: 15px 5px 5px;
  }
  .van-steps {
    :deep(.van-step) {
      &::after {
        display: none;
      }
    }
    .status {
      font-size: 15px;
      color: var(--cp-text3);
      margin-bottom: 4px;
    }
    .content {
      font-size: 13px;
      color: var(--cp-tip);
      margin-bottom: 4px;
    }
    .time {
      font-size: 13px;
      color: var(--cp-tag);
    }
  }
}
</style>
