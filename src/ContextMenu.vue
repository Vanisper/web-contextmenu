<template>
  <div class="v-contextmenu" v-show="status" :style="{
    left: style.left,
    top: style.top,
  }" @contextmenu.prevent>
    <ContextmenuContent :menus="menus" :isDark="isDark" :subMenuPosition="style.subMenuPosition"
      :clickMenuItem="clickMenuItem" />
  </div>
  <!-- 这是通过slot渲染获得的结果 -->
  <!-- <slot></slot> -->
  <!-- 为了拿到slot的dom，必须改为通过render方式渲染slot -->
  <!-- <RenderComp :vnode="defaultSlot"></RenderComp> -->
</template>

<script lang="ts" setup>
import {
  ComponentInternalInstance,
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  ref,
  onMounted,
  useSlots
} from "vue";

import ContextmenuContent from "./ContextmenuContent.vue";
import { IClickMenuItem } from "./type/ContextMenuType";
import factory from './StatefulRenderCompFactory';

const MENU_WIDTH = 170;
const MENU_HEIGHT = 30;
const MENU_PADDING = 5;
const DIVIDER_HEIGHT = 11;
const SUB_MENU_WIDTH = 120;
const Instance = getCurrentInstance() as ComponentInternalInstance | null;
const props = defineProps({
  axis: {
    type: Object as () => { x: number; y: number },
    default() {
      return { x: 0, y: 0 };
    },
  },
  el: {
    type: HTMLElement,
    default() {
      return null;
    },
  },
  event: {
    type: MouseEvent,
    default() {
      return null;
    },
  },
  menus: {
    type: Array<IClickMenuItem>,
    default() {
      return [{ text: "" }];
    },
  },
  isDark: {
    type: Boolean,
    default: false,
  },
  removeContextMenu: {
    type: Function,
    default() {
      return () => { };
    },
  },
});

const status = ref(false);
const axis = ref(props.axis);
const style = computed<{
  left: string;
  top: string;
  subMenuPosition: "right" | "left";
}>(() => {
  const { x, y } = axis.value;

  const normalMenuCount = props.menus.filter(
    (menu) => !menu.divider && !menu.hide
  ).length;
  const dividerMenuCount = props.menus.filter((menu) => menu.divider).length;

  const menuWidth = MENU_WIDTH;
  const menuHeight =
    normalMenuCount * MENU_HEIGHT +
    dividerMenuCount * DIVIDER_HEIGHT +
    MENU_PADDING * 2;

  const maxMenuWidth = MENU_WIDTH + SUB_MENU_WIDTH - 10;

  const screenWidth = document.body.clientWidth;
  const screenHeight = document.body.clientHeight;

  const left = screenWidth <= x + menuWidth ? x - menuWidth : x;
  const top = screenHeight <= y + menuHeight ? y - menuHeight : y;

  const subMenuPosition = screenWidth <= left + maxMenuWidth ? "right" : "left";

  return {
    left: left + "px",
    top: top + "px",
    subMenuPosition,
  };
});

const slots = useSlots();
// 这里获取到的是默认插槽的vnode，但拿不到对应的dom实例
const defaultSlot = slots.default && slots.default()[0]

onMounted(() => {
  if (defaultSlot?.el === null) {
    // 即使在该组件的mounted钩子中，这个defaultSlot的$el依然为null
  } else {
    nextTick(() => (status.value = true));
  }
});
function onEvent(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  axis.value = {
    x: event.x,
    y: event.y
  }
  status.value = true;
}
function onSlotMounted(defaultSlotEl: HTMLElement) {
  // Object.assign(defaultSlotEl.style, {
  //   color: 'pink',
  //   cursor: 'pointer',
  // })

  defaultSlotEl.addEventListener("contextmenu", onEvent)
}
function onSlotUnmounted(defaultSlotEl: HTMLElement) {
  defaultSlotEl.removeEventListener("contextmenu", onEvent)
}
const RenderComp = factory({ mountedCallFun: onSlotMounted, unmountedCallFun: onSlotUnmounted })

onBeforeUnmount(() => {
  document.body.removeChild(Instance?.proxy?.$el);
});

function clickMenuItem(item: IClickMenuItem) {
  if (item.disable || item.children) return;

  status.value = false;
  item.action &&
    item.action(props.el, props.event, props.axis, props.menus, props.isDark);

  props.removeContextMenu();
}
</script>

<style lang="less">
.v-contextmenu {
  position: fixed;
  z-index: 9999;
  user-select: none;
}
</style>
