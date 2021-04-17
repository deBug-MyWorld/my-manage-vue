<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="5" style="margin-bottom: 10px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div style="text-align: center">
              <div class="el-upload">
                <img :src="user.avatar==null ? DefaultAvatar : user.avatar" title="点击上传头像" class="avatar" @click="toggleShow">
                <myUpload v-model="show" field="avatar" :headers="headers" :url="updateAvatarApi" @crop-upload-fail="cropUploadFail" @crop-upload-success="cropUploadSuccess"/>
              </div>
            </div>
            <ul class="user-info">
              <li><div style="height: 100%"><i class="el-icon-user" /> 用户名称<div class="user-right">{{ user.username }}</div></div></li>
              <li><i class="el-icon-phone" /> 手机号码 <div class="user-right">{{ user.phone }}</div></li>
              <li><i class="el-icon-message" /> 用户邮箱 <div class="user-right">{{ user.email }}</div></li>
              <li>
                <i class="el-icon-lock"/> 安全设置
                <div class="user-right">
                  <a @click="$refs.pass.dialog = true">修改密码</a>
                </div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="19">
        <!--    用户资料    -->
        <el-card class="box-card">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="用户资料" name="first">
              <el-form ref="form" :model="form" :rules="rules" style="margin-top: 10px;" size="small" label-width="65px">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="form.username" style="width: 35%" />
                  <span style="color: #C0C0C0;margin-left: 10px;">用户名修改后则需重新登录</span>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" style="width: 35%;" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" style="width: 35%;" />
                </el-form-item>                
                <el-form-item label="性别">
                  <el-radio-group v-model="form.gender" style="width: 178px">
                    <el-radio label="男">男</el-radio>
                    <el-radio label="女">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="">
                  <el-button :loading="saveLoading" size="mini" type="primary" @click="doSubmit">保存配置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <!--    操作日志    -->
            <el-tab-pane label="操作日志" name="second">
              <el-table v-loading="loading" :data="data" style="width: 100%;">
                <el-table-column prop="description" label="行为" />
                <el-table-column prop="ip" label="IP" />
                <el-table-column prop="addr" label="操作地址" />
                <el-table-column prop="time" label="请求耗时" align="center">
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row.time <= 300">{{ scope.row.time }}ms</el-tag>
                    <el-tag v-else-if="scope.row.time <= 1000" type="warning">{{ scope.row.time }}ms</el-tag>
                    <el-tag v-else type="danger">{{ scope.row.time }}ms</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  align="right"
                >
                  <template slot="header">
                    <div style="display:inline-block;float: right;cursor: pointer" @click="init">创建日期<i class="el-icon-refresh" style="margin-left: 40px" /></div>
                  </template>
                  <template slot-scope="scope">
                    <span>{{ scope.row.createTime }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <!-- 分页区 -->
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="this.queryParams.pageNum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="this.queryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="this.queryParams.total"
              ></el-pagination>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    <updatePass ref="pass" />
  </div>
</template>

<script>
import 'babel-polyfill'
import myUpload from 'vue-image-crop-upload/upload-2.vue'
import { mapGetters } from 'vuex'
import store from '@/store'
import { isvalidPhone } from '@/utils/validate'
import { getToken } from '@/utils/token'
import Avatar from '@/assets/img/avatar.png'
import updatePass from './center/updatePass'
import { editUser } from '@/api/user'
import { page } from '@/api/crud'
export default {
  name: 'Center',
  components: { myUpload ,updatePass},
  data() {
    // 自定义验证
    const validPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isvalidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    }
    return {
      show: false,  //剪切框显示和隐藏的flag
      DefaultAvatar: Avatar,
      activeName: 'first',
      saveLoading: false,
      headers: {
        'Authorization': getToken()
      },
      form: {},
      rules: {
        username:[{required: true,trigger:'blur',message:'用户名不能为空'}],
        phone: [{ required: true, trigger: 'blur', validator: validPhone }],
        email:[{required: true,trigger:'blur',message:'邮箱不能为空'},
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
      },
      loading: false,
      data: [],
      queryParams: {  // 分页参数
          pageNum: 1,
          pageSize: 5,
          total: 0
      },
    }
  },
  computed: {
    ...mapGetters([
      'user',
      'updateAvatarApi',
    ])
  },
  created() {
    this.form = { userId: this.user.userId, gender: this.user.gender, phone: this.user.phone,email:this.user.email,username:this.user.username }
    store.dispatch('user/GetInfo').then(() => {})
  },
  methods: {
    //控制剪切框的显示和隐藏
    toggleShow() {
      this.show = !this.show;
    },
    handleClick(tab, event) {
      if (tab.name === 'second') {
        this.init()
      }
    },
    async init(){
      this.loading = true
      const params = {
        pageNum:this.queryParams.pageNum,
        pageSize:this.queryParams.pageSize,
        username:this.user.username
      }
      var url = 'api/logs/user'
      let res = await page(url,params)
      this.data = res.data.records
      this.queryParams.total = res.data.total
      setTimeout(() => {
        this.loading = false
      }, 500);
    },
    handleSizeChange(val){
      this.queryParams.pageSize = val
      this.init()
    },
    handleCurrentChange(val){
      this.queryParams.pageNum = val
      this.init()
    },
    cropUploadSuccess(jsonData, field) {
      store.dispatch('user/GetInfo').then(() => {})
    },
    cropUploadFail(status,field){
      if (status === 500) {
        this.$message.error("文件大小超过限制!")
      }
    },
    doSubmit() {
      if (this.$refs['form']) {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.saveLoading = true
            editUser(this.form).then((res) => {
              if (res.isok) {
                this.$message.success("修改用户信息成功！")
                store.dispatch('user/GetInfo').then(() => {})
                this.saveLoading = false                
              }
            }).catch(() => {
              this.saveLoading = false
            })
          }
        })
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
  }
  .user-info {
    padding-left: 0;
    list-style: none;
    li{
      border-bottom: 1px solid #F0F3F4;
      padding: 11px 0;
      font-size: 13px;
    }
    .user-right {
      float: right;
      a{
        color: #317EF3;
      }
    }
  }
</style>
