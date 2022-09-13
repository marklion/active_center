<template>
  <div class="app-container">
    <tableToolBar
      @click_btn_list="handleListClick"
      @click_reset="getTemplateList"
      @click_search="handleSearch"></tableToolBar>

    <el-row :gutter="15" v-loading="listLoading">
      <el-empty v-if="(list.length === 0)" :description="emptyTip"></el-empty>
      <el-col v-else :span="24" v-for="item in list" :key="item._id">
        <el-card shadow="hover" :body-style="{padding: 0}" class="template-card-panel">
            <el-card>
              <div slot="header" class="clearfix">
                <span>{{item.name}}</span>
                <el-button class="btn-type-4" type="primary" size="mini" icon="el-icon-delete" @click="doDel(item._id)">删除</el-button>
                <el-button class="btn-type-4" type="primary" size="mini" icon="el-icon-edit" @click="goEdit(item)">编辑</el-button>
              </div>
              <span>项目：</span>
              <el-tag v-for="menu in item.items">
                {{menu.name}} - {{menu.bet_values.map(i => i.value)}}
              </el-tag>
            </el-card>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {getList, remove} from '@/api/template'
  import textCoverUrl from '@/assets/card_cover.jpg'
  import geoCoverUrl from '@/assets/geo_bg.jpg'
  import tableToolBar from "@/components/TableToolBar";

  export default {
    name: 'activeTemplate',
    components:{
      tableToolBar
    },
    data(){
      return {
        listLoading : false,
        list : [],
        emptyTip : '请新增赛事模板',
      }
    },
    created(){
      this.fetchList();
    },

    methods: {
      async handleSearch(keyword){
        await this.fetchList({name : keyword})
      },
      async handleListClick(index){
        if(index === 0){
          this.addTemplate();
        }
      },

      async getTemplateList(){
        await this.fetchList();
      },

      addTemplate(){
        this.goEdit();
      },

      goEdit(tmpl){
        if(tmpl !== undefined){
          this.$router.push({path: '/template/edit', query : {id : tmpl._id}});
        }else{
          this.$router.push({path: '/template/edit'});
        }
      },

      async doDel(tmpl_id){
        try{
          await this.$confirm('确认删除该模板吗？', '提示',{type : 'warning'});
          let res = await remove(tmpl_id);
          this.doQuery();
            this.$message({
              type : 'success',
              message : '删除成功!'
            });
        }catch(err){
          //异常情况已统一处理
        }
      },

      onClickTemplate(item){

      },
      async doQuery(){
        await this.fetchList(this.filter);
      },

      async fetchList(query = {}){
        let q = {};
        if(query.name){
          q.name = query.name
        }
        if(query.type && query.type.toString().length){
          q.type = query.type
        }
        this.list = await getList(q);
      },
    },
    watch: {

    }
  }
</script>

<style scoped>
.template-card-panel{
  margin-top: 15px;
}
.btn-type-4{
  float : right;
  margin-right: 10px;
}
</style>
