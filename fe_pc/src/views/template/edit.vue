<template>
  <div class="app-container">
    <el-row style="margin-bottom: 20px">
      <el-page-header @back="goBack" content="编辑模板"/>
    </el-row>
    <el-row >
      <el-col :span="12">
        <el-form ref="form" :model="form" label-width="140px">
          <el-form-item label="模板名称">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="备注说明">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入备注说明"
              maxlength="200"
              show-word-limit
              v-model="form.comment">
            </el-input>
          </el-form-item>

          <el-form-item label="比赛项目">
            <div style="margin-bottom: 20px;">
              <el-button
                size="small" type="primary" icon="el-icon-plus"
                @click="addActiveItem()"
              >
                增加项目
              </el-button>
            </div>
            <el-tabs v-model="editableItem" type="card" closable @tab-remove="removeItem">
              <el-tab-pane
                v-for="(item, index) in form.items"
                :key="item.name"
                :label="item.name"
                :name="item.name"
              >
                <el-form label-width="80px">
                  <el-form-item label="项目编码">
                    <el-input v-model="item.code" size="small"></el-input>
                  </el-form-item>
                  <el-form-item label="参赛羽数">
                    <el-input-number
                      size="small"
                      v-model="item.toy_limit"
                      @change="handleBetValueClose" :min="1" :max="10">
                    </el-input-number>
                  </el-form-item>
                  <el-form-item label="下注金额">
                    <el-tag
                      :key="tag"
                      v-for="tag in item.bet_values"
                      closable
                      :disable-transitions="false"
                      @close="handleBetValueClose(tag)">
                      {{tag}}
                    </el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="inputVisible"
                      type="number"
                      v-model="inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm"
                      @blur="handleInputConfirm"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" type="primary" icon="el-icon-plus" size="small" @click="showInput">新增下注金额</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" icon="el-icon-check">保 存</el-button>
            <el-button @click="goBack" icon="el-icon-close">取 消</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { getById, saveTemplate } from '@/api/template'

  export default {
    name: 'edit',

    data() {
      return {
        editableItem : '',

        inputVisible: false,
        inputValue: '',

        form : {
          name : '',
          items : []
        }
      }
    },

    computed: {
      currentEditItem: {
        get() {
          return (this.form.items).find(item => {console.log(item, this.editableItem);return item.name === this.editableItem})
        }
      }
    },

    watch : {
      // 'form.type' : {
      //   handler(type, oldValue){
      //     if(type === 4){
      //       this.cardsTab = this.form.message_card_list.map((card,index) => {
      //         let name = `${index}卡片${this.editCardIndex++}`;
      //         if(index === 0){
      //           this.editCardValue = name;
      //         }
      //           return {
      //             title : '卡片' + (index + 1),
      //             name : name
      //           }
      //       })
      //     }
      //   }
      // },
      // deep: true
    },

    beforeRouteEnter(to, from, next) {
      let id = to.query.id
      next(vm => {
        if (id !== undefined) {
          //获取已存在card，覆盖form
          getById(id).then((resp) => {
            vm.form = resp
            //接口获取的数据中已经直接关联提取了media实体，但是form中的media实际上应该还mediaId，所以有下面两部操作
            // vm.media = resp.media
            // vm.form.media = vm.media && vm.media._id
          })
        }
      })
    },

    methods: {
      goBack() {
        this.$router.push({ path: '/template/index' })
      },
      addActiveItem() {
        this.$prompt('请输入名称', '新增比赛项目', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern:/.{1,10}/,
          inputErrorMessage: '名称最大长度10'
        }).then(({value}) => {
          this.form.items.push({
            toy_limit: 1,
            name: value,
            bet_values: []
          });
          this.editableItem = value;
        }).catch(err => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
      },

      removeItem(targetName){
        let tabs = this.form.items;
        let activeName = this.editableItem;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.name;
              }
            }
          });
        }
        this.editableItem = activeName;
        this.form.items = tabs.filter(tab => tab.name !== targetName);
      },

      handleBetValueClose(tag){
        this.currentEditItem.bet_values.splice(this.currentEditItem.bet_values.indexOf(tag), 1);
      },

      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput[0].$refs.input.focus();
        });
      },

      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          this.currentEditItem.bet_values.push(inputValue);
        }
        this.inputVisible = false;
        this.inputValue = '';
      },

      async onSubmit() {
        // 校验表单 TODO
        console.log('model form = ',this.form)
        //提交表单
        try{
          let result = await saveTemplate(this.form)
          this.$message.success('赛事模板添加成功！')
          //成功
          this.$router.push({ path: '/template/index' })
          //失败由api统一拦截给出错误提示
        }catch(err){
          console.log(err)
        }
      },




      // getAnEmptyCard() {
      //   return {
      //     media: null,
      //     title: '',
      //     description: '',
      //     suggestions: []
      //   }
      // },
    }
  }
</script>

<style scoped>
.el-tag{
  margin-right: 10px;
}
.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
