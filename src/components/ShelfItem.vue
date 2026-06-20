<template>
  <div 
    class="relative cursor-pointer transition-transform duration-300 hover:-translate-y-2 group"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <!-- 侧边阴影 -->
    <div 
      class="absolute left-0 top-0 h-full w-2 bg-black/20 rounded-l transition-opacity"
    ></div>
    
    <!-- 书本主体 -->
    <div 
      class="w-full h-full rounded shadow-lg flex items-center justify-center relative overflow-hidden"
      :style="{ backgroundColor: color }"
    >
      <!-- 金色书边装饰 -->
      <div class="absolute right-0 top-0 h-full w-px bg-white/20"></div>
      
      <!-- 动态波纹/纹理 -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
             <rect width="100" height="100" fill="url(#noise)" />
          </pattern>
        </svg>
      </div>

      <!-- 文字内容 -->
      <div class="z-10 text-white font-serif tracking-widest text-center px-2 select-none">
        <div class="text-[10px] opacity-70 mb-1">{{ labels[type] }}</div>
        <div class="text-xs font-bold">{{ title }}</div>
      </div>
    </div>
    
    <!-- 悬浮时的“打开”提示 -->
    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      点击打开
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  id: [Number, String],
  title: String,
  color: {
    type: String,
    default: '#5c6bc0'
  },
  type: {
    type: String, // 'diary', 'album', 'video'
    default: 'diary'
  },
  width: {
    type: Number,
    default: 60
  },
  height: {
    type: Number,
    default: 90
  }
})

const labels = {
  diary: 'DIARY',
  album: 'ALBUM',
  video: 'VIDEO'
}
</script>