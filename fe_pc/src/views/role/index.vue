<template>
  <div class="app-container">
    <tableToolBar
      @click_btn_list="handleListClick"
      @click_reset="getRoleList"
      @click_search="handleSearch"></tableToolBar>

    <el-card style="margin-top:20px;">
      <div slot="header" class="clearfix">
        <span>角色列表</span>
      </div>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" label="#" align="center">
        </el-table-column>
        <el-table-column prop="name" label="角色名" align="center">
        </el-table-column>
        <el-table-column prop="customer_name" label="归属客户" align="center">
          <template slot-scope="scope">
<!--            <el-tag>{{scope.row.roleType}}级</el-tag>-->
            <el-tag size="mini">{{scope.row.customer_name || '--'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator.name" label="创建人" align="center">
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" align="center">
          <template slot-scope="scope">
            {{scope.row.create_time | formatTime}}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="success" :disabled="!scope.row.editable"
                       @click.native.prevent="setPermissions(scope.row)" size="mini">
              分配权限
            </el-button>
            <el-button type="warning" :disabled="!scope.row.editable"
                       @click.native.prevent="showEditDialog(scope.row)" size="mini">
              编辑
            </el-button>
            <el-button type="danger" :disabled="!scope.row.editable"
                       @click.native.prevent="handleDel(scope.row)" size="mini">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <PermissionsDialog ref="child" @giveRules='giveRules' @resetDefaultKey='resetDefaultKey' :permissionsDialog='permissionsDialog'
                       :defaultkey='defaultkey'>
    </PermissionsDialog>
  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import { getList, add, update, deleteRole } from '@/api/role'
  import PermissionsDialog from "./permissionsDialog";

  export default {
    name: 'index',

    components:{
      tableToolBar,PermissionsDialog
    },

    mounted(){
      this.getRoleList();
    },

    data(){
      return {
        input3 : '角色管理',
        showAddDialog : false,
        permissionsDialog: {
          show: false,
          id: ""
        },
        defaultkey: [],
        tableData : [],
        formatDate : {}
      }
    },
    methods : {
      // goEdit(id){
      //   if(id !== undefined){
      //     this.$router.push({path: '/role/edit', query : {id}});
      //   }else{
      //     this.$router.push({path: '/role/edit'});
      //   }
      // },
      async getRoleList(){
        this.tableData = await getList();
      },
      async handleSearch(keyword){
        this.$message.success(keyword);
      },
      async handleListClick(index){
        if(index === 0){
          this.roleEdit();
        }

      },
      async roleEdit(id = '', inputValue = ''){
        try{
          let confirm = await this.$prompt('请输入新角色名', '', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue
          })
          let name = confirm.value

          if(id){
            await update(id, {name});
          }else{
            await add({ name });
          }
          this.getRoleList()
        }catch(cancel){ }
      },

      setPermissions(row){
        this.permissionsDialog = {
          show: true,
          id: row._id
        }
        this.defaultkey = row.menus
        this.$refs.child.isCheck = true
        setTimeout(() => {
          this.$refs.child.isCheck = false
        }, 500);
      },

      showEditDialog(row){
        this.roleEdit(row._id, row.name);
      },
      async handleDel(row){
        this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          await deleteRole(row._id);
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getRoleList()
          })
      },
      resetDefaultKey() {
        this.defaultkey = []
      },
      /**
       * 权限分配完成，对应角色保存到后端
       */
      async giveRules(data) {
        console.log(data);
        await update(this.permissionsDialog.id, { menus: data })
        this.$notify({
          title: '成功',
          message: '分配成功！',
          type: 'success'
        })
        this.permissionsDialog.show = false
        this.getRoleList()
      }
    }
  }
</script>

<style scoped>

</style>
