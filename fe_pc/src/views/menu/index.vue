<template>
  <div class="app-container">
    <tableToolBar
      @click_add="handleAdd"
      @click_reset="getDataList"
      @click_search="handleSearch"></tableToolBar>

    <el-card style="margin-top:20px;">
      <div slot="header" class="clearfix">
        <span>菜单列表</span>
      </div>
      <el-table ref="table" :data="tableData" style="width: 100%" row-key="_id" lazy :load="getChildMenus"
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}">>
        <el-table-column type="index" label="#" width="55"></el-table-column>
        <el-table-column prop="title" label="菜单标题" width="165" show-overflow-tooltip></el-table-column>
        <el-table-column prop="icon" label="图标" align="center" width="70">
          <template slot-scope="scope">
            <!-- <svg-icon :icon-class="scope.row.icon" v-if="scope.row.icon" /> -->
            <e-icon :icon-name="scope.row.icon" v-if="scope.row.icon"/>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" align="center"></el-table-column>

        <el-table-column prop="permissions" width="80" label="权限标识" align="center">
          <template slot-scope="scope">
            {{ scope.row.permissions == '' ? '--' : scope.row.permissions }}
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件路径" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.component == 'Layout'">--</span>
            <span v-else>{{ scope.row.component== undefined ? '--' : scope.row.component }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="菜单类型" align="center" width="80">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.type == 1">目录</el-tag>
            <el-tag type="warning" v-if="scope.row.type == 2">菜单</el-tag>
            <el-tag type="danger" v-if="scope.row.type == 3">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hidden" label="是否隐藏" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.hidden" active-text="是"
                       inactive-text="否">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="noCache" label="是否缓存" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.noCache" active-text="是"
                       inactive-text="否">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="创建日期" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            {{ scope.row.date | formatDate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row)" type="text" size="small">编辑</el-button>
            <el-button @click="handleDel(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <menuDialog :dialogMenu='dialogMenu' :formData="formData" :userMenus="userMenus"
                @add="handleSubmit" @edit="handleSubmitEdit"></menuDialog>
  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import { getList, add, update, remove } from '@/api/menu'
  import menuDialog from './dialogMenu'
  import store from '@/store'

  export default {
    name: 'menuView',

    components: {
      tableToolBar,menuDialog
    },

    mounted() {
      this.getDataList()
    },

    data() {
      return {
        dialogMenu: {show : false},
        oldPid : '',
        userMenus : store.getters.menus,

        tableData: [],
        formData: {}
      }
    },
    methods: {
      async getDataList(pid = 0) {
        let menus = await getList({pid : pid});
        // 实现无感刷新
        if(+pid !== 0){
          this.$set(this.$refs.table.store.states.lazyTreeNodeMap, pid, menus);
        }else{
          this.tableData = menus;
        }
      },

      async getChildMenus(tree, treeNode, resolve){
        let query = {pid : tree._id};
        let data = await getList(query);
        resolve(data);
      },

      //提交新增请求
      async handleSubmit() {
        let result = await add(this.formData);
        this.dialogMenu.show = false
        this.$message.success('新增成功！')
        this.getDataList();
      },

      // 提交编辑请求
      async handleSubmitEdit(data) {
        if (this.formData._id == this.formData.pid) {
          this.$message.error('自己不能成为自己的下级！')
          return false
        }
        let res = await update(this.formData._id, this.formData)
        this.dialogMenu.show = false
        this.$message.success('修改成功！')

        await this.getDataList(data.pid);
        if(data.pid != this.oldPid){
          await this.getDataList(this.oldPid);
        }
      },

      handleDel(rowData) {
        this.$confirm('该操作将删除菜单, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          await remove(rowData._id)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getDataList(rowData.pid);
        }).catch(err => {});
      },

      async handleSearch(keyword) {
        this.$message.success(keyword)
      },
      async handleAdd() {
        this.dialogMenu = {
          show : true,
          title : '新增菜单',
          option : 'add'
        }
        this.formData = this.newFormData()
      },
      async handleEdit(rowData){
        this.dialogMenu = {
          show : true,
          title : '修改菜单',
          option : 'edit'
        }

        this.formData = Object.assign({}, rowData);
        this.formData.pid = [this.formData.pid];
        this.oldPid = rowData.pid;
      },
      newFormData(){
        return {
            type: 1,
            hidden: false,
            pid: [''],
            icon: "",
            path: "",
            title: "",
            sort: "",
            name: "",
            component: "",
            permissions: "",
            noCache: true
          }
      }
    }
  }
</script>

<style scoped>

</style>
