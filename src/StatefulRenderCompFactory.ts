import { VNode, defineComponent } from 'vue'

export type CallFun = (vnodeEl: HTMLElement) => void
export interface RenderCallbackObj {
    /**
     * 自定义mounted回调
     */
    mountedCallFun?: CallFun
    /**
     * 自定义updated回调
     */
    updatedCallFun?: CallFun
    /**
     * 自定义unmounted回调
     */
    unmountedCallFun?: CallFun
}

interface IProps {
    vnode: null | VNode
}

const factory = ({ mountedCallFun, updatedCallFun, unmountedCallFun }: RenderCallbackObj) => {
    return defineComponent({
        props: {
            vnode: null,
        },
        mounted() {
            // 这个this.$el就代表当前vnode的dom对象
            mountedCallFun && mountedCallFun(this.$el)
        },
        updated() {
            updatedCallFun && updatedCallFun(this.$el)
        },
        unmounted() {
            unmountedCallFun && unmountedCallFun(this.$el)
        },
        render(props: IProps) {
            return props.vnode
        },
    })
}

export default factory

