<template>
  <div id="viewerContainer"></div>
</template>

<script setup lang="ts">
import * as Cesium from "cesium";
import { Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { onMounted } from "vue";

import {CV} from '../3d/CV.js';


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
      console.log(lat_String, log_String, alti_String)
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
});


</script>

<style scoped></style>

