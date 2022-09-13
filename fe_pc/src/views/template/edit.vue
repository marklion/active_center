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
                  <el-form-item label="参赛羽数">
                    <el-input-number
                      size="small"
                      v-model="item.toy_limit"
                      :min="1" :max="10">
                    </el-input-number>
                  </el-form-item>

                  <el-form-item label="下注金额">
                    <el-button class="button-new-tag" type="primary" icon="el-icon-plus" size="small" @click="addOneItem(index)">添加下注金额</el-button>
                    <el-row :gutter="10" v-for="bet in item.bet_values">
                      <el-col :span="10">
                        <el-input size="small" v-model="bet.code">
                          <template slot="prepend">编号</template>
                        </el-input>
                      </el-col>
                      <el-col :span="10">
                        <el-input size="small" v-model="bet.value" type="number">
                          <template slot="prepend">金额</template>
                        </el-input>
                      </el-col>
                      <el-col :span="4">
                        <el-button type="danger" icon="el-icon-close" size="small" plain style="vertical-align: top;"
                        @click="handleBetValueClose(bet)"></el-button>
                      </el-col>
                    </el-row>
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
  import { getById, saveTemplate, update } from '@/api/template'

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
        },
      }
    },

    computed: {
      currentEditItem: {
        get() {
          return (this.form.items).find(item => {console.log(item, this.editableItem);return item.name === this.editableItem})
        }
      }
    },

    watch : {},

    beforeRouteEnter(to, from, next) {
      let id = to.query.id
      next(vm => {
        if (id !== undefined) {
          //获取已存在card，覆盖form
          getById(id).then((resp) => {
            vm.form = resp;
            let items = resp.items;
            vm.editableItem = (items && items.length > 0) ? items[0].name : ''
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

      handleBetValueClose(bet){
        this.currentEditItem.bet_values.splice(this.currentEditItem.bet_values.findIndex(e => e.value === bet.value), 1);
      },

      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput[0].$refs.input.focus();
        });
      },
      addOneItem(index){
        this.currentEditItem.bet_values.push({
          value : '',
          code : `T${index + 1}A${this.currentEditItem.bet_values.length + 1}`
        })
      },

      async onSubmit() {
        // 校验表单 TODO
        console.log('model form = ',this.form)
        //提交表单
        try{
          if(this.form._id){
            await update(this.form._id, this.form)
          }else{
            await saveTemplate(this.form)
          }
          this.$message.success('赛事模板添加成功！')
          //成功
          this.$router.push({ path: '/template/index' })
          //失败由api统一拦截给出错误提示
        }catch(err){
          console.log(err)
        }
      },
    }
  }
</script>

<style scoped>
</style>
