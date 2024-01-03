const express = require('express');
const mongoose = require('mongoose');
//允许跨域
const cors = require('cors');
//routes
const typhoonsRoutes = require('./routes/typhoons')
const typhoon_routes_Routes = require('./routes/typhoon_routes')
//端口号
const hostname = '127.0.0.1'; // 需要更改为您的本地 IP 地址
const port = 9993;
const databaseUrl='mongodb://localhost:27017/web_gis_service';
const app = express();

// 建立与 MongoDB 数据库的连接并处理连接错误
mongoose.connect(databaseUrl, { useNewUrlParser: true }).then(()=>console.log("连接成功")); // 数据库地址是本地的MongoDB 实例
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  console.log('connected to database');
});

// 分别使用内置中间件来解析 JSON 和 URL-encoded 形式的请求体
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 跨域
app.use(cors());

// 启用路由
app.use('/typhoons',typhoonsRoutes)
app.use('/typhoon_routes',typhoon_routes_Routes)


// 启动服务器
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});