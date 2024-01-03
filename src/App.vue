<template>
  <n-config-provider :theme="darkTheme">
    <n-global-style />
    <div class="full-container">
      <n-layout>

        <n-layout-header bordered class="header-container">
          <n-page-header>
            <n-space justify="space-between">
              <div>
                <span class='titlename'>
                  亚洲台风可视化及分析平台
                </span>

                <div class="button-group1">
                  <n-button size="small" class="btn1" type="primary" ghost @click="toggleToolbar">
                    风场
                  </n-button>

                  <n-dropdown trigger="hover" :options="options_taifeng" @select="handleTaifengSelect">
                    <n-button size="small" class="btn1">台风轨迹</n-button>
                  </n-dropdown>

                  <n-dropdown trigger="hover" :options="options_layers" @select="handleLayerSelect">
                    <n-button size="small" class="btn1">图层显示</n-button>
                  </n-dropdown>

                  <n-dropdown trigger="hover" :options="options_Ranging" @select="handleRanging">
                    <n-button size="small" class="btn1">测距</n-button>
                  </n-dropdown>


                </div>
              </div>

              <div class="button-group2">

                <n-button class="btn1" size="small" type="primary" ghost @click="useGoogleMap">
                  谷歌地图
                </n-button>

                <n-button class="btn1" size="small" type="primary" ghost @click="show_taifeng_data">
                  台风频次表
                </n-button>

                <n-dropdown trigger="hover" :options="options_name_table" @select="handletableSelect">
                  <n-button size="small" class="btn1">图表类型</n-button>
                </n-dropdown>

                <n-popselect v-model:value="current_taifeng" :options="options_name_taifeng" trigger="click" size="medium"
                  scrollable v-on:click="handlePopselectClick">
                  <n-button size="small" >台风：{{ current_taifeng || '请选择台风' }}</n-button>
                </n-popselect>
                <!-- <n-button class="btn1" type="primary" ghost @click="handleLocateChina">
                  定位中国
                </n-button> -->

              </div>
            </n-space>

          </n-page-header>
        </n-layout-header>

        <div id="canvasContainer">
          <canvas id="windycanvas" width="1500" height="700"></canvas>
        </div>


        <transition name="slide-fade">
          <div id="toolbar" class="param-container" v-show="showToolbar">
            <div class="param-item">
              <label>粒子数目: </label>
              <input type="range" id="particleNum" min="1000" max="30000" value="12000" step="1000" style="width: 170px">
            </div>
            <div class="param-item">
              <label>生命周期: </label>
              <input type="range" id="particleLife" min="50" max="200" value="100" step="10" style="width: 170px">
            </div>
            <div class="param-item">
              <label>粒子速度: </label>
              <input type="range" id="particleVelocityScale" min="500" max="20000" value="7000" step="500"
                style="width: 170px">
            </div>
            <div class="param-item">
              <label>每秒刷新率: </label>
              <input type="range" id="frameTime" min="5" max="20" value="10" step="1" style="width: 170px">
            </div>

            <div class="param-item">
              <label>线宽度: </label>
              <input type="range" id="lineWidth" min="1" max="7" value="2" step="1" style="width: 170px">
            </div>

            <div class="param-item">
              <button type="button" id="startField" class="button black">风场开关</button>
              <button type="button" id="changeFieldData" class="button black" style="margin-left: 49px;">数据切换</button>
              <select id="dataSelect" class="select">
                <option value="102">2024.01.02</option>
                <option value="1231">2023.12.31</option>
                <option value="1227">2023.12.27</option>
                <option value="1224">2023.12.24</option>
              </select>
            </div>
          </div>
        </transition>

        <transition name="fade" appear mode="out-in">
          <div v-if="isDialogOpen" class="heatmap-mask">
            <div class="heatmap-container">
              <component :is="current_table" v-model:typhoonName="current_taifeng" :key="current_taifeng" />
            </div>
            <n-button class="hide-button" type="primary" ghost @click="hideDialog">
              回退
            </n-button>
          </div>
        </transition>

        <transition name="fade" appear mode="out-in">
          <div v-if="show_taifeng_infa" class="heatmap-mask1">
            <div class="heatmap-container1">

              <n-scrollbar style="max-height: 100%; min-width: 450px;">
                <img src="./assets/img/infa.jpg" alt="Description" class="heatmap-image" /><br>

                <a href="http://jmm.ijournal.cn/html/2022/1/20220109.htm" class="tu_taifeng">台风“烟花”</a>

                <div class="heatmap-text">
                  <p>
                    强台风烟花（英文：Severe Typhoon In-Fa，国际编号：2106，联合台风警报中心：09W，菲律宾大气地球物理和天文管理局：Fabian
                    ）为2021年太平洋台风季第6个被命名的风暴。台风“烟花”寿命奇长，路径诡异复杂，移速缓慢、陆上滞留时间长、风雨强度大、影响范围广，与多系统同期活跃并相互影响，造成中国各地总计482万人受灾，直接经济损失132亿元
                    。其亦通过水汽输送间接参与影响了“7·20河南暴雨”灾情 。
                  </p>
                </div><br/>

              </n-scrollbar>
            </div>
          </div>
        </transition>

        <CesiumViewer ref="cesiumViewerRef" />


      </n-layout>

      <span class='lll' id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>
        经度： <span id="longitude"></span>° 纬度：<span id="latitude"></span>° 高度:<span id="altitude"></span>m
      </span>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import * as Cesium from "cesium";
import { darkTheme } from 'naive-ui';
import CesiumViewer from '@/components/CesiumViewer.vue';
import DLineChart from '@/components/DLineChart.vue';
import ScatterMap from '@/components/ScatterMap.vue';
import MonthTyphoon from '@/components/MonthTyphoon.vue';
import { ref } from 'vue'
import 'naive-ui';
import { taifengData_Malakas, taifengData_Chaba, taifengData_Nalgae, taifengData_Surigae, taifengData_Infa } from '@/types/data';
import axios from 'axios';
import * as $ from 'jquery';

const map = ref<string>('');
const cesiumViewerRef = ref();
const show_taifeng = ref<boolean>(false);

const showToolbar = ref<boolean>(false);
const isDialogOpen = ref(false);
const show_taifeng_infa = ref(false);

const current_taifeng = ref('Malakas');
let current_table = ref();

let handler: Cesium.ScreenSpaceEventHandler | null | undefined = null;
let positions: any[] = [];
let isDraw = false;
let StartPoint;
let text;
let temLine: Cesium.Entity | null | undefined = null;
let AllEntities: ArrayLike<any> = [];


const componentMap =
{
  '散点图': ScatterMap,
  '折线图': DLineChart,
};


const hideDialog = () => {
  isDialogOpen.value = false;
}


const options_Ranging = ref([
  {
    label: '开始测距',
    key: 'start'
  },
  {
    label: '清除测距',
    key: 'clear'
  },
]);


const handleRanging = (key: string) => {
  if (key == 'start') {
    isDraw = true;
    startMeasure();
  }
  else {
    handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    $.each(AllEntities,function (_index,value) 
    {
      window.CesiumViewer.entities.remove(value);
    });
    AllEntities = [];
    positions = [];
    StartPoint = 0;
    temLine = null;
    text = 0;
    handler = null;
  }
}


const startMeasure = () => {
  initializeCesium();
  if (handler == null) {
    handler = new Cesium.ScreenSpaceEventHandler(window.CesiumViewer.scene.canvas);
    handler.setInputAction(onLeftClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(cancelMeasure, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
};


const cancelMeasure = () => {
  isDraw = false;
}


const onLeftClick = (movement: { position: any; endPosition: Cesium.Cartesian2; }) => {

  if (isDraw) {
    var position1, cartographic;
    var ray = window.CesiumViewer.scene.camera.getPickRay(movement.position);
    if (ray) {
      position1 = window.CesiumViewer.scene.globe.pick(ray, window.CesiumViewer.scene);
    }
    if (position1) {
      cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
    }

    if (cartographic) {
      var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
      var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
      let contentString = '';
      contentString = contentString + 'x:' + lat + 'y:' + lon + '\n';

      var height = window.CesiumViewer.scene.globe.getHeight(cartographic);

      var point = Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, height);

      positions.push(point);

      if (positions.length === 1) {
        StartPoint = point;
        createPoint(point, undefined);
      }
      else if (positions.length > 1) {
        text = Number(getLineDis(positions[positions.length - 2], positions[positions.length - 1]));

        createPoint(point, text);

        createLine(positions, undefined);
      }
    }
  }
}


function getLineDis(startPoint: { x: number; y: number; }, endPoint: { x: number; y: number; }) {
  var x2 = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x);
  var y2 = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y);
  var dis = Math.sqrt(x2 + y2) / 1000;
  return dis.toFixed(2);
}


function createPoint(point: Cesium.Cartesian3, text: { toFixed: (arg0: number) => { (): any; new(): any; toString: { (): string; new(): any; }; }; } | undefined) {
  var labelText = text === undefined ? '起点' : text.toFixed(2).toString() + '公里';

  var drawPoint = window.CesiumViewer.entities.add({
    position: point,
    point:
    {
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      show: true,
      color: Cesium.Color.SKYBLUE,
      pixelSize: 3,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 3,
      clampToGround: true
    },
    label:
    {
      text: labelText,
      font: '24px monospace',
      color: Cesium.Color.RED,
      backgroundColor: Cesium.Color.CORAL,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 8,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(50, 0),
      clampToGround: true,
      disableDepthTestDistance:Number.POSITIVE_INFINITY
    }
  });
  AllEntities.push(drawPoint);
}


function createLine(polylinePath: any[], point: undefined) {
  var linePosition = point === undefined ? polylinePath : [polylinePath, point];
  var lineGlowPower = point === undefined ? .8 : .3;
  var lineWidth = point === undefined ? 6 : 8;
  var polyline = window.CesiumViewer.entities.add({
    polyline: {
      show: true,
      positions: linePosition,

      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: lineGlowPower,
        color: Cesium.Color.BLUE.withAlpha(.9)
      }),
      width: lineWidth,
      clampToGround: true
    }
  });
  temLine = point === undefined ? undefined : polyline;
  AllEntities.push(polyline);
}

const initializeCesium = () => {
  window.CesiumViewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};


const handlePopselectClick = () => {
  isDialogOpen.value = !isDialogOpen.value;
  isDialogOpen.value = !isDialogOpen.value;
};

const options_name_taifeng = ref([
  {
    label: "Malakas",
    value: "Malakas"
  },
  {
    label: "Megi",
    value: "Megi"
  },
  {
    label: "Chaba",
    value: "Chaba"
  },
  {
    label: "Aere",
    value: "Aere"
  },
  {
    label: "Songda",
    value: "Songda"
  },
  {
    label: "Trases",
    value: "Trases"
  },
  {
    label: "nameless",
    value: "nameless"
  },
  {
    label: "Mulan",
    value: "Mulan"
  },
  {
    label: "Meari",
    value: "Meari"
  },
  {
    label: "Ma",
    value: "Ma"
  },
  {
    label: "Tokage",
    value: "Tokage"
  },
  {
    label: "Hinnamnor",
    value: "Hinnamnor"
  },
  {
    label: "Muifa",
    value: "Muifa"
  },
  {
    label: "Merbok",
    value: "Merbok"
  },
  {
    label: "Nanmadol",
    value: "Nanmadol"
  },
  {
    label: "Talas",
    value: "Talas"
  },
  {
    label: "Noru",
    value: "Noru"
  },
  {
    label: "Kulap",
    value: "Kulap"
  },
  {
    label: "Roke",
    value: "Roke"
  },
  {
    label: "Sonca",
    value: "Sonca"
  },
  {
    label: "Nesat",
    value: "Nesat"
  },
  {
    label: "Haitang",
    value: "Haitang"
  },
  {
    label: "Nalgae",
    value: "Nalgae"
  },
  {
    label: "Banyan",
    value: "Banyan"
  },
  {
    label: "Yamaneko",
    value: "Yamaneko"
  },
  {
    label: "Pakhar",
    value: "Pakhar"
  },

]);


const options_name_table = ref([
  {
    label: '散点图',
    key: '散点图'
  },
  {
    label: '折线图',
    key: '折线图'
  },
]);


const options_layers = ref([
  {
    label: '降水7.19',
    key: 'https://www.ncei.noaa.gov/thredds/wms/cdr/persiann/2021/PERSIANN-CDR_v01r01_20210719_c20220415.nc?precipitation'
  },
  {
    label: '降水5.16',
    key: 'https://www.ncei.noaa.gov/thredds/wms/cdr/persiann/2021/PERSIANN-CDR_v01r01_20210516_c20211124.nc?precipitation'
  },
  {
    label: '温度307~723',
    key: 'https://www.ncei.noaa.gov/thredds/wms/cdr/sea-surface-temp-whoi/2021/SEAFLUX-OSB-CDR_V02R00_SST_D20210307_C20210723.nc?sea_surface_temperature'
  },
  {
    label: '清除图层',
    key: 'clear'
  }
]);


interface TyphoonData {
  [key: string]: any;
}

let taifeng_Malakas;
//更新
axios.get('http://127.0.0.1:9993/typhoon_routes/name/Malakas')
  .then(response => {
    taifeng_Malakas = response.data
    // m_WindField = JSON.stringify(dataWithoutId)
  })
  .catch(error => {
    console.error(error);
  });

const data: { [key: string]: TyphoonData } =
{
  'Malakas': taifengData_Malakas,
  'Chaba': taifengData_Chaba,
  'Nalgae': taifengData_Nalgae,
  'Surigae': taifengData_Surigae,
  'Infa': taifengData_Infa,
};


const options_taifeng = ref([
  {
    label: '显示Malakas台风轨迹',
    key: 'Malakas'
  },
  {
    label: '显示Chaba台风轨迹',
    key: 'Chaba'
  },
  {
    label: '显示Nalgae台风轨迹',
    key: 'Nalgae'
  },
  {
    label: '显示Surigae台风轨迹',
    key: 'Surigae'
  },
  {
    label: '显示Infa台风轨迹',
    key: 'Infa'
  },
  {
    label: '清除台风轨迹',
    key: 'clear'
  },
]);


const handleTaifengSelect = (key: string) => {
  if (key != 'clear') 
  {
    if(key == 'Infa')
    {
      show_taifeng_infa.value = true;
    }
    else
    {
      show_taifeng_infa.value = false;
    }
    if (show_taifeng.value == true) 
    {
      cesiumViewerRef.value.clearTaiFeng();
      cesiumViewerRef.value.initTaiFeng(data[key]);
    }
    else 
    {
      cesiumViewerRef.value.initTaiFeng(data[key]);
      show_taifeng.value = true;
    }

  }
  else 
  {
    if (show_taifeng.value == true) 
    {
      show_taifeng_infa.value = false;
      cesiumViewerRef.value.clearTaiFeng();
      show_taifeng.value = false;
    }

  }
};


const handletableSelect = (key: string) => {
  current_table = componentMap[key] || null;
  isDialogOpen.value = false;
  isDialogOpen.value = true;
};


const handleLocateChina = () => {
  window.CesiumViewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(104.06667, 35.0, 5000000.0),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: Cesium.Math.toRadians(0.0),
    },
  });
};


const useGoogleMap = () => {

  window.CesiumViewer.imageryLayers.removeAll();

  window.CesiumViewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 19,
    })
  );

  window.CesiumViewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 19,
    })
  );

  map.value = "GoogleMaps";
};

const useAmap = () => {

  window.CesiumViewer.imageryLayers.removeAll();

  window.CesiumViewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
    })
  );

  window.CesiumViewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: 'http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'
    })
  );

  map.value = "AMap";
};
const handleLayerSelect = (key: string) => {
  if (key != 'clear') {
    const split_url = key.split('?')
    addWMS(split_url[0], split_url[1]);
  }
  else {
    handleLayerClear();
  }

};


const handleLayerClear = () => {
  var layerCount = window.CesiumViewer.imageryLayers.length;
  if (layerCount > 1) {
    for (var i = layerCount - 1; i > 0; i--) {
      window.CesiumViewer.imageryLayers.remove(window.CesiumViewer.imageryLayers.get(i));
    }
  }
};


const addWMS = (url: string, name: string) => {

  var wmsParameters =
  {
    transparent: true,
    format: 'image/png'
  };

  var wmsProvider = new Cesium.WebMapServiceImageryProvider({
    url: url,
    layers: name,
    parameters: wmsParameters
  });

  window.CesiumViewer.imageryLayers.addImageryProvider(wmsProvider);
};


const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value;
};


const show_taifeng_data = () => {
  current_table = MonthTyphoon;
  isDialogOpen.value = false;
  isDialogOpen.value = true;
}
</script>


<style scoped>
.heatmap-image {
  max-width: 100%;
  max-height: 50vh;
  margin-top: 20px;
  margin-bottom: 30px;
  margin-left: 20px;
  margin-right: 0px;

}

.tu_taifeng{
  margin-left: 180px;
  margin-right: 0px;
}

.heatmap-text {
  color: #fff;
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 30px;
  margin-left: 20px;
  margin-right: 20px;

}

.heatmap-mask1 {
  position: fixed;
  right: 40px;
  top: 110px;
  transform: translateX(5%);
  background: rgba(0, 0, 0, 0.5) url("./img/images/bg_report.png") no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
  background-size: cover;
}

.heatmap-container1 {
  position: relative;
  z-index: 1001;
  max-width: 500px;
  width: 90%;
  height: 500px;
  overflow-y: auto;
  max-height: 520px;
  padding: 10px;
  /* Add padding to create a buffer space around the content */
}

.heatmap-mask {
  position: fixed;
  right: 40px;
  top: 110px;
  transform: translateX(5%);
  background: rgba(0, 0, 0, 0.5) url("./img/images/bg_report.png") no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  width: 500px;
  height: 520px;
  cursor: pointer;
  background-size: cover;
}

.heatmap-container {
  position: relative;
  z-index: 1001;
}

.hide-button {
  position: absolute;
  bottom: 20px;
  right: 10px;
  z-index: 1002;
}

.button-group1 {
  padding-top: 15px;
  margin-left: 50px;
}

.button-group2 {
  padding-top: 15px;
  margin-left: 10px;
}

.btn1 {
  margin-right: 10px;
}

.full-container {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header-container {
  height: 60px;
  padding: 0 3px;
  z-index: 2;
  background: rgba(12, 12, 43, 0.7) url("./img/images/bg_top.png") no-repeat;
  background-size: cover;
}

.titlename {
  font-size: 37px;
  text-align: center;
  font-family: STXinwei;
  color: #4eeeee;
  z-index: 3;
  position: absolute;
  left: 50%;
  top: 0px;
  transform: translateX(-50%);
  user-select: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

}

.lll {
  position: absolute;
  bottom: 0px;
  z-index: 1003;
}

.btn {
  position: absolute;
  top: 5px;
  left: 5px;
  padding: 2px;
}

#canvasContainer {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  position: absolute;
  left: 0;
  top: 60px;
  z-index: 2;
  pointer-events: none;
  display: block;
}

.param-container {
  position: absolute;
  left: 20px;
  top: 70px;
  z-index: 3;
  background: rgba(0, 0, 0, 0.4) url("./img/images/bg_report.png") no-repeat;
  background-size: contain;
  height: 250px;
  width: 300px;
  padding: 15px;
}

.param-item {
  margin-bottom: 15px;
}

.param-item label {
  display: inline-block;
  width: 80px;
}

.param-item button {
  margin-left: 50px;
  margin-top: 10px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 2s, transform 1s;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-120%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateX(120%);
}

.select {
  margin-left: 160px;
  height: 21px;
  font-size: 12px;
  padding: 2px;
}
</style>