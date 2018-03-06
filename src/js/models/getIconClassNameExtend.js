import blankSvg from '../../img/blank.svg';

const getIconClassNameExtend = self => {
  let styleNode = null;
  return {
    views: {
      getIconClassName() {
        const className = 'icon_' + self.id;
        if (!styleNode) {
          let icon = null;
          if (self.meta.icon64) {
            icon = JSON.stringify(self.meta.icon64);
          }
          if (self.meta.icon) {
            icon = JSON.stringify(self.meta.icon);
          }
          if (!icon) {
            icon = blankSvg;
          }

          styleNode = document.createElement('style');
          styleNode.textContent = `.${className} {
          background-image:url(${icon});
        }`;

          document.body.appendChild(styleNode);
        }
        return className;
      },
      beforeDestroy() {
        if (styleNode) {
          if (styleNode.parentNode) {
            styleNode.parentNode.removeChild(styleNode);
          }
          styleNode = null;
        }
      }
    }
  }
};


export default getIconClassNameExtend;
