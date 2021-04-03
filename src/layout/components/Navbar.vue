<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" id="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" id="breadcrumb-container" />

    <div class="right-menu">
      <el-tooltip content="全屏缩放" effect="dark" placement="bottom">
        <screenfull id="screenfull" class="right-menu-item hover-effect" style="margin-right:15px;" />
      </el-tooltip>

      <el-dropdown class="avatar-container" id="avatar-container" trigger="click" @command="handleCommand">
        <div class="avatar-wrapper">
          <img :src="avatar==null? DefaultAvatar:avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" style="top:55px;" >
          <el-dropdown-item icon="el-icon-user" command="handleUserCenter">个人中心</el-dropdown-item>
          <el-dropdown-item divided icon="el-icon-switch-button" command="handleLogOut">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import Avatar from '@/assets/img/avatar.png'
export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull
  },
  data(){
    return{
      DefaultAvatar:Avatar
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    handleCommand(command){
      this[command]();
    },
    handleUserCenter(){
      this.$router.push('/user/center')
    },
    handleLogOut(){
      this.$confirm('确定注销并退出系统吗？','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then( async() =>{
        await this.$store.dispatch('user/LogOut')
        location.reload()
        // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        this.$message.success("退出成功！")
      })
      .catch(error =>{
        console.log(error)
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
