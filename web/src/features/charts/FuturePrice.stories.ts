import { Meta, StoryObj } from '@storybook/react';
import { halfHourPriceData, priceData } from 'stories/mockData';
import { mockDateDecorator } from 'storybook-mock-date-decorator';

import { FuturePrice } from './FuturePrice';

const meta: Meta<typeof FuturePrice> = {
  title: 'charts/FuturePrice',
  component: FuturePrice,
  decorators: [mockDateDecorator],
};
export default meta;

type Story = StoryObj<typeof FuturePrice>;

export const PositivePrices: Story = {
  args: {
    futurePrice: priceData,
  },
  parameters: {
    date: new Date('2024-09-02 01:00:00+00:00'),
  },
};

const negativePriceData = JSON.parse(JSON.stringify(priceData));

negativePriceData.priceData['2024-09-02 03:00:00+00:00'] = -0.2;
negativePriceData.priceData['2024-09-02 13:00:00+00:00'] = -0.9;
negativePriceData.priceData['2024-09-02 08:00:00+00:00'] = -0.3;

export const NegativePrices: Story = {
  args: {
    futurePrice: negativePriceData,
  },
  parameters: {
    date: new Date('2024-09-02 01:00:00+00:00'),
  },
};

const zeroPriceData = JSON.parse(JSON.stringify(priceData));

zeroPriceData.priceData['2024-09-02 03:00:00+00:00'] = 0;
zeroPriceData.priceData['2024-09-02 13:00:00+00:00'] = 0;
zeroPriceData.priceData['2024-09-02 08:00:00+00:00'] = 3;

export const ZeroPrices: Story = {
  args: {
    futurePrice: zeroPriceData,
  },
  parameters: {
    date: new Date('2024-09-02 01:00:00+00:00'),
  },
};

export const HalfHourPrices: Story = {
  args: {
    futurePrice: halfHourPriceData,
  },
  parameters: {
    date: new Date('2024-09-02 01:00:00+00:00'),
  },
};
