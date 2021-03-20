<template>
  <div>
    <el-row :gutter="20" v-if="search">
        <el-col :span="6">
            <el-input size="mini" clearable v-model="query"  placeholder="请输入名称进行查询" ></el-input>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-search" size="mini" type="success" @click="handleSearch">查询</el-button>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-refresh-right" size="mini" type="warning" @click="resetQuery">重置</el-button>
        </el-col>        
    </el-row> 
    <el-row :gutter="20">
      <el-col :span="2">
          <el-button icon="el-icon-plus" size="mini" type="primary" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="4" :offset="18">
          <el-button-group>
            <el-button type="info" size="mini" icon="el-icon-search" plain @click="showSearch"></el-button>
            <el-button  size="mini" icon="el-icon-refresh" @click="getMenuList"></el-button>
            <el-popover placement="bottom-end" trigger="click" width="150">
              <el-button  size="mini" slot="reference" icon="el-icon-s-grid"></el-button>
              <el-checkbox v-model="allColumnSelected" :indeterminate="allColumnsSelectedIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
              <el-checkbox v-for="item in defaultFormColumns" :key="item.label" v-model="item.visible" @change="handleCheckedTableColumnsChange(item)">{{ item.label }}</el-checkbox>
            </el-popover>
          </el-button-group>        
      </el-col>
  </el-row>     
  </div>
</template>

<script>
export default {
  name:'CRUD',
  props:{
      defaultFormColumns:{
          require:true,
          type:Array
      },
  },
  data(){
    return{
      query:'',
      search:true,
      allColumnSelected:true,
      allColumnsSelectedIndeterminate: false,
      key:1,
      tableColumns:[],// 动态table      
    }
  },
  mounted(){
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
    handleSearch(){

    },
    handleAdd(){

    },
    getMenuList(){
        console.log('aaaaa')
    },
  }
};
</script>

<style lang="scss" scoped>
.el-row{
  margin-bottom: 20px;
}
</style>