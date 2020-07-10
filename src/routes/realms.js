import defaultLayout from './satellite/defaultLayout';
import neutron1 from './satellite/neutron1';
import hiapo from './satellite/hiapo';
import hyti from './satellite/hyti';

export default {
  name: 'Realms',
  icon: 'rocket',
  path: '/realm/:id',
  component: 'Dashboard',
  props: {
    defaultLayout,
    realms: {
      neutron1: ['neutron1', 'beagle1'],
      hiapo: [],
      hyti: [],
    },
  },
  children: [
    neutron1,
    hiapo,
    hyti,
  ],
};
