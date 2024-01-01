<template>
  <div id="viewerContainer"></div>
</template>

<script setup lang="ts">
import * as Cesium from "cesium";
import { Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { onMounted } from "vue";
import "cesium-windy-canvas";

import CesiumWindyData from '../mock/cesiumwindy.data';
import CanvasParticle from '../windy/canvasparticle';
import CanvasWindField from '../windy/canvaswindfield';
import CesiumWindy from '../windy/cesiumwindy';
import WindyColor from '../windy/windyColor';

let windy;
let wind_params;

onMounted(() => {
  const viewer = new Viewer("viewerContainer",
    {
      animation: false,
      shouldAnimate: true,
      baseLayerPicker: true,
      fullscreenButton: true,
      vrButton: false,
      homeButton: true,
      selectionIndicator: true,
      infoBox: false,
      sceneModePicker: false,
      timeline: false,
      navigationHelpButton: true,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      useDefaultRenderLoop: true,
      showRenderLoopErrors: false,
      useBrowserRecommendedResolution: true,
      automaticallyTrackDataSourceClocks: true,
      orderIndependentTranslucency: true,
      shadows: false,
      projectionPicker: true,
      requestRenderMode: true,

      skyBox: new Cesium.SkyBox({//用于渲染星空的SkyBox对象
        sources: {
          positiveX: 'src/img/skybox/00h+00.jpg',
          negativeX: 'src/img/skybox/12h+00.jpg',
          positiveY: 'src/img/skybox/06h+00.jpg',
          negativeY: 'src/img/skybox/18h+00.jpg',
          positiveZ: 'src/img/skybox/06h+90.jpg',
          negativeZ: 'src/img/skybox/06h-90.jpg'
        }
      })

    });

  const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement;
  if (creditContainer) {
    creditContainer.style.display = "none";
  }

  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.enableLighting = true;

  window.CesiumViewer = viewer;

  //@经纬度展示
  var canvas = window.CesiumViewer.scene.canvas;
  //具体事件的实现
  var ellipsoid = window.CesiumViewer.scene.globe.ellipsoid;
  var handler = new Cesium.ScreenSpaceEventHandler(canvas);
  let that = this;
  handler.setInputAction(function (movement) {
    //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    var cartesian = window.CesiumViewer.camera.pickEllipsoid(
      movement.endPosition,
      ellipsoid
    );
    if (cartesian) {
      //将笛卡尔三维坐标转为地图坐标（弧度）
      var cartographic = window.CesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
        cartesian
      );
      //将地图坐标（弧度）转为十进制的度数
      var lat_String = Cesium.Math.toDegrees(cartographic.latitude).toFixed(
        4
      );
      var log_String = Cesium.Math.toDegrees(cartographic.longitude).toFixed(
        4
      );
      var alti_String = (
        window.CesiumViewer.camera.positionCartographic.height / 1000
      ).toFixed(2);
      // console.log(lat_String, log_String, alti_String)
      // that.longitude = log_String;
      // that.latitude = lat_String;
      // that.altitude = alti_String;
      document.getElementById('longitude').innerHTML = log_String;
      document.getElementById('latitude').innerHTML = lat_String;
      document.getElementById('altitude').innerHTML = alti_String;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // @天空盒
  //   window.CesiumViewer.scene.skyBox = new Cesium.SkyBox({//用于渲染星空的SkyBox对象
  //   sources: {
  // positiveX: 'src/img/skybox/3/tycho2t3_80_px.jpg',
  //       negativeX: 'src/img/skybox/3/tycho2t3_80_mx.jpg',
  //       positiveY: 'src/img/skybox/3/tycho2t3_80_py.jpg',
  //       negativeY: 'src/img/skybox/3/tycho2t3_80_my.jpg',
  //       positiveZ: 'src/img/skybox/3/tycho2t3_80_pz.jpg',
  //       negativeZ: 'src/img/skybox/3/tycho2t3_80_mz.jpg'
  //   }
  // })

  //@风场
  const windycanvas = document.getElementById('windycanvas')
  //风场参数
  wind_params = {
    viewer: viewer,
    canvas: windycanvas,

    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    speedRate: 7000, //速度 值越大 月满
    maxAge: 100, //周期
    particlesNumber: 12000,//数目
    frameTime: 10,//每秒刷新次数 越大越快
    lineWidth: 2,//线宽度
  };
  // 风场 调用
  // 使用 CesiumWindyApi.CesiumWindy()
  windy = new CesiumWindy(CesiumWindyData, wind_params);
  // windy._resize(window.innerWidth, window.innerHeight);


  handler.setInputAction(function (click) {
    click.value = true
    var windycanvas = document.getElementById("windycanvas");
    windycanvas.style.display = "none";
    console.log("click")
    // 具体的处理逻辑在这里
    // 可以根据需求修改clicked的值，或执行其他操作
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

  handler.setInputAction(function (click) {
    click.value = true
    var windycanvas = document.getElementById("windycanvas");
    windy.redraw();
    windycanvas.style.display = "block";
    console.log("click")
    // 具体的处理逻辑在这里
    // 可以根据需求修改clicked的值，或执行其他操作
  }, Cesium.ScreenSpaceEventType.LEFT_UP)
});

// //粒子大小控制
// $("#particleSize").on("input change", function () {
// });


</script>

<style scoped></style>

