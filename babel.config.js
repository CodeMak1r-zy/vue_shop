// 这是项目发布阶段需要用到的babel插件(P195)
// process.env.NODE_ENV拿到当前编译模式：开发阶段development,发布阶段production
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // (...)是展开运算符，把prodPlugins数组中的每一项展开，放到另一个数组(plugins)中
    // 发布产品时候的插件数组
    ...prodPlugins
  ]
}
