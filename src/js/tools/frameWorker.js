const debug = require('debug')('frameWorker');
const qs = require('querystring');
import Transport from './transport';


class FrameWorker {
  constructor(id) {
    this.id = id;
    this.frame = null;
    this.isLoaded = false;

    this.messageStack = [];

    this.frameListener = this.frameListener.bind(this);

    this.initTransport();
  }
  initTransport() {
    const self = this;

    this.transport = new Transport({
      onMessage(listener) {
        self.onMessage = listener;
      },
      postMessage(msg) {
        self.postMessage(msg);
      }
    });

    this.sendMessage = this.transport.sendMessage.bind(this.transport);
    this.addListener = this.transport.addListener.bind(this.transport);
    this.removeListener = this.transport.removeListener.bind(this.transport);
  }
  onMessage(msg) {

  }
  frameListener(e) {
    if (this.frame && e.source === this.frame.contentWindow) {
      this.onMessage(e.data);
    }
  }
  init() {
    this.destroyFrame();
    window.addEventListener("message", this.frameListener);
    const frame = this.frame = document.createElement('iframe');
    frame.src = 'sandbox.html' + '#' + qs.stringify({
      id: this.id
    });
    frame.style.display = 'none';
    frame.onload = () => {
      frame.onload = null;
      this.isLoaded = true;
      while (this.messageStack.length) {
        this.postMessage(this.messageStack.shift());
      }
    };
    document.body.appendChild(frame);
  }
  postMessage(msg) {
    if (!this.isLoaded) {
      this.messageStack.push(msg);
    } else {
      this.frame.contentWindow.postMessage(msg, '*');
    }
  }
  destroyFrame() {
    window.removeEventListener("message", this.frameListener);
    if (this.frame) {
      if (this.frame.parentNode) {
        this.frame.parentNode.removeChild(this.frame);
      }
    }
  }
  destroy() {
    this.destroyFrame();
    this.transport.destroy();
  }
}

export default FrameWorker;