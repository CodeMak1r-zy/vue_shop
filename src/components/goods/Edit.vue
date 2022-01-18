<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="编辑商品信息" type="info" center show-icon :closable="false">
      </el-alert>

      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab页签区域 -->
      <el-form :model="goodsInfo" :rules="goodsInfoRules" ref="goodsInfoRef" label-width="100px" label-position="top">
        <el-tabs tab-position='left' v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称：" prop="goods_name">
              <el-input v-model.trim="goodsInfo.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格：" prop="goods_price">
              <el-input v-model="goodsInfo.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量：" prop="goods_weight">
              <el-input v-model="goodsInfo.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量：" prop="goods_number">
              <el-input v-model="goodsInfo.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类（不可修改，以分类ID展示）：" prop="goods_cat">
              <el-input v-model="goodsInfo.goods_cat" disabled></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border size="mini" :label="cb" v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 卡片视图 -->
            <el-card class="ImgCard">
              <!-- 提示区域 -->
              <el-alert title="商品已拥有图片" type="info" center :closable="false" class="alert">
              </el-alert>
              <!-- 走马灯 -->
              <el-carousel :interval="4000" type="card" height="200px">
                <el-carousel-item v-for="(item,i) in bigPics.pics" :key="i">
                  <!-- 图片容器 -->
                  <el-image style="width: 100%; height: 100%" :src="item.pics_big_url" fit="contain"></el-image>
                </el-carousel-item>
              </el-carousel>
            </el-card>
            <!-- 上传图片 -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary" class="upLoadBtn">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="goodsInfo.goods_introduce"></quill-editor>
            <!-- 确定提交编辑按钮 -->
            <el-button type="primary" class="btnUp" @click="edit">确定提交编辑</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>

  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 接收传给本组件的row参数
      goodsRow: {},
      // 绑定步骤条显示第几步
      activeIndex: '0',
      // 编辑商品数据列表对象
      goodsInfo: {},
      // 编辑商品的验证规则对象
      goodsInfoRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      // 商品分类ID数组
      goodsCat: [],
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 图片要上传的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      // 控制预览对话框的显示与隐藏
      previewVisible: false,
      // 图片的真实url地址
      previewPath: '',
      bigPics: {
        pics: []
      }
    }
  },
  created() {
    this.getRouteName()
  },
  mounted() {
    this.getInfoById()
  },
  methods: {
    // 获取当前路由名称,以及接收并处理List.vue组件传来的row对象属性
    getRouteName() {
      // 获取路由名称
      const name = this.$route.name
      console.log(name)
      // 获取商品列表传递过来的row参数,并赋值给res
      const res = this.$route.query.row
      // 对res使用 JSON.parse(取值时，把获取到的Json字符串转换回对象)
      const row = JSON.parse(res)
      this.goodsRow = row
      // console.log(this.goodsRow)
    },
    // 根据ID查询数据列表
    async getInfoById() {
      const { data: res } = await this.$axios.get(
        `goods/${this.goodsRow.goods_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败！')
      }
      this.goodsInfo = res.data
      // this.goodsInfo.pics.forEach((item) => {
      //   item.pic = ''
      // })
      console.log(this.goodsInfo)
    },
    // 切换页签之前的钩子函数
    beforeTabLeave(activeName, oldactiveName) {
      if (oldactiveName === '0' && this.goodsInfo.goods_name === '') {
        this.$message.error('请先填写商品名称！')
        return false
      }
    },
    // tab 被选中时触发这个函数
    async tabClicked() {
      // 对goods_cat预处理，转化为数组并赋值给goodsCat
      this.goodsCat = this.goodsInfo.goods_cat.split(',')
      // console.log(this.goodsCat)
      // 如果触发的是商品参数tab页签
      if (this.activeIndex === '1') {
        const { data: res } = await this.$axios.get(
          `categories/${this.goodsCat[2]}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败！')
        }
        this.$message.info('请注意，参数是商品所属分类的参数，不支持编辑修改！')
        // 将res.data下的attr_vals由字符串转化为数组，再将res.data赋给manyTableData
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$axios.get(
          `categories/${this.goodsCat[2]}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败！')
        }
        this.$message.info('请注意，属性是商品所属分类的属性，不支持编辑修改！')
        this.onlyTableData = res.data
      } else if (this.activeIndex === '3') {
        // this.bigPics.pics = this.goodsInfo.pics.pics_big_url
        // 事实证明，浅拷贝不行
        this.bigPics.pics = _.cloneDeep(this.goodsInfo.pics)
        console.log(this.bigPics)
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      // 1.获取要删除的图片的真实路径
      const filePath = file.response.data.url
      // 2.从pics数组中，找到这个图片对应的索引值
      const i = this.goodsInfo.pics.findIndex(
        (item) => item.pics_big_url === filePath
      )
      this.goodsInfo.pics.splice(i, 1)
      console.log(this.goodsInfo)
    },
    // 图片上传成功后触发的钩子函数
    handleSuccess(response) {
      // console.log(response)
      let picInfo = { pics_big_url: response.data.url }
      picInfo = JSON.parse(JSON.stringify(picInfo))
      this.bigPics.pics.push(picInfo)
      const temp_pic = { pic: response.data.tmp_path }
      // console.log(temp_pic)
      this.goodsInfo.pics.push(temp_pic)
      console.log(this.goodsInfo)
    },
    // 点击按钮确定提交编辑
    edit() {
      this.$refs.goodsInfoRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        this.goodsInfo.attrs = []
        // this.goodsInfo.pics = []
        // console.log(this.goodsInfo)
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.goodsInfo.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.goodsInfo.attrs.push(newInfo)
        })
        console.log(this.goodsInfo)
        const { data: res } = await this.$axios.put(
          `goods/${this.goodsInfo.goods_id}`,
          {
            goods_name: this.goodsInfo.goods_name,
            goods_price: this.goodsInfo.goods_price,
            goods_number: this.goodsInfo.goods_number,
            goods_weight: this.goodsInfo.goods_weight,
            goods_introduce: this.goodsInfo.goods_introduce,
            pics: this.goodsInfo.pics,
            attrs: this.goodsInfo.attrs,
            goods_cat: this.goodsInfo.goods_cat
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑商品失败！')
        }
        this.$message({
          type: 'success',
          message: '编辑商品成功！',
          showClose: true,
          duration: 0,
          center: true
        })
        this.$router.push('/goods')
      })
      // console.log(this.goodsInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 15px 0 0 !important;
}

.el-carousel {
  width: 800px;
}

.ImgCard {
  width: 850px;
}

.upLoadBtn {
  margin-top: 10px;
}

.alert {
  margin-bottom: 10px;
}

.previewImg {
  width: 100%;
}

.btnUp {
  margin-top: 10px;
}
</style>