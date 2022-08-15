<template>
  <div class="app-container">
    <tableToolBar
      :btn-list="[]"
      @click_reset="getDataList"
      @click_search="handleSearch"></tableToolBar>

    <el-card style="margin-top:20px;">
      <div slot="header" class="clearfix">
        <span>赛事列表</span>
      </div>
      <el-table :data="activeList" style="width: 100%" height="500">
        <el-table-column fixed prop="name" label="比赛名称"></el-table-column>
        <el-table-column fixed prop="status" label="报名状态">
          <template v-slot="scope">
            <el-button size="mini" type="success" round v-if="getActiveStatus(scope.row)">报名中</el-button>
            <el-button size="mini" type="danger" round v-else>已截止</el-button>
          </template>
        </el-table-column>
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
          width="100">
          <template v-slot="scope">
            <el-button
              @click.native.prevent="goRegistView(scope.row._id)"
              type="text">
              报名
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import {getList, remove} from "@/api/active";
  // import { getList, add, update, remove } from '@/api/menu'
  // import menuDialog from './dialogMenu'
  // import store from '@/store'

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
        let now = new Date().toISOString();
        if(active.status > 0){
          return false
        }else if(now >= active.bet_start_time && now <= active.bet_end_time){
          return true
        }else{
          return false
        }
      },
      goRegistView(id){
        if (id !== undefined) {
          this.$router.push({path: '/registration/edit', query: {id}});
        } else {
          this.$message("比赛数据异常")
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

</style>
