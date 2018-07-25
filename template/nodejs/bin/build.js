const isWindows = process.platform == 'win32';
const fs = require('fs');
const exec = (function () {
  const child_process = require('child_process');
  if (isWindows) {
    const iconv = require('iconv-lite');
    const encoding = 'cp936';
    const binaryEncoding = 'binary';
    const decode = function (input) {
      return iconv.decode(new Buffer(input, binaryEncoding), encoding);
    };
    return function (cmd) {
      return new Promise((resolve, reject) => {
        console.log('Executing: ', cmd);
        child_process.exec(cmd, {shell: true, encoding: binaryEncoding}, function (error, stdout, stderr) {
          if (error) {
            console.log(stderr);
            resolve(null);
            reject(decode(stderr));
          } else {
            console.log(stdout);
            resolve(decode(stdout));
          }
        })
      })
    };
  } else {
    return function (cmd) {
      return new Promise((resolve, reject) => {
        console.log('Executing: ', cmd);
        child_process.exec(cmd, {shell: true}, function (error, stdout, stderr) {
          if (error) {
            console.log(stderr);
            resolve(null);
            // reject(stderr);
          } else {
            console.log(stdout);
            resolve(stdout);
          }
        })
      })
    };
  }
})();

/**
 * 删除文件
 */
const deleteFiles = function () {
  const files = [...arguments];
  let file, subFiles;
  while (files.length > 0) {
    // 左一
    file = files[0];
    if (fs.existsSync(file)) {
      // 存在
      if (fs.statSync(file).isDirectory()) {
        // 目录
        subFiles = fs.readdirSync(file);
        if (subFiles.length > 0) {
          // 不为空
          subFiles.forEach(subFile => {
            // 左进
            files.unshift(file + '/' + subFile);
          });
        } else {
          // 为空
          // 左出
          files.shift();
          fs.rmdirSync(file);
        }
      } else {
        // 文件
        // 左出
        files.shift();
        fs.unlinkSync(file);
      }
    } else {
      // 不存在
      // 左出
      files.shift();
    }
  }
};

const copyFile = async function (src, target) {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, target, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
        console.log(`Copied '${src}' to '${target}'`);
      }
    });
  });
};

// 输出目录
const outputDir = './dist';
deleteFiles(outputDir);

// 构建并打包docker镜像
(async function () {
  const v_docker = await exec('docker -v');
  if (await exec('docker info')) {
    console.log('Detected docker ', v_docker, ' daemon process start building...');
  } else {
    throw new Error('No available docker daemon process detected!');
  }
  console.log('Deleting old image');
  await exec('docker stop proj-wx-server');
  await exec('docker rm proj-wx-server');
  await exec('docker rmi proj-wx-server');

  console.log('Building new image');
  const buildResult = await exec('docker build --rm -t proj-wx-server .');

  if (buildResult) {
    console.log('Packing new image');
    fs.mkdirSync(outputDir);
    fs.mkdirSync(outputDir + "/shared");
    fs.mkdirSync(outputDir + "/shared/logs");
    // await exec('docker save -o ./dist/proj-wx-server-%date:~0,4%%date:~5,2%%date:~8,2%%time:~0,2%%time:~3,2%%time:~6,2%.tar redis proj-wx-server');
    await exec('docker save -o ./dist/proj-wx-server.tar redis proj-wx-server');
    await copyFile('./model/config-production.json', './dist/shared/model-config.json');
    await copyFile('./build/start.sh', './dist/start.sh');
  }
})()
  .then(res => {
    console.log('Build success.');
  })
  .catch(err => {
    console.warn('Build fail: ', err);
  });
