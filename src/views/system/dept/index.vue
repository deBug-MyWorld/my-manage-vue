<template>
  <div class="app-container">
    <el-row :gutter="20" v-if="search">
        <el-col :span="6">
            <el-input size="mini" clearable v-model="query"  placeholder="请输入部门名称进行查询" ></el-input>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-search" size="mini" type="success" :disabled="hasPerm('dept:list')" @click="handleSearch">查询</el-button>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-refresh-right" size="mini" type="warning" @click="resetQuery">重置</el-button>
        </el-col>        
    </el-row> 
    <el-row :gutter="20">
      <el-col :span="2">
          <el-button icon="el-icon-plus" size="mini" type="primary" :disabled="hasPerm('dept:add')" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="4" :offset="18">
        <DynamicTable :defaultFormColumns="defaultFormColumns" @tableColumns="changeValues" ref="dynamicTable" :search.sync="search" @queryTable="getDeptList"></DynamicTable>      
      </el-col>
  </el-row> 
  <!-- 表格区 -->
  <el-table size='mini' :key="key" style="margin-bottom:10px;" row-key="deptId" :header-cell-style="{background:'#F2F6FC'}" stripe :data="tableData" v-loading="tableLoading">
    <el-table-column align="center" type="index" fixed label="序号" width="50"></el-table-column>
    <el-table-column :show-overflow-tooltip="true" align="center" v-for="column in tableColumns" :key="column.label" :label="column.label">
      <template v-slot="scope" v-if="column.property === 'status'">
        <el-tag size="mini" v-if="scope.row.status == true" type="success">启用</el-tag>
        <el-tag size="mini" v-else type="danger">禁用</el-tag>
      </template>  
      <template slot-scope="scope" v-else>
        {{scope.row[column.property]}}
      </template>      
    </el-table-column>
    <el-table-column align="center" label="操作" fixed="right" width="180">
      <template slot-scope="scope">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row)" :disabled="hasPerm('dept:edit')">修改</el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteMenu(scope.row.deptId)" :disabled="hasPerm('dept:delete')">删除</el-button>
      </template>
    </el-table-column>
  </el-table>    
  <!-- 新增/修改菜单对话框 -->
  <el-dialog :visible.sync="deptDialog" :title="title" @closed="handleClose" width="570px">
    <el-form ref="deptForm" :inline="true" :model="deptForm" :rules="deptRules" size="small" label-width="80px">
        <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="deptForm.deptName" placeholder="部门名称"></el-input>
        </el-form-item>
        <el-form-item label="部门排序" prop="sort">
            <el-input-number v-model="deptForm.sort" controls-position="right" :min="1" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
            <el-radio-group v-model="deptForm.status" size="mini">
                <el-radio :label="true">启用</el-radio>
                <el-radio :label="false">禁用</el-radio>
            </el-radio-group>
        </el-form-item>
      <el-form-item label="上级类目" prop="deptPid">
        <treeselect v-model="deptForm.deptPid" :options="depts" style="width:400px;" placeholder="选择上级类目"></treeselect>
      </el-form-item>        
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini"  @click="deptDialog = false">取消</el-button>
      <el-button size="mini" type="primary" @click="handleSubmit">确认</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { list,del,edit,add } from '@/api/crud'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import DynamicTable from '@/components/DynamicTable'
export default {
  name:'Dept',
  components:{Treeselect,DynamicTable},
  data(){
    return{
      tableLoading:true,
      query:'',
      search:true,
      key:1,
      defaultFormColumns: [
        {
          label : '部门名称',
          visible: true,
          property:'deptName'
        },
        {
          label : '排序',
          visible:true,
          property:'sort'
        },
        {
          label:'状态',
          visible:true,
          property:'status'
        },
        {
          label:'创建日期',
          visible:true,
          property:'createTime'
        }
      ],
      tableColumns:[],// 动态table    
      tableData:[],
      deptDialog:false,
      title:'',
      deptForm:{
        deptId:null,
        deptName:null,
        deptPid:null,
        sort:1,
        status:true,
      },
      deptRules:{
        deptName:[{required: true,message:'请输入名称',trigger:'blur'}],
      },
      depts:[],
    }
  },
  computed:{
    ...mapGetters(['crud']),
  },
  mounted(){
    this.getDeptList()
    this.tableColumns = this.$refs.dynamicTable.tableColumns
  },
  methods:{
    changeValues(value){
      this.tableColumns = value.tableColumns
      this.key = value.key
    },
    resetQuery(){
      this.query = ''
    },
    handleSearch(){
      this.$message.error('下次一定')
    },
    handleAdd(){
      this.title = '新增部门'
      this.deptDialog = true
      this.depts = [{id:0,label:'顶级类目',children:this.getTreeData(this.tableData)}]
    },
    async getDeptList(){
      this.tableLoading = true
      let res = await list(this.crud.dept)
      this.tableData = res.data
      setTimeout(() => {
        this.tableLoading = false
      }, 500);
    },
    deleteMenu(deptId){
      this.$confirm('此操作将永久删除，若有子级菜单也会一并删除，是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async ()=>{
        let res = await del(this.crud.dept,deptId)
        if(res!=undefined && res.isok){
          this.$message.success("删除成功！")
          this.getDeptList()
        }
      }).catch(error =>{
        console.log(error)
      })
    },
    handleEdit(row){
      this.deptDialog = true
      this.title = '修改菜单'
      this.$nextTick(()=>{
        this.deptForm = Object.assign({},this.deptForm,row)
        this.deptForm.deptPid = row.deptPid
        this.depts = [{id:0,label:'顶级类目',children:this.getTreeData(this.tableData)}]
        console.log(this.deptForm)
      })

    },
    handleClose(){
      this.$refs["deptForm"].resetFields();
      this.deptForm.deptId = null      
    },
    getTreeData(val){
      let arr = []
      val.forEach(data =>{
        let obj = {
          id: data.deptId,
          label:data.deptName,
        }
        if (data.children && data.children.length > 0){
          obj.children = this.getTreeData(data.children)
        }
        arr.push(obj)
      })
      return arr;
    },
    handleSubmit(){
      this.$refs.deptForm.validate(async valid =>{
        if(!valid){
          return false
        } else {
          if(this.deptForm.deptId === null){
            let res = await add(this.crud.dept,this.deptForm)
            if(res!=undefined && res.isok){
              this.$message.success("添加成功！")
            }
          } else {
            let res = await edit(this.crud.dept,this.deptForm)
            if (res!=undefined && res.isok) {
              this.$message.success("修改成功！")
            }
          }
          this.getDeptList()
          this.deptDialog = false
        }
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.el-row{
  margin-bottom: 20px;
}
</style>
