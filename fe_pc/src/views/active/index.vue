<template>
  <div class="app-container">
    <tableToolBar
      :btnList="btnList"
      @click_btn_list="handleBtnsClick"
      @click_reset="getDataList"
      @click_search="handleSearch"></tableToolBar>

    <el-card style="margin-top:20px;">
      <div slot="header" class="clearfix">
        <span>赛事列表</span>
      </div>
    <el-table :data="activeList" style="width: 100%" height="600">
      <el-table-column fixed prop="name" label="比赛名称"></el-table-column>
      <el-table-column prop="template_copy.name" label="关联模板"></el-table-column>
      <el-table-column prop="involved_leader.length" label="团队数"></el-table-column>
      <el-table-column prop="bet_start_time" label="报名开始">
        <template v-slot="scope">
          {{ scope.row.bet_start_time | formatTime }}
        </template>
      </el-table-column>
      <el-table-column prop="bet_end_time" label="报名截止">
        <template v-slot="scope">
          {{ scope.row.bet_end_time | formatTime }}
        </template>
      </el-table-column>
      <el-table-column prop="start_time" label="比赛时间">
        <template v-slot="scope">
          {{ scope.row.start_time | formatTime }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="120">
        <template v-slot="scope">
          <el-button
            @click.native.prevent="deleteActive(scope.row)"
            type="text"
            size="small">
            移除
          </el-button>
          <el-button
            @click.native.prevent="stopBet(scope.row)"
            type="text"
            size="small">
            结束报名
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    </el-card>

  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import { getList,remove } from '@/api/active'

  export default {
    components:{
      tableToolBar
    },
    data() {
      return {
        btnList : [{title : '新建比赛'}],

        activeList : [],
      };
    },
    async created(){
      await this.getDataList();
    },
    methods: {
      handleBtnsClick(index) {
        if (index === 0) {
          //create active
          this.goEdit()
        }
      },
      goEdit(id) {
        if (id !== undefined) {
          this.$router.push({path: '/active/edit', query: {id}});
        } else {
          this.$router.push({path: '/active/edit'});
        }
      },
      async getDataList(query){
        this.activeList = await getList(query)
      },
      handleSearch(){
        return []
      },
      deleteActive(active){
        this.$confirm('该操作将删除此比赛数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          await remove(active._id);
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          await this.getDataList();
        }).catch();
      },
      stopBet(active){
        //todo
        this.$message('未开发')
      }
    }
  }
</script>

<style scoped>
  .tab-pane-title-ctn b{
    line-height: 40px;
  }
</style>
