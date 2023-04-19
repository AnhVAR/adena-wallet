import React from 'react';
import { ThemeProvider } from 'styled-components';
import { RecoilRoot } from 'recoil';
import type { Decorator, Parameters } from '@storybook/react';
import { GlobalStyle } from '../src/styles/global-style';
import theme from '../src/styles/theme';
import '../index.css';

const extensionViewport = {
  name: 'Adena Extension',
  styles: {
    width: '360px',
    height: '540px'
  }
}

export const parameters: Parameters = {
  viewport: {
    viewports: {
      adenaExtension: extensionViewport
    },
    defaultViewport: 'adenaExtension'
  },
  backgrounds: {
    default: 'adenaExtension',
    values: [
      {
        name: 'adenaExtension',
        value: '#212128'
      }
    ]
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators: Decorator[] = [
  (Story, context) => {
    return (
      <>
        <GlobalStyle />
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <Story />
          </ThemeProvider>
        </RecoilRoot>
      </>
    );
  },
];