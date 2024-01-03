<template>
<!-- 台风强度热力图进行绘制 -->
<div ref="heatmapRef" style="width: 500px; height: 500px;"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import data from "@/types/json/output2022.json";
import { ref, onMounted } from "vue";

const props = defineProps<{
typhoonName: string;
}>();

const heatmapRef = ref(null);

onMounted(() => {

const myEcharts = echarts.init(heatmapRef.value);
console.log(data);
const name = props.typhoonName;
//filterData我们可以通过切换英文名(Malakas,Megi,Chaba)的字段，来切换我们的台风数据,数据中纬度用x表示，经度用y表示
const filteredData = data.filter((item: { 英文名: string; }) => item.英文名 === name);
// console.log(filteredData);

const heatData = filteredData.map((item: { [x: string]: string; y: string; x: string; }) => [
parseFloat(item.y),
parseFloat(item.x),
parseInt(item["中心气压(百帕)"], 10),
]);
console.log(heatData);
const minP = Math.min(...heatData.map((item: any[]) => item[2]));
const maxP = Math.max(...heatData.map((item: any[]) => item[2]));
// console.log("最小中心气压:"+minP);
// console.log("最大中心气压:"+maxP);

// console.log(filteredData[0].英文名);

//绘制echarts图表
myEcharts.setOption({
title: {
    text: filteredData[0].英文名 + " 台风中心气压散点图", //这里实现动态展示台风名字
    left: "center",
    textStyle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white", // 设置标题字体颜色为白色
    },
},
visualMap: {
    //可视化控件部分
    min: minP,
    max: maxP,
    calculable: true,
    left: "center",
    bottom: "0%",
    orient: "horizontal", // 将 visualMap 设置为水平方向
},
xAxis: {
    type: "value",
    name: "经度",
    min: Math.min(...heatData.map((item: any[]) => item[0])),
    max: Math.max(...heatData.map((item: any[]) => item[0])),
    nameTextStyle: {
    color: "white", // 设置坐标轴名称字体颜色为白色
    },
    axisLabel: {
    color: "white", // 设置坐标轴字体颜色为白色
    },
},
yAxis: {
    type: "value",
    name: "纬度",
    min: Math.min(...heatData.map((item: any[]) => item[1])),
    max: Math.max(...heatData.map((item: any[]) => item[1])),
    nameTextStyle: {
    color: "white", // 设置坐标轴名称字体颜色为白色
    },
    axisLabel: {
    color: "white", // 设置坐标轴字体颜色为白色
    },
},
series: [
    {
    type: "scatter",
    symbolSize: 10, // 散点大小
    data: heatData,
    itemStyle: {
        color: "rgba(0, 0, 255, 0.7)", // 散点颜色，这里为蓝色
    },
    emphasis: {
        itemStyle: {
        color: "rgba(255, 0, 0, 1)", // 高亮时的颜色，这里为红色
        },
    },
    },
],
tooltip: {
    formatter: function (params: { dataIndex: any; value: any[]; }) {
    //获取当前数据的索引
    let dataIndex = params.dataIndex;
    return `经度: ${params.value[1]}<br>纬度: ${params.value[0]}<br>气压值: ${
        params.value[2]
    }<br>日期: ${filteredData[dataIndex].日期}<br>时间:${
        filteredData[dataIndex].时间
    }`;
    },
    trigger: "item",
},
});
});
</script>
