import {
  ComponentPublicInstance,
  DirectiveBinding,
  Teleport,
  VNode,
  createApp,
  defineAsyncComponent,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  ref,
  render,
  watch,
} from "vue";
import ContextMenuComponent from "./ContextMenu.vue";
import factory from "./StatefulRenderCompFactory";
import { IClickMenuItem } from "./type/ContextMenuType";

const __ctxmenu__ = "__ctxmenu__";
const contextmenuListener = ({
  el,
  event,
  menus,
  isDark,
}: {
  el: HTMLElement;
  event: MouseEvent;
  menus: IClickMenuItem[];
  isDark: boolean;
}) => {
  event.stopPropagation();
  event.preventDefault();
  let instance: ComponentPublicInstance | null, mask: HTMLElement | null;

  if (!menus) return;

  const removeContextMenu = () => {
    if (instance) {
      // Array.from(document.body.querySelectorAll(".v-contextmenu")).forEach((el) => {
      //     document.body.removeChild(el);
      // })
      document.body.removeChild(instance.$el);
    }

    instance = null;

    if (mask) {
      mask.removeEventListener("contextmenu", handleMaskContextmenu);
      mask.removeEventListener("click", removeContextMenu);
      document.body.removeChild(mask);
      mask = null;
    }
    el.classList.remove("contextmenu-active");
    document.body.removeEventListener("scroll", removeContextMenu);
    window.removeEventListener("resize", removeContextMenu);
  };

  const handleMaskContextmenu = (event: MouseEvent) => {
    event.preventDefault();
    removeContextMenu();
  };

  removeContextMenu();

  mask = document.createElement("div");
  mask.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9998;
  `;
  document.body.appendChild(mask);
  // 传递初始化参数
  const app = createApp(ContextMenuComponent, {
    axis: { x: event.x, y: event.y },
    el,
    event,
    menus,
    isDark,
    removeContextMenu,
  });
  instance = app.mount(document.createElement("div"));
  document.body.appendChild(instance.$el);
  el.classList.add("contextmenu-active");

  mask.addEventListener("contextmenu", handleMaskContextmenu);
  mask.addEventListener("click", removeContextMenu);
  document.body.addEventListener("scroll", removeContextMenu);
  window.addEventListener("resize", removeContextMenu);
};

const contextMenuComponent = defineComponent({
  name: "context-menu",
  inheritAttrs: false,
  components: {
    ContextMenuComponent,
  },
  props: {
    isDark: {
      type: Boolean,
      default: false,
    },
    menus: {
      type: Array as () => IClickMenuItem[],
      default: null,
    },
  },
  setup(props, { slots }) {
    // 这里获取到的是默认插槽的vnode，但拿不到对应的dom实例
    const defaultSlots = slots.default && (slots.default() as VNode[]);
    onMounted(() => {
      // console.log(props);
    });

    const SlotRenderCom = factory({
      mountedCallFun: (el) => {
        el[__ctxmenu__] = (event: MouseEvent) =>
          contextmenuListener({
            el,
            event,
            menus: props.menus,
            isDark: props.isDark,
          });
        el.addEventListener("contextmenu", el[__ctxmenu__]);
      },
      unmountedCallFun: (el) => {
        if (el && el[__ctxmenu__]) {
          el.removeEventListener("contextmenu", el[__ctxmenu__]);
          delete el[__ctxmenu__];
        }
      },
    });
    return () => (
      <>
        {defaultSlots.map((defaultSlot, _index) => {
          return <SlotRenderCom vnode={defaultSlot} />;
        })}
      </>

      //   <!-- 这是通过slot渲染获得的结果 -->
      //   <!-- <slot></slot> -->
      //   <!-- 为了拿到slot的dom，必须改为通过render方式渲染slot -->
      //   <RenderComp :vnode="defaultSlot"></RenderComp>
    );
  },
});

export default contextMenuComponent;
