<template>
    <div class="login_container">
        <h1 style="position: relative;color: #fff;margin: 0 auto;text-align:center;top:80px;">后台管理系统</h1>
        <div class="login_box">
            <div class="login_top">
                <img src="@/assets/img/logo.jpeg">
            </div>
            <!--表单-->
            <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="0px" class="login_form">
            <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入用户名称" prefix-icon="el-icon-user-solid"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginForm.password" placeholder="请输入登录密码" show-password prefix-icon="el-icon-lock"></el-input>
            </el-form-item>
            <el-checkbox v-model="checked" class="rememberme">记住密码</el-checkbox>
            <el-form-item class="login_btn">
                <el-button type="primary" @click="submitForm('loginForm')" :loading="loading">登录</el-button>
                <el-button @click="resetForm('loginForm')">重置</el-button>
            </el-form-item>
            </el-form>
                    <!-- 验证码 -->
        <Vcode :show="isShow" @success="success" @close="close" :canvasWidth="450" :canvasHeight="300" />
    </div>
    </div>
</template>

<script>
import Vcode from "vue-puzzle-vcode"
export default {
    components: {
            Vcode
        },    
    name:'Login',
    data() {
      return {
        loginForm: {
          username: '',
          password: ''
        },
        isShow: false,
        checked: true,
        loading: false,
        redirect: undefined,
        loginRules: {
          username: [
            { required: true, message: '请输入用户名称', trigger: 'blur' },
            { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
          ],
        }
      };
    },
    watch:{
      $route:{
        // 加载登录页后，直接获取，登录页地址栏的的redirect参数，赋值给this.redirect
        handler:function(route){
          console.log(route)
          this.redirect = route.query && route.query.redirect
        },
        immediate:true
      }
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
             this.isShow = true;
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      success() {
        this.loading = true;
        this.$store.dispatch('user/Login',this.loginForm).then(()=>{
          this.loading = false
          console.log(this.redirect)
          this.$router.push({ path:this.redirect || '/'},()=>{})
          this.$message.success("登录成功！")
        }).catch(()=>{
          this.loading = false;
        })
        this.close()
      },
      close() {
        this.isShow = false;
      },    
    }        
}
</script>

<style scoped>
.login_container{
  min-height: 100%;
  background-color: #2d3a4b;  
  width: 100%;
  overflow: hidden;
}
.login_box{
    width: 400px;
    height: 320px;
    background-color: #FFFFFF;
    border-radius: 5px;
    position: relative;
    margin: 0 auto;
    top:250px;
}
.login_top{
    position: relative;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin: -65px auto;
    background-color: #FFFFFF;
    top: -70px;
}
.login_top img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #EEEEEE;
}
.login_form{
    position: relative;
    bottom: 0px;
    width: 100%;
    padding: 0px 20px;
    box-sizing: border-box;
    top: 20px;
}
.login_btn{
    display: flex;
    justify-content: flex-end;
}
</style>