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

import taifengImg from '@/assets/img/tf.png';

//风场数据
let windy;
let wind_params;
var wind_judge = 1;

//台风数据
const lineAllEntity: any[] = [];
const pineAll: any[] = [];
const pointAll: any[] = [];
let preUpdateHandler: ((event: any) => void) | null = null;
const selectAll: any[] = [];
let labelEntitleAll: any[] = [];


const removeLine = async () => {
  if (lineAllEntity && lineAllEntity.length > 0) {
    lineAllEntity.forEach((item) => {
      window.CesiumViewer.entities.remove(item);
    });
  }
  lineAllEntity.length = 0;
};


const removeLabelMehods = () => {
  if (labelEntitleAll && labelEntitleAll.length > 0) {
    labelEntitleAll.forEach((item) => {
      window.CesiumViewer.entities.remove(item);
    });
  }
  labelEntitleAll = [];
};


const typhoonFlytoPath = async (viewer: Viewer, positions: string | any[], typhoonName: string) => {

  viewer.clock.shouldAnimate = true;

  const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
  const stop = Cesium.JulianDate.addSeconds(start, positions.length, new Cesium.JulianDate());

  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();

  viewer.clock.multiplier = 5;

  const property = await computeFlight(start, positions);

  let rotation = Cesium.Math.toRadians(30);

  function getRotationValue() {
    rotation += -0.03;
    return rotation;
  }

  const typhoonEntity = viewer.entities.add({
    name: '台风路径',
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: start,
        stop: stop,
      }),
    ]),
    position: property,
    orientation: new Cesium.VelocityOrientationProperty(property),
    ellipse: {
      semiMinorAxis: 105000.0,
      semiMajorAxis: 105000.0,
      height: 100.0,
      fill: true,
      outlineWidth: 5,
      outline: false,
      rotation: new Cesium.CallbackProperty(getRotationValue, false),
      stRotation: new Cesium.CallbackProperty(getRotationValue, false),
      material: new Cesium.ImageMaterialProperty({
        image: taifengImg,
        transparent: true,
      }),
    },
    point: {
      pixelSize: 10,
      color: Cesium.Color.TRANSPARENT,
      outlineColor: Cesium.Color.TRANSPARENT,
      outlineWidth: 4,
    },
    label: {
      text: typhoonName,
      font: '18px sans-serif',
      pixelOffset: new Cesium.Cartesian2(0.0, 50),
    },
    path: {
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.9,
        color: Cesium.Color.YELLOW,
      }),
      width: 6,
    },
  });

  pineAll.push(typhoonEntity);
  // 设置飞行视角
  viewer.trackedEntity = undefined;
  viewer.flyTo(typhoonEntity, {
    duration: 2,
    offset: {
      height: 900000,
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-90),
      range: 2000000,
    },
  });
  const oldItem: string | any[] = [];
  let num = 0;


  preUpdateHandler = function () {
    if (typhoonEntity) {
      const center = typhoonEntity.position?.getValue(viewer.clock.currentTime);
      const hpr = new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0.0),
        Cesium.Math.toRadians(-90),
        2000000,
      );
      if (center) {

        const cartographic = Cesium.Cartographic.fromCartesian(center);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        selectAll.forEach((item) => {
          if (Number(item.x).toString() == lat.toFixed(1) && Number(item.y).toString() == lng.toFixed(1)) {
            if (oldItem.length > 0) {
              if (
                (oldItem[0] != Number(item.x) && oldItem[1] == Number(item.y)) ||
                (oldItem[0] == Number(item.x) && oldItem[1] != Number(item.y)) ||
                (oldItem[0] != Number(item.x) && oldItem[1] != Number(item.y))
              ) {
                oldItem[0] = Number(item.x);
                oldItem[1] = Number(item.y);

                if ((selectAll[selectAll.length - 1].x == oldItem[0]) && (selectAll[selectAll.length - 1].y == oldItem[1])) {
                  // 清除台风飞行飞行跟踪
                  if (preUpdateHandler) {
                    //viewer.scene.preUpdate.removeEventListener(preUpdateHandler);
                  }

                  setTimeout(() => {
                    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                    viewer.trackedEntity = undefined;
                  }, 500)
                }

                num++;
                if (num < pointAll.length) {
                  pointAll[num].label.text =
                    '风速' +
                    item['风速'] +
                    'm/s \n' +
                    item['日期'] +
                    ' ' +
                    item['时间'];
                }
              }
            } else {
              oldItem[0] = Number(item.x);
              oldItem[1] = Number(item.y);
              if (num < pointAll.length) {
                pointAll[num].label.text =
                  '风速' + item['风速'] + '\n ' + item['日期'] + ' ' + item['时间'];
              }
            }
          }
        });

        //viewer.camera.lookAt(center, hpr);
      }
    }
  };
  // 飞行跟踪
  viewer.scene.preUpdate.addEventListener(preUpdateHandler);

  typhoonEntity.position?.setInterpolationOptions({
    interpolationDegree: 3,
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
  });
};



const computeFlight = async (start: any, positions: string | any[]) => {
  const property = new Cesium.SampledPositionProperty();
  for (let i = 0; i < positions.length; i++) {
    const time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
    const position = Cesium.Cartesian3.fromDegrees(
      parseFloat(positions[i].fLongitude),
      parseFloat(positions[i].fLatitude),
      Cesium.Math.nextRandomNumber() * 500 + 1750,
    );
    property.addSample(time, position);
  }
  return property;
};


const initTaiFeng = async (taifengData: any) => {

  // drawLine(jingjiexian24, false, '24小时警戒线');
  // drawLine(jingjiexian48, true, '48小时警戒线');
  // addLabelMehods('24小时警戒线', [118.859085804271217, 18.184787653347598, 0]);
  // addLabelMehods('48小时警戒线', [131.945923047920701, 15.047864893994642, 0]);

  const data = [...taifengData].reverse();
  const typhoonName = '台风';
  const result = [];
  if (data.length > 0) {
    for (let p = data.length - 1; p >= 0; p--) {
      const d = {
        FID: data[p]['日期'] + ' ' + data[p]['时间'],
        serial: p + 1,
        fLongitude: Number(data[p].y),
        fLatitude: Number(data[p].x),
      };
      result.push(d);

      if (p % 10 == 0) {
        selectAll.push(data[p]);
        let color = null;
        const fs = parseFloat(data[p]['风速'].split('m')[0]);
        if (fs >= 15 && fs < 20) {
          color = new Cesium.Color(0, 0, 205 / 255);
        } else if (fs >= 20 && fs < 25) {
          color = new Cesium.Color(1, 1, 0);
        } else if (fs >= 25 && fs < 30) {
          color = new Cesium.Color(1, 165 / 255, 0);
        } else if (fs >= 30 && fs < 35) {
          color = new Cesium.Color(1, 140 / 255, 0);
        } else if (fs >= 35) {
          color = new Cesium.Color(1, 0, 0);
        }
        const entity = window.CesiumViewer.entities.add(
          new Cesium.Entity({
            id: data[p]['x'] + '-' + data[p]['y'] + '-' + p,
            point: new Cesium.PointGraphics({
              color: color,
              pixelSize: 20,
              outlineColor: new Cesium.Color(0, 1, 1),
            }),
            label: {
              text: '',
              font: '12px sans-serif',
              pixelOffset: new Cesium.Cartesian2(0, 50),
            },
            position: Cesium.Cartesian3.fromDegrees(Number(data[p].y), Number(data[p].x), 5000),
          }),
        );
        pointAll.push(entity);
      }
    }
    await typhoonFlytoPath(window.CesiumViewer, result, typhoonName);
  }
};


const clearTaiFeng = () => {
  if (pineAll.length > 0) {
    pineAll.forEach((item) => {
      window.CesiumViewer.entities.remove(item);
    });

  }
  if (pointAll.length > 0) {
    // 取消视角绑定
    window.CesiumViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    window.CesiumViewer.trackedEntity = undefined;
    pointAll.forEach((item) => {
      window.CesiumViewer.entities.remove(item);
    });
  }
  pineAll.length = 0;
  pointAll.length = 0;

  removeLine();

  removeLabelMehods();

  if (preUpdateHandler) {
    window.CesiumViewer.scene.preUpdate.removeEventListener(preUpdateHandler);
  }
}

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
    isdistory: false,
  };
  // @风场 调用
  // 使用 CesiumWindyApi.CesiumWindy()
  windy = new CesiumWindy(CesiumWindyData, wind_params);
  // windy._resize(window.innerWidth, window.innerHeight);

  //风场移动时停止
  handler.setInputAction(function (click) {
    click.value = true
    if (windy) {
      // windy.clearRect()
      var windycanvas = document.getElementById("windycanvas");
      windycanvas.style.display = "none";
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

  handler.setInputAction(function (click) {
    click.value = true
    if (windy) {
      if (wind_judge) {
        windy.start()
        windy.redraw()
        var windycanvas = document.getElementById("windycanvas");
        windycanvas.style.display = "block";
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_UP)

  //粒子数目
  var particleNumInput = document.getElementById("particleNum");
  if (particleNumInput) {
    particleNumInput.oninput = function (event) {
      // 获取当前输入值
      var particleNum = event.target.value;
      wind_params.particlesNumber = particleNum;
      windy.redraw_param(wind_params);
    }
  }

  //生命周期
  var particleLifeInput = document.getElementById("particleLife");
  if (particleLifeInput) {
    particleLifeInput.oninput = function (event) {
      // 获取当前输入值
      var particleLife = event.target.value;
      wind_params.maxAge = particleLife;
      windy.redraw_param(wind_params);
    }
  }

  //速度
  var particleVelocityScaleInput = document.getElementById("particleVelocityScale");
  if (particleVelocityScaleInput) {
    particleVelocityScaleInput.oninput = function (event) {
      // 获取当前输入值
      var particleVelocityScale = event.target.value;
      wind_params.speedRate = particleVelocityScale;
      windy.redraw_param(wind_params);
    }
  }
  //刷新率
  var frameTimeInput = document.getElementById("frameTime");
  // 检查输入范围元素是否存在，若存在则添加 oninput 事件处理函数
  if (frameTimeInput) {
    frameTimeInput.oninput = function (event) {
      // 获取当前输入值
      var frameTime = event.target.value;
      wind_params.frameTime = frameTime;
      windy.redraw_param(wind_params);
    }
  }
  //线宽
  var lineWidthInput = document.getElementById("lineWidth");
  if (lineWidthInput) {
    lineWidthInput.oninput = function (event) {
      // 获取当前输入值
      var lineWidth = event.target.value;
      wind_params.lineWidth = lineWidth;
      windy.redraw_param(wind_params);
    }
  }

  //@风场开关
  var startField = document.getElementById("startField");
  if (startField) {
    startField.onclick = function (event) {
      if (windy) {
        if (wind_judge) {
          windy.clearRect()
          var windycanvas = document.getElementById("windycanvas");
          windycanvas.style.display = "none";
        }
        else {
          windy.start()
          windy.redraw()
          var windycanvas = document.getElementById("windycanvas");
          windycanvas.style.display = "block";
        }
        // var windycanvas = document.getElementById("windycanvas");
        // windycanvas.style.display = "none";
      }
      wind_judge = (wind_judge + 1) % 2
    }
  }

});




defineExpose({
  initTaiFeng,
  clearTaiFeng
})


</script>

<style scoped></style>

