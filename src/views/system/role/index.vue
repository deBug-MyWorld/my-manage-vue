<template>
  <div class="app-container">
    <el-row :gutter="20" v-if="search">
        <el-col :span="6">
            <el-input size="mini" clearable v-model="query"  placeholder="请输入角色名称/代码进行查询" ></el-input>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-search" size="mini" type="success" :disabled="hasPerm('role:list')" @click="handleSearch">查询</el-button>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-refresh-right" size="mini" type="warning" @click="resetQuery">重置</el-button>
        </el-col>        
    </el-row> 
    <el-row :gutter="20">
      <el-col :span="2">
          <el-button icon="el-icon-plus" size="mini" type="primary" :disabled="hasPerm('role:add')" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="4" :offset="18">
        <DynamicTable :defaultFormColumns="defaultFormColumns" @tableColumns="changeValues" ref="dynamicTable" :search.sync="search" @queryTable="getRoleList"></DynamicTable>      
      </el-col>
    </el-row> 
    <!-- 表格区 -->
    <el-table size='mini' :key="key" style="margin-bottom:10px;" row-key="menuId" :header-cell-style="{background:'#F2F6FC'}" stripe :data="tableData" v-loading="tableLoading">
      <el-table-column align="center" type="index" fixed label="序号" width="50"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" align="center" v-for="column in tableColumns" :key="column.label" :label="column.label">
        <template v-slot="scope" v-if="column.property === 'status'">
          <el-tag size="mini" v-if="scope.row.status == 1" type="success">启用</el-tag>
          <el-tag size="mini" v-else type="danger">禁用</el-tag>
        </template>  
        <template slot-scope="scope" v-else>
          {{scope.row[column.property]}}
        </template>      
      </el-table-column>
      <el-table-column align="center" label="操作" fixed="right" width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row)" :disabled="hasPerm('role:edit')">修改</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRole(scope.row.roleId)" :disabled="hasPerm('role:delete')">删除</el-button>
          <el-button type="warning" plain size="mini" icon="el-icon-plus" @click="handlePermission(scope.row.roleId)" :disabled="hasPerm('role:permission')">权限</el-button>
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
    <!-- 新增/修改角色对话框 -->
    <el-dialog :visible.sync="roleDialog" :title="title" @closed="handleClose" width="350px">
      <el-form ref="roleForm" :model="roleForm" :rules="roleRules" size="small" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色代码" prop="roleCode">
          <el-input v-model="roleForm.roleCode"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
        <el-switch
          v-model="roleForm.status "
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="启用"
          inactive-text="禁用" 
          :active-value="1"
          :inactive-value="0">
        </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini"  @click="roleDialog = false">取消</el-button>
        <el-button size="mini" type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </el-dialog>
    <!-- 权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="permissionDialog" width="400">
      <el-tree 
        ref="tree" 
        node-key="menuId" 
        show-checkbox 
        :data="treeData"
        :props="defaultProps">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="permissionDialog = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="handlePermissionUpdate" :disabled="treeData.length == 0">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { list,del,edit,add,page } from '@/api/crud'
import { getMenuIdsByRoleId,permission } from '@/api/role'
import DynamicTable from '@/components/DynamicTable'
export default {
  name:'Role',
  components:{
    DynamicTable
  },  
  data(){
    return{
      tableLoading:true,
      query:'',
      search:true,
      key:1,
      defaultFormColumns: [
        {
          label : '角色名称',
          visible: true,
          property:'roleName'
        },
        {
          label : '角色代码',
          visible: true,
          property:'roleCode'
        },
        {
          label : '状态',
          visible: true,
          property:'status'
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
        pageSize: 5,
        total: 0
      },
      roleDialog:false,
      title:'',
      roleForm:{
        roleId:null,
        roleName:null,
        roleCode:null,
        status:1,
      },
      roleRules:{
        roleName:[{required:true,message:'请输入角色名称',trigger:'blur'}],
        roleCode:[{required:true,message:'请输入角色代码',trigger:'blur'}],
      },
      permissionDialog:false,
      defaultProps:{
        children:'children',
        label:'menuName'
      },
      treeData:[],
      permissionForm:{
        roleId:null,
        menuIds:[]
      }
    }
  },
  computed:{
    ...mapGetters(['crud']),
  },
  mounted(){
    this.getRoleList()
    this.tableColumns = this.$refs.dynamicTable.tableColumns
  },
  methods:{
    changeValues(value){
      this.tableColumns = value.tableColumns
      this.key = value.key
    },
    showSearch(){
      this.search = !this.search
    },
    resetQuery(){
      this.query = ''
    },
    handleSearch(){
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query)
    },
    async queryPage(pageNum,pageSize,query){
      this.tableLoading = true
      const params = {
        pageNum:pageNum,
        pageSize:pageSize,
        query:query?query:null
      }
      let res = await page(this.crud.role,params)
      this.tableData = res.data.records
      this.queryParams.total = res.data.total
      setTimeout(() => {
        this.tableLoading = false
      }, 500);
    },
    getRoleList(){
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,'')
    },
    handleAdd(){
      this.title = '新增角色'
      this.roleDialog = true
    },
    handleEdit(row){
      this.roleDialog = true
      this.title = '修改角色'
      this.$nextTick(()=>{
        this.roleForm = Object.assign({},this.roleForm,row)
        this.roleForm.roleId = row.roleId
        console.log(this.roleForm)
      })
    },
    deleteRole(roleId){
      this.$confirm('此操作将永久删除，是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async()=>{
        let res = await del(this.crud.role,roleId)
        if(res!=undefined && res.isok){
          this.$message.success("删除成功！")
          this.getRoleList()
        }
      }).catch(error =>{
        console.log(error)
      })
    },
    async handlePermission(roleId){
      this.permissionDialog = true
      this.permissionForm.roleId = roleId
      let res = await list(this.crud.menu)
      if (res!=undefined && res.isok) {
        this.treeData = res.data
        let result = await getMenuIdsByRoleId(roleId)
        if (result !=undefined && result.isok) {
          result.data.forEach(menuId =>{
            // 树形菜单赋值
            var node = this.$refs.tree.getNode(menuId)
            if (node.isLeaf) {
              this.$refs.tree.setChecked(node,true)
            }
          })
        }
      }

    },
    handleSizeChange(val){
      this.queryParams.pageSize = val
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query)
    },
    handleCurrentChange(val){
      this.queryParams.pageNum = val
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query)
    },
    handleClose(){
      this.$refs["roleForm"].resetFields()
      this.roleForm.roleId = null
    },
    handleSubmit(){
      this.$refs.roleForm.validate(async valid =>{
        if (!valid) {
          return false
        } else {
          if (this.roleForm.roleId === null) {
            let res = await add(this.crud.role,this.roleForm)
            if(res!=undefined && res.isok){
              this.$message.success("添加成功！")
            }            
          } else {
            let res = await edit(this.crud.role,this.roleForm)
            if(res!=undefined && res.isok){
              this.$message.success("修改成功！")
            }
          }
          this.getRoleList()
          this.roleDialog = false
        }
      })
    },
    async handlePermissionUpdate(){
      this.permissionForm.menuIds = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
      let res = await permission(this.permissionForm)
      if (res !=undefined && res.isok) {
        this.permissionDialog = false
        this.$message.success("权限分配成功！")
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.el-row{
  margin-bottom: 20px;
}
</style>