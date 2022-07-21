<template>
  <div class="app-container">
    <tableToolBar
      :btnList="btnList"
      @click_btn_list="handleListClick"
      @click_reset="getTaskList"
      @click_search="handleSearch"></tableToolBar>

    <el-card style="margin-top:20px;">
      <div slot="header" class="clearfix">
        <span>任务列表</span>
      </div>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" label="#" align="center">
        </el-table-column>
        <el-table-column prop="name" label="任务" align="center">
        </el-table-column>
        <el-table-column prop="template_name" label="模板" align="center">
        </el-table-column>
        <el-table-column prop="template_type" label="消息类型" align="center">
          <template slot-scope="scope">
            {{typeMap[+(scope.row.template_type)]}}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template slot-scope="scope">
            {{statusMap[+(scope.row.status)]}}
          </template>
        </el-table-column>
        <el-table-column prop="mobiles.total" label="号码数" align="center">
        </el-table-column>
        <el-table-column prop="send_time" label="发送时间" align="center">
          <template slot-scope="scope">
            {{ scope.row.send_time | formatTime }}
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button @click="sendResult(scope.row._id)" type="text" size="small">详情</el-button>
            <el-button v-if="scope.row.status == 1" @click="updateTask(scope.row._id)" type="text" size="small">激活</el-button>
            <el-button v-if="scope.row.status == 2" @click="updateTask(scope.row._id)" type="text" size="small">停止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import {getList } from '@/api/sendTask'


  export default {
    name: 'task',

    async created(){
      await this.refreshView();
    },

    data(){
      return {
        //0文本，1地理位置，2媒体，3单卡，4多卡
        typeMap : ['纯文本','地理位置','媒体文件','单卡片','多卡片'],
        //0=删除，1=未激活，2=已激活，3=已完成，4=异常终止
        statusMap : ['已删除','未激活','待执行','已完成','异常终止'],

        btnList : [{title : '新建发送'}],
        tableData : []
      }
    },

    components:{
      tableToolBar
    },

    methods : {
      async refreshView(){
        this.tableData = await getList();
      },
      //only for create, no edit
      goEdit(){
        this.$router.push({name: 'sendTaskEdit',});
      },
      sendResult(id){
        //TODO add loading mask while updating
        this.$message.warning('查看该任务发送情况' + id)
      },
      updateTask(id, data){
        this.$message.warning('更新任务状态' + id)
      },
      async getTaskList(){},
      async handleSearch(keyword){
        this.$message.success(keyword);
      },
      async handleListClick(index){
        if(index === 0){
          this.goEdit()
        }
      },
    }
  }
</script>

<style scoped>

</style>
