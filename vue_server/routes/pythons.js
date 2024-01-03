const express = require("express");
const router = express.Router();
const { spawn } = require('child_process');

router.get('/', (req, res) => {
    console.log(req.body);
    
    // 调用Python脚本
    const pythonProcess = spawn('python', ['./python/getFile.py']);
    
    // 获得Python脚本的输出
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString('utf-8');
    });
    
    // 监听Python脚本结束事件
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`执行Python脚本时出错，退出码为: ${code}`);
      }
      
      console.log(`Python脚本的输出: ${output}`);
      res.send(`Python脚本的输出: ${output}`);
    });
    
    // 可选：监听Python脚本的错误输出
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python脚本错误输出：${data}`);
    });
  });

  module.exports = router;