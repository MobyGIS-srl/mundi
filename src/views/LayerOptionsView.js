import $ from 'jquery';
import 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.css';
import Marionette from 'backbone.marionette';

import template from './LayerOptionsView.hbs';


const LayerOptionsView = Marionette.ItemView.extend({
  template,
  events: {
    'change [name="layer-visible"]': 'onLayerVisibleChange',
    'input #layer-options-opacity': 'onOpacitySlide',
    'change .layer-option': 'onLayerOptionChange'
  },

  templateHelpers() {
    return {
      options: this.getDisplayOptions(),
    };
  },

  initialize(options) {
    this.useDetailsDisplay = options.useDetailsDisplay && !!this.model.get('detailsDisplay');
  },

  useBackdrop() {
    return true;
  },

  getDisplayOptions() {
    const display = this.useDetailsDisplay ? this.model.get('detailsDisplay') : this.model.get('display');
    const options = (display.options || [])
      .map((option) => {
        let values = option.values;
        let low;
        let high;
        let targetLow;
        let targetHigh;
        const target = option.target;
        if (values) {
          values = values.map(value =>
            Object.assign({}, value, {
              isCurrent: this.model.get(target) === value.value
            })
          );
        }
        if (typeof option.min !== 'undefined') {
          [targetLow, targetHigh] = Array.isArray(target) ? target : target.split(',');
          low = this.model.get(targetLow);
          high = this.model.get(targetHigh);
        }
        return Object.assign({}, option, { values, low, high, targetLow, targetHigh });
      });
    return options;
  },

  onRender() {
    const display = this.useDetailsDisplay ? this.model.get('detailsDisplay') : this.model.get('display');
    let opacity = display.opacity;
    opacity = typeof opacity === 'undefined' ? 1 : opacity;
    this.$slider = this.$('.opacity-slider').slider({
      min: 0,
      max: 100,
      value: opacity * 100,
      formatter(value) {
        return `${value}%`;
      }
    });

    this.$slider.on('slide', (event) => {
      this.model.set(`${this.useDetailsDisplay ? 'detailsDisplay' : 'display'}.opacity`, event.value / 100);
    });
    this.$slider.on('change', () => {
      this.model.set(`${this.useDetailsDisplay ? 'detailsDisplay' : 'display'}.opacity`, parseInt(this.$slider.val(), 10) / 100);
    });

    const $dataSliders = this.$('input[data-slider-min]');
    if ($dataSliders.length) {
      $dataSliders.slider()
        .on('slideStop', (event) => {
          const $target = $(event.target);
          this.model.set({
            [$target.data('targetLow')]: event.value[0],
            [$target.data('targetHigh')]: event.value[1],
          });
        });
    }
  },

  onLayerVisibleChange(event) {
    const $target = $(event.target);
    this.model.set(`${this.useDetailsDisplay ? 'detailsDisplay' : 'display'}.visible`, $target.is(':checked'));
  },

  onOpacitySlide() {
    const display = Object.assign({}, this.model.get('display'));
    display.opacity = this.$('.opacity-slider').val();
    this.model.set('display', display);
  },

  onLayerOptionChange(event) {
    const $target = $(event.target);
    this.model.set(`${$target.attr('name')}`, $target.val());
  },
});

export default LayerOptionsView;
