import { css } from 'styled-components';

export const Theme: any = {
  global: {
    size: {
      medium: '250px',
    },
    control: {
      disabled: {
        opacity: 0.5,
      },
      border: {
        radius: '2px',
      },
    },
    border: {
      radius: '2px',
    },
    colors: {
      White1000: '#ffffff',
      Basic1000: '#000000',
      Basic800: '#30303d',
      Basic600: '#939393',
      Basic400: '#D7D7D7',
      Basic300: '#E6E6E6',
      Basic200: '#F5F5F5',
      Basic100: '#FFFFFF',
      Yellow600: '#FFCB02',
      Yellow400: '#FFE06E',
      Yellow200: '#FFF5CC',
      Green600: '#00A825',
      Red600: '#FF0000',
      Grey700: '#b5b5b5',
      Grey600: '#afb1c0',
      Grey500: '#9698a7',
      Grey400: '#d2d6e1',
      Blue500: '#4740a1',

      border: '#323232',
      brand: 'white',
      focus: 0,
      active: '#FFCB02',
      icon: 'black',
      formBackground: '#f8f8f8',
      text: {
        dark: 'black',
        light: '#323232',
      },
      control: {
        dark: '#f5f5f5',
        light: '#f5f5f5',
      },
      'toggle-knob': 'black',

      buttonBgColor: '#4740a1',
    },
    font: {
      family: 'Helvetica, sans-serif',
      size: '14px',
      height: '20px',
    },
    drop: {
      shadowSize: 0,
    },
    input: {
      border: {
        radius: '2px',
      },
      disabled: {
        opacity: 0.5,
      },
      weight: 400,
    },
    selected: {
      background: 'Yellow400',
      color: 'Basic1000',
    },
  },
  textInput: {
    extend: css`
      ${(props: any) => 'font-size: 16px; padding: 8px;'}
    `,
  },
  heading: {
    font: {
      family: 'system-ui, sans-serif',
    },
    weight: 300,

    level: {
      1: {
        font: {
          weight: 300,
        },
        medium: {
          size: '45px',
          height: '54px',
        },
        small: {
          size: '13px',
          height: '18px',
          weight: 'normal',
        },
      },
    },
    extend: css`
      ${(props: any) => props.size === 'small' && 'letter-spacing: 4px;'};
    `,
  },
  text: {
    font: {
      family: 'system-ui, sans-serif',
    },
    small: {
      size: '14px',
      height: '18px',
    },
    medium: {
      size: '16px',
      height: '19px',
    },
    large: {
      size: '30px',
      height: '20px',
    },
  },
  button: {
    color: 'dark',
    border: {
      radius: '22px',
    },
    padding: {
      horizontal: '24px',
      vertical: '18px',
    },
    disabled: {
      opacity: 1.0,
    },
    // extend: css`
    //   ${(props: any) => 'letter-spacing: 4px; text-align: center;'};
    // `,
  },
  select: {
    border: {
      radius: '2px',
    },
    background: 'dark',
    color: 'black',
    icons: {
      color: 'black',
    },
  },
  checkBox: {
    color: {
      light: 'toggle-knob',
    },
    toggle: {
      color: {
        dark: 'toggle-knob',
        light: 'toggle-knob',
      },
    },
    // icons: {
    //   checked: CheckMarkIcon,
    // },
  },
  table: {
    header: {
      pad: { vertical: 'xxsmall' },
      border: undefined,
    },
    body: {
      pad: { vertical: 'medium' },
      verticalAlign: 'top',
    },
    extend: css`
      ${(props: any) =>
        'border-collapse: separate; width: 100%; table-layout: fixed; word-break: break-all;}'}
    `,
  },
};
