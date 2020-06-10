export default [
  {
    name: 'Activity',
    props: {},
  },
  {
    name: 'Attitude',
    props: {
      attitudes: [
        {
          name: '',
          nodeProcess: '',
          dataKey: '',
          quaternions: {
            d: {
              x: 0,
              y: 0,
              z: 0,
            },
            w: 0,
          },
          live: true,
        },
      ],
    },
  },
  {
    name: 'Clock',
  },
  {
    name: 'Chart',
    props: {},
  },
  {
    name: 'Commands',
  },
  {
    name: 'DisplayValue',
    props: {
      name: '',
      displayValues: [
        {
          name: '',
          nodeProcess: '',
          dataKey: '',
          unit: '',
          processDataKey: (x) => x.toFixed(2),
        },
      ],
    },
  },
  {
    name: 'Events',
    props: {},
  },
  {
    name: 'Globe',
    props: {
      name: '',
      orbits: [
        {
          name: '',
          modelFileName: '',
          nodeProcess: '',
          dataKey: '',
          live: true,
          position: [], // x, y, z
          orientation: {
            d: {
              x: 0,
              y: 0,
              z: 0,
            },
            w: 0,
          },
        },
      ],
      overlays: [
        {
          markerColor: 'RED',
          geoJson: {
            type: 'Polygon',
            coordinates: [
              [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]],
            ],
          },
        },
      ],
    },
  },
  {
    name: 'Macro',
    props: {},
  },
  {
    name: 'MASDRCommands',
    props: {},
  },
  {
    name: 'Replacement',
  },
  {
    name: 'SatellitePasses',
    props: {},
  },
  {
    name: 'SetValues',
    props: {},
  },
  {
    name: 'Sequence',
    props: {},
  },
  {
    name: 'Status',
  },
  {
    name: 'Subsystem',
    props: {},
  },
  {
    name: 'ThreeD',
    props: {},
  },
  {
    name: 'UploadFile',
    props: {},
  },
];
