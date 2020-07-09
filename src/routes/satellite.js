import defaultLayout from './satellite/defaultLayout';
import neutron1 from './satellite/neutron1';
import hiapo from './satellite/hiapo';
import hyti from './satellite/hyti';

export default {
  name: 'Satellites',
  icon: 'rocket',
  path: '/satellite/:id',
  component: 'Dashboard',
  props: {
    defaultLayout,
  },
  children: [
    neutron1,
    hiapo,
    hyti,
  ],
};
