const publicRouter = {
    name: null,
    title: '实时发布',
    type: 'folder', // 类型: folder, tab, view
    icon: 'iconfont icon-tushuguanli',
    order: 1,
    inNav: true,
    children: [
      {
        title: '热修复管理',
        type: 'view',
        name: 'public',
        route: '/public/hotFix',   // 路由地址
        filePath: 'view/public/hotFix.vue',
        inNav: true,
        icon: 'iconfont icon-tushuguanli',
      },     
    ],
  }
   
  export default publicRouter