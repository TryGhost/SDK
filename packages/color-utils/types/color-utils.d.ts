import Color from 'color';
export { Color };
export declare function lightenToContrastThreshold(foreground: string | Color, background: string | Color, contrastThreshold: number): Color;
export declare function darkenToContrastThreshold(foreground: string | Color, background: string | Color, contrastThreshold: number): Color;
export declare function textColorForBackgroundColor(background: string | Color): Color;
