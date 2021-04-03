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
                <myUpload v-model="show" :headers="headers" url="/updateAvatarApi" @crop-upload-success="cropUploadSuccess"/>
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
                <el-form-item label="用户名称" prop="username">
                  <el-input v-model="form.username" style="width: 35%" />
                  <span style="color: #C0C0C0;margin-left: 10px;">用户名称不能重复</span>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" style="width: 35%;" />
                  <span style="color: #C0C0C0;margin-left: 10px;">手机号码不能重复</span>
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
        phone: [
          { required: true, trigger: 'blur', validator: validPhone }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user',
    ])
  },
  created() {
    this.form = { id: this.user.userId, gender: this.user.gender, phone: this.user.phone }
    store.dispatch('user/GetInfo').then(() => {})
  },
  methods: {
    //控制剪切框的显示和隐藏
    toggleShow() {
      this.show = !this.show;
    },
    handleClick(tab, event) {
    },
    cropUploadSuccess(jsonData, field) {
      store.dispatch('user/GetInfo').then(() => {})
    },
    doSubmit() {
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
