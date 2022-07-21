<template>
  <div>
    <div @click="showMap(true)">
      <el-link type="primary">地图选择</el-link>
    </div>

    <el-dialog title="地图选择"
               :visible.sync=mapVisible
               width="50%" append-to-body>
      <el-row>
        <el-form>
          <el-form-item>
            <el-autocomplete
              class="search-input"
              ref="search-box"
              v-model="query"
              :fetch-suggestions="querySearch"
              @change="handleChange"
              placeholder="请输入关键词搜索位置"
              autofocus
              :trigger-on-focus="true"
              @select="handleSelect"
            >
              <template slot="prepend">关键字</template>
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-autocomplete>
          </el-form-item>
        </el-form>
        <el-form :inline="true">
          <el-form-item label="经度">
            <el-input v-model="lng" disabled></el-input>
          </el-form-item>
          <el-form-item label="维度">
            <el-input v-model="lat" disabled></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onConfirm">确定</el-button>
            <el-button @click="showMap(false)">关闭</el-button>
          </el-form-item>
        </el-form>
      </el-row>

      <div class="map-container">
        <amap
          cache-key="coord-picker-map"
          mmap-style="amap://styles/whitesmoke"
          async
          :center.sync="center"
          :zoom.sync="zoom"
          is-hotspot
          @hotspotclick="onHotspotClick"
          @click="onMapClick"
        >
          <amap-marker v-if="position" :position.sync="position" draggable/>

        </amap>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { loadAmap, loadPlugins } from '@amap/amap-vue'

  export default {
    name: 'myMap',
    data() {
      return {
        center: null,
        position: null,
        query: '',
        lng: '',
        lat: '',
        mapVisible: false,
        results: [],
        zoom: 10,

        mode: 'search',
        searching: false,
        tips: [],
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        satellite: false
      }
    },
    computed: {
      wrapper() {
        return this.$refs.wrapper
      },
      positionText() {
        if (!this.position) return ''
        return `${this.position[0]}, ${this.position[1]}`
      }
    },
    created() {
      this.$ready = new Promise(async resolve => {
        const AMap = await loadAmap()
        await loadPlugins(['AMap.PlaceSearch', 'AMap.AutoComplete'])

        this.ps = new AMap.PlaceSearch({
          pageSize: this.pageSize
        })
        this.ac = new AMap.AutoComplete()

        resolve()
      })
    },
    async mounted() {
      await loadPlugins(['AMap.AutoComplete', 'AMap.PlaceSearch'])
      this.ps = new AMap.PlaceSearch({
        pageSize: this.pageSize
      })
      this.ac = new AMap.AutoComplete()
    },
    methods: {
      showMap(flag) {
        this.mapVisible = flag
      },
      handleSelect(item) {
        if (item.keyword) {
          this.query = `${item.name} ${item.keyword}`
          this.$nextTick(() => {
            this.$refs['search-box'].focus()
          })
        } else {
          this.focus(item)
        }
      },
      handleChange(value) {
        let box = this.$refs['search-box']
        box.debouncedGetData(value)
      },
      querySearch(queryString, cb) {
        this.searching = true
        this.ps.search(queryString, (status, result) => {
          this.searching = false
          // if (query !== this.query) return;

          if (status === 'complete') {
            if (result.poiList.count) {
              this.results = result.poiList.pois.map((item) => {
                item.value = item.name
                return item
              })
              this.total = result.poiList.count
            } else if (result.cityList) {
              this.results = result.cityList.map(item => {
                item.value = `${item.name}(共${item.count}条结果)`
                item.keyword = queryString
                return item
              })
              this.total = result.cityList.length
            }
          } else {
            this.results = []
            this.total = 0
          }
          console.log(result)
          console.log(status)

          cb(this.results)
        })
        // 调用 callback 返回建议列表的数据

      },
      onMapClick(e) {
        e.location = e.lnglat
        this.focus(e)
      },
      onHotspotClick(e) {
        //由于此处同时触发hotspot 和 click 两个event，故将hot event 延迟，保证以这个事件为准
        this.$nextTick(() => {
          this.query = e.name
          e.location = e.lnglat
          this.focus(e)
        })
      },
      focus(poi) {
        const pos = [poi.location.lng, poi.location.lat]
        this.position = [...pos]
        this.center = [...pos]
        this.lng = this.position[0]
        this.lat = this.position[1]
        if (this.zoom < 16) {
          this.zoom = 16
        }
      },
      onConfirm() {
        this.showMap(false)
        this.$emit('confirm', {
          lng: this.lng,
          lat: this.lat,
          name: this.query
        })
      },

      async search(clear = false) {
        this.mode = 'result'
        await this._ready

        if (clear) {
          this.results = []
          this.total = 0
          this.pageIndex = 1
          this.ps.setPageIndex(1)
        }

        this.searching = true
        const { query } = this
        this.ps.search(query, (status, result) => {
          this.searching = false
          if (query !== this.query) return

          if (status === 'complete' && result.poiList) {
            this.results = result.poiList.pois
            this.total = result.poiList.count
          } else {
            this.results = []
            this.total = 0
          }
        })
      },
      async autoComplete(kw) {
        if (!kw) {
          this.tips = []
        } else {
          this.ac.search(kw, (status, result) => {
            if (kw !== this.query) return
            if (status === 'complete' && result.tips) {
              this.tips = Array.from(new Set(result.tips.map(tip => tip.name)))
            } else {
              this.tips = []
            }
          })
        }
      },

      reset() {
        this.ps.setPageIndex(1)
        this.results = []
        this.tips = []
        this.total = 0
        this.mode = 'search'
      }
    },
    watch: {
      pageIndex(value) {
        this.$ready.then(() => {
          this.ps.setPageIndex(value)
          this.search(false)
        })
      }
    }
  }
</script>

<style scoped>
  .map-container {
    width: 100%;
    height: 400px;
  }

  .search-input {
    display: block;
  }


  .result-panel {
    position: absolute;
    left: 10px;
    top: 10px;
    width: 320px;
    display: flex;
    flex-direction: column;


  }

  .result-panel .search-bar {
    display: flex;
    align-items: center;
  }

  .result-panel .search-bar .text {
    text-overflow: ellipsis;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
  }

  .result-panel .result-list.ant-list-loading {
    min-height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .info {
    position: absolute;
    right: 10px;
    top: 10px;
    padding-left: 24px;
  }
</style>
