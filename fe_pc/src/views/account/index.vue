<template>
  <div class="app-container">
    <tableToolBar
      @click_btn_list="handleListClick"
      @click_reset="getDataList"
      @click_search="handleSearch"></tableToolBar>

    <el-card style="margin-top:20px;">
      <div slot="header" class="clearfix">
        <span>账号列表</span>
      </div>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" label="#" align="center">
        </el-table-column>
        <el-table-column prop="name" label="名称" align="center">
        </el-table-column>
        <el-table-column prop="account" label="账号" align="center">
        </el-table-column>
        <el-table-column prop="role.name" label="角色" align="center">
        </el-table-column>
        <el-table-column prop="club.name" label="俱乐部" align="center">
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" align="center">
          <template slot-scope="scope">
            {{ scope.row.create_time | formatTime }}
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button @click="goEdit(scope.row._id)" type="text" size="small">编辑</el-button>
            <el-button @click="handleDel(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import { getList, add, remove } from '@/api/account'

  export default {
    name: 'account',

    components:{
      tableToolBar
    },

    mounted(){
      this.getDataList();
    },

    data(){
      return {
        showAddDialog : false,

        tableData : [],
        formatDate : {}
      }
    },
    methods : {
      goEdit(id){
        if(id !== undefined){
          this.$router.push({path: '/account/edit', query : {id}});
        }else{
          this.$router.push({path: '/account/edit'});
        }
      },
      async getDataList(){
        this.tableData = await getList();
      },
      async handleSearch(keyword){
        this.$message.success(keyword);
      },
      async handleListClick(){
        this.goEdit()
      },
      setPermissions(){},
      showEditDialog(){},
      handleDel(rowData){
        this.$confirm('该操作将删除此客户数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          await remove(rowData._id);
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getDataList();
        }).catch();
      }
    }
  }
</script>

<style scoped>

</style>
