
## 简介
这个是热修复包管理平台前端,支持热修复包的上传,发布,暂停,结束,浏览,同时也支持用户管理,注册等

##预览
![包管理](https://raw.githubusercontent.com/shijianmei/blog_Images/main/%E7%83%AD%E4%BF%AE%E5%A4%8D%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F/%E4%BF%AE%E5%A4%8D%E5%8C%85%E6%B5%8F%E8%A7%88.png)

![包上传](https://raw.githubusercontent.com/shijianmei/blog_Images/main/%E7%83%AD%E4%BF%AE%E5%A4%8D%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F/%E4%BF%AE%E5%A4%8D%E5%8C%85%E6%B7%BB%E5%8A%A0.png)


## 本地运行
1. 运行之前需要先启动 [热修复后端服务](https://github.com/shijianmei/hotfixServer)
2. 下载前端代码到本地
3. 安装依赖 `npm install or yarn`
4. 启动运行 `npm run serve`

## 部署
1. 先部署 [后台服务](https://github.com/shijianmei/hotfixServer) 到服务器 ,并启动
2. 然后配置前端代码域名:在.env.production下
    ```VUE_APP_BASE_URL = 'http://localhost:5000/'```
3. 部署前端代码到服务器
