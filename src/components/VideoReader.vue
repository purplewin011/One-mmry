<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/90 backdrop-blur-xl" @click="$emit('close')"></div>

    <!-- 关闭按钮 -->
    <button 
      class="absolute top-6 right-6 z-[100] p-2 bg-white/10 hover:bg-white/30 rounded-full text-white transition-all transform hover:rotate-90"
      @click="$emit('close')"
    >
      <X class="w-6 h-6" />
    </button>

    <!-- 电影放映容器 -->
    <div 
      class="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 transition-all duration-1000 transform-style-3d"
      :class="isStarting ? 'scale-[0.8] opacity-0 rotate-x-[-20deg]' : 'scale-100 opacity-100 rotate-x-0'"
    >
      <!-- 电影胶片边缘效果 -->
      <div class="absolute top-0 left-0 right-0 h-8 flex justify-between px-4 z-20 pointer-events-none opacity-30">
        <div v-for="i in 20" :key="'t'+i" class="w-4 h-4 bg-white/10 rounded-sm"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-8 flex justify-between px-4 z-20 pointer-events-none opacity-30">
        <div v-for="i in 20" :key="'b'+i" class="w-4 h-4 bg-white/10 rounded-sm"></div>
      </div>

      <!-- 视频播放器 -->
      <video 
        ref="videoPlayer"
        :src="videoUrl"
        class="w-full h-full object-contain"
        autoplay
        muted
        playsinline
        @ended="onVideoEnded"
      ></video>

      <!-- 播放状态层 -->
      <div v-if="!isPlaying" class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm group cursor-pointer" @click="togglePlay">
        <Play class="w-20 h-20 text-white opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
      </div>

      <!-- 控制栏 -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 w-2/3 opacity-0 hover:opacity-100 transition-opacity duration-500 flex flex-col gap-2 z-30">
        <div class="h-1 bg-white/20 rounded-full overflow-hidden">
          <div class="h-full bg-rose-500 transition-all duration-100" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="flex justify-between items-center text-white/50 text-[10px] font-mono tracking-widest uppercase">
          <span>TITLE: {{ title }}</span>
          <div class="flex gap-4">
             <button @click="toggleMute">{{ isMuted ? 'UNMUTE' : 'MUTE' }}</button>
             <button @click="togglePlay">{{ isPlaying ? 'PAUSE' : 'PLAY' }}</button>
          </div>
        </div>
      </div>

      <!-- 仿真投影光束效果 -->
      <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent mix-blend-overlay"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { X, Play, Pause } from 'lucide-vue-next'
import { calculateVideoProgress, toggleMuteFlag, togglePlaybackFlag } from '../utils/video.js'

const props = defineProps({
  title: String,
  videoUrl: String
})

const emit = defineEmits(['close'])

const videoPlayer = ref(null)
const isStarting = ref(true)
const isPlaying = ref(true)
const isMuted = ref(true)
const progress = ref(0)

onMounted(() => {
  // 入场动画
  setTimeout(() => {
    isStarting.value = false
  }, 50)

  // 进度监控
  if (videoPlayer.value) {
    videoPlayer.value.addEventListener('timeupdate', () => {
      progress.value = calculateVideoProgress(videoPlayer.value.currentTime, videoPlayer.value.duration)
    })
  }
})

const togglePlay = () => {
    if (videoPlayer.value.paused) {
        videoPlayer.value.play()
        isPlaying.value = togglePlaybackFlag(false)
    } else {
        videoPlayer.value.pause()
        isPlaying.value = togglePlaybackFlag(true)
    }
}

const toggleMute = () => {
  const nextMuted = toggleMuteFlag(videoPlayer.value.muted)
  videoPlayer.value.muted = nextMuted
  isMuted.value = nextMuted
}

const onVideoEnded = () => {
    isPlaying.value = false
}
</script>

<style scoped>
.transform-style-3d { transform-style: preserve-3d; }
.rotate-x-20 { transform: rotateX(-20deg); }
.rotate-x-0 { transform: rotateX(0deg); }
</style>