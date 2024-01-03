<template>
  <div ref="dlineRef" style="height: 500px; width: 500px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import data from "@/types/json/output2022.json";

const dlineRef = ref(null);

const props = defineProps<{
  typhoonName: string;
}>();

onMounted(() => {
    console.log( props.typhoonName);
  const name = props.typhoonName;
  const filteredData = data.filter((item: { 英文名: string; }) => item.英文名 === name);

  const days = Array.from(new Set(filteredData.map((item: { 日期: any; }) => item.日期)));
  const aveSpeedByDay = days.map((day) => {
    const dayData = filteredData.filter((item: { 日期: unknown; }) => item.日期 === day);
    const totalSpeed = dayData.reduce((sum: number, item: { 风速: string; }) => sum + parseFloat(item.风速), 0);
    const averageWindSpeed = totalSpeed / dayData.length;

    return {
      date: day,
      averageWindSpeed: averageWindSpeed.toFixed(2),
    };
  });

  const datas = aveSpeedByDay.map((item) => item.date);
  const windSpeeds = aveSpeedByDay.map((item) => item.averageWindSpeed);

  const dlineecharts = echarts.init(dlineRef.value);
  dlineecharts.setOption({
    title: {
      text: filteredData[0].英文名 + "每日平均风速随时间变化图",
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
      },
    },
    xAxis: {
      type: 'category',
      data: datas,
      axisLabel: {
        color: 'white',
      },
    },
    yAxis: {
      type: 'value',
      name: '风速(m/s)',
      nameTextStyle: {
        color: 'white',
      },
      axisLabel: {
        color: 'white',
      },
    },
    series: [
      {
        name: '风速',
        type: 'line',
        data: windSpeeds,
      },
    ],
    tooltip: {},
    animationDuration: 5000,
  });
});
</script>
