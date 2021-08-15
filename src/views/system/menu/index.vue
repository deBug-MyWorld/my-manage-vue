<template>
  <div class="app-container">
    <el-row :gutter="20" v-if="search">
        <el-col :span="6">
            <el-input size="mini" clearable v-model="query"  placeholder="请输入名称进行查询" ></el-input>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-search" size="mini" type="success" :disabled="hasPerm('menu:list')" @click="handleSearch">查询</el-button>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-refresh-right" size="mini" type="warning" @click="resetQuery">重置</el-button>
        </el-col>        
    </el-row> 
    <el-row :gutter="20">
      <el-col :span="2">
          <el-button icon="el-icon-plus" size="mini" type="primary" :disabled="hasPerm('menu:add')" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="4" :offset="18">
        <DynamicTable :defaultFormColumns="defaultFormColumns" @tableColumns="changeValues" ref="dynamicTable" :search.sync="search" @queryTable="getMenuList"></DynamicTable>      
      </el-col>
  </el-row> 
  <!-- 表格区 -->
  <el-table size='mini' :key="key" style="margin-bottom:10px;" row-key="menuId" :header-cell-style="{background:'#F2F6FC'}" stripe :data="tableData" v-loading="tableLoading">
    <el-table-column align="center" type="index" fixed label="序号" width="50"></el-table-column>
    <el-table-column :show-overflow-tooltip="true" align="center" v-for="column in tableColumns" :key="column.label" :label="column.label">
      <template v-slot="scope" v-if="column.property === 'type'">
        <el-tag size="mini" v-if="scope.row.type == 0" type="success">菜单</el-tag>
        <el-tag size="mini" v-else type="info">按钮</el-tag>
      </template>  
      <template v-slot="scope" v-else-if="column.property === 'icon'">
        <i :class="scope.row.icon"></i>
      </template>
      <template slot-scope="scope" v-else>
        {{scope.row[column.property]}}
      </template>      
    </el-table-column>
    <el-table-column align="center" label="操作" fixed="right" width="180">
      <template slot-scope="scope">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row)" :disabled="hasPerm('menu:edit')">修改</el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteMenu(scope.row.menuId)" :disabled="hasPerm('menu:delete')">删除</el-button>
      </template>
    </el-table-column>
  </el-table>    
  <!-- 新增/修改菜单对话框 -->
  <el-dialog :visible.sync="menuDialog" :title="title" @closed="handleClose" width="570px">
    <el-form ref="menuForm" :inline="true" :model="menuForm" :rules="menuRules" size="small" label-width="80px">
      <el-form-item label="菜单类型" prop="type">
        <el-radio-group v-model="menuForm.type" size="mini">
          <el-radio-button label="0">菜单</el-radio-button>
          <el-radio-button label="1">按钮</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="menuForm.type.toString() === '0'" label="菜单图标" prop="icon">
        <el-popover placement="bottom-start" width="450" trigger="click" @show="$refs['iconSelect'].reset()">
          <IconSelect ref="iconSelect" @selected="selected"></IconSelect>
          <el-input slot="reference" v-model="menuForm.icon" style="width:400px;" placeholder="点击选择图标" readonly>
            <i v-if="menuForm.icon" slot="prefix" :class="menuForm.icon"></i>
            <i v-else slot="prefix" class="el-icon-search el-input__icon"></i>
          </el-input>
        </el-popover>
      </el-form-item>
      <el-form-item v-show="menuForm.type.toString() === '0'" label="菜单隐藏" prop="hidden">
        <el-radio-group v-model="menuForm.hidden" size="mini">
          <el-radio-button label="true">是</el-radio-button>
          <el-radio-button label="false">否</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="menuForm.type.toString() === '0'" label="菜单名称" prop="menuName" style="margin-left:35px;">
        <el-input v-model="menuForm.menuName" placeholder="菜单名称" ></el-input>
      </el-form-item>
      <el-form-item v-if="menuForm.type.toString() === '1'" label="按钮名称" prop="menuName" style="margin-left:35px;">
        <el-input v-model="menuForm.menuName" placeholder="按钮名称"></el-input>
      </el-form-item>
      <el-form-item v-show="menuForm.type.toString() === '1'" label="权限标识" prop="permission">
        <el-input v-model="menuForm.permission" placeholder="权限标识"></el-input>
      </el-form-item>
      <el-form-item v-if="menuForm.type.toString() === '0'" label="路由地址" prop="url">
        <el-input v-model="menuForm.url" style="width: 155px;" placeholder="路由地址"></el-input>
      </el-form-item>    
      <el-form-item v-if="menuForm.type.toString() === '0'" label="组件路径" prop="component">
        <el-input v-model="menuForm.component" style="width: 155px;" placeholder="组件路径"></el-input>
      </el-form-item>  
      <el-form-item label="上级类目" prop="menuPid">
        <treeselect v-model="menuForm.menuPid" :options="menus" style="width:400px;" placeholder="选择上级类目"></treeselect>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini"  @click="menuDialog = false">取消</el-button>
      <el-button size="mini" type="primary" @click="handleSubmit">确认</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { list,del,edit,add } from '@/api/crud'
import IconSelect from '@/components/IconSelect'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import DynamicTable from '@/components/DynamicTable'
export default {
  name:'Menu',
  components:{IconSelect, Treeselect,DynamicTable},
  data(){
    return{
      tableLoading:true,
      query:'',
      search:true,
      key:1,
      defaultFormColumns: [
        {
          label : '名称',
          visible: true,
          property:'menuName'
        },
        {
          label : '类型',
          visible: true,
          property:'type'
        },
        {
          label : '路由路径',
          visible: true,
          property:'url'
        },    
        {
          label : '图标',
          visible: true,
          property:'icon'
        },   
        {
          label : '权限标识',
          visible: true,
          property:'permission'
        },   
      ],
      tableColumns:[],// 动态table    
      tableData:[],
      menuDialog:false,
      title:'',
      menuForm:{
        menuId:null,
        menuName:null,
        menuPid:null,
        type:'0',
        url:null,
        icon:null,
        hidden:false,
        permission:null,
        component:null
      },
      menuRules:{
        menuName:[{required: true,message:'请输入名称',trigger:'blur'}],
        url:[{required:true,message:'请输入地址',trigger:'blur'}],
      },
      menus:[],
    }
  },
  computed:{
    ...mapGetters(['crud']),
  },
  mounted(){
    this.getMenuList()
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
      this.title = '新增菜单'
      this.menuDialog = true
      this.menus = [{id:0,label:'顶级类目',children:this.getTreeData(this.tableData)}]
    },
    async getMenuList(){
      this.tableLoading = true
      let res = await list(this.crud.menu)
      this.tableData = res.data
      setTimeout(() => {
        this.tableLoading = false
      }, 500);
    },
    deleteMenu(menuId){
      this.$confirm('此操作将永久删除，若有子级菜单也会一并删除，是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async ()=>{
        let res = await del(this.crud.menu,menuId)
        if(res!=undefined && res.isok){
          this.$message.success("删除成功！")
          this.getMenuList()
        }
      }).catch(error =>{
        console.log(error)
      })
    },
    handleEdit(row){
      this.menuDialog = true
      this.title = '修改菜单'
      this.$nextTick(()=>{
        this.menuForm = Object.assign({},this.menuForm,row)
        this.menuForm.menuPid = row.menuPid
        this.menus = [{id:0,label:'顶级类目',children:this.getTreeData(this.tableData)}]
        console.log(this.menuForm)
      })

    },
    selected(name){
      this.menuForm.icon = 'el-icon-'+ name
    },
    handleClose(){
      this.$refs["menuForm"].resetFields();
      this.menuForm.menuId = null      
    },
    getTreeData(val){
      let arr = []
      val.forEach(data =>{
        let obj = {
          id: data.menuId,
          label:data.menuName,
        }
        if (data.children && data.children.length > 0){
          obj.children = this.getTreeData(data.children)
        }
        arr.push(obj)
      })
      return arr;
    },
    handleSubmit(){
      this.$refs.menuForm.validate(async valid =>{
        if(!valid){
          return false
        } else {
          if(this.menuForm.menuId === null){
            let res = await add(this.crud.menu,this.menuForm)
            if(res!=undefined && res.isok){
              this.$message.success("添加成功！")
            }
          } else {
            let res = await edit(this.crud.menu,this.menuForm)
            if (res!=undefined && res.isok) {
              this.$message.success("修改成功！")
            }
          }
          this.getMenuList()
          this.menuDialog = false
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
