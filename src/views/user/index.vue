<template>
  <div class="app-container">
    <el-row :gutter="20" v-if="search">
        <el-col :span="6">
            <el-input size="mini" clearable v-model="query"  placeholder="请输入用户名进行查询" ></el-input>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-search" size="mini" :disabled="hasPerm('user:list')" type="success" @click="handleSearch">查询</el-button>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-refresh-right" size="mini" type="warning" @click="resetQuery">重置</el-button>
        </el-col>        
    </el-row> 
      <el-row :gutter="20">
      <el-col :span="2">
          <el-button icon="el-icon-plus" size="mini" :disabled="hasPerm('user:add')" type="primary" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="4" :offset="18">
          <el-button-group>
            <el-button type="info" size="mini" icon="el-icon-search" plain @click="showSearch"></el-button>
            <el-button  size="mini" icon="el-icon-refresh" @click="getUserList"></el-button>
            <el-popover placement="bottom-end" trigger="click" width="150">
              <el-button  size="mini" slot="reference" icon="el-icon-s-grid"></el-button>
              <el-checkbox v-model="allColumnSelected" :indeterminate="allColumnsSelectedIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
              <el-checkbox v-for="item in defaultFormColumns" :key="item.label" v-model="item.visible" @change="handleCheckedTableColumnsChange(item)">{{ item.label }}</el-checkbox>
            </el-popover>
          </el-button-group>        
      </el-col>
  </el-row>  
  <!-- 表格区 -->
  <el-table size='mini' :key="key" style="margin-bottom:10px;" :header-cell-style="{background:'#F2F6FC'}" stripe :data="tableData" v-loading="tableLoading">
    <el-table-column align="center" type="index" fixed label="序号" width="50"></el-table-column>
    <el-table-column :show-overflow-tooltip="true" align="center" v-for="column in tableColumns" :key="column.label" :label="column.label">
      <template v-slot="scope" v-if="column.property === 'enabled'">
        <el-tag size="mini" v-if="scope.row.enabled" type="success">启用</el-tag>
        <el-tag size="mini" v-else type="danger">禁用</el-tag>
      </template>  
      <template slot-scope="scope" v-else>
        {{scope.row[column.property]}}
      </template>      
    </el-table-column>
    <el-table-column align="center" label="操作" fixed="right" width="180">
      <template slot-scope="scope">
        <el-button type="primary" size="mini" icon="el-icon-edit" :disabled="hasPerm('user:edit')" @click="handleEdit(scope.row)">修改</el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" :disabled="user.userId === scope.row.userId || hasPerm('user:delete')" @click="deleteUser(scope.row.userId)">删除</el-button>
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
  <!-- 新增/修改用户对话框 -->
  <el-dialog :visible.sync="userDialog" :title="title" @closed="handleClose" width="570px">
    <el-form size="small" :inline="true" :rules="userRules" :model="userForm" ref="userForm" label-width="66px">
      <el-form-item label="用户名"  prop="username">
        <el-input v-model="userForm.username" :disabled="userForm.userId !== null"></el-input>
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model.number="userForm.phone"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userForm.email"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="userForm.gender" style="width: 178px">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态" prop="enabled">
        <el-switch
          v-model="userForm.enabled "
          :disabled="user.userId === userForm.userId"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="启用"
          inactive-text="禁用" 
          :active-value="1"
          :inactive-value="0">
        </el-switch>
      </el-form-item>
      <el-form-item style="margin-bottom: 0;" label="角色" prop="roles">
        <el-select v-model="userForm.roles" style="width:437px" multiple placeholder="请选择角色">
          <el-option v-for="item in roleDatas" :key="item.roleId" :label="item.roleName" :value="item.roleId"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="userDialog = false">取 消</el-button>
      <el-button size="mini" type="primary" @click="handleSubmit">确 定</el-button>
    </span>    
  </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { isvalidPhone } from '@/utils/validate'
import { page,del,edit,add } from '@/api/crud'
import {getRoleList} from '@/api/role'
export default {
  name:'User',
  data(){
    const validPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isvalidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    };
    const usernameCheck = async (rule, value, callback) => {
      if(!value){
        callback(new Error('用户名不能为空'))
      } else{
        if (this.userForm.userId === null){
            try {
              await this.$store.dispatch("user/UserNameCheck",value)
            } catch(e){
              callback(new Error(e.message))
            }          
        } else {
          callback()
        } 
      }
    }
    return{
      tableLoading:true,
      query:'',
      search:true,
      allColumnSelected:true,
      allColumnsSelectedIndeterminate: false,
      key:1,
      defaultFormColumns: [
        {
          label : '用户名',
          visible: true,
          property:'username'
        },
        {
          label : '性别',
          visible: true,
          property:'gender'
        },
        {
          label : '电话',
          visible: true,
          property:'phone'
        },    
        {
          label : '邮箱',
          visible: true,
          property:'email'
        },   
        {
          label : '状态',
          visible: true,
          property:'enabled'
        },   
        {
          label : '创建时间',
          visible: true,
          property:'createTime'
        }, 
      ],
      tableColumns:[],// 动态table
      tableData:[],
      queryParams: {  // 分页参数
        pageNum: 1,
        pageSize: 8,
        total: 0
      },
      userDialog: false,
      title:'',
      userRules:{
        username:[{ required: true, validator:usernameCheck, trigger: "blur" }],
        phone: [ { required: true, trigger: 'blur', validator: validPhone }],
        email: [{ required: true, message: "邮箱不能为空", trigger: "blur" },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],   
        roles:[{required: true, message: "角色不能为空", trigger: "blur"}]  
      },
      userForm:{
        userId:null,
        username:null,
        gender:'男',
        email:null,
        phone:null,
        enabled:1,
        roles:[]
      },
      roleDatas:[],
    }
  },
  computed:{
    ...mapGetters(['user','crud']),
  },
  mounted(){
    this.getUserList()
    this.tableColumns = this.defaultFormColumns
  },
  methods:{
    showSearch(){
      this.search = !this.search
    },
    handleCheckAllChange(val) {
      if (val === false){
        this.allColumnSelected = true
        return
      }
      this.defaultFormColumns.forEach(column => {
        if (!column.visible){
          column.visible = true
        }
      })
      this.allColumnSelected = val
      this.allColumnsSelectedIndeterminate = false
      this.updateFormColums()
    },
    handleCheckedTableColumnsChange(item){
      let totalCount = 0
      let selectedCount = 0
      this.tableColumns.forEach(column => {
        ++totalCount
        selectedCount += column.visible ? 1:0
      })
      if (selectedCount === 0){
        this.$message.warning('请至少选择一列！！！')
        this.$nextTick(function() {
          item.visible = true
        })        
        return
      }
      this.allColumnSelected = selectedCount === totalCount
      this.allColumnsSelectedIndeterminate = selectedCount !== totalCount && selectedCount !==0
      this.updateFormColums()
    },
    // 动态表格
    updateFormColums(){
      this.tableColumns = this.defaultFormColumns.filter(i => i.visible == true)
      this.key = this.key + 1 //  为了保证table 每次都会重渲
    },
    resetQuery(){
      this.query = ''
    },
    async queryPage(pageNum,pageSize,username){
      this.tableLoading = true
      const params = {
        pageNum:pageNum,
        pageSize:pageSize,
        username:username?username:null
      }
      let res = await page(this.crud.user,params)
      this.tableData = res.data.records
      this.queryParams.total = res.data.total
      setTimeout(() => {
        this.tableLoading = false
      }, 500);
      
    },
    getUserList(){
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,'')
    },
    deleteUser(id){
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async ()=>{
        let res = await del(this.crud.user,id)
         if (res !=undefined && res.isok){
           this.$message.success("删除用户成功");
           this.getUserList()
         }
      })      
    },
    handleSizeChange(val){
      this.queryParams.pageSize = val
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query)
    },
    handleCurrentChange(val){
      this.queryParams.pageNum = val
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query)
    },
    handleSearch(){
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query)
    },
    handleAdd(){
      this.title = '新增用户'
      this.userDialog = true
      this.getRoleList()
    },
    handleEdit(row){
      this.userDialog = true;
      this.$nextTick(async()=>{
        this.title = '修改用户'
        // 获取全部角色
        this.getRoleList()
        // 合并具有相同属性的对象
        this.userForm = Object.assign({}, this.userForm, row)
        // 查询该用户的角色id
        const res = await this.$store.dispatch("user/UserRoles",row.userId)
        this.userForm.roles = res.data
      })


    },
    handleSubmit(){
      this.$refs.userForm.validate(async valid =>{
        if(!valid){
          return false
        } else {
          if(this.userForm.userId === null){
            let res = await add(this.crud.user,this.userForm)
            if (res !=undefined && res.isok){
              this.$message.success("添加用户成功!，默认密码：123456")
            }
          } else {
            let res = await edit(this.crud.user,this.userForm)
            if (res !=undefined && res.isok){
              this.$message.success("修改用户成功!") 
            }
          }
            this.getUserList()
            this.userDialog = false
        }
      })
      
    },
    handleClose(){
      // 要清空的地方必须绑定prop属性，并且和form中数据的最后的名字一致，否则不能清空
      this.$refs["userForm"].resetFields();
      this.userForm.userId = null
    },
    async getRoleList(){
      let res = await getRoleList()
      this.roleDatas = res.data
    },
  }
}
</script>

<style lang="scss" scoped>
.el-row{
  margin-bottom: 20px;
}
</style>
