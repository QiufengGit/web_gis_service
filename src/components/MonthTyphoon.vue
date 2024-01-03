<template>
    <div ref="month" style="height:500px;width: 500px;"></div>
</template>

<script>
import * as echarts from "echarts"
import data from "@/types/json/output2022.json"


export default {
    props: {
        typhoonName: {
            type: String,
            required: true
        }
    },
    mounted() {
        //对日期进行转换
        const newData = data.map(item => ({ ...item, 日期: new Date(item.日期) }));

        //通过循环，利用日期进行处理
        var monthlyTyphoonCount = []; //用于存储每个月台风的个数
        for (let month = 1; month <= 12; month++) {
            var filteredData = newData.filter(item => item.日期.getMonth() + 1 === month); // 过滤出当前月的数据
            var typhoonNames = new Set(filteredData.map(item => item.英文名));
            var count = typhoonNames.size;

            monthlyTyphoonCount.push({
                month: month,
                count: count,
                names: Array.from(typhoonNames)
            });
        }

        console.log(monthlyTyphoonCount);
        //将数据提取成单独的数组
        const monthdata = monthlyTyphoonCount.map(item => item.month);
        const numberdata = monthlyTyphoonCount.map(item => item.count);

        //绘制echarts图表，绘制柱状图
        let myEcharts = echarts.init(this.$refs.month);
        myEcharts.setOption({
            title: {
                text: "各月台风频次表",
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: 'white' // 设置标题字体颜色为白色
                }
            },
            xAxis: {
                type: 'category',
                data: monthdata,
                axisLabel: {
                    color: 'white' // 设置坐标轴字体颜色为白色
                }
            },
            yAxis: {
                type: 'value',
                name: '次数',
                nameTextStyle: {
                    color: 'white' // 设置坐标轴名称字体颜色为白色
                },
                axisLabel: {
                    color: 'white' // 设置坐标轴字体颜色为白色
                }
            },
            series: [
                {
                    name: '次数',
                    type: 'bar',
                    data: numberdata,

                }
            ],
            tooltip: {
                formatter: function (params) {
                    //获取当前数据的索引
                    let dataIndex = params.dataIndex;
                    return `月份:${monthdata[dataIndex]}<br>次数：${numberdata[dataIndex]}<br>台风：${monthlyTyphoonCount[dataIndex].names}`
                },
                trigger: "item"
            }
        });
    }
}
</script>