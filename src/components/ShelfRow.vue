<template>
  <div class="flex flex-col mb-12 relative">
    <!-- 书架顶部标题/标签 -->
    <div class="flex items-center space-x-2 px-6 mb-2">
      <component :is="icon" class="w-5 h-5 text-wood-dark opacity-70" />
      <span class="text-sm font-bold text-wood-dark tracking-widest">{{ title }}</span>
    </div>

    <!-- 书架内容容器 -->
    <div class="relative group">
      <!-- 书架底部边缘 -->
      <div class="absolute bottom-0 w-full h-8 bookshelf-gradient shadow-2xl z-0 -mb-2 scale-x-[1.02]"></div>
      
      <!-- 实际可移动的架子面 -->
      <div 
        class="relative flex items-end space-x-1 px-8 pb-1 pt-6 min-h-[120px] z-10 
               bg-gradient-to-t from-black/20 via-transparent to-transparent 
               border-b-[10px] border-wood-shelf rounded-sm"
      >
        <!-- 已有项 -->
        <slot name="items"></slot>
        
        <!-- 新建控件 -->
        <div 
          class="flex flex-col items-center justify-center border-2 border-dashed border-wood-shelf/40 
                 hover:border-wood-shelf/80 hover:bg-black/5 rounded cursor-pointer transition-all duration-300 ml-4 mb-2 
                 w-[60px] h-[90px] text-wood-shelf/60 group/add"
          @click="$emit('add')"
        >
          <PlusCircle class="w-6 h-6 transition-transform group-hover/add:scale-110" />
          <span class="text-[9px] mt-1 font-bold">新建</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusCircle } from 'lucide-vue-next'

defineProps({
  title: String,
  icon: Object,
})

defineEmits(['add'])
</script>