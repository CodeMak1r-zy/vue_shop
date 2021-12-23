<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <!-- 使用element中Layout布局 -->
            <el-row :gutter="20">
              <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable 
                @keyup.enter.native="getUserList"
                @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search"
                    @click="getUserList"></el-button>
                </el-input>
              </el-col>
              <el-col :span="4">
                <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
              </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="userlist" border stripe>
                <!-- index为索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <!-- 定义一个作用域插槽,通过slot-scope接受了当前作用域的数据scope -->
                    <!-- 这里整个template为定义的作用域插槽，会覆盖当前列的prop -->
                    <template slot-scope="scope">
                      <!-- 当前本行的数据: scope.row -->
                      <!-- 开关 -->
                      <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                      </el-switch>
                    </template>
                </el-table-column>

                <el-table-column label="操作">
                    <template slot-scope="scope">
                      <!-- 修改按钮 -->
                      <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">
                        </el-button>
                      </el-tooltip>
                      
                      <!-- 删除按钮 -->
                      <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">
                        </el-button>
                      </el-tooltip>
                      
                      <!-- 分配角色按钮 -->
                      <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini" 
                        @click="setRole(scope.row)">
                        </el-button> 
                      </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户的对话框 -->
        <el-dialog title="添加用户" 
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
          <!-- 内容主体区域 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <!-- 用户名输入框 -->
            <!-- trim:不允许输入空格 -->
            <el-form-item label="用户名" prop="username">
              <el-input v-model.trim="addForm.username"></el-input>
            </el-form-item>
            <!-- 密码输入框 -->
             <el-form-item label="密码" prop="password">
              <el-input v-model.trim="addForm.password"></el-input>
            </el-form-item>
            <!-- 邮箱输入框 -->
             <el-form-item label="邮箱" prop="email">
              <el-input v-model.trim="addForm.email"></el-input>
            </el-form-item>
            <!-- 手机输入框 -->
             <el-form-item label="手机" prop="mobile">
              <el-input v-model.trim="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 对话框底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <!-- 对话框内容:表单验证 -->
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <!-- 用户名 -->
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <!-- 邮箱 -->
            <el-form-item label="邮箱" prop="email">
              <el-input v-model.trim="editForm.email" 
              @keyup.enter.native="editUserInfo"></el-input>
            </el-form-item>
            <!-- 手机号 -->
            <el-form-item label="手机" prop="mobile">
              <el-input v-model.trim="editForm.mobile"
              @keyup.enter.native="editUserInfo"></el-input>
            </el-form-item>
          </el-form>
          <!-- 对话框底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">
            取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%"
         @close="setRoleDialogClosed">
          <div>
            <p>当前的用户：{{userInfo.username}}</p>
            <p>当前的角色：{{userInfo.role_name}}</p>
            <p>分配新角色：
              <el-select v-model="selectedRoleId" placeholder="请选择">
                <el-option v-for="item in rolesList" :key="item.id"
                :label="item.roleName" :value="item.id">
                </el-option>
              </el-select>
            </p>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="setRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
          </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        // 验证邮箱的规则
        // 在data数据中,return外，定义了变量,变量是这个箭头函数
        // 这个箭头函数就是一个自定义校验规则
        // 箭头函数的形参中,包含了三个参数
        // rule:验证规则  value:需要验证的字段  callback:回调函数(cb)
        // 验证通过,直接调用cb回调函数,代表验证通过
        // 验证失败,调用callback的同时提供一个Error错误信息
        var checkEmail = (rule, value, cb) => {
            // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(regEmail.test(value)) {
                // 合法邮箱
                return cb()
            }
            cb(new Error('请输入合法的邮箱！'))
        }
        // 验证手机号的规则
        var checkMobile = (rule, value, cb) => {
            // 验证手机号的正则表达式
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if(regMobile.test(value)) {
                // 合法手机号
                return cb()
            }
            cb(new Error('请输入合法的手机号！'))
        }
        return{
            // 获取用户列表的参数对象(获取用户列表时向服务器传递的参数对象)
            queryInfo:{
                query: '',   // 查询参数
                pagenum: 1,  // 当前的页数
                pagesize: 2  // 当前每页显示多少条数据
            },
            userlist: [],
            total: 0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加表单的验证规则对象
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur'},
                    { min: 3,
                      max: 10,
                      message: '用户名的长度在3~10个字符之间',
                      trigger: 'blur'}
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur'},
                    { min: 6,
                      max: 15,
                      message: '用户名的长度在6~15个字符之间',
                      trigger: 'blur'}
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur'},
                    // 把验证邮箱是否合法的规则加入到表单验证规则对象中
                    {validator: checkEmail, trigger: 'blur'}
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur'},
                    // 把验证手机号是否合法的规则加入到表单验证规则对象中
                    {validator: checkMobile, trigger: 'blur'}
                ]
            },
            // 控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            // 通过ID查询到的用户信息对象
            editForm: {},
            // 修改表单的验证规则对象
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur'},
                    {validator: checkEmail, trigger: 'blur'}
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur'},
                    {validator: checkMobile, trigger: 'blur'}
                ]
            },
            // 控制分配角色对话框的显示与隐藏
            setRoleDialogVisible: false,
            // 需要被分配角色的用户信息
            userInfo: {},
            // 所有角色的数据列表
            rolesList: [],
            // 已选中的角色Id值
            selectedRoleId: ''
        }
    },
    created(){
        // 在页面创建期间，调用getUserList函数
        this.getUserList()
    },
    methods:{
        // 发起一次ajax数据请求,params用来在get请求中传参
        // get请求会返回一个promise对象,为了简化promise,使用async await来优化这一次异步操作
        async getUserList(){
            // 从get返回的数据对象中，解构赋值出data属性，重命名为res
            const {data: res} = await this.$axios.get('users', { params: this.queryInfo })
            if(res.meta.status !==200) {
                return this.$message.error('获取用户列表失败！')
            }
            // 把获取到的数据保存到data上
            this.userlist = res.data.users
            this.total = res.data.total
            console.log(res)
        },
        // 监听 pagesize 改变的事件
        handleSizeChange(newSize){
            console.log(newSize)
            this.queryInfo.pagesize = newSize
            // 重新请求数据
            this.getUserList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage){
            console.log(newPage)
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 监听 switch 开关状态的改变
        async userStateChanged(userinfo){
            console.log(userinfo)
            const {data: res} = await this.$axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if(res.meta.status !== 200){
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('更新用户状态失败！')
            }
            this.$message.success('更新用户状态成功！')
        },
        // 监听添加用户对话框的关闭事件
        addDialogClosed() {
          this.$refs.addFormRef.resetFields()
        },
        // 点击按钮，添加新用户
        addUser() {
          this.$refs.addFormRef.validate(async valid => {
              // 详情见login.vue =》 login() 表单的预验证
              if(!valid) return
              // 可以发起添加用户的网络请求了
              const {data :res} = await this.$axios.post('users', this.addForm)
              if(res.meta.status !== 201) {
                  return this.$message.error('用户创建失败！')
              }
              this.$message.success('用户创建成功！')
              // 隐藏添加用户的对话框
              this.addDialogVisible = false
              // 重新获取用户列表数据
              this.getUserList()
            })
        },
        // 展示编辑用户的对话框
        async showEditDialog(id) {
          const {data :res} = await this.$axios.get('users/' + id)
          if(res.meta.status !== 200) {
              return this.$message.error('查询用户信息失败！')
          }
          this.editForm = res.data
          this.editDialogVisible = true
        },
        // 监听修改用户对话框的关闭事件
        editDialogClosed() {
          this.$refs.editFormRef.resetFields()
        },
        // 修改用户信息并提交
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                if(!valid) return
                // 发起修改用户信息的数据请求
                const {data :res} = await this.$axios.put('users/' + this.editForm.id, {
                  email: this.editForm.email,
                  mobile: this.editForm.mobile
                })

                if(res.meta.status !== 200) {
                    return this.$message.error('更新用户信息失败！')
                }
                // 关闭对话框
                this.editDialogVisible = false
                // 刷新数据列表
                this.getUserList()
                // 提示修改成功
                this.$message.success('更新用户信息成功！')
            })
        },
        // 根据ID删除对应的用户信息
        async removeUserById(id) {
          // 弹框询问用户是否删除数据
          // 用confirmResult接收this.$confirm函数的返回值
          const confirmResult = await this.$confirm('This operation will permanently delete the user. Do you want to continue?', 'Warning', {
          confirmButtonText: 'determine',
          cancelButtonText: 'cancel',
          type: 'warning' //左侧感叹号小图标
          // 用.catch捕获取消操作
        }).catch(err => {
          return err
        })
        // 可以简写成 .catch(err => err)
        // 如果用户确认删除，则返回值为字符串"confirm"
        // 如果用户取消删除，则返回值为字符串"cancel"
        if(confirmResult !== 'confirm') {
          return this.$message.info('Deletion cancelled')
        }
        const {data: res} = await this.$axios.delete('users/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功！')
        this.getUserList()
        },
        // 展示分配角色的对话框
        async setRole(userInfo) {
          this.userInfo = userInfo

          // 在展示对话框之前获取所有的角色列表
          const { data: res } = await this.$axios.get('roles')
          if(res.meta.status !== 200) {
            return this.$message.error('获取角色列表失败！')
          }

          this.rolesList = res.data

          // 展示对话框
          this.setRoleDialogVisible = true
        },
        // 点击确定按钮分配新角色
        async saveRoleInfo() {
          // 判断有没有选择角色 this.selectRoleId 为false 则没有选择的角色
          // 相反的，!this.selectRoleId 为true，return出错误信息
          if(!this.selectedRoleId) {
            return this.$message.error('请选择要分配的角色！')
          }

          const {data: res} = await this.$axios.put(`users/${this.userInfo.id}/role`,{rid: this.selectedRoleId})

          if(res.meta.status !== 200) {
            return this.$message.error('更新角色失败！')
          }

          this.$message.success('更新角色成功！')
          this.getUserList()
          this.setRoleDialogVisible = false
        },
        // 监听分配角色对话框关闭事件
        setRoleDialogClosed() {
          this.selectedRoleId = ''
          this.userInfo = {}
        }
    }
}
</script>

<style lang="less" scoped>
    
</style>