import Vue from 'vue';
import draggable from 'vuedraggable';
import uniqueId from 'lodash/uniqueId';

import PatternizerPreview from './components/patternizer-preview';
import RotationInput from './components/rotation-input';
import ColorPicker from './components/color-picker';
import RangeInput from './components/range-input';

function preparePatternData(data) {
  const newData = Object.assign({}, data);
  const stripes = newData.stripes.map((stripe) => {
    const clone = Object.assign({}, stripe);
    if (Object.prototype.hasOwnProperty.call(clone, 'mode')) {
      clone.plaid = clone.mode === 'plaid';
      delete clone.mode;
    }
    clone.visible = true;
    clone.id = uniqueId();
    return clone;
  });
  newData.stripes = stripes;
  return newData;
}

const app = new Vue({
  el: '#app',
  components: {
    draggable,
    'patternizer-preview': PatternizerPreview,
    'rotation-input': RotationInput,
    'color-picker': ColorPicker,
    'range-input': RangeInput,
  },
  data: Object.assign(
    {
      currentStripeIdx: 0,
    },
    preparePatternData(window.pattern)
  ),
  computed: {
    dataFiltered() {
      const visibleStripes = this.stripes.filter(stripe => (stripe.visible === true));
      const stripesCleaned = visibleStripes.map((stripe) => {
        const clone = Object.assign({}, stripe);
        delete clone.visible;
        return clone;
      });
      return {
        stripes: stripesCleaned,
        bg: this.bg,
      };
    },
  },
  methods: {
    getStripeClasses(index) {
      const classes = [];
      if (this.currentStripeIdx === index) {
        classes.push('stripes__item--active');
      }
      if (!this.stripes[index].visible) {
        classes.push('stripes__item--hidden');
      }
      return classes.join(' ');
    },
    onStripeClick(index) {
      this.currentStripeIdx = index;
    },
    onSortUpdate(event) {
      this.currentStripeIdx = event.newIndex;
    },
    removeStripe(index, event) {
      event.stopPropagation();
      let newIndex = index;
      if (this.stripes.length === 1) {
        return;
      }
      if (this.currentStripeIdx === index) {
        newIndex -= 1;
        if (newIndex <= 0) {
          newIndex = 0;
        }
      }
      const newStripes = this.stripes.slice();
      newStripes.splice(index, 1);

      this.currentStripeIdx = newIndex;
      this.stripes = newStripes;
    },
    onNewStripe() {
      const newStripe = Object.assign({}, this.stripes[this.currentStripeIdx]);
      newStripe.id = uniqueId();
      const newStripes = this.stripes.slice();
      newStripes.unshift(newStripe);

      this.stripes = newStripes;
      this.currentStripeIdx = 0;
    },
  },
});
