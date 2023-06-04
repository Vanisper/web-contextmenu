<template>
    <ContextMenuComponent :menus="menus" :is-dark="true">
        <div style="height: 100px;width: 100px;background-color: red;">组件调用</div>
    </ContextMenuComponent>
    <div v-contextmenu="menus" style="height: 100px;width: 100px;background-color: green;">指令调用</div>
    <ContextMenu :menus="menus">
        <div style="height: 100px;width: 100px;background-color: blue;">局部引用</div>
    </ContextMenu>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import ContextMenu from "../package/vue3/ContextMenu";
import { IClickMenuItem } from "../type/ContextMenuType";
const menus = ref<IClickMenuItem[]>([
    {
        text: "新建文件",
        subText: "CREATE_FILE",
        action: (el, event, axis, menus, item, isDark) => {
            console.log(el, event, axis, menus, item, isDark);
        },
        hide: false,
        divider: false,
        disable: true
    }, {
        divider: true
    }, {
        text: "快捷键",
        shortCut: "space",
        action: (el, event, axis, menus, item, isDark) => {
            console.log(el, event, axis, menus, item, isDark);
        },
        children: [
            {
                text: "快捷键",
                shortCut: "space",
                action: (el, event, axis, menus, item, isDark) => {
                    console.log(el, event, axis, menus, item, isDark);
                },
            }
        ]
    }, {
        text: "111",
        action: (el, event, axis, menus, item, isDark) => {
            console.log(el, event, axis, menus, item, isDark);
        },
    }
])
</script>


<style lang="less" >
* {
    padding: 0;
    margin: 0;
}
</style>

