// how do you define it? based on attribute or through js
// based on attribute:
//    + easy to set up
//    + same place as hovered element
// based on js:
//    + avoid bloated HTML
//    + easy to pass complex options, like objects
//    + easy to add to multiple elements in one go
//    + easy to add to dynamically added elements
//
// TODO
// - trigger on click
// - input elements
// - a11y
// - nested tooltips
//
// TODO LEARN
// Difference between mouseenter, mousemove and mouseover
//
class Tooltip {

  constructor () {
    this.contentTag = 'data-tooltip-content';
    this.contentSelectorTag = 'data-tooltip-content-selector';
    this.positionTag = 'data-tooltip-position';
    this.selector = `*[${this.contentTag}]`;

    this.el = document.getElementById('tooltip');
    if(!this.el) {
      this.el = document.createElement('div');
      this.el.setAttribute('id', 'tooltip');
      document.body.append(this.el);
  
      this.el.addEventListener('mouseover', this.cancelHideTooltip.bind(this));
      this.el.addEventListener('mouseleave', this.scheduleHideTooltip.bind(this));
    }

    document.body.addEventListener('mouseover',this.onMouseOver.bind(this));
  }

  onMouseOver (event) {
    let target = event.target;
    if (this.isTooltip(event.target)) {
      this.cancelHideTooltip();

      let content;

      if(target.attributes[this.contentTag]) {
        content = target.attributes[this.contentTag].value;
      } else if(target.attributes[this.contentSelectorTag]) {
        let contentSelector = target.attributes[this.contentSelectorTag].value;
        content = document.querySelector(contentSelector).innerHTML;
      }

      if(target.attributes[this.positionTag]) {
        let position = target.attributes[this.positionTag].value;
        this.showTooltip(target, content, position);
      } else {
        this.showTooltip(target, content);
      }

    }
  }

  showTooltip (target, content, position) {
    this.el.innerHTML = content;

    target.addEventListener('mouseleave',this.scheduleHideTooltip.bind(this));

    let tooltipCoords = this.positionTooltip(target, position)

    this.el.style.left = `${tooltipCoords.x}px`;
    this.el.style.top = `${tooltipCoords.y}px`;

    this.el.classList.add('show');
  }

  scheduleHideTooltip () {
    this.hideTooltipTimer = this.hideTooltipTimer || setTimeout(this.hideTooltip.bind(this), 300);
  }

  cancelHideTooltip () {
    clearTimeout(this.hideTooltipTimer);
    this.hideTooltipTimer = null;
  }

  positionTooltip (target, position) {
    position = position || 'top';

    let targetCoords = target.getBoundingClientRect();
    let tooltipCoords = this.el.getBoundingClientRect();
    let viewportCoords = {
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight
    };

    let positionX = 0;
    positionX = targetCoords.x + (targetCoords.width - tooltipCoords.width) / 2;

    // check if tooltip is off screen
    if (positionX < 0) {
      positionX = 0;
    } else if (positionX + tooltipCoords.width > viewportCoords.width) {
      positionX = viewportCoords.width - tooltipCoords.width;
    }

    let positionY = 0;

    if (position === 'top') {
      positionY = targetCoords.y - tooltipCoords.height;
    } else {
      positionY = targetCoords.y + targetCoords.height;
    }

    // adjust for scroll
    positionY = positionY + viewportCoords.y;

    // check if tooltip is off screen
    if (positionY < viewportCoords.y) {
      return this.positionTooltip(target, 'bottom');
    } else if (positionY + tooltipCoords.height > viewportCoords.y + viewportCoords.height) {
      return this.positionTooltip(target, 'top');
    }

    return {
      x: positionX,
      y: positionY
    }
  }

  hideTooltip () {
    this.el.classList.remove('show');
    this.el.innerHTML = '';
    this.el.setAttribute('style','');
  }

  isTooltip (el) {
    if(el.attributes[this.contentTag]) {
      return true
    }

    if(el.attributes[this.contentSelectorTag]) {
      let contentSelector = el.attributes[this.contentSelectorTag].value;
      return !!document.querySelector(contentSelector);
    }
    
    return false;
  }
}

export default Tooltip;