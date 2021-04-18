<template>
  <div class="app-container">
    <el-row :gutter="20">
        <el-col :span="6">
            <el-input size="mini" clearable v-model="query"  placeholder="请输入你要搜索的内容" ></el-input>
        </el-col>
        <el-col :span="8">
            <el-date-picker size="mini" style="width:300px;" v-model="dateValue" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" :picker-options="pickerOptions" range-separator=":" start-placeholder="开始日期" end-placeholder="结束日期" align="right"></el-date-picker>
        </el-col>  
        <el-col :span="2">
            <el-button icon="el-icon-search" size="mini" type="success" :disabled="hasPerm('log:list')" @click="handleSearch">查询</el-button>
        </el-col>            
    </el-row> 
    <!-- 表格区 -->
    <el-table size='mini' style="margin-bottom:10px;margin-top:20px;" :row-class-name="tableRowClassName" :header-cell-style="{background:'#F2F6FC'}"  :data="tableData" v-loading="tableLoading">
      <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="请求方法">
                    <span>{{ props.row.methodName }}</span>
                </el-form-item>
                <el-form-item label="请求参数">
                    <span>{{ props.row.params }}</span>
                </el-form-item>
                <el-form-item label="异常详情" v-if="props.row.type ==='ERROR'">
                    <el-button size="mini" type="text" @click="info(props.row)">查看详情</el-button>
                </el-form-item>                
            </el-form>              
          </template>
      </el-table-column>
      <el-table-column align="center" type="index" label="序号" width="50"></el-table-column>
      <el-table-column align="center" label="用户名" prop="createBy"></el-table-column>
      <el-table-column align="center" label="IP" prop="ip"></el-table-column>
      <el-table-column align="center" label="操作地址" prop="addr"></el-table-column>
      <el-table-column align="center" label="请求URI" prop="requestUri"></el-table-column>
      <el-table-column align="center" label="描述" :show-overflow-tooltip="true" prop="description"></el-table-column>
      <el-table-column align="center" label="请求方式" :filters="methodFilters" :filter-method="myFilter" filter-placement="bottom-end">
          <template slot-scope="scope">
              <el-tag v-if="scope.row.method ==='GET'" size="small">{{scope.row.method}}</el-tag>
              <el-tag v-else-if="scope.row.method ==='POST'" size="small" type="success">{{scope.row.method}}</el-tag>
              <el-tag v-else-if="scope.row.method ==='PUT'" size="small" type="warning">{{scope.row.method}}</el-tag>
              <el-tag v-else type="danger" size="small">{{scope.row.method}}</el-tag>
          </template>
      </el-table-column>
      <el-table-column align="center" label="请求耗时" sortable prop="time">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.time <= 300">{{ scope.row.time }}ms</el-tag>
            <el-tag v-else-if="scope.row.time <= 1000" type="warning">{{ scope.row.time }}ms</el-tag>
            <el-tag v-else type="danger">{{ scope.row.time }}ms</el-tag>
          </template>
      </el-table-column>
      <el-table-column align="center" :show-overflow-tooltip="true"  sortable label="创建日期" prop="createTime"></el-table-column>
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
    <!--异常详情弹框-->
    <el-dialog :visible.sync="dialog" title="异常详情" append-to-body top="30px" width="85%">
      <pre v-highlightjs="errorInfo"><code class="java" /></pre>
    </el-dialog>    
  </div>
</template>

<script>
import { page } from '@/api/crud'
import { mapGetters } from 'vuex'
export default {
  data(){
    return{
        tableLoading:false,
        query:'',
        dateValue:'',
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        tableData:[],  
        queryParams: {  // 分页参数
            pageNum: 1,
            pageSize: 5,
            total: 0
        },
        methodFilters:[
            {
                text:'GET',
                value:'GET'
            },
            {
                text:'POST',
                value:'POST'
            },
            {
                text:'PUT',
                value:'PUT'
            },
            {
                text:'DELETE',
                value:'DELETE'
            },            
        ],
        errorInfo:'',
        dialog:false,        
    };
  },
  computed:{
    ...mapGetters(['crud']),
  },
  mounted(){
    this.getLogList()
  },
  methods:{
    info(row){
      this.dialog = true,
      this.errorInfo = row.exceptionDetail
    },
    tableRowClassName({row,rowIndex}){
      if (row.type === 'ERROR') {
        return 'warning-row';
      }
      return '';
    },
    handleSearch(){
        this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query,this.dateValue)
    },
    async queryPage(pageNum,pageSize,query,time){
        this.tableLoading = true
        const params = {
            pageNum:pageNum,
            pageSize:pageSize,
            query:query?query:null,
            time:time?time:null
        }
        let res = await page(this.crud.log,params)
        this.tableData = res.data.records
        this.queryParams.total = res.data.total
        setTimeout(() => {
            this.tableLoading = false
        }, 500);
    },
    getLogList(){
        this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,null,null)
    },
    handleSizeChange(val){
      this.queryParams.pageSize = val
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query,this.dateValue)
    },
    handleCurrentChange(val){
      this.queryParams.pageNum = val
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,this.query,this.dateValue)
    },
    myFilter(value,row){
        return row.method === value
    },
  }
}
</script>

<style>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 70px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
.demo-table-expand .el-form-item__content {
  font-size: 12px;
}
.el-table .warning-row {
  background: oldlace;
}
</style>