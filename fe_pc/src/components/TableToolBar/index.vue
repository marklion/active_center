<template>
  <div>
    <!--工具栏-->
    <div class="head-container">
      <div>
        <!-- 搜索 -->
        <span>
          <span class="filter-item">
            <el-button v-for="(btn, i) in btnList"
                       :type="btn.type || 'primary'"
                       :icon="btn.icon || 'el-icon-plus'"
                       :size="btn.size || 'small'"
                       @click="handleClick(i)">
              {{btn.title || '新增'}}
            </el-button>
          </span>
        </span>
        <span>
          <el-input v-model="searchKey" clearable placeholder="输入关键字搜索" style="width: 200px" class="filter-item" size="small"/>
          <el-button-group>
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleSearch"></el-button>
            <el-button type="primary" icon="el-icon-refresh" size="small" @click="handleReset"></el-button>
          </el-button-group>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'tableToolBar',
    props : {
      addTitle : {
        type : String,
        default : '新增'
      },
      btnList : {
        type : Array,
        default : () => [{type : 'primary', icon: 'el-icon-plus', size: 'small', title: '新增'}]
      }
    },
    data() {
      return {
        searchKey: ""
      }
    },
    methods: {
      toQuery() { },
      handleReset(){
        this.$emit('click_reset');
      },
      handleSearch(){
        this.$emit('click_search', this.searchKey);
      },
      handleClick(index) {
        this.$emit("click_btn_list", index)
      }
    }

  }
</script>

<style lang="scss" scoped>
  // 工具栏
  .head {
    &-container {
      text-indent: -10px;
      > div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        > span {
          display: flex;
          align-items: center;
        }
        .filter {
          &-item {
            margin-left: 10px;
          }
        }
      }
    }
  }
</style>
