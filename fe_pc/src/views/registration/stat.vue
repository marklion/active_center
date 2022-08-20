<template>
  <div class="app-container">
    <el-row>
      <el-page-header class="edit-header-bar" @back="goBack" :content=getTitleDisplay() />
    </el-row>
    <el-row>
      <el-card class="box-card">
        <el-table :data="activeItems" stripe style="width: 100%" @filter-change="onFilterChange">
          <el-table-column type="index" label="#" align="center">
          </el-table-column>
          <el-table-column
            prop="name" label="项目" align="center"
            :filters="activeItemsName.map(name => {return {text: name, value: name}})"
            :filter-method="filterHandler">
          </el-table-column>
          <el-table-column prop="bet_value" label="金额" align="center">
          </el-table-column>
          <el-table-column
            prop="ring_no" label="环号" align="center"
            :filters="toyList.map(toy => {return {text: toy.ring_no, value: toy._id}})"
            :filter-method="filterHandler">
            <template v-slot="scope">
              <div v-for="(group) of activeItemPlayersMap[scope.row._id]" :key="group[0]._id" class="text item">
                <el-tag @close="onRemoveRecord(scope.row._id, group)">
                  {{getGroupDisplay(group)}}
                </el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-row>
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
      activeItemsName : [],
      activeItemMap: {},
      activeItemPlayers: [],
      activeItemPlayersMap: {},

      toyList : [],
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
        vm.activeItemsName = _.keys(map);
      });
      vm.reloadActivePlayers();
    })
  },
  async created(){
    await this.loadToys();
  },

  methods: {
    goBack(){
      this.$router.push({ path: '/registration/index' })
    },
    getTitleDisplay(){
      return this.active ? this.active.name : ''
    },

    async loadToys(){
      this.toyList = await getToyList();
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
    },
    getGroupDisplay(group){
      return _.map(group, 'toy.ring_no').join(' - ')
    },
    onFilterChange(filters){
      console.log('fileters = ', filters)
    },
    filterHandler(value, row, column) {
      console.log(value, row, column)
      const property = column['property'];
      if(property === 'ring_no'){
        let group = this.activeItemPlayersMap[row._id];
        return group && _.find(_.flattenDeep(group), o => o.toy._id === value)
      }else{
        return row[property] === value;
      }
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
