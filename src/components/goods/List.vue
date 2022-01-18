<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model.trim="queryInfo.query" clearable @clear="getGoodsList" @keyup.enter.native="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">
            添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodslist" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>

        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="105px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            <!-- 使用了main.js中自定义的全局过滤器dateFormat -->
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoods(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1, //显示的页码是哪一页
        pagesize: 10 //每页显示多少条数据
      },
      // 商品列表
      goodslist: [],
      // 总数据条数
      total: 0,
      // 控制删除按钮弹出框的显示与隐藏
      delVisible: false
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$axios.get('goods', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      // 弹出贾维斯消息通知
      const h = this.$createElement
      this.$notify({
        title: 'Jarvis?',
        message: h('i', { style: 'color: teal' }, 'At your service, sir!'),
        duration: 2000, //设置贾维斯通知的持续时间为2s
        offset: 70, //设置贾维斯通知的页面偏移
        showClose: false //隐藏关闭按钮
      })
      console.log(res.data)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听pagenum改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 点击删除按钮，删除对应商品
    async removeById(goods_id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$axios.delete(`goods/${goods_id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败！')
      }
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    // 点击添加商品按钮，跳转路由
    goAddpage() {
      this.$router.push('/goods/add')
    },
    // 点击编辑按钮，跳转路由
    editGoods(row) {
      // query传参本质是保存在url中，但是网址是字符串，里面无法保存对象，数组都不能保存，所以我们先把row这个对象转化为JSON对象(object是纯正的对象，JSON对象是以字符串形式存在的对象，字符串是可以保存在网址中的)
      this.$router.push({ name: 'edit', query: { row: JSON.stringify(row) } })
    }
  }
}
</script>

<style lang="less" scoped>
</style>