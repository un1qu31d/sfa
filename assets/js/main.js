const sys = {
  loaded: false,
  loadPercentage: 0
};

class animation {
  introSteps = {
    count: 100,
    details: []
  };
  introItems = {};
  // l 0.048 -0.037
  animationCommands = `
  M 1920 243.848
  h -1920
  v -27.168
  l 0 -0.037
  c 22.692 -17.219 48.412 -36.735 69.788 -52.12
  c 11.132 -8.012 20.469 -14.473 28.543 -19.751
  a 234.722 234.722 0 0 1 22.186 -13.167
  c 22.157 -11.669 44.29 -22.672 65.784 -32.7
  c 21.3 -9.942 42.614 -19.23 63.35 -27.6
  c 20.521 -8.289 41.1 -15.938 61.173 -22.733
  c 19.839 -6.717 39.776 -12.8 59.259 -18.089
  c 19.233 -5.219 38.615 -9.819 57.605 -13.673
  c 18.713 -3.8 37.625 -6.988 56.213 -9.484
  c 18.276 -2.454 36.809 -4.312 55.082 -5.524
  c 17.925 -1.188 36.165 -1.79 54.212 -1.79
  c 203.2 0 393.235 74.733 633.835 169.348
  c 13.813 5.432 28.095 11.048 42.6 16.737
  c 25.673 10.068 52.013 18.922 78.288 26.318
  c 25.172 7.085 50.954 13.02 76.631 17.64
  c 24.523 4.413 49.6 7.743 74.537 9.9
  c 23.735 2.051 47.963 3.091 72.01 3.091
  c 16.834 0 33.969 -0.51 50.928 -1.514
  c 16.274 -0.965 32.818 -2.41 49.172 -4.3
  a 932.531 932.531 0 0 0 92.4 -15.47
  a 1005.64 1005.64 0 0 0 156.351 -48.117
  Z
  `;
  cubicBezierCurves = [];
  cubicBezierRanges = [];

  constructor(element) {
    this.animationCommands.split(/\n/).filter(command => command.trim().length).reduce((coordinates, command) => {
      let commandDetails = command.trim().split(' ');
      switch(commandDetails[0]) {
        case 'M':
          return {x: parseFloat(commandDetails[1]), y: parseFloat(commandDetails[2])};
        case 'h':
          return {x: (coordinates.x + parseFloat(commandDetails[1])), y: coordinates.y};
        case 'v':
          return {x: coordinates.x, y: (coordinates.y + parseFloat(commandDetails[1]))};
        case 'l':
          return {x: (coordinates.x + parseFloat(commandDetails[1])), y: (coordinates.y + parseFloat(commandDetails[2]))};
        case 'c':
          this.cubicBezierCurves[this.cubicBezierCurves.length] = {
            p1: {x: coordinates.x, y: coordinates.y},
            p2: {x: (coordinates.x + parseFloat(commandDetails[1])), y: (coordinates.y + parseFloat(commandDetails[2]))},
            p3: {x: (coordinates.x + parseFloat(commandDetails[3])), y: (coordinates.y + parseFloat(commandDetails[4]))},
            p4: {x: (coordinates.x + parseFloat(commandDetails[5])), y: (coordinates.y + parseFloat(commandDetails[6]))}
          };
          return {x: (coordinates.x + parseFloat(commandDetails[5])), y: (coordinates.y + parseFloat(commandDetails[6]))};
        case 'a':
          return {x: (coordinates.x + parseFloat(commandDetails[6])), y: (coordinates.y + parseFloat(commandDetails[7]))};
      }
      return coordinates;
    }, {x: 0, y: 0});
    this.cubicBezierRanges = this.cubicBezierCurves.map(CBC => ({start: (Math.min(CBC.p1.x, CBC.p2.x, CBC.p3.x, CBC.p4.x) / 1920), end: (Math.max(CBC.p1.x, CBC.p2.x, CBC.p3.x, CBC.p4.x) / 1920)}));
    this.introItems = {
      car: {
        selector: element.querySelector('.animation__car')
      },
      curve: {
        selector: element.querySelector('.animation__curve')
      }
    }
    this.generateData();
    window.addEventListener('resize', () => {
      this.generateData();
      this.draw(this.percentage);
    });
  }

  getBezier(t,p1,p2,p3,p4) {
    const pos = {};
    pos.x = p1.x*(t*t*t) + p2.x*(3*t*t*(1-t)) + p3.x*(3*t*(1-t)*(1-t)) + p4.x*((1-t)*(1-t)*(1-t));
    pos.y = p1.y*(t*t*t) + p2.y*(3*t*t*(1-t)) + p3.y*(3*t*(1-t)*(1-t)) + p4.y*((1-t)*(1-t)*(1-t));
    return {x: pos.x / 1920, y: pos.y / 243.848};
  }

  getPointByStep(step) {
    let point = false;
    let percentage = (step / this.introSteps.count) * ((this.introItems.curve.width + this.introItems.car.width) / this.introItems.curve.width);
    if(percentage <= 1) {
      let cubicBezierRangeIndex = this.cubicBezierRanges.findIndex(cubicBezierRange => ((cubicBezierRange.start) <= percentage && percentage <= (cubicBezierRange.end)));
      if(cubicBezierRangeIndex >= 0) {
        let cubicBezierRange = this.cubicBezierRanges[cubicBezierRangeIndex];
        let cubicBezierCurve = this.cubicBezierCurves[cubicBezierRangeIndex];
        let rangePercentage = (percentage - (cubicBezierRange.start)) / ((cubicBezierRange.end) - (cubicBezierRange.start));
        point = this.getBezier((1 - rangePercentage), cubicBezierCurve.p1, cubicBezierCurve.p2, cubicBezierCurve.p3, cubicBezierCurve.p4);
      }
    }
    return point;
  }

  generateData = () => {
    this.introItems.car.width = this.introItems.car.selector.offsetWidth;
    this.introItems.car.height = this.introItems.car.selector.offsetHeight;
    this.introItems.curve.width = this.introItems.curve.selector.offsetWidth;
    this.introItems.curve.height = this.introItems.curve.selector.offsetHeight;
    for(let i = 0;i <= this.introSteps.count; i++) {
      let point = this.getPointByStep(i);
      let startPoint = this.getPointByStep(i);
      let endPoint = this.getPointByStep((i - 9) >= 0 ? (i - 9) : 0);
      let width = this.introItems.car.width;
      let height = this.introItems.car.height;
      if(startPoint && endPoint) {
        height = ((startPoint.y - endPoint.y) * this.introItems.curve.height);
      }
      this.introSteps.details[i] = {
        x: (((this.introItems.curve.width + this.introItems.car.width) / this.introSteps.count) * i),
        y: point ? ((1 - point.y) * this.introItems.curve.height) : 0,
        r: (startPoint && endPoint) ? (Math.atan(height / width) * (180 / Math.PI)) : 0
      };
    }
    this.introSteps.details = this.introSteps.details.map((v, i, a) => {
      if(i > 0) {
        if(!v.y) {
          v.y = a[i-1].y;
        }
        if(!v.r) {
          v.r = a[i-1].r;
        }
      }
      return v;
    });
  }

  draw = (percentage) => {
    this.percentage = percentage;
    if(document.querySelector('html').getAttribute('dir') === 'rtl') {
      this.introItems.car.selector.style.left = `calc(100% - ${this.introSteps.details[this.percentage].x}px)`;
      this.introItems.car.selector.style.bottom = `${this.introSteps.details[100 - this.percentage].y}px`;
      this.introItems.car.selector.style.transform = `rotateZ(${this.introSteps.details[100 - this.percentage].r}deg)`;
    } else {
      this.introItems.car.selector.style.right = `calc(100% - ${this.introSteps.details[this.percentage].x}px)`;
      this.introItems.car.selector.style.bottom = `${this.introSteps.details[this.percentage].y}px`;
      this.introItems.car.selector.style.transform = `rotateZ(${this.introSteps.details[this.percentage].r}deg)`;
    }
  }
}

animationElements = [...document.querySelectorAll('.component--animation')].map(element => (new animation(element)));
const loading = () => (window.setTimeout(() => {
  sys.loadPercentage += 1;
  sys.loadPercentage = sys.loadPercentage > 100 ? 0 : sys.loadPercentage;
  if(sys.loaded) {
    document.querySelector('.component--intro').classList.add('status--loaded');
  }
  if(!(sys.loaded && sys.loadPercentage === 0)) {
    animationElements.forEach(animationElement => {
      animationElement.draw(sys.loadPercentage);
    });
    loading();
  }
}, (4000 / 100)));
loading();

window.addEventListener('load', ev => {
  sys.loaded = true;
});
document.querySelector('[data-type="switch"][data-switch="menu"][data-tutorial="toggle"]').addEventListener('click', ev => {
  document.querySelector('.component--header').classList.toggle('status--active-menu');
});
document.querySelectorAll('[data-type="switch"][data-switch="tutorial"][data-tutorial="on"]').forEach(element => {
  element.addEventListener('click', ev => {
    document.querySelector('.component--tutorial').classList.add('status--active');
  });
});
document.querySelectorAll('[data-type="switch"][data-switch="tutorial"][data-tutorial="off"]').forEach(element => {
  element.addEventListener('click', ev => {
    document.querySelector('.component--tutorial').classList.remove('status--active');
  });
});