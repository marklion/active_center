<template>
  <div class="app-container">
    <tableToolBar
      :btn-list="[]"
      @click_reset="getDataList"
      @click_search="handleSearch"></tableToolBar>

    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" v-for="(active) of activeList">
        <el-card shadow="hover"
                 style="margin-top:20px;">
          <div slot="header" class="clearfix">
            <span>{{ active.name }}</span>
            <el-button
              style="float: right; padding: 6px"
              size="mini" round
              :type="getActiveStatus(active).type">
              {{ getActiveStatus(active).text }}
            </el-button>
          </div>
          <div>
            <el-descriptions title="比赛信息" :column="1">
              <el-descriptions-item label="报名开始">{{ active.bet_start_time | formatTime }}</el-descriptions-item>
              <el-descriptions-item label="报名截止">{{ active.bet_end_time | formatTime }}</el-descriptions-item>
              <el-descriptions-item label="比赛时间">{{ active.start_time | formatTime }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div>
            <el-button type="primary" plain icon="el-icon-s-claim"
                       @click.native.prevent="goRegistView(active._id)">
              报名
            </el-button>
            <el-button type="primary" plain icon="el-icon-s-data"
                       @click.native.prevent="goStatView(active._id)">
              参赛明细
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import {getList, remove} from "@/api/active";

  export default {
    name: 'registrationView',

    components: {
      tableToolBar
    },

    data() {
      return {
        btnList : [],

        activeList : [],
      };
    },
    async created(){
      await this.getDataList();
    },
    methods: {
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
      goRegistView(id){
        if (id !== undefined) {
          this.$router.push({path: '/registration/edit', query: {id}});
        } else {
          this.$message("比赛数据异常")
        }
      },
      goStatView(id){
        if (id !== undefined) {
          this.$router.push({path: '/registration/stat', query: {id}});
        } else {
          this.$message("比赛数据异常")
        }
      },
      async getDataList(query){
        this.activeList = await getList(query)
      },
      async handleSearch(keyword){
        await this.getDataList({name : keyword})
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

</style>
