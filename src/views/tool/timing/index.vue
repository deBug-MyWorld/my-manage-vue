<template>
  <div class="app-container">
    <el-row :gutter="20" v-if="search">
        <el-col :span="6">
            <el-input size="mini" clearable v-model="query"  placeholder="请输入任务名称进行查询" ></el-input>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-search" size="mini" type="success" :disabled="hasPerm('quartz:list')" @click="handleSearch">查询</el-button>
        </el-col>
        <el-col :span="2">
            <el-button icon="el-icon-refresh-right" size="mini" type="warning" @click="resetQuery">重置</el-button>
        </el-col>        
    </el-row> 
    <el-row :gutter="20">
      <el-col :span="2">
          <el-button icon="el-icon-plus" size="mini" type="primary" :disabled="hasPerm('quartz:exe')" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="4" :offset="18">
          <el-button-group>
            <el-button type="info" size="mini" icon="el-icon-search" plain @click="showSearch"></el-button>
            <el-button  size="mini" icon="el-icon-refresh" @click="getTimingList"></el-button>
            <DynamicTable :defaultFormColumns="defaultFormColumns" @tableColumns="changeValues" ref="dynamicTable"></DynamicTable>
          </el-button-group>        
      </el-col>
  </el-row>  
  <!-- 表格区 -->
  <el-table size='mini' :key="key" style="margin-bottom:10px;" row-key="jobId" :header-cell-style="{background:'#F2F6FC'}" stripe :data="tableData" v-loading="tableLoading">
    <el-table-column align="center" type="index" fixed label="序号" width="50"></el-table-column>
    <el-table-column :show-overflow-tooltip="true" align="center" v-for="column in tableColumns" :key="column.label" :label="column.label">
      <template v-slot="scope" v-if="column.property === 'status'">
        <el-tag size="mini" v-if="scope.row.status == '1'" type="success">运行中</el-tag>
        <el-tag size="mini" v-else type="warning">暂停中</el-tag>
      </template> 
      <template slot-scope="scope" v-else>
        {{scope.row[column.property]}}
      </template>      
    </el-table-column>
    <el-table-column align="center" label="操作" fixed="right" width="180">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
            <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)" :disabled="hasPerm('quartz:exe')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="执行一次" placement="top-start">
            <el-button type="text"  icon="el-icon-thumb" @click="handleExecute(scope.row)" :disabled="hasPerm('quartz:trigger')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="暂停" placement="top-start" v-if="scope.row.status==1">
            <el-button type="text" icon="el-icon-video-pause" @click="handlePause(scope.row)" :disabled="hasPerm('quartz:pause')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="恢复" placement="top-start" v-else>
            <el-button type="text" icon="el-icon-video-play" @click="handleResume(scope.row)" :disabled="hasPerm('quartz:resume')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
            <el-button type="text"  icon="el-icon-delete" @click="handleDelete(scope.row)" :disabled="hasPerm('quartz:delete')"></el-button>
        </el-tooltip>
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
    <!-- 新增/修改定时任务对话框 -->
    <el-dialog :visible.sync="timingDialog" :title="title" @closed="handleClose" width="500px">
      <el-form ref="timingForm" :model="timingForm" :rules="timingRules" size="small" label-width="100px">
        <el-form-item label="任务名称" prop="jobName">
          <el-input v-model="timingForm.jobName"></el-input>
        </el-form-item>
        <el-form-item label="Bean名称(首字母小写)" prop="beanName">
          <el-input v-model="timingForm.beanName"></el-input>
        </el-form-item>
        <el-form-item label="执行方法" prop="methodName">
          <el-input v-model="timingForm.methodName"></el-input>
        </el-form-item>     
        <el-form-item label="cron表达式" prop="cron">
          <el-input v-model="timingForm.cron"></el-input>
        </el-form-item>   
        <el-form-item label="任务状态" prop="status">
            <el-radio-group v-model="timingForm.status">
                <el-radio label="1">启用</el-radio>
                <el-radio label="2">暂停</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="失败后暂停" prop="pauseAfterFailure">
          <el-radio-group v-model="timingForm.pauseAfterFailure">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="timingForm.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini"  @click="timingDialog = false">取消</el-button>
        <el-button size="mini" type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </el-dialog>   
  </div>
</template>

<script>
import crudJob from '@/api/timing';
import DynamicTable from '@/components/DynamicTable'
export default {
  name:'Timing',
  components:{DynamicTable},
  data(){
    const cronCheck = async (rule, value, callback) => {
      const res = await crudJob.check({cron: value});
      if (res.data) {
        callback();
      } else {
        callback(new Error('cron表达式错误'));
      }
    }      
    return{
        tableLoading:false,
        query:'',
        search:true,
        key:1,
        defaultFormColumns:[
          {
            label:'任务名称',
            visible:true,
            property:'jobName'
          },
          {
            label:'Bean名称',
            visible:true,
            property:'beanName'
          },
          {
            label:'执行方法',
            visible:true,
            property:'methodName'
          },
          {
            label:'cron表达式',
            visible:true,
            property:'cron'
          },
          {
            label:'状态',
            visible:true,
            property:'status'
          },
          {
            label:'描述',
            visible:true,
            property:'description'
          },
          {
            label:'创建时间',
            visible:true,
            property:'createTime'
          },          
        ],
        tableColumns:[],//动态table
        tableData:[],
        timingDialog:false,
        title:'',
        timingForm:{
          jobId:null,
          jobName:null,
          description:null,
          cron:null,
          beanName:null,
          methodName:null,
          status:"1",
          pauseAfterFailure:1
        },
        timingRules:{
            jobName:[
              {required:true,message:'请输入任务名称',trigger:'blur'}
            ],
            description:[
              {required:true,message:'请输入任务描述',trigger:'blur'}
            ],
            beanName:[
              {required:true,message:'请输入bean名称',trigger:'blur'}
            ],
            methodName:[
              {required:true,message:'请输入方法名称',trigger:'blur'}
            ],
            cron:[
              {required: true, message: 'cron表达式不能为空', trigger: 'blur'},
              {validator: cronCheck, trigger: 'blur'}
            ]
        },
        queryParams:{ // 分页参数
          pageNum:1,
          pageSize:5,
          total:0
        }
    }
  },
  mounted(){
    this.getTimingList()
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
    async queryPage(pageNum,pageSize,query){
        this.tableLoading = true
        const params = {
            pageNum:pageNum,
            pageSize:pageSize,
            jobName:query?query:null
        }
        let res = await crudJob.page(params)
        this.tableData = res.data.records
        this.queryParams.total = res.data.total
        setTimeout(() => {
          this.tableLoading = false
        }, 500);
    },
    getTimingList(){
      this.queryPage(this.queryParams.pageNum,this.queryParams.pageSize,null)
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
      this.title = "新增任务"
      this.timingDialog = true
    },
    handleEdit(row){
      this.timingDialog = true
      this.$nextTick(()=>{
          this.title = "编辑任务"
          this.timingForm = Object.assign(this.timingForm, row)
      })
      
    },
    handleSubmit(){
      console.log(this.timingForm)
      this.$refs.timingForm.validate(valid =>{
          if (valid) {
              crudJob.addORsave(this.timingForm).then(res =>{
                  console.log(res)
                  if (res.isok) {
                      this.getTimingList()
                      this.timingDialog = false
                      this.$message.success(res.data)
                  }
              })
          }
      })
    },
    handleClose(){
      this.$refs["timingForm"].resetFields()
      this.timingForm.jobId = null
      this.timingForm.createTime = null
    },
    handleDelete(row){
      this.$confirm('确认要删除该任务吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let res = await crudJob.del(row)
        if (res!=undefined && res.isok) {
            this.$message.success('删除任务成功')
            this.getTimingList()
        }
      }).catch(error =>{
          console.log(error)
      })
    },
    handleExecute(params){
      crudJob.execution(params).then(res=>{
          console.log(res)
          if (res.isok) {
              this.getTimingList()
              this.$message.success(res.data)
          }
      })
    },
    handleResume(row){
        row.status = '1'
        crudJob.resume(row).then(res=>{
            console.log(res)
            if (res.isok) {
                this.getTimingList()
                this.$message.success(res.data)
            }
        })
    },
    handlePause(row){
        row.status = '2'
        crudJob.pause(row).then(res =>{
            console.log(res)
            if (res.isok) {
                this.getTimingList()
                this.$message.success(res.data)
            }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row{
  margin-bottom: 20px;
}
</style>