<template>
  <el-container class="home-container">
      <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapese ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单区域 -->
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapese" :collapse-transition="false" router :default-active="$route.path">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
              <!-- 一级菜单的模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>

              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" 
              :key="subItem.id">
                <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-s-unfold"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容主体Main -->
        <el-main>
          <!-- 路由占位符 -->
          <router-view/>
        </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
    return{
      // 左侧菜单数据
      menulist:[],
      iconsObj:{
        '125':'el-icon-orange',
        '103':'el-icon-takeaway-box',
        '101':'el-icon-s-goods',
        '102':'el-icon-s-order',
        '145':'el-icon-s-marketing'
      },
      // 是否折叠
      isCollapese: false
    }
  },
  // 在整个页面刚加载的时候,就应该立即获取左侧菜单,所以用到created()生命周期函数
  created(){
    this.getMenuList()
  },
  methods: {
    logout(){
      window.sessionStorage.clear()
      // 清空token
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList(){
      // 用get请求方式去请求menus路径,以获取菜单
      const {data: res} = await this.$axios.get('menus')
      // 如果登录失败,则把meta.msg里的错误消息显示出来
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 将获取到的菜单的数据保存到menulist中
      this.menulist = res.data
      console.log(res)
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse(){
      this.isCollapese = !this.isCollapese
    }
  },
}
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    // flex布局 左右贴边对齐
    justify-content: space-between;
    padding-left: 0;
    // item元素(即 按钮)水平居中
    align-items: center;
    color: #fff;
    font-size: 20px;
    // 选中el-header下的子代div
    > div {
      display: flex;
      // flex布局 纵向居中
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
}


.el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
}

.el-main {
    background-color: #eaedf1;
}

.toggle-button {
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer; //鼠标放上去变成小手
}
</style>
