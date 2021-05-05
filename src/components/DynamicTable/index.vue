<template>
    <el-popover placement="bottom-end" trigger="click" width="150">
      <el-button  size="mini" slot="reference" icon="el-icon-s-grid"></el-button>
      <el-checkbox v-model="allColumnSelected" :indeterminate="allColumnsSelectedIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
      <el-checkbox v-for="item in defaultFormColumns" :key="item.label" v-model="item.visible" @change="handleCheckedTableColumnsChange(item)">{{ item.label }}</el-checkbox>
    </el-popover>     
</template>

<script>
import { parse } from 'path-to-regexp';
export default {
  name:'DynamicTable',
  props:{
      defaultFormColumns:{
          require:true,
          type:Array
      },
  },
  data(){
    return{
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
      var params = {
        tableColumns:this.tableColumns,
        key:this.key
      }
      this.$emit('tableColumns',params)
    },
  }
};
</script>

<style lang="scss" scoped>

</style>