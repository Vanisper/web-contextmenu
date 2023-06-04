import {
    App,
    ComponentPublicInstance,
    createApp,
    Directive,
    DirectiveBinding,
} from "vue";
import ContextmenuComponent from "./ContextMenu.vue";
import Contextmenu from "./ContextMenu";
import { IClickMenuItem } from "./type/ContextMenuType";

const __ctxmenu__ = "__ctxmenu__";

interface Element extends HTMLElement {
    __ctxmenu__?: (event: MouseEvent) => void;
}

interface Instance extends ComponentPublicInstance {
    axis: { x: number; y: number };
    el: HTMLElement;
    menus: IClickMenuItem[];
    isDark: boolean;
    removeContextMenu: () => void;
}

const contextmenuListener = ({
    el,
    event,
    binding,
}: {
    el: HTMLElement;
    event: MouseEvent;
    binding: DirectiveBinding;
}) => {
    event.stopPropagation();
    event.preventDefault();
    let instance: ComponentPublicInstance | null, mask: HTMLElement | null;
    const menus = binding.arg || binding.value;
    if (!menus) return;

    const isDark = binding.modifiers!.dark;

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
    const app = createApp(ContextmenuComponent, {
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

const ContextmenuDirective: Directive = {
    mounted(el: Element, binding: DirectiveBinding, vnode) {
        // 要想自定义指令的数据可更新 需要设置一个key
        // https://www.iteye.com/blog/wangchuanyin-2439617
        vnode.key = "_ctxmenu_key_";
        // console.log(vnode);
        el[__ctxmenu__] = (event: MouseEvent) =>
            contextmenuListener({ el, event, binding });
        el.addEventListener("contextmenu", el[__ctxmenu__]);
    },
    // updated(el: Element, binding: DirectiveBinding) {
    //     el[__ctxmenu__] = (event: MouseEvent) =>
    //         contextmenuListener({ el, event, binding });
    //     el.addEventListener("contextmenu", el[__ctxmenu__]);
    // },
    unmounted(el: Element) {
        if (el && el[__ctxmenu__]) {
            el.removeEventListener("contextmenu", el[__ctxmenu__]);
            delete el[__ctxmenu__];
        }
    },
};

const directives = {
    contextmenu: ContextmenuDirective,
};

export default {
    install(app: App) {
        // 注册具名组件
        app.component("ContextMenuComponent", Contextmenu);
        // 注册全局指令
        app.directive("contextmenu", ContextmenuDirective);
    },
    directives
}
