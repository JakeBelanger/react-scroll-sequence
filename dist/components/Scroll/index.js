"use strict";

require("core-js/modules/es.object.assign.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _reactSpring = require("react-spring");

var _utils = require("./utils");

const _excluded = ["children", "images", "priorityFrames", "starts", "ends", "style"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const ScrollSequence = _ref => {
  let {
    children,
    images,
    priorityFrames,
    starts = "in",
    ends = "in",
    style
  } = _ref,
      rest = _objectWithoutProperties(_ref, _excluded);

  const loadingQueue = (0, _react.useRef)((priorityFrames || []).concat((0, _utils.createLoadingQueue)(images.length)));
  const loadedImages = (0, _react.useRef)([]);
  const canvasRef = (0, _react.useRef)(null);
  const containerRef = (0, _react.useRef)(null);
  const [{
    spring
  }, api] = (0, _reactSpring.useSpring)(() => ({
    spring: 0,
    config: _reactSpring.config.slow,
    onChange: () => draw()
  }));

  const nearestLoadedImage = target => {
    const images = loadedImages.current;
    if (images[target]) return images[target];

    for (let i = 1; i < images.length; i++) {
      if (images[target - i]) return images[target - i];
      if (images[target + i]) return images[target + i];
    }
  };

  function draw() {
    const val = ~~spring.get();
    const ctx = canvasRef.current.getContext('2d');
    const image = nearestLoadedImage(val);

    if (image !== null && image !== void 0 && image.width) {
      (0, _utils.drawImageCover)(ctx, image);
    }
  }

  const loadNextImage = () => {
    if (loadingQueue.current.length === 0) return; // queue is empty, finished loading

    const e = loadingQueue.current.shift(); // check if image has already been loaded

    if (loadedImages.current[e]) {
      return loadNextImage();
    }

    const onLoad = () => {
      img.removeEventListener('load', onLoad);
      loadedImages.current[e] = img;

      if (e === 0) {
        draw();
      }

      loadNextImage();
    }; // prepare the image


    const img = new Image();
    img.addEventListener('load', onLoad);
    img.src = images[e];
  };

  const getPercentScrolled = () => {
    const el = containerRef.current;
    const doc = document.documentElement;
    const clientOffsety = doc.scrollTop || window.pageYOffset;
    const elementHeight = el.clientHeight || el.offsetHeight;
    const clientHeight = doc.clientHeight;
    let target = el;
    let offsetY = 0;

    do {
      offsetY += target.offsetTop;
      target = target.offsetParent;
    } while (target && target !== window);

    let u = clientOffsety - offsetY;
    let d = elementHeight + clientHeight;
    if (starts === 'out') u += clientHeight;
    if (ends === 'in') d -= clientHeight;
    if (starts === 'in') d -= clientHeight; // start: out, ends: out
    // const value = ((clientOffsety + clientHeight) - offsetY) / (clientHeight + elementHeight) * 100;
    //start: in, ends: out
    // const value = (clientOffsety - offsetY) / (elementHeight) * 100;
    //start: out, ends: in
    // const value = ((clientOffsety + clientHeight) - offsetY) / (elementHeight) * 100;
    // Start: in, ends: in
    // (clientOffsety - offsetY) / (elementHeight - clientHeight)

    const value = u / d;
    return value > 1 ? 1 : value < 0 ? 0 : value;
  };

  (0, _react.useEffect)(() => {
    // Start loading images
    loadNextImage();

    const handleScroll = e => {
      const percent = getPercentScrolled();
      api.start({
        spring: percent * images.length
      });
    }; // Handle resize


    function updateSize() {
      const w = canvasRef.current.parentElement.clientWidth;
      const h = canvasRef.current.parentElement.clientHeight;
      const canvas = canvasRef.current;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = "".concat(w, "px");
      canvas.style.height = "".concat(h, "px");
      draw();
    }

    window.addEventListener('resize', updateSize);
    window.addEventListener('scroll', handleScroll);
    updateSize();
    console.log((0, _utils.createLoadingQueue)(20));
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [draw, loadNextImage]);
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: containerRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      height: '100vh',
      width: '100%',
      position: "sticky",
      inset: '0'
    }
  }, /*#__PURE__*/_react.default.createElement("canvas", {
    ref: canvasRef
  })), /*#__PURE__*/_react.default.createElement("div", _extends({
    style: _objectSpread({
      position: 'relative'
    }, style)
  }, rest), children));
};

var _default = ScrollSequence;
exports.default = _default;