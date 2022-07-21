<template>
  <div class="app-container">
    <el-row>
      <el-form :inline="true" :model="filter">
        <el-form-item label="名称" size="small">
          <el-input v-model="filter.name" placeholder="模板名称"></el-input>
        </el-form-item>
        <el-form-item label="模板类型" size="small">
          <el-select v-model="filter.type" placeholder="请选择">
            <el-option v-for="item in typeOptions"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
        </el-form-item>
<!--        <el-form-item>-->
          <el-button type="primary" size="small" @click="doQuery">查询</el-button>
<!--        </el-form-item>-->
<!--        <el-form-item>-->
          <el-button type="primary" size="small" @click="goEdit()" icon="el-icon-plus">新建模板</el-button>
<!--        </el-form-item>-->
      </el-form>
    </el-row>
    <el-row  :gutter="10">
      <el-col :span="4" v-for="item in list" :key="item._id">
        <templateCard
          :item="item"
          :hasAction="true"
          @edit="goEdit"
          @delete="doDel"
          @click="onClickTemplate"
        ></templateCard>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {getList, remove} from '@/api/template'
  import textCoverUrl from '@/assets/card_cover.jpg'
  import geoCoverUrl from '@/assets/geo_bg.jpg'
  import templateCard from '@/components/TemplateCard'

  export default {
    name: 'messageTemplate',
    components: {  templateCard  },
    data(){
      return {
        list : [],
        typeOptions : [
          {
            label : '-全部-'
          },
         {
          value : 0,
          label : '纯文本'
        },{
          value : 1,
          label : '位置消息'
        },{
          value : 2,
          label : '文件消息'
        },{
          value : 3,
          label : '单卡片'
        },{
          value : 4,
          label : '多卡片'
        }
        ],
        filter : {
          name : '',
          type : ''
        }
      }
    },
    created(){
      this.fetchList();
    },

    methods: {
      goEdit(tmpl){
        if(tmpl !== undefined){
          this.$router.push({path: '/template/edit', query : {id : tmpl._id}});
        }else{
          this.$router.push({path: '/template/edit'});
        }
      },

      async doDel(tmpl){
        try{
          await this.$confirm('确认删除该模板吗？', '提示',{type : 'warning'});
          let res = await remove(tmpl._id);
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

      getCoverImgUrl(template){
        let url = textCoverUrl;
        if(template.type === 1){
          url = geoCoverUrl;
        }
        if(template.type >= 2){
          url = template.media && (template.media.url || template.media.thumbnail_url);
        }
        return url;
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
</style>
