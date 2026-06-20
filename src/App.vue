<template>
  <div class="min-h-screen bg-transparent relative pb-20 overflow-x-hidden selection:bg-rose-100 selection:text-rose-900">
    <!-- 顶部动态视频大图区 -->
    <div class="h-[30vh] md:h-[40vh] relative overflow-hidden flex items-center justify-center">
      <!-- 视频背景 -->
      <video 
        autoplay 
        loop 
        muted 
        playsinline
        class="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
      >
        <source src="https://onemmry.com/assets/video/bg-hero.mp4" type="video/mp4" />
      </video>

      <!-- 渐变遮罩 -->
      <div class="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-black/30 pointer-events-none"></div>

      <!-- 文字叠加 -->
      <div class="relative z-10 text-center space-y-2 animate-fade-in-up">
        <h1 class="text-4xl md:text-5xl font-serif text-slate-800 tracking-widest drop-shadow-sm">OneMmry</h1>
        <p class="text-xs md:text-sm font-light text-slate-600 tracking-[0.4em] uppercase opacity-80">
          记录生活，承载珍贵
        </p>
      </div>

      <!-- 用户及更多操作快捷入口 -->
      <div class="absolute top-8 right-8 z-20 flex gap-4">
        <button class="p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white shadow transition-all duration-300">
          <User class="w-5 h-5 text-slate-700" />
        </button>
        <button class="p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white shadow transition-all duration-300">
          <Settings class="w-5 h-5 text-slate-700" />
        </button>
      </div>
    </div>

    <!-- 书架容器层（整体视觉呈现为嵌在墙面上） -->
    <div class="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
      <!-- 第一层：日记本 -->
      <ShelfRow title="日记记录册 (DIARIES)" :icon="Book" @add="addNew('diary')">
        <template #items>
          <ShelfItem 
            v-for="d in diaries" 
            :key="d.id"
            :id="d.id"
            :title="d.title"
            :color="d.color"
            type="diary"
            :width="65"
            :height="100"
            @click="openDiary(d)"
          />
        </template>
      </ShelfRow>

      <!-- 第二层：相册 -->
      <ShelfRow title="影像珍藏馆 (ALBUMS)" :icon="Camera" @add="addNew('album')">
        <template #items>
          <ShelfItem 
            v-for="a in albums" 
            :key="a.id"
            :id="a.id"
            :title="a.title"
            :color="a.color"
            type="album"
            :width="85"
            :height="75"
            class="rotate-[-2deg] mr-2"
            @click="openAlbum(a)"
          />
        </template>
      </ShelfRow>

      <!-- 第三层：录像带/碟片 -->
      <ShelfRow title="时光录像带 (RECORDS)" :icon="Video" @add="addNew('video')">
        <template #items>
          <ShelfItem 
            v-for="v in videos" 
            :key="v.id"
            :id="v.id"
            :title="v.title"
            :color="v.color"
            type="video"
            :width="55"
            :height="85"
            class="opacity-90"
            @click="openVideo(v)"
          />
        </template>
      </ShelfRow>
    </div>

    <!-- 仿真日记本模态框组件 -->
    <Transition name="fade">
      <DiaryReader 
        v-if="activeDiary" 
        :title="activeDiary.title"
        :initialPages="activeDiary.pages"
        @close="activeDiary = null"
        @update:pages="updateDiaryContent"
      />
    </Transition>

    <!-- 仿真相册模态框组件 -->
    <Transition name="fade">
      <AlbumReader 
        v-if="activeAlbum" 
        :title="activeAlbum.title"
        :photos="activeAlbum.photos"
        @close="activeAlbum = null"
        @update:photos="updateAlbumPhotos"
      />
    </Transition>

    <!-- 仿真视频放映组件 -->
    <Transition name="fade">
      <VideoReader 
        v-if="activeVideo" 
        :title="activeVideo.title"
        :videoUrl="activeVideo.url"
        @close="activeVideo = null"
      />
    </Transition>

    <!-- 视频上传创建对话框 -->
    <Transition name="fade">
      <div v-if="showVideoUploader" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/85 backdrop-blur-md" @click="showVideoUploader = false"></div>
        <div class="relative bg-[#222] p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
          <h3 class="text-white font-serif text-xl tracking-widest mb-6">制作新录像带</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-white/40 text-[10px] uppercase tracking-widest mb-1">录像带标题</label>
              <input v-model="newVideoData.title" type="text" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-rose-500/50" placeholder="为这段记忆命名..." />
            </div>
            <div>
              <label class="block text-white/40 text-[10px] uppercase tracking-widest mb-1">选择视频文件</label>
              <input type="file" ref="videoFileInput" accept="video/*" class="hidden" @change="handleVideoFileSelect" />
              <div 
                @click="$refs.videoFileInput.click()"
                class="w-full h-32 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-rose-500/30 transition-colors"
                :class="{'bg-rose-500/5': newVideoData.url}"
              >
                <Video v-if="!newVideoData.url" class="w-8 h-8 text-white/20 mb-2" />
                <span v-if="!newVideoData.url" class="text-white/30 text-xs">点击选择视频文件</span>
                <span v-else class="text-rose-400 text-xs font-mono">VIDEO READY</span>
              </div>
            </div>
            <button 
              @click="confirmAddVideo"
              class="w-full bg-rose-600 hover:bg-rose-500 text-white font-serif py-3 rounded-lg mt-4 transition-all tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="!newVideoData.title || !newVideoData.url"
            >
              录制完成
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 简易页脚 -->
    <div class="text-center mt-20 text-[10px] text-slate-400 font-light tracking-widest">
      &copy; 2026 ONEMMRY | 陪你记录每一刻
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Book, Camera, Video, User, Settings } from 'lucide-vue-next'
import ShelfRow from './components/ShelfRow.vue'
import ShelfItem from './components/ShelfItem.vue'
import DiaryReader from './components/DiaryReader.vue'
import AlbumReader from './components/AlbumReader.vue'
import VideoReader from './components/VideoReader.vue'
import { createAlbumRecord, createDiaryRecord, createVideoRecord } from './utils/memory.js'

const API_URL = 'http://localhost:3000/api'

// 本地状态
const diaries = ref([])
const albums = ref([])
const videos = ref([])

const activeDiary = ref(null)
const activeAlbum = ref(null)
const activeVideo = ref(null)

const showVideoUploader = ref(false)
const newVideoData = ref({ title: '', url: '' })

// --- 数据获取与同步 ---

// 从后端加载所有数据
const fetchData = async () => {
  try {
    const response = await fetch(`${API_URL}/all`)
    const data = await response.json()
    diaries.value = data.diaries || []
    albums.value = data.albums || []
    videos.value = data.videos || []
  } catch (error) {
    console.error('获取数据失败:', error)
    // 在此可以添加错误提示，比如弹出一个 toast
  }
}

// 同步所有数据到后端
const syncData = async () => {
  try {
    await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        diaries: diaries.value, 
        albums: albums.value, 
        videos: videos.value 
      }),
    })
  } catch (error) {
    console.error('同步数据失败:', error)
  }
}

// --- 生命周期与监听 ---

// 组件挂载时获取初始数据
onMounted(fetchData)

// 监听任何数据变化，并自动同步到后端
watch([diaries, albums, videos], syncData, { deep: true })


// --- 业务逻辑方法 ---

const openDiary = (diary) => {
    activeDiary.value = diary
}

const openAlbum = (album) => {
    activeAlbum.value = album
}

const openVideo = (video) => {
    activeVideo.value = video
}

const updateDiaryContent = (newPages) => {
    if (activeDiary.value) {
        activeDiary.value.pages = newPages
    }
}

const updateAlbumPhotos = (newPhotos) => {
    if (activeAlbum.value) {
        activeAlbum.value.photos = newPhotos
    }
}

const handleVideoFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file)
        newVideoData.value.url = url
    }
}

const confirmAddVideo = () => {
  videos.value.push(createVideoRecord(newVideoData.value.title, newVideoData.value.url))
    showVideoUploader.value = false
    newVideoData.value = { title: '', url: '' }
}

const addNew = (type) => {
    if (type === 'video') {
        showVideoUploader.value = true
        return
    }

    const name = window.prompt(`请输入${type === 'diary' ? '日记本' : '相册'}名称`, '新文件夹')
    if (!name) return

    if (type === 'diary') diaries.value.push(createDiaryRecord(name))
    else if (type === 'album') albums.value.push(createAlbumRecord(name))
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>