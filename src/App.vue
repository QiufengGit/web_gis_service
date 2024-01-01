<template>
  <n-config-provider :theme="darkTheme">
    <n-global-style />
    <div class="full-container">
      <n-layout>

        <n-layout-header bordered class="header-container">
          <n-page-header>
            <template #extra>
              <n-space>
                <span class='titlename'>
                  亚洲台风可视化与分析系统
                </span>

                <!-- <n-dropdown trigger="hover" :options="options" @select="handleLayerSelect">
                  <n-button>选择图层</n-button>
                </n-dropdown>


                <n-button type="primary" ghost @click="handleLayerClear">
                  清除图层
                </n-button> -->


                <n-button type="primary" ghost @click="handleLocateChina">
                  定位中国
                </n-button>


                <n-button type="primary" ghost @click="handleLocateUSA">
                  定位美国
                </n-button>


                <n-button type="primary" ghost @click="useGoogleMap">
                  谷歌地图
                </n-button>


                <n-button type="primary" ghost @click="useAmap">
                  高德地图
                </n-button>


                <div class="theme-toggle-button">

                  <n-button circle>
                    <n-icon :component="DarkModeRound" />
                  </n-button>
                </div>
              </n-space>
            </template>
          </n-page-header>
        </n-layout-header>
        <CesiumViewer />
        <div id="canvasContainer">
          <canvas id="windycanvas" width="1500" height="700"></canvas>
        </div>

        <span class='lll' id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>
          经度： <span id="longitude"></span>° 纬度：<span id="latitude"></span>° 高度:<span id="altitude"></span>m
        </span>

        <div id="toolbar" class="param-container">
          <div class="param-item">
              <label>粒子大小: </label>
              <input type="range" id="particleSize" min="1" max="10" value="1.2" step="1" style="width: 170px">
          </div>
          <div class="param-item">
              <label>生命周期: </label>
              <input type="range" id="particleLife" min="1" max="20" value="5" step="1" style="width: 170px">
          </div>
          <div class="param-item">
              <label>粒子密度: </label>
              <input type="range" id="particleDensity" min="0.1" max="3" value="1" step="0.1" style="width: 170px">
          </div>
          <div class="param-item">
              <label>粒子速度: </label>
              <input type="range" id="particleVelocityScale" min="0.1" max="5" value="0.4" step="0.1" style="width: 170px">
          </div>
          <div class="param-item">
              <label>图层可见性 </label>
              <input type="checkbox" id="fieldLayerVisible" checked=true>
          </div>
          <div class="param-item">
              <label>场景泛光</label>
              <input type="checkbox" id="show" checked>
          </div>
          <div class="param-item">
              <label>亮度阈值: </label>
              <input type="range" id="threshold" min="0" max="1" value="0.5" step="0.1" style="width: 170px">
          </div>
          <div class="param-item">
              <label>泛光强度: </label>
              <input type="range" id="bloomIntensity" min="0" max="10" value="2" step="0.1" style="width: 170px">
          </div>
          <div class="param-item">
              <button type="button" id="startField" class="button black">启动风场</button>
              <button type="button" id="changeFieldData" class="button black" style="margin-left: 49px;">切换数据</button>
          </div>
      </div>


      </n-layout>
    </div>
  </n-config-provider>
</template>


<script setup lang="ts">
import * as Cesium from "cesium";
import { darkTheme } from 'naive-ui';
import { DarkModeRound } from '@vicons/material';
import CesiumViewer from '@/components/CesiumViewer.vue';
// import $ from 'jquery';
import { ref } from 'vue'
import 'naive-ui';

const map = ref<string>('');

const options = ref([
  {
    label: '美国降水反射率的数据图层',
    key: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?nexrad-n0r-900913-m50m'
  },
  {
    label: '美国干旱反射率的数据图层',
    key: 'https://edcintl.cr.usgs.gov/geoserver/quickdri_vegdri_conus_week_data/vegdri_conus_week_data/wms?vegdri_conus_week_data'
  },
  {
    label: '美国降水量的数据图层',
    key: 'https://edcintl.cr.usgs.gov/geoserver/quickdri_precip-tp-7_conus_day_data/precip-tp-7_conus_day_data/wms?precip-tp-7_conus_day_data'
  },
  {
    label: '美国水观察的数据图层',
    key: 'https://edcintl.cr.usgs.gov/geoserver/quickdri_water_watch_today/water_watch_today/wms?water_watch_today'
  },
  {
    label: '美国降水天数的数据图层',
    key: 'https://edcintl.cr.usgs.gov/geoserver/quickdri_precip-rd-30_conus_day_data/precip-rd-30_conus_day_data/wms?precip-rd-30_conus_day_data'
  },
  {
    label: '美国最大连续干旱天数的数据图层',
    key: 'https://edcintl.cr.usgs.gov/geoserver/quickdri_precip-cdd-30_conus_day_data/precip-cdd-30_conus_day_data/wms?precip-cdd-30_conus_day_data'
  },
  {
    label: '美国降水后天数的数据图层',
    key: 'https://edcintl.cr.usgs.gov/geoserver/quickdri_precip-dsr_conus_day_data/precip-dsr_conus_day_data/wms?precip-dsr_conus_day_data'
  }
]);

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

const handleLocateUSA = () => {
  window.CesiumViewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-100, 35.0, 5000000.0),
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
  const split_url = key.split('?')
  addWMS(split_url[0], split_url[1]);
};


const handleLayerClear = () => {
  window.CesiumViewer.imageryLayers.removeAll();
  if (map.value == "AMap") {
    useAmap();
  }
  else {
    useGoogleMap();
  }
};


// const addWFS = (url:string) => {

//   // 加载 WFS 数据
//   $.ajax({
//   url: url,
//   cache: false,
//   async: true,
//   success: function (data) 
//   {
//     const dataSource = Cesium.GeoJsonDataSource.load(data);
//     window.CesiumViewer.dataSources.add(dataSource);

//     const entities = dataSource.entities.values;

//     for (let i = 0; i < entities.length; i++) 
//     {
//       const entity = entities[i];
//       const polylineVolume = {
//         positions: entity.polyline._positions,
//         shape: computeCircle(50.0),
//         material: Cesium.Color.BLACK,
//       };
//       entity.polylineVolume = polylineVolume;
//       entity.polyline = null;
//     }
//   },
// });
// function computeCircle(_radius: number) {}
// };



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

// var windycanvas = document.getElementById("windycanvas");

// window.CesiumViewer.canvas.addEventListener('mousedown', function(event) {
//   // 鼠标按下时隐藏组件
//   windycanvas.style.display = "none";
// });

// window.CesiumViewer.canvas.addEventListener('mouseup', function(event) {
//   // 鼠标释放时显示组件
//   windycanvas.style.display = "block";
// });

// var canvas=document.getElementById('windycanvas');    
// canvas.width=canvas.clientWidth*window.devicePixelRatio;
// canvas.height=canvas.clientHeight*window.devicePixelRatio; 

</script>

<style scoped>
.full-container {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header-container {
  height: 60px;
  padding: 0 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;

  /* 使用 rgba() 函数设置背景颜色和透明度 */
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
  z-index: 3;
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
  /* 让canvas的z-index值更高 */
  pointer-events: none;
  display: block;
}

.param-container{
  position: absolute;
  left: 30px;
  top: 90px;
  z-index: 3;

    /* 使用 rgba() 函数设置背景颜色和透明度 */
  background: rgba(0, 0, 0, 0.4) url("./img/images/bg_report.png") no-repeat;
  background-size: contain;
}

</style>