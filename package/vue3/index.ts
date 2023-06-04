import {
    App,
    ComponentPublicInstance,
    createApp,
    Directive,
    DirectiveBinding,
} from "vue";
import ContextmenuComponent from "./ContextMenu.vue";
import Contextmenu from "./ContextMenu";
import { IClickMenuItem } from "../../type/ContextMenuType";

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
    let instance: ComponentPublicInstance | null, mask: HTMLElement | null, box: HTMLElement | null;
    const menus = binding.arg || binding.value;
    if (!menus) return;

    const isDark = binding.modifiers!.dark;

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
    const app = createApp(ContextmenuComponent, {
        axis: { x: event.x, y: event.y },
        el,
        event,
        menus,
        isDark,
        removeContextMenu,
    });
    box = document.createElement("div");
    instance = app.mount(box);
    // instance = app.mount("body");
    // console.log(box, instance.$el);
    document.body.appendChild(box);
    el.classList.add("contextmenu-active");

    mask.addEventListener("contextmenu", handleMaskContextmenu);
    mask.addEventListener("click", removeContextMenu);
    document.body.addEventListener("scroll", removeContextMenu);
    window.addEventListener("resize", removeContextMenu);
    let i = -1;
    function handleKeyDown(event: KeyboardEvent) {
        const menusBox = box.querySelector(".v-contextmenu") as HTMLElement
        const menusItems = Array.from(box.querySelectorAll(".v-contextmenu-item")) as HTMLElement[]
        const active = (i: number) => box.querySelectorAll(".v-contextmenu-item")[i] as HTMLElement
        switch (event.key) {
            case "ArrowDown":
                i = i < menusItems.length - 1 ? i + 1 : 0;
                // 最开始时 清空所有active
                !i && menusItems.forEach(v => v.classList.remove("active"));
                (i && !active(i).parentElement?.classList.contains("sub-menu")) && active(i - 1).classList.remove("active");
                (i && active(i - 1).parentElement?.classList.contains("sub-menu")) && active(i - 2).classList.remove("active");

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
                !ignore.some(v => active(i)?.classList.contains(v)) && active(i)?.click();
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
