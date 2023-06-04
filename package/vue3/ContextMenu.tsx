import {
  ComponentPublicInstance,
  VNode,
  createApp,
  defineComponent,
  onMounted,
} from "vue";
import ContextMenuComponent from "./ContextMenu.vue";
import factory from "./StatefulRenderCompFactory";
import { IClickMenuItem } from "../../type/ContextMenuType";

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
  let instance: ComponentPublicInstance | null,
    mask: HTMLElement | null,
    box: HTMLElement | null;

  if (!menus) return;

  const removeContextMenu = () => {
    if (instance || box) {
      // Array.from(document.body.querySelectorAll(".v-contextmenu")).forEach((el) => {
      //     document.body.removeChild(el);
      // })
      // document.body.removeChild(instance.$el);
      document.body.removeChild(box);
    }
    box = null;
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
    document.removeEventListener("keydown", handleKeyDown);
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
  box = document.createElement("div");
  instance = app.mount(box);
  document.body.appendChild(box);
  el.classList.add("contextmenu-active");

  mask.addEventListener("contextmenu", handleMaskContextmenu);
  mask.addEventListener("click", removeContextMenu);
  document.body.addEventListener("scroll", removeContextMenu);
  window.addEventListener("resize", removeContextMenu);

  let i = -1;
  function handleKeyDown(event: KeyboardEvent) {
    const menusBox = box.querySelector(".v-contextmenu") as HTMLElement;
    const menusItems = box.querySelectorAll(".v-contextmenu-item");
    const active = (i: number) =>
      box.querySelectorAll(".v-contextmenu-item")[i] as HTMLElement;
    switch (event.key) {
      case "ArrowDown":
        i = i < menusItems.length - 1 ? i + 1 : 0;
        // 最开始时 清空所有active
        if (!i) {
          for (let ii = 0; ii < menusItems.length; ii++) {
            menusItems[ii].classList.remove("active");
          }
        }
        i &&
          !active(i).parentElement?.classList.contains("sub-menu") &&
          active(i - 1).classList.remove("active");
        i &&
          active(i - 1).parentElement?.classList.contains("sub-menu") &&
          active(i - 2).classList.remove("active");

        active(i).classList.add("active");
        break;
      case "ArrowUp":
        console.log(box.querySelector(".v-contextmenu"));
        console.log(box.querySelectorAll(".v-contextmenu-item"));

        break;
      case "ArrowLeft":
        console.log(box.querySelector(".v-contextmenu"));
        console.log(box.querySelectorAll(".v-contextmenu-item"));

        break;
      case "ArrowRight":
        console.log(box.querySelector(".v-contextmenu"));
        console.log(box.querySelectorAll(".v-contextmenu-item"));

        break;
      case "Enter":
        const ignore = ["divider", "disable"];
        !ignore.some((v) => active(i)?.classList.contains(v)) &&
          active(i)?.click();
        break;
      default:
        console.log(event.key);

        break;
    }
    // if (event.ctrlKey && event.key === "s") {
    //     event.preventDefault(); // 防止默认行为
    //     dom.value.click();
    // }
  }
  document.addEventListener("keydown", handleKeyDown);
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
    shortCut: {
      type: String,
      default() {
        return undefined;
      },
    },
  },
  setup(props, { slots }) {
    // 这里获取到的是默认插槽的vnode，但拿不到对应的dom实例
    const defaultSlots = slots.default && (slots.default() as VNode[]);

    onMounted(() => {});

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
        {defaultSlots &&
          defaultSlots.map((defaultSlot, _index) => {
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
