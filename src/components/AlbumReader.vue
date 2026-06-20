<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="$emit('close')"></div>

    <!-- 关闭按钮 -->
    <button 
      class="absolute top-6 right-6 z-[80] p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"
      @click="$emit('close')"
    >
      <X class="w-6 h-6" />
    </button>

    <!-- 翻页容器主体 -->
    <div class="album-container relative w-full h-[85vh] perspective-3000 flex items-center justify-center">
      <!-- 相册翻页逻辑 -->
      <div 
        class="album relative w-full h-full transform-style-3d select-none"
        @mouseup="onGlobalMouseUp"
      >
        <!-- 下层：封底/内衬 (右侧固定背景) -->
        <div class="absolute right-0 top-0 w-1/2 h-full bg-[#1a252f] rounded-r-lg shadow-2xl z-0 border-l border-white/5"></div>
        
        <!-- 下层：封页 (相册打开后的左侧背景) -->
        <div class="absolute left-0 top-0 w-1/2 h-full bg-[#2c3e50] rounded-l-lg flex flex-col items-center justify-center text-white/10 border-r border-black/20 shadow-2xl z-0">
           <Camera class="w-24 h-24 mb-4" />
           <span class="text-sm tracking-[0.5em] font-serif uppercase text-white/20">{{ title }}</span>
        </div>

        <!-- 上层：仿真纸张 -->
        <div 
          v-for="idx in totalSheets" 
          :key="idx"
          class="page-sheet absolute right-0 top-0 w-1/2 h-full origin-left transition-transform duration-1000 transform-style-3d"
          :class="{ 'cursor-pointer': !isDraggingPhoto && !ghostPhoto }"
          :style="{ 
            zIndex: getZIndex(idx),
            transform: idx <= currentPage ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            pointerEvents: (isDraggingPhoto || ghostPhoto) ? 'none' : 'auto'
          }"
          @click="flipPage(idx)"
        >
          <!-- 纸张正面 (奇数页) -->
          <div class="page-front absolute inset-0 bg-[#f8f8f8] backface-hidden border-l border-black/10 p-8 shadow-[inset_20px_0_50px_rgba(0,0,0,0.1)]">
            <div class="absolute top-4 left-6 text-[10px] text-slate-400 font-mono tracking-widest uppercase">PAGE {{ idx * 2 - 1 }}</div>
            <div class="relative w-full h-full mt-4 pointer-events-auto">
              <div 
                v-for="img in getPhotosForPage(idx * 2 - 1)" 
                :key="img.id"
                class="absolute cursor-move shadow-lg p-2 bg-white hover:z-50 transition-shadow active:shadow-2xl"
                :style="{ 
                  left: img.x + '%', 
                  top: img.y + '%', 
                  width: '220px',
                  transform: `rotate(${img.rotate}deg)`
                }"
                @mousedown.stop="startDrag($event, img)"
              >
                <img :src="img.url" class="w-full h-full object-cover pointer-events-none rounded-sm" />
              </div>
            </div>
          </div>

          <!-- 纸张反面 (偶数页) -->
          <div class="page-back absolute inset-0 bg-[#f0f0f0] backface-hidden rotate-y-180 border-r border-black/10 p-8 shadow-[inset_-20px_0_50px_rgba(0,0,0,0.1)]">
            <div class="absolute top-4 right-6 text-[10px] text-slate-400 font-mono tracking-widest uppercase text-right">PAGE {{ idx * 2 }}</div>
            <div class="relative w-full h-full mt-4 pointer-events-auto">
              <div 
                v-for="img in getPhotosForPage(idx * 2)" 
                :key="img.id"
                class="absolute cursor-move shadow-lg p-2 bg-white hover:z-50 transition-shadow active:shadow-2xl"
                :style="{ 
                  left: img.x + '%', 
                  top: img.y + '%', 
                  width: '220px',
                  transform: `rotate(${img.rotate}deg)`
                }"
                @mousedown.stop="startDrag($event, img)"
              >
                <img :src="img.url" class="w-full h-full object-cover pointer-events-none rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部控制 -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      <div class="flex items-center gap-12">
          <button @click="prev" class="p-3 border border-white/20 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-90"><ChevronLeft class="w-6 h-6" /></button>
          
          <div class="text-white/30 text-[10px] tracking-[0.4em] uppercase">Sheet {{ currentPage > 0 ? currentPage : 0 }} / {{ totalSheets }}</div>

          <button @click="next" class="p-3 border border-white/20 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-90"><ChevronRight class="w-6 h-6" /></button>
      </div>
      <div class="text-white/20 text-[9px] tracking-widest mt-1 uppercase">Total Photos: {{ photos.length }}</div>
    </div>

    <!-- 右侧悬浮控制栏 -->
    <div class="fixed right-10 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-4">
      <!-- 预览新照片的小窗口 (拖拽源) -->
      <div 
        v-if="pendingPhotos.length > 0"
        class="flex flex-col gap-2 mb-4 max-h-[300px] overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md"
      >
        <div 
          v-for="(src, idx) in pendingPhotos" 
          :key="idx"
          class="relative w-16 h-16 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
          @mousedown.prevent="startDragNewPhoto($event, src)"
          @dragstart.prevent
        >
          <img :src="src" draggable="false" class="w-full h-full object-cover rounded-lg shadow-lg border border-white/20 pointer-events-none" />
          <div class="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors rounded-lg"></div>
        </div>
      </div>

      <button 
        @click="triggerFileInput"
        class="group relative flex items-center justify-center w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl transition-all hover:-translate-x-2 active:scale-95 shadow-2xl"
      >
        <Plus class="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-500" />
        <span class="absolute right-full mr-4 px-3 py-1 bg-black/60 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">点击或拖拽上传</span>
      </button>

      <div 
        ref="trashElement"
        class="group relative flex items-center justify-center w-14 h-14 transition-all duration-300 rounded-2xl border shadow-2xl overflow-hidden"
        :class="[
          isOverTrash 
            ? 'bg-red-500/80 border-red-400 scale-110 -translate-x-2' 
            : 'bg-white/10 border-white/20 hover:bg-white/20'
        ]"
      >
        <Trash2 
          class="w-6 h-6 transition-all duration-300" 
          :class="isOverTrash ? 'text-white scale-125' : 'text-white/60'"
        />
        <span class="absolute right-full mr-4 px-3 py-1 bg-red-600/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">拖拽到此处删除</span>
        
        <!-- 垃圾桶内部的波动效果 -->
        <div v-if="isOverTrash" class="absolute inset-0 bg-red-400/20 animate-pulse"></div>
      </div>

      <!-- 拖拽中的跟随元素 -->
      <div 
        v-if="ghostPhoto" 
        class="fixed z-[200] pointer-events-none w-[150px] shadow-2xl p-2 bg-white rotate-3"
        :style="{ left: ghostPos.x + 'px', top: ghostPos.y + 'px', transform: `translate(-50%, -50%) rotate(3deg)` }"
      >
        <img :src="ghostPhoto" class="w-full object-cover rounded-sm" />
      </div>

      <div class="w-14 h-[1px] bg-white/10 mx-auto"></div>

      <div class="flex flex-col items-center gap-2 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white/40 text-[10px] uppercase tracking-tighter vertical-text">
        Tools
      </div>
    </div>

    <input type="file" ref="fileInput" class="hidden" multiple accept="image/*" @change="handleFileSelect" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { X, ChevronLeft, ChevronRight, Upload, Camera, Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  title: String,
  photos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'update:photos'])

const currentPage = ref(0)
const totalSheets = 10 // 假设相册有 10 张纸
const isDragging = ref(false)
const localPhotos = ref([...props.photos])
const fileInput = ref(null)
const trashElement = ref(null)
const isOverTrash = ref(false)

// 待放入相册的缓存照片
const pendingPhotos = ref([])
const ghostPhoto = ref(null)
const ghostPos = reactive({ x: 0, y: 0 })

// 拖拽移动照片的相关状态
const draggingPhoto = ref(null)
const isDraggingPhoto = ref(false)
const justFinishedDragging = ref(false)
let startPos = { x: 0, y: 0 }

// --- 拖拽新照片到页面的逻辑 ---
const startDragNewPhoto = (e, src) => {
    // 关键：强制阻止所有原生行为
    e.preventDefault();
    e.stopPropagation();
    
    ghostPhoto.value = src
    ghostPos.x = e.clientX
    ghostPos.y = e.clientY
    justFinishedDragging.value = false
    isOverTrash.value = false
    
    const handleMove = (me) => {
        me.preventDefault();
        ghostPos.x = me.clientX
        ghostPos.y = me.clientY

        // 碰撞检查：是否在垃圾桶上方
        if (trashElement.value) {
            const rect = trashElement.value.getBoundingClientRect()
            isOverTrash.value = (
                me.clientX >= rect.left && me.clientX <= rect.right &&
                me.clientY >= rect.top && me.clientY <= rect.bottom
            )
        }
    }
    
    const handleRelease = (re) => {
        window.removeEventListener('mousemove', handleMove, { capture: true })
        window.removeEventListener('mouseup', handleRelease, { capture: true })
        
        justFinishedDragging.value = true
        setTimeout(() => { justFinishedDragging.value = false }, 150)
        
        // 如果在垃圾桶上方松手，直接从待选区移除
        if (isOverTrash.value) {
            pendingPhotos.value = pendingPhotos.value.filter(s => s !== src)
        } else {
            const container = document.querySelector('.album-container')
            if (container) {
                const rect = container.getBoundingClientRect()
                if (re.clientX >= rect.left && re.clientX <= rect.right &&
                    re.clientY >= rect.top && re.clientY <= rect.bottom) {
                    
                    const centerX = rect.left + rect.width / 2
                    const isLeft = re.clientX < centerX
                    let targetPage = isLeft ? 
                        (currentPage.value > 0 ? currentPage.value * 2 - 1 : 1) : 
                        (currentPage.value === 0 ? 1 : currentPage.value * 2)
                    
                    const targetRectX = isLeft ? rect.left : centerX
                    const px = ((re.clientX - targetRectX) / (rect.width / 2)) * 100
                    const py = ((re.clientY - rect.top) / rect.height) * 100

                    localPhotos.value.push({
                        id: Date.now() + Math.random(),
                        url: src,
                        page: targetPage,
                        x: px - 10,
                        y: py - 10,
                        rotate: (Math.random() - 0.5) * 15
                    })
                    
                    pendingPhotos.value = pendingPhotos.value.filter(s => s !== src)
                    emit('update:photos', [...localPhotos.value])
                }
            }
        }
        ghostPhoto.value = null
        isOverTrash.value = false
    }
    
    window.addEventListener('mousemove', handleMove, { capture: true })
    window.addEventListener('mouseup', handleRelease, { capture: true })
}

const onGlobalMouseUp = () => {
    // 冗余清理
    if (ghostPhoto.value) ghostPhoto.value = null
}

const startDrag = (e, photo) => {
    draggingPhoto.value = photo
    isDraggingPhoto.value = true
    justFinishedDragging.value = false
    isOverTrash.value = false
    startPos = { x: e.clientX, y: e.clientY }
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
    if (!draggingPhoto.value) return
    const dx = e.clientX - startPos.x
    const dy = e.clientY - startPos.y
    
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        justFinishedDragging.value = true
    }

    // 碰撞检查：是否在垃圾桶上方
    if (trashElement.value) {
        const rect = trashElement.value.getBoundingClientRect()
        isOverTrash.value = (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom
        )
    }

    // 自适应物理尺寸计算
    const container = document.querySelector('.album-container')
    if (container) {
        const rect = container.getBoundingClientRect()
        const pageWidth = rect.width / 2
        const pageHeight = rect.height
        
        draggingPhoto.value.x += (dx / pageWidth) * 100
        draggingPhoto.value.y += (dy / pageHeight) * 100
    }
    
    startPos = { x: e.clientX, y: e.clientY }
}

const stopDrag = () => {
    // 如果在垃圾桶上方松手，从相册中删除
    if (isOverTrash.value && draggingPhoto.value) {
        localPhotos.value = localPhotos.value.filter(p => p.id !== draggingPhoto.value.id)
    }

    draggingPhoto.value = null
    isDraggingPhoto.value = false
    isOverTrash.value = false
    // 保持 justFinishedDragging 为 true 一小会儿
    setTimeout(() => { justFinishedDragging.value = false }, 150)
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', stopDrag)
    emit('update:photos', [...localPhotos.value])
}

const getZIndex = (idx) => {
    if (idx <= currentPage.value) {
        return idx // 翻过去的照片，idx 越大（越晚翻）越在上
    } else {
        return totalSheets + 1 - idx // 还没翻的照片，idx 越小（越早翻）越在上
    }
}

const flipPage = (idx) => {
    // 只有在没在拖拽照片，且刚刚没有结束拖拽时才允许翻页
    if (draggingPhoto.value || ghostPhoto.value || justFinishedDragging.value) return
    if (idx <= currentPage.value) currentPage.value = idx - 1
    else currentPage.value = idx
}

const prev = () => { if (currentPage.value > 0) currentPage.value-- }
const next = () => { if (currentPage.value < totalSheets) currentPage.value++ }

// 每页展示逻辑 (根据 photo 对象的 page 属性)
const getPhotosForPage = (pageNum) => {
    return localPhotos.value.filter(p => p.page === pageNum)
}

const triggerFileInput = () => fileInput.value.click()

const onDragLeave = (e) => {
    if (e.relatedTarget === null || !e.currentTarget.contains(e.relatedTarget)) {
        isDragging.value = false
    }
}

const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (re) => {
                pendingPhotos.value.push(re.target.result)
            }
            reader.readAsDataURL(file)
        }
    })
}

const handleDrop = (e) => {
    isDragging.value = false
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (re) => {
                pendingPhotos.value.push(re.target.result)
            }
            reader.readAsDataURL(file)
        }
    })
}

const processFiles = (files) => {
    // 逻辑已整合到 handleFileSelect
}
</script>

<style scoped>
.perspective-3000 { perspective: 3000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }

.page-sheet {
  transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
}

.album-container {
  user-select: none;
  overflow: visible; /* 关键：允许 3D 内容溢出物理容器而不被裁剪 */
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
</style>