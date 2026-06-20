<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-md" @click="$emit('close')"></div>

    <!-- 关闭按钮 -->
    <button 
      class="absolute top-6 right-6 z-[70] p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
      @click="$emit('close')"
    >
      <X class="w-6 h-6" />
    </button>

    <!-- 书本主体容器 (仿真翻页) -->
    <div class="book-container relative w-full max-w-5xl aspect-[1.4/1] perspective-2000">
      
      <!-- 页面堆叠 -->
      <div class="book relative w-full h-full transform-style-3d">
        
        <!-- 遍历生成 6 张纸 (每张正面+反面，共 12 页，第 12 页留白) -->
        <div 
          v-for="idx in 6" 
          :key="idx"
          class="page-sheet absolute right-0 top-0 w-1/2 h-full origin-left transition-transform duration-700 transform-style-3d cursor-pointer"
          :style="{ 
            zIndex: getZIndex(idx),
            transform: idx <= currentPage ? 'rotateY(-180deg)' : 'rotateY(0deg)'
          }"
          @click="flipPage(idx)"
        >
          <!-- 正面 (奇数) -->
          <div class="page-front absolute inset-0 bg-[#fdfdf5] backface-hidden border-l border-black/5 p-8 flex flex-col shadow-inner">
            <div class="text-[10px] text-slate-400 mb-2 font-mono uppercase">PAGE {{ getDiaryPageLabel(idx, 'front') }} / 11</div>
            <textarea 
              v-model="localPages[(idx * 2) - 2]"
              :placeholder="getDiaryPageLabel(idx, 'front') <= 11 ? '这一页想写点什么...' : ''"
              :disabled="getDiaryPageLabel(idx, 'front') > 11"
              class="flex-1 bg-transparent border-none focus:ring-0 resize-none font-serif text-slate-700 leading-loose text-lg"
              @click.stop
              @input="handleInput"
            ></textarea>
            <div class="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#000_1px,transparent_1px)] bg-[size:100%_2.5rem] mt-16 mx-8"></div>
          </div>

          <!-- 反面 (偶数) -->
          <div class="page-back absolute inset-0 bg-[#f8f8f0] backface-hidden rotate-y-180 border-r border-black/5 p-8 flex flex-col shadow-inner">
            <div class="text-[10px] text-right text-slate-400 mb-2 font-mono uppercase">PAGE {{ getDiaryPageLabel(idx, 'back') }} / 11</div>
            <textarea 
              v-model="localPages[(idx * 2) - 1]"
              :placeholder="getDiaryPageLabel(idx, 'back') <= 11 ? '继续记录...' : ''"
              :disabled="getDiaryPageLabel(idx, 'back') > 11"
              class="flex-1 bg-transparent border-none focus:ring-0 resize-none font-serif text-slate-700 leading-loose text-lg"
              @click.stop
              @input="handleInput"
            ></textarea>
            <div class="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#000_1px,transparent_1px)] bg-[size:100%_2.5rem] mt-16 mx-8"></div>
          </div>
        </div>

        <!-- 固定底面 -->
        <div class="absolute left-0 top-0 w-1/2 h-full bg-[#f4f4eb] border-r border-black/10 p-8 flex flex-col z-0 rounded-l-sm shadow-2xl">
           <div class="flex-1 flex items-center justify-center opacity-20">
             <BookOpen class="w-16 h-16 text-slate-400" />
           </div>
           <div class="text-[9px] text-slate-400 text-center uppercase tracking-tighter">OneMmry Digital Archive</div>
        </div>
      </div>
    </div>

    <!-- 交互提示 -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      <div class="flex gap-4">
          <button @click="prev" class="p-2 border border-white/20 hover:bg-white/20 rounded-full text-white"><ChevronLeft /></button>
          <button @click="next" class="p-2 border border-white/20 hover:bg-white/20 rounded-full text-white"><ChevronRight /></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-vue-next'
import { flipDiaryPage, getDiaryPageLabel, normalizeDiaryPages } from '../utils/diary.js'

const props = defineProps({
  title: String,
  initialPages: {
    type: Array,
    default: () => Array(12).fill('')
  }
})

const emit = defineEmits(['close', 'update:pages'])

const currentPage = ref(0) 
const localPages = reactive(normalizeDiaryPages(props.initialPages))

const getZIndex = (idx) => {
    return idx <= currentPage.value ? idx : 10 - idx
}

const flipPage = (idx) => {
  currentPage.value = flipDiaryPage(currentPage.value, idx)
}

const prev = () => { if (currentPage.value > 0) currentPage.value-- }
const next = () => { if (currentPage.value < 6) currentPage.value++ }

const handleInput = () => {
    emit('update:pages', [...localPages].slice(0, 11))
}
</script>

<style scoped>
.perspective-2000 { perspective: 2000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }

.page-sheet {
  transition: transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1);
  box-shadow: -1px 0 5px rgba(0,0,0,0.1);
}

.bg-\[\#fdfdf5\] { background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png"); }
.bg-\[\#f8f8f0\] { background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png"); }

textarea::placeholder { color: #d0d0d0; font-style: italic; }
</style>

<style scoped>
/* 仿真纸张纹理 */
.bg-\[\#fdfdf5\] {
  background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
}

textarea::placeholder {
  color: #a0aec0;
  font-style: italic;
}
</style>