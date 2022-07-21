<template>
  <el-form  ref="form" :model="form" :label-width="labelWidth">
    <el-form-item label="媒体文件">
      <media-select display="选择媒体文件" :tabs="mediaTabs" @confirm="handleMediaConfirm"></media-select>
      <span v-if="form.media">
        <el-divider direction="vertical"></el-divider>
        <el-tag closable @close="handleMediaFileRemove()">{{form.media.name}}</el-tag>
      </span>
    </el-form-item>

    <el-form-item label="标题">
      <el-input v-model="form.title"></el-input>
    </el-form-item>
    <el-form-item label="内容">
      <el-input
        type="textarea"
        :rows="3"
        placeholder="请输入内容"
        v-model="form.description">
      </el-input>
    </el-form-item>
    <el-form-item label="菜单">
      <el-button icon="el-icon-plus" @click="addMenuToCard">增加卡片菜单</el-button>
      <span v-for="(menu, index) of form.suggestions">
        <el-divider direction="vertical"></el-divider>
        <el-tag closable @close="handleMenuRemove(index)" @click="handleMenuEdit(index)">{{menu.display_text}}</el-tag>
      </span>
    </el-form-item>
    <el-card v-if="menuFormVisible" class="box-card" style="margin-left: 120px">
      <suggestion-form :showForm.sync="menuFormVisible"
                       :form.sync="editMenu"
                       @confirm="onSaveMenu"
                       @cancel="onCancelMenu"/>
    </el-card>
  </el-form>
</template>

<script>
  import suggestionForm from '@/components/SuggestionForm'
  import mediaCards from './mediaCards'
  import mediaSelect from './mediaSelect'

  import {saveMenu} from '@/api/suggestion'

  export default {
    name: 'index',
    components: {
      suggestionForm,
      mediaCards,
      mediaSelect
    },
    props : {
      labelWidth:{
        type : String,
        default : '120px'
      },
      model : {
        type : Object
      }
    },
    created(){
      this.form = this.model;
    },
    data() {
      return {
        mediaTabs: [{
          label: '图片', name: 'image'
        }, {
          label: '视频', name: 'video'
        }, {
          label: '音频', name: 'audio'
        }],

        menuFormVisible: false,
        editMenu: {},

        form: {
          media: null,
          title: '',
          description: '',

          suggestions: []
        }
      }
    },
    // watch : {
    //   model : {
    //     handler(newV, oldV){
    //       console.log('watch model', newV);
    //       this.form = newV;
    //     },
    //     deep : true
    //   }
    // },
    methods : {
      handleMediaConfirm(file){
        this.form.media = file;
        this.$emit('change', 'media', this.form);
      },
      handleMediaFileRemove(){
        this.form.media = null;
        this.$emit('change', 'media', this.form);
      },
      addMenuToCard(){
        if(this.form.suggestions.length < 4){
          this.editMenu = {};
          this.menuFormVisible = true;
        }else{
          this.$message.error('一张卡片最多可以添加4个菜单');
        }
      },
      async onSaveMenu(menu){
        let result = await saveMenu(menu);
        this.menuFormVisible = false;
        this.form.suggestions.push(result);
        this.$emit('change', 'suggestion', this.form);
        // console.log('卡片按钮保存：', result);
      },
      handleMenuEdit(index){
        this.editMenu = this.form.suggestions[index];
        this.menuFormVisible = true;
      },
      handleMenuRemove(index){
        this.form.suggestions.splice(index, 1);
        this.$emit('change', 'suggestion', this.form);
      },
      onCancelMenu(){
        this.menuFormVisible = false;
      },
    }
  }
</script>

<style scoped>

</style>
