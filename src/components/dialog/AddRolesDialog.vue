<template>
  <div>
    <!-- $emit 实现子组件向父组件通信 -->
    <!-- 1、父组件可以使用 props 把数据传给子组件。
             2、子组件可以使用 $emit,让父组件监听到自定义事件 。 -->
    <!-- $emit('update:show', false)指的是对话框关闭时修改show的值为false
             并向父组件同步这个数据 -->
    <el-dialog title="添加角色" :visible.sync="DialogVisible" width="50%" @close="DialogClosed" :show="show">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <!-- 角色名称输入框 -->
        <!-- trim:不允许输入空格 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model.trim="addForm.roleName" @keyup.enter.native="addUser"></el-input>
        </el-form-item>
        <!-- 角色描述输入框 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model.trim="addForm.roleDesc" @keyup.enter.native="addUser"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="DialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 控制对话框的显示与隐藏
      DialogVisible: this.show,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      // 添加角色的表单验证规则对象
      addFormRules: {
        // 验证 角色名称 规则对象
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名的长度在3~10个字符之间',
            trigger: 'blur',
          },
        ],
        // 角色描述可以为空
        roleDesc: [{}],
      },
    }
  },
  // 子组件中props用于接收父组件传递来的数据
  // props接收到父组件的值是静态的
  // prop着重于数据的传递，并不能调用属性和方法
  props: {
    // 声明一个自定义属性show,父组件Roles.vue通过这个属性向子组件传递数据
    // 也就是父组件控制子组件这个对话框的显示与隐藏(show:true/false)
    show: {
      // 自定义函数show的默认属性
      type: Boolean,
      default: false,
    },
  },
  // watch的作用可以监控一个值的变换，并调用因为变化需要执行的方法。
  // 可以通过watch动态改变关联的状态。
  watch: {
    // 用watch监控show的变化
    // show的值变化后，调用show()把新的变化后的值赋给DialogVisible
    // 每次变化都会调用watch中的show()，对DialogVisible重新赋值
    show() {
      this.DialogVisible = this.show
    },
  },
  methods: {
    // 发起添加角色的请求
    addUser() {
      // valid返回True代表表单校验成功
      this.$refs.addFormRef.validate(async (valid) => {
        // 如果valid不为true 校验失败，不发送请求，直接return
        if (!valid) return
        const { data: res } = await this.$axios.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('角色添加失败！')
        }
        this.$message.success('角色添加成功！')
        this.DialogVisible = false
        // 子组件用$emit触发父组件事件(getRolesList)
        // 父组件监听到getRolesList事件，从而重新发起 获取所有角色的列表 的请求
        this.$emit('getRolesList')
      })
    },
    // 监听对话框关闭事件
    DialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.$emit('update:show', false)
    },
  },
}
</script>

<style lang="less" scoped>
</style>