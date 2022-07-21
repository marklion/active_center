<template>
  <div class="app-container">
    <tableToolBar
      @click_btn_list="handleListClick"
      @click_reset="getDataList"
      @click_search="handleSearch"></tableToolBar>

    <el-card style="margin-top:20px;">
      <div slot="header" class="clearfix">
        <span>客户列表</span>
      </div>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" label="#" align="center">
        </el-table-column>
        <el-table-column prop="name" label="名称" align="center">
        </el-table-column>
        <el-table-column prop="address" label="地址" align="center">
        </el-table-column>
        <el-table-column align="center"
          prop="contact.name"
          label="联系人"
          width="100">
        </el-table-column>
        <el-table-column align="center"
          prop="contact.mobile"
          label="联系电话"
          width="120">
        </el-table-column>
        <el-table-column align="center"
          prop="create_time"
          label="日期"
          width="180">
          <template slot-scope="scope">
            {{scope.row.create_time | formatTime}}
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
      <el-pagination style="margin-top : 20px"
                     :hide-on-single-page="true"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="currentPage"
                     :page-sizes="[100, 200, 300, 400]"
                     :page-size="pageSize"
                     layout="total, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import { getList,add,remove,customer } from '@/api/customer'

  export default {
    name: 'customer',

    components:{
      tableToolBar
    },

    async mounted(){
      this.total = await customer.total();
      if(this.total > 0){
        this.currentPage = 1;
        this.getDataList();
      }
    },

    data(){
      return {
        total : 0,
        pageSize : 10,
        currentPage : 0,

        showAddDialog : false,

        tableData : [],
        formatDate : {}
      }
    },
    methods : {
      goEdit(id){
        if(id !== undefined){
          this.$router.push({path: '/customer/edit', query : {id}});
        }else{
          this.$router.push({path: '/customer/edit'});
        }
      },
      async getDataList(){
        this.tableData = await customer.list({page : this.currentPage, pageSize : this.pageSize});
      },
      async handleSearch(keyword){
        this.$message.success(keyword);
      },
      async handleListClick(index){
        if(index === 0){
          this.goEdit()
        }
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
      },
      handleSizeChange(){

      },
      handleCurrentChange(page){
        this.currentPage = page
        this.getDataList();
      }
    }
  }
</script>

<style scoped>

</style>
