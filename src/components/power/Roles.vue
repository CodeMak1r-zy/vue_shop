<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <!-- "show"指的是本组件中data中的show -->
          <!-- addRoles-dialog标签名字是根据Import addRolesDialog来的，用于声明组件-->
          <!-- :show.sync中show指的是绑定对话框的显示与隐藏
                        sync指的是父子组件的双向绑定 -->
          <!-- @getRolesList="getRolesList" 
                         在子组件里用$emit向父组件触发一个事件，父组件监听这个事件 -->
          <addRoles-dialog :show.sync="show" @getRolesList="getRolesList"></addRoles-dialog>
          <el-button type="primary" @click="showDialog">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- v-for="(item数组元素,index下标) in 数组" -->
            <!-- 行的内容是数组循环得出的，所以有很多行 -->
            <!-- 给每一行动态绑定class属性，:class="[]" -->
            <!-- 三元表达式i1(下标)是否等于0？也就是判断是否是第一项，第一项则需要加上bdtop，上边框 -->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <!-- 插值表达式渲染一级权限的名称 -->
                <!-- 每一行的第一列 -->
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 每一行的第二列 -->
                <!-- 通过 for 循环嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '':'bdtop' ,'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- pre 元素可定义预格式化的文本。
                            被包围在 pre 元素中的文本通常会保留空格和换行符。
                            而文本也会呈现为等宽字体。 -->
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName">
        </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑用户的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="35%" @close="editDialogClosed">
      <!-- 对话框内容:表单验证 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <!-- 角色ID -->
        <el-form-item label="角色ID">
          <el-input v-model="editForm.roleId" disabled></el-input>
        </el-form-item>
        <!-- 角色名称 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model.trim="editForm.roleName" @keyup.enter.native="editUserInfo"></el-input>
        </el-form-item>
        <!-- 角色描述 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model.trim="editForm.roleDesc" @keyup.enter.native="editUserInfo"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">
          取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">

      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">
          取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 导入子组件AddRolesDialog.vue
import addRolesDialog from '../dialog/AddRolesDialog.vue'
export default {
  data() {
    return {
      // 添加角色对话框默认隐藏
      show: false,
      // 所有角色列表数据
      roleList: [],
      // 控制 编辑对话框 的显示与隐藏
      editDialogVisible: false,
      // 根据ID查询到的角色信息对象
      editForm: {},
      // 编辑表单的验证规则对象
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名的长度在2~10个字符之间',
            trigger: 'blur'
          }
        ],
        // 角色描述可以为空
        roleDesc: [{}]
      },
      // 控制 分配权限对话框 的显示与隐藏
      setRightDialogVisible: false,
      // 获取到所有的权限数据
      rightsList: [],
      // 树形控件的属性绑定对象
      // 树形中的父子节点通过哪个属性进行嵌套
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 树形控件默认选中的节点ID值数组
      // 已经通过node-key绑定了ID值
      defKeys: [],
      // 当前即将分配权限的角色ID
      roleId: ''
    }
  },
  components: {
    // 注册子组件，注册后就可以通过标签<addRoles-dialog>来使用子组件了
    addRolesDialog
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      this.roleList = res.data
      console.log(this.roleList)
    },
    // 绑定点击 添加角色 事件
    showDialog() {
      this.show = true
    },
    // 点击编辑后，展示编辑角色的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$axios.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交编辑用户数据
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$axios.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('编辑角色信息失败！')
        }
        // 提示编辑成功
        this.$message.success('编辑角色信息成功！')
        // 编辑成功后关闭对话框
        this.editDialogVisible = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    // 根据ID删除对应的角色信息
    async removeUserById(id) {
      // 弹窗询问角色是否确定删除
      const confirmResult = await this.$confirm(
        'This operation will permanently delete the role. Do you want to continue?',
        'Warning',
        {
          confirmButtonText: 'determine',
          cancelButtonText: 'cancel',
          type: 'warning' //左侧感叹号小图标
          // 用.catch捕获取消操作
        }
      ).catch((err) => err)
      // 若用户确定删除，confirmResult返回字符串"confirm"
      // 若用户取消删除,confirmResult返回字符串"cancel"
      if (confirmResult !== 'confirm') {
        return this.$message.info('Deletion cancelled!')
      }
      const { data: res } = await this.$axios.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    // 根据ID删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限，是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning' //左侧感叹号小图标
          // 用.catch捕获取消操作
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }

      const { data: res } = await this.$axios.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }

      // this.getRolesList() 整个列表刷新，不利于体验
      // 把服务器返回的最新的权限，直接赋值给children属性
      // children变化了，整个v-for循环的数组就发生了变化，所以整个v-for遍历出的元素就发生了变化
      // 动态的让e-tag中的插值表达式发生变化，达到页面/列表不刷新，单独让标签消失的效果

      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 将角色的id保存在data.roleId中
      this.roleId = role.id
      // 获取所有权限的数据 获取树形结构(tree)的数据
      const { data: res } = await this.$axios.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }

      // 把获取到的权限数据保存到 data-rightsList 中
      this.rightsList = res.data

      // 递归获取三级节点的ID
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的ID,并保存到 defKeys 数组中
    // node(节点)来判断是不是三级权限节点，arr(数组)来保存
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 没有 return 说明不是三级节点，则需要递归
      // 获取当前节点的 children 循环里面的每一项(forEach)
      // 每循环一项，拿到一个子节点 item
      // 根据 item 再次调用函数 getLeafKsys()
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    // 监听 分配权限 对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        // 其中 ... 为展开运算符
        // 这样把两个数组合并成一个新数组
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      // 把拿到的keys(id)新数组以英文的逗号拼接成字符串
      const idStr = keys.join(',')

      const { data: res } = await this.$axios.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功！')

      this.getRolesList()

      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
  margin-left: 50px;
  margin-right: 50px;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>