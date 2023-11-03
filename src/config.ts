export const config: {
  times: {
    name: string;
    value?: number;
  }[];
} = {
  times: [
    {
      name: "1 minute",
      value: 60000,
    },
    {
      name: "5 minutes",
      value: 300000,
    },
    {
      name: "15 minutes",
    },
    {
      name: "30 minutes",
      value: 1800000,
    },
    {
      name: "1 hour",
      value: 3600000,
    },
    {
      name: "2 hours",
      value: 7200000,
    },
    {
      name: "4 hours",
      value: 14400000,
    },
    {
      name: "6 hours",
      value: 21600000,
    },
  ],
};
