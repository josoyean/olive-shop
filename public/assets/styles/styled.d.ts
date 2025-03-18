import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    color: {
      main: string;
    };
    fontColor: {
      main: string;
      sub: string;
      black: string;
      red: string;
    };
    lineColor: {
      main: string;
      sub: string;
    };
    fontSize: {
      large: string;
      middle: string;
      small: string;
    };
  }
}
