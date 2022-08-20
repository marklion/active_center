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
      <el-table-column fixed prop="status" label="状态" min-width="40px">
        <template v-slot="scope">
          <el-button size="mini" round
                     :type="getActiveStatus(scope.row).type">
            {{getActiveStatus(scope.row).text}}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="template_copy.name" label="关联模板" min-width="40px"></el-table-column>
      <el-table-column prop="involved_leader.length" label="参与团队" min-width="40px"></el-table-column>
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
  import { getList,remove,update } from '@/api/active'

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
      getActiveStatus(active){
        let result = {type : 'success', text: ''}
        let now = new Date().toISOString();
        if(active.status > 0){
          result.type = 'danger'
          result.text = '已停止'
        }else if(now >= active.bet_start_time && now <= active.bet_end_time){
          result.type = 'success'
          result.text = '报名中'
        }else{
          result.type = 'danger'
          result.text = '已截止'
        }
        return result;
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
      async stopBet(active){
        await update(active._id, {status : 1});
        await this.getDataList()
      }
    }
  }
</script>

<style scoped>
  .tab-pane-title-ctn b{
    line-height: 40px;
  }
</style>
