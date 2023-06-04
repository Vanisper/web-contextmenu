export interface IClickMenuItem {
  text?: string;
  subText?: string;
  disable?: boolean;
  children?: Array<IClickMenuItem>;
  action?: ClickMenuItemAction;
  divider?: boolean;
  hide?: boolean;
}

export type ClickMenuItemAction = (
  el: HTMLElement,
  event: MouseEvent,
  axis: Axis,
  menus: IClickMenuItem[],
  isDark: boolean
) => void;

export interface Axis {
  x: number;
  y: number;
}
