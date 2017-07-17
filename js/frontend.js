import Vue from 'vue';
import draggable from 'vuedraggable';
import PatternizerPreview from './components/patternizer-preview';
import RotationInput from './components/rotation-input';
import ColorPicker from './components/color-picker';
import RangeInput from './components/range-input';

window.pattern = {
  stripes: [
    {
      color: '#a03ad6',
      rotation: 200,
      opacity: 50,
      mode: 'plaid',
      width: 10,
      gap: 10,
      offset: 0,
    },
    {
      color: '#FFB4D6',
      rotation: 45,
      opacity: 80,
      mode: 'normal',
      width: 30,
      gap: 10,
      offset: 0,
    },
  ],
  bg: '#ffffff',
};

function migratePatternData(data) {
  const newData = Object.assign({}, data);
  const stripes = newData.stripes.map((stripe) => {
    const clone = Object.assign({}, stripe);
    if (Object.prototype.hasOwnProperty.call(clone, 'mode')) {
      clone.plaid = clone.mode === 'plaid';
      delete clone.mode;
    }
    clone.visible = true;
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
    {},
    {
      currentStripeId: 0,
    },
    migratePatternData(window.pattern)
  ),
  methods: {
    onStripeClick() {
      this.currentStripeId = this.getElementIndex(event.currentTarget);
    },
    removeStripe(index) {
      if (this.stripes.length === 1) {
        return;
      }
      if (this.currentStripeId === index) {
        // TODO: this part doesn't work right...
        this.currentStripeId -= 1;
        if (this.currentStripeId <= 0) {
          this.currentStripeId = 0;
        }
      }
      this.stripes.splice(index, 1);
    },
    getStripeClasses(index) {
      const classes = [];
      if (this.currentStripeId === index) {
        classes.push('stripes__item--active');
      }
      if (!this.stripes[index].visible) {
        classes.push('stripes__item--hidden');
      }
      return classes.join(' ');
    },
    onSortUpdate(event) {
      this.currentStripeId = event.newIndex;
    },
    onNewStripe() {
      const newStripe = Object.assign({}, this.stripes[this.currentStripeId]);
      this.stripes.unshift(newStripe);
      this.currentStripeId = 0;
    },
    getElementIndex(node) {
      let index = 0;
      while ((node = node.previousElementSibling)) {
        index += 1;
      }
      return index;
    },
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
});
