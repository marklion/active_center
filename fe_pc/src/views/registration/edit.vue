<template>
  <div class="app-container">
    <el-row>
      <el-page-header class="edit-header-bar" @back="goBack" :content=title />
    </el-row>
    <el-row>
      <el-tabs type="border-card">
        <el-tab-pane v-for="(item) of activeItems" :label="item" :key="item">
          <el-card class="box-card" v-for="(bet) of activeItemMap[item]">
            <div slot="header" class="clearfix">
              <span>{{ bet.bet_value }}
                | 小计：￥
                {{bet.bet_value * (activeItemPlayersMap[bet._id] ? activeItemPlayersMap[bet._id].length : 0)}}
              </span>
              <el-button style="float: right; padding: 3px 0" type="text" @click="showToySelect(bet)">添加</el-button>
            </div>

            <div v-for="(group) of activeItemPlayersMap[bet._id]" :key="group[0]._id" class="text item">
              <el-tag closable @close="onRemoveRecord(bet._id, group)">
                {{getGroupDisplay(group)}}
              </el-tag>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-row>


    <el-dialog title="请选择环号" :visible.sync="toySelectVisible" width="90%" @close="onCancelToySelect">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="选择数量">
          <el-input v-model="editingItem.toy_limit" disabled></el-input>
        </el-form-item>
        <el-form-item label="候选环号" prop="checkedToys">
          <el-checkbox-group
            v-model="form.checkedToys"
            :min="1"
            :max="editingItem && editingItem.toy_limit">
            <el-checkbox v-for="toy in toyList" :label="toy._id" :key="toy._id">{{toy.ring_no}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onCancelToySelect">取 消</el-button>
        <el-button @click="onResetForm">重 置</el-button>
        <el-button type="primary" @click="onSaveBetRecord">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getById } from '@/api/active'
import {getActiveItemById} from '@/api/activeItem'
import {getList as getToyList} from '@/api/toy'
import {save as saveActivePlayer, getList as getActivePlayerList, remove as removePlayer} from '@/api/activePlayer'
import * as _ from 'lodash'

export default {

  data() {
    return {
      title : '',
      activeId: '',
      active: null,
      activeItems : [],
      activeItemMap: {},
      activeItemPlayers: [],
      activeItemPlayersMap: {},

      toyList : null,
      toySelectVisible: false,

      editingItem: {toy_limit : 0},

      form : {
        checkedToys : []
      },
      rules : {
        checkedToys : [
          {type: 'array', required: true, message: '请选择对应数量的环号', trigger: 'change'},
          {type: 'array', required: true, validator: this.toysValidator, trigger: 'change'},
        ]
      },
      toysValidator : function(){
        let _this = this;
        return function(rule, value, cb){
          console.log(123123)
            if(value.length === _this.editingItem.toy_limit){
              cb();
            }else{
              return cb(new Error('请正确选择环号数量' + _this.editingItem.toy_limit))
            }
        }
      }.bind(this)()
    }
  },
  beforeRouteEnter(to, from, next) {
    let id = to.query.id
    next( vm => {
      vm.activeId = id;
      getById(id).then(res => {
        vm.active = res;
        vm.title = res.name + ' 报名表'
      });
      getActiveItemById(id).then( res => {
        vm.activeItems = res;
        let map = _.groupBy(res, 'name')
        vm.activeItemMap = map;
        vm.activeItems = _.keys(map);
      });
      vm.reloadActivePlayers();
    })
  },

  methods: {
    goBack(){
      this.$router.push({ path: '/registration/index' })
    },
    getTitleDisplay(){
      return this.active ? this.active.name : ''
    },
    async showToySelect(activeItem){
      const loading = this.$loading({
        lock: true,
        text: '数据加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.editingItem = activeItem;
      if(this.toyList === null){
        this.toyList = await getToyList();
      }
      this.toySelectVisible = true;
      loading.close();
    },
    onResetForm(){
      this.form.checkedToys = [];
    },
    onCancelToySelect(){
      this.editingItem = {toy_limit : 0};
      this.form.checkedToys = [];
      this.toySelectVisible = false;
    },
    onSaveBetRecord(){
      const loading = this.$loading({
        lock: true,
        text: '数据加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      this.$refs.form.validate(async valid => {
        try{
          if(valid){
            let postData = {
              toys: this.form.checkedToys,
              item: this.editingItem._id
            }
            await saveActivePlayer(postData)
            await this.reloadActivePlayers()
            this.onCancelToySelect();
          }else{
            return false;
          }
        }catch(err){
          console.log(err)
        }finally{
          loading.close()
        }
      })
    },
    async reloadActivePlayers(){
      this.activeItemPlayersMap = {}
      this.activeItemPlayers = await getActivePlayerList({active: this.activeId});
      let groups = _.groupBy(this.activeItemPlayers, 'group_id');
      for(let group of _.values(groups)){
        let key = group[0].item;
        if(!this.activeItemPlayersMap[key]){
          this.$set(this.activeItemPlayersMap, key, [])
        }
        this.activeItemPlayersMap[key].push(group)
      }
      await this.$nextTick()
      // this.activeItemPlayersMap = _.groupBy(this.activeItemPlayers, 'item');
    },
    getGroupDisplay(group){
      return _.map(group, 'toy.ring_no').join(' - ')
    },
    async onRemoveRecord(item, toyGroup){
      try{
        await this.$confirm('此操作将删除该报名记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        for(let record of toyGroup){
          await removePlayer(record._id);
        }
        await this.reloadActivePlayers();
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }catch(err){}
    }
  },
  computed: {

  }

}
</script>

<style lang="scss" scoped>
.edit-header-bar{
  margin-bottom: 20px;
}
</style>
