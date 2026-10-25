import { createRequire } from 'module';
import { jsx, Fragment, jsxs } from 'preact/jsx-runtime';
import { createContext, createElement, h, toChildArray } from 'preact';
import { useContext } from 'preact/hooks';

createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));

// node_modules/inline-style-parser/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/inline-style-parser/cjs/index.js"(exports, module) {
    var COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
    var NEWLINE_REGEX = /\n/g;
    var WHITESPACE_REGEX = /^\s*/;
    var PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
    var COLON_REGEX = /^:\s*/;
    var VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
    var SEMICOLON_REGEX = /^[;\s]*/;
    var TRIM_REGEX = /^\s+|\s+$/g;
    var NEWLINE = "\n";
    var FORWARD_SLASH = "/";
    var ASTERISK = "*";
    var EMPTY_STRING = "";
    var TYPE_COMMENT = "comment";
    var TYPE_DECLARATION = "declaration";
    function index2(style, options) {
      if (typeof style !== "string") {
        throw new TypeError("First argument must be a string");
      }
      if (!style) return [];
      options = options || {};
      var lineno = 1;
      var column = 1;
      function updatePosition(str) {
        var lines = str.match(NEWLINE_REGEX);
        if (lines) lineno += lines.length;
        var i = str.lastIndexOf(NEWLINE);
        column = ~i ? str.length - i : column + str.length;
      }
      function position3() {
        var start2 = { line: lineno, column };
        return function(node) {
          node.position = new Position(start2);
          whitespace2();
          return node;
        };
      }
      function Position(start2) {
        this.start = start2;
        this.end = { line: lineno, column };
        this.source = options.source;
      }
      Position.prototype.content = style;
      function error(msg) {
        var err = new Error(
          options.source + ":" + lineno + ":" + column + ": " + msg
        );
        err.reason = msg;
        err.filename = options.source;
        err.line = lineno;
        err.column = column;
        err.source = style;
        if (options.silent) ;
        else {
          throw err;
        }
      }
      function match(re2) {
        var m = re2.exec(style);
        if (!m) return;
        var str = m[0];
        updatePosition(str);
        style = style.slice(str.length);
        return m;
      }
      function whitespace2() {
        match(WHITESPACE_REGEX);
      }
      function comments(rules) {
        var c;
        rules = rules || [];
        while (c = comment()) {
          if (c !== false) {
            rules.push(c);
          }
        }
        return rules;
      }
      function comment() {
        var pos = position3();
        if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;
        var i = 2;
        while (EMPTY_STRING != style.charAt(i) && (ASTERISK != style.charAt(i) || FORWARD_SLASH != style.charAt(i + 1))) {
          ++i;
        }
        i += 2;
        if (EMPTY_STRING === style.charAt(i - 1)) {
          return error("End of comment missing");
        }
        var str = style.slice(2, i - 2);
        column += 2;
        updatePosition(str);
        style = style.slice(i);
        column += 2;
        return pos({
          type: TYPE_COMMENT,
          comment: str
        });
      }
      function declaration() {
        var pos = position3();
        var prop = match(PROPERTY_REGEX);
        if (!prop) return;
        comment();
        if (!match(COLON_REGEX)) return error("property missing ':'");
        var val = match(VALUE_REGEX);
        var ret = pos({
          type: TYPE_DECLARATION,
          property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
          value: val ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING)) : EMPTY_STRING
        });
        match(SEMICOLON_REGEX);
        return ret;
      }
      function declarations() {
        var decls = [];
        comments(decls);
        var decl;
        while (decl = declaration()) {
          if (decl !== false) {
            decls.push(decl);
            comments(decls);
          }
        }
        return decls;
      }
      whitespace2();
      return declarations();
    }
    function trim(str) {
      return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
    }
    module.exports = index2;
  }
});

// node_modules/style-to-object/cjs/index.js
var require_cjs2 = __commonJS({
  "node_modules/style-to-object/cjs/index.js"(exports) {
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = StyleToObject;
    var inline_style_parser_1 = __importDefault(require_cjs());
    function StyleToObject(style, iterator) {
      let styleObject = null;
      if (!style || typeof style !== "string") {
        return styleObject;
      }
      const declarations = (0, inline_style_parser_1.default)(style);
      const hasIterator = typeof iterator === "function";
      declarations.forEach((declaration) => {
        if (declaration.type !== "declaration") {
          return;
        }
        const { property, value } = declaration;
        if (hasIterator) {
          iterator(property, value, declaration);
        } else if (value) {
          styleObject = styleObject || {};
          styleObject[property] = value;
        }
      });
      return styleObject;
    }
  }
});

// node_modules/style-to-js/cjs/utilities.js
var require_utilities = __commonJS({
  "node_modules/style-to-js/cjs/utilities.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.camelCase = void 0;
    var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
    var HYPHEN_REGEX = /-([a-z])/g;
    var NO_HYPHEN_REGEX = /^[^-]+$/;
    var VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
    var MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;
    var skipCamelCase = function(property) {
      return !property || NO_HYPHEN_REGEX.test(property) || CUSTOM_PROPERTY_REGEX.test(property);
    };
    var capitalize = function(match, character) {
      return character.toUpperCase();
    };
    var trimHyphen = function(match, prefix) {
      return "".concat(prefix, "-");
    };
    var camelCase = function(property, options) {
      if (options === void 0) {
        options = {};
      }
      if (skipCamelCase(property)) {
        return property;
      }
      property = property.toLowerCase();
      if (options.reactCompat) {
        property = property.replace(MS_VENDOR_PREFIX_REGEX, trimHyphen);
      } else {
        property = property.replace(VENDOR_PREFIX_REGEX, trimHyphen);
      }
      return property.replace(HYPHEN_REGEX, capitalize);
    };
    exports.camelCase = camelCase;
  }
});

// node_modules/style-to-js/cjs/index.js
var require_cjs3 = __commonJS({
  "node_modules/style-to-js/cjs/index.js"(exports, module) {
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var style_to_object_1 = __importDefault(require_cjs2());
    var utilities_1 = require_utilities();
    function StyleToJS(style, options) {
      var output = {};
      if (!style || typeof style !== "string") {
        return output;
      }
      (0, style_to_object_1.default)(style, function(property, value) {
        if (property && value) {
          output[(0, utilities_1.camelCase)(property, options)] = value;
        }
      });
      return output;
    }
    StyleToJS.default = StyleToJS;
    module.exports = StyleToJS;
  }
});

// node_modules/comma-separated-tokens/index.js
function stringify(values, options) {
  const settings = {};
  const input = values[values.length - 1] === "" ? [...values, ""] : values;
  return input.join(
    (settings.padRight ? " " : "") + "," + (settings.padLeft === false ? "" : " ")
  ).trim();
}

// node_modules/devlop/lib/default.js
function ok() {
}

// node_modules/estree-util-is-identifier-name/lib/index.js
var nameRe = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
var nameReJsx = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
var emptyOptions = {};
function name(name2, options) {
  const settings = emptyOptions;
  const re2 = settings.jsx ? nameReJsx : nameRe;
  return re2.test(name2);
}

// node_modules/hast-util-whitespace/lib/index.js
var re = /[ \t\n\f\r]/g;
function whitespace(thing) {
  return typeof thing === "object" ? thing.type === "text" ? empty(thing.value) : false : empty(thing);
}
function empty(value) {
  return value.replace(re, "") === "";
}

// node_modules/property-information/lib/util/schema.js
var Schema = class {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(property, normal, space) {
    this.normal = normal;
    this.property = property;
    if (space) {
      this.space = space;
    }
  }
};
Schema.prototype.normal = {};
Schema.prototype.property = {};
Schema.prototype.space = void 0;

// node_modules/property-information/lib/util/merge.js
function merge(definitions, space) {
  const property = {};
  const normal = {};
  for (const definition of definitions) {
    Object.assign(property, definition.property);
    Object.assign(normal, definition.normal);
  }
  return new Schema(property, normal, space);
}

// node_modules/property-information/lib/normalize.js
function normalize(value) {
  return value.toLowerCase();
}

// node_modules/property-information/lib/util/info.js
var Info = class {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(property, attribute) {
    this.attribute = attribute;
    this.property = property;
  }
};
Info.prototype.attribute = "";
Info.prototype.booleanish = false;
Info.prototype.boolean = false;
Info.prototype.commaOrSpaceSeparated = false;
Info.prototype.commaSeparated = false;
Info.prototype.defined = false;
Info.prototype.mustUseProperty = false;
Info.prototype.number = false;
Info.prototype.overloadedBoolean = false;
Info.prototype.property = "";
Info.prototype.spaceSeparated = false;
Info.prototype.space = void 0;

// node_modules/property-information/lib/util/types.js
var types_exports = {};
__export(types_exports, {
  boolean: () => boolean,
  booleanish: () => booleanish,
  commaOrSpaceSeparated: () => commaOrSpaceSeparated,
  commaSeparated: () => commaSeparated,
  number: () => number,
  overloadedBoolean: () => overloadedBoolean,
  spaceSeparated: () => spaceSeparated
});
var powers = 0;
var boolean = increment();
var booleanish = increment();
var overloadedBoolean = increment();
var number = increment();
var spaceSeparated = increment();
var commaSeparated = increment();
var commaOrSpaceSeparated = increment();
function increment() {
  return 2 ** ++powers;
}

// node_modules/property-information/lib/util/defined-info.js
var checks = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(types_exports)
);
var DefinedInfo = class extends Info {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(property, attribute, mask, space) {
    let index2 = -1;
    super(property, attribute);
    mark(this, "space", space);
    if (typeof mask === "number") {
      while (++index2 < checks.length) {
        const check = checks[index2];
        mark(this, checks[index2], (mask & types_exports[check]) === types_exports[check]);
      }
    }
  }
};
DefinedInfo.prototype.defined = true;
function mark(values, key, value) {
  if (value) {
    values[key] = value;
  }
}

// node_modules/property-information/lib/util/create.js
function create(definition) {
  const properties = {};
  const normals = {};
  for (const [property, value] of Object.entries(definition.properties)) {
    const info = new DefinedInfo(
      property,
      definition.transform(definition.attributes || {}, property),
      value,
      definition.space
    );
    if (definition.mustUseProperty && definition.mustUseProperty.includes(property)) {
      info.mustUseProperty = true;
    }
    properties[property] = info;
    normals[normalize(property)] = property;
    normals[normalize(info.attribute)] = property;
  }
  return new Schema(properties, normals, definition.space);
}

// node_modules/property-information/lib/aria.js
var aria = create({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: booleanish,
    ariaAutoComplete: null,
    ariaBusy: booleanish,
    ariaChecked: booleanish,
    ariaColCount: number,
    ariaColIndex: number,
    ariaColSpan: number,
    ariaControls: spaceSeparated,
    ariaCurrent: null,
    ariaDescribedBy: spaceSeparated,
    ariaDetails: null,
    ariaDisabled: booleanish,
    ariaDropEffect: spaceSeparated,
    ariaErrorMessage: null,
    ariaExpanded: booleanish,
    ariaFlowTo: spaceSeparated,
    ariaGrabbed: booleanish,
    ariaHasPopup: null,
    ariaHidden: booleanish,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: spaceSeparated,
    ariaLevel: number,
    ariaLive: null,
    ariaModal: booleanish,
    ariaMultiLine: booleanish,
    ariaMultiSelectable: booleanish,
    ariaOrientation: null,
    ariaOwns: spaceSeparated,
    ariaPlaceholder: null,
    ariaPosInSet: number,
    ariaPressed: booleanish,
    ariaReadOnly: booleanish,
    ariaRelevant: null,
    ariaRequired: booleanish,
    ariaRoleDescription: spaceSeparated,
    ariaRowCount: number,
    ariaRowIndex: number,
    ariaRowSpan: number,
    ariaSelected: booleanish,
    ariaSetSize: number,
    ariaSort: null,
    ariaValueMax: number,
    ariaValueMin: number,
    ariaValueNow: number,
    ariaValueText: null,
    role: null
  },
  transform(_, property) {
    return property === "role" ? property : "aria-" + property.slice(4).toLowerCase();
  }
});

// node_modules/property-information/lib/util/case-sensitive-transform.js
function caseSensitiveTransform(attributes, attribute) {
  return attribute in attributes ? attributes[attribute] : attribute;
}

// node_modules/property-information/lib/util/case-insensitive-transform.js
function caseInsensitiveTransform(attributes, property) {
  return caseSensitiveTransform(attributes, property.toLowerCase());
}

// node_modules/property-information/lib/html.js
var html = create({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: commaSeparated,
    acceptCharset: spaceSeparated,
    accessKey: spaceSeparated,
    action: null,
    allow: null,
    allowFullScreen: boolean,
    allowPaymentRequest: boolean,
    allowUserMedia: boolean,
    alpha: boolean,
    alt: null,
    as: null,
    async: boolean,
    autoCapitalize: null,
    autoComplete: spaceSeparated,
    autoFocus: boolean,
    autoPlay: boolean,
    blocking: spaceSeparated,
    capture: null,
    charSet: null,
    checked: boolean,
    cite: null,
    className: spaceSeparated,
    closedBy: null,
    colorSpace: null,
    cols: number,
    colSpan: number,
    command: null,
    commandFor: null,
    content: null,
    contentEditable: booleanish,
    controls: boolean,
    controlsList: spaceSeparated,
    coords: number | commaSeparated,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: boolean,
    defer: boolean,
    dir: null,
    dirName: null,
    disabled: boolean,
    download: overloadedBoolean,
    draggable: booleanish,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: boolean,
    formTarget: null,
    headers: spaceSeparated,
    height: number,
    hidden: overloadedBoolean,
    high: number,
    href: null,
    hrefLang: null,
    htmlFor: spaceSeparated,
    httpEquiv: spaceSeparated,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: boolean,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: boolean,
    itemId: null,
    itemProp: spaceSeparated,
    itemRef: spaceSeparated,
    itemScope: boolean,
    itemType: spaceSeparated,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: boolean,
    low: number,
    manifest: null,
    max: null,
    maxLength: number,
    media: null,
    method: null,
    min: null,
    minLength: number,
    multiple: boolean,
    muted: boolean,
    name: null,
    nonce: null,
    noModule: boolean,
    noValidate: boolean,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: boolean,
    optimum: number,
    pattern: null,
    ping: spaceSeparated,
    placeholder: null,
    playsInline: boolean,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: boolean,
    referrerPolicy: null,
    rel: spaceSeparated,
    required: boolean,
    reversed: boolean,
    rows: number,
    rowSpan: number,
    sandbox: spaceSeparated,
    scope: null,
    scoped: boolean,
    seamless: boolean,
    selected: boolean,
    shadowRootClonable: boolean,
    shadowRootCustomElementRegistry: boolean,
    shadowRootDelegatesFocus: boolean,
    shadowRootMode: null,
    shadowRootSerializable: boolean,
    shape: null,
    size: number,
    sizes: null,
    slot: null,
    span: number,
    spellCheck: booleanish,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: number,
    step: null,
    style: null,
    tabIndex: number,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: boolean,
    useMap: null,
    value: booleanish,
    width: number,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: spaceSeparated,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: number,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: number,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: boolean,
    // Lists. Use CSS to reduce space between items instead
    declare: boolean,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: number,
    // `<img>` and `<object>`
    leftMargin: number,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: number,
    // `<body>`
    marginWidth: number,
    // `<body>`
    noResize: boolean,
    // `<frame>`
    noHref: boolean,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: boolean,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: boolean,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: number,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: booleanish,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: number,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: number,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    credentialless: boolean,
    disablePictureInPicture: boolean,
    disableRemotePlayback: boolean,
    exportParts: commaSeparated,
    part: spaceSeparated,
    prefix: null,
    property: null,
    results: number,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: caseInsensitiveTransform
});

// node_modules/property-information/lib/svg.js
var svg = create({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    maskType: "mask-type",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: commaOrSpaceSeparated,
    accentHeight: number,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: number,
    amplitude: number,
    arabicForm: null,
    ascent: number,
    attributeName: null,
    attributeType: null,
    azimuth: number,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: number,
    by: null,
    calcMode: null,
    capHeight: number,
    className: spaceSeparated,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: number,
    diffuseConstant: number,
    direction: null,
    display: null,
    dur: null,
    divisor: number,
    dominantBaseline: null,
    download: boolean,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: number,
    enableBackground: null,
    end: null,
    event: null,
    exponent: number,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: number,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: commaSeparated,
    g2: commaSeparated,
    glyphName: commaSeparated,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: number,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: number,
    horizOriginX: number,
    horizOriginY: number,
    id: null,
    ideographic: number,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: number,
    k: number,
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    kernelMatrix: commaOrSpaceSeparated,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: number,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskType: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: number,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: number,
    overlineThickness: number,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: number,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: spaceSeparated,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: number,
    pointsAtY: number,
    pointsAtZ: number,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: commaOrSpaceSeparated,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: commaOrSpaceSeparated,
    rev: commaOrSpaceSeparated,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: commaOrSpaceSeparated,
    requiredFeatures: commaOrSpaceSeparated,
    requiredFonts: commaOrSpaceSeparated,
    requiredFormats: commaOrSpaceSeparated,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: number,
    specularExponent: number,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: number,
    strikethroughThickness: number,
    string: null,
    stroke: null,
    strokeDashArray: commaOrSpaceSeparated,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: number,
    strokeOpacity: number,
    strokeWidth: null,
    style: null,
    surfaceScale: number,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: commaOrSpaceSeparated,
    tabIndex: number,
    tableValues: null,
    target: null,
    targetX: number,
    targetY: number,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: commaOrSpaceSeparated,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: number,
    underlineThickness: number,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: number,
    values: null,
    vAlphabetic: number,
    vMathematical: number,
    vectorEffect: null,
    vHanging: number,
    vIdeographic: number,
    version: null,
    vertAdvY: number,
    vertOriginX: number,
    vertOriginY: number,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: number,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: caseSensitiveTransform
});

// node_modules/property-information/lib/xlink.js
var xlink = create({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(_, property) {
    return "xlink:" + property.slice(5).toLowerCase();
  }
});

// node_modules/property-information/lib/xmlns.js
var xmlns = create({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: caseInsensitiveTransform
});

// node_modules/property-information/lib/xml.js
var xml = create({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(_, property) {
    return "xml:" + property.slice(3).toLowerCase();
  }
});

// node_modules/property-information/lib/hast-to-react.js
var hastToReact = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
};

// node_modules/property-information/lib/find.js
var cap = /[A-Z]/g;
var dash = /-[a-z]/g;
var valid = /^data[-\w.:]+$/i;
function find(schema, value) {
  const normal = normalize(value);
  let property = value;
  let Type = Info;
  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]];
  }
  if (normal.length > 4 && normal.slice(0, 4) === "data" && valid.test(value)) {
    if (value.charAt(4) === "-") {
      const rest = value.slice(5).replace(dash, camelcase);
      property = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
    } else {
      const rest = value.slice(4);
      if (!dash.test(rest)) {
        let dashes = rest.replace(cap, kebab);
        if (dashes.charAt(0) !== "-") {
          dashes = "-" + dashes;
        }
        value = "data" + dashes;
      }
    }
    Type = DefinedInfo;
  }
  return new Type(property, value);
}
function kebab($0) {
  return "-" + $0.toLowerCase();
}
function camelcase($0) {
  return $0.charAt(1).toUpperCase();
}

// node_modules/property-information/index.js
var html2 = merge([aria, html, xlink, xmlns, xml], "html");
var svg2 = merge([aria, svg, xlink, xmlns, xml], "svg");

// node_modules/space-separated-tokens/index.js
function stringify2(values) {
  return values.join(" ").trim();
}

// node_modules/hast-util-to-jsx-runtime/lib/index.js
var import_style_to_js = __toESM(require_cjs3());
var pointStart = point("start");
function point(type) {
  return point3;
  function point3(node) {
    const point4 = node && node.position && node.position[type] || {};
    if (typeof point4.line === "number" && point4.line > 0 && typeof point4.column === "number" && point4.column > 0) {
      return {
        line: point4.line,
        column: point4.column,
        offset: typeof point4.offset === "number" && point4.offset > -1 ? point4.offset : void 0
      };
    }
  }
}

// node_modules/unist-util-stringify-position/lib/index.js
function stringifyPosition(value) {
  if (!value || typeof value !== "object") {
    return "";
  }
  if ("position" in value || "type" in value) {
    return position2(value.position);
  }
  if ("start" in value || "end" in value) {
    return position2(value);
  }
  if ("line" in value || "column" in value) {
    return point2(value);
  }
  return "";
}
function point2(point3) {
  return index(point3 && point3.line) + ":" + index(point3 && point3.column);
}
function position2(pos) {
  return point2(pos && pos.start) + "-" + point2(pos && pos.end);
}
function index(value) {
  return value && typeof value === "number" ? value : 1;
}

// node_modules/vfile-message/lib/index.js
var VFileMessage = class extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(causeOrReason, optionsOrParentOrPlace, origin) {
    super();
    if (typeof optionsOrParentOrPlace === "string") {
      origin = optionsOrParentOrPlace;
      optionsOrParentOrPlace = void 0;
    }
    let reason = "";
    let options = {};
    let legacyCause = false;
    if (optionsOrParentOrPlace) {
      if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("type" in optionsOrParentOrPlace) {
        options = {
          ancestors: [optionsOrParentOrPlace],
          place: optionsOrParentOrPlace.position
        };
      } else {
        options = { ...optionsOrParentOrPlace };
      }
    }
    if (typeof causeOrReason === "string") {
      reason = causeOrReason;
    } else if (!options.cause && causeOrReason) {
      legacyCause = true;
      reason = causeOrReason.message;
      options.cause = causeOrReason;
    }
    if (!options.ruleId && !options.source && typeof origin === "string") {
      const index2 = origin.indexOf(":");
      if (index2 === -1) {
        options.ruleId = origin;
      } else {
        options.source = origin.slice(0, index2);
        options.ruleId = origin.slice(index2 + 1);
      }
    }
    if (!options.place && options.ancestors && options.ancestors) {
      const parent = options.ancestors[options.ancestors.length - 1];
      if (parent) {
        options.place = parent.position;
      }
    }
    const start2 = options.place && "start" in options.place ? options.place.start : options.place;
    this.ancestors = options.ancestors || void 0;
    this.cause = options.cause || void 0;
    this.column = start2 ? start2.column : void 0;
    this.fatal = void 0;
    this.file = "";
    this.message = reason;
    this.line = start2 ? start2.line : void 0;
    this.name = stringifyPosition(options.place) || "1:1";
    this.place = options.place || void 0;
    this.reason = this.message;
    this.ruleId = options.ruleId || void 0;
    this.source = options.source || void 0;
    this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
    this.actual = void 0;
    this.expected = void 0;
    this.note = void 0;
    this.url = void 0;
  }
};
VFileMessage.prototype.file = "";
VFileMessage.prototype.name = "";
VFileMessage.prototype.reason = "";
VFileMessage.prototype.message = "";
VFileMessage.prototype.stack = "";
VFileMessage.prototype.column = void 0;
VFileMessage.prototype.line = void 0;
VFileMessage.prototype.ancestors = void 0;
VFileMessage.prototype.cause = void 0;
VFileMessage.prototype.fatal = void 0;
VFileMessage.prototype.place = void 0;
VFileMessage.prototype.ruleId = void 0;
VFileMessage.prototype.source = void 0;

// node_modules/hast-util-to-jsx-runtime/lib/index.js
var own = {}.hasOwnProperty;
var emptyMap = /* @__PURE__ */ new Map();
var cap2 = /[A-Z]/g;
var tableElements = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]);
var tableCellElement = /* @__PURE__ */ new Set(["td", "th"]);
var docs = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function toJsxRuntime(tree, options) {
  if (!options || options.Fragment === void 0) {
    throw new TypeError("Expected `Fragment` in options");
  }
  const filePath = options.filePath || void 0;
  let create2;
  if (options.development) {
    if (typeof options.jsxDEV !== "function") {
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    }
    create2 = developmentCreate(filePath, options.jsxDEV);
  } else {
    if (typeof options.jsx !== "function") {
      throw new TypeError("Expected `jsx` in production options");
    }
    if (typeof options.jsxs !== "function") {
      throw new TypeError("Expected `jsxs` in production options");
    }
    create2 = productionCreate(filePath, options.jsx, options.jsxs);
  }
  const state = {
    Fragment: options.Fragment,
    ancestors: [],
    components: options.components || {},
    create: create2,
    elementAttributeNameCase: options.elementAttributeNameCase || "react",
    evaluater: options.createEvaluater ? options.createEvaluater() : void 0,
    filePath,
    ignoreInvalidStyle: options.ignoreInvalidStyle || false,
    passKeys: options.passKeys !== false,
    passNode: options.passNode || false,
    schema: options.space === "svg" ? svg2 : html2,
    stylePropertyNameCase: options.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: options.tableCellAlignToStyle !== false
  };
  const result = one(state, tree, void 0);
  if (result && typeof result !== "string") {
    return result;
  }
  return state.create(
    tree,
    state.Fragment,
    { children: result || void 0 },
    void 0
  );
}
function one(state, node, key) {
  if (node.type === "element") {
    return element(state, node, key);
  }
  if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    return mdxExpression(state, node);
  }
  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    return mdxJsxElement(state, node, key);
  }
  if (node.type === "mdxjsEsm") {
    return mdxEsm(state, node);
  }
  if (node.type === "root") {
    return root(state, node, key);
  }
  if (node.type === "text") {
    return text(state, node);
  }
}
function element(state, node, key) {
  const parentSchema = state.schema;
  let schema = parentSchema;
  if (node.tagName.toLowerCase() === "svg" && parentSchema.space === "html") {
    schema = svg2;
    state.schema = schema;
  }
  state.ancestors.push(node);
  const type = findComponentFromName(state, node.tagName, false);
  const props = createElementProps(state, node);
  let children = createChildren(state, node);
  if (tableElements.has(node.tagName)) {
    children = children.filter(function(child) {
      return typeof child === "string" ? !whitespace(child) : true;
    });
  }
  addNode(state, props, type, node);
  addChildren(props, children);
  state.ancestors.pop();
  state.schema = parentSchema;
  return state.create(node, type, props, key);
}
function mdxExpression(state, node) {
  if (node.data && node.data.estree && state.evaluater) {
    const program = node.data.estree;
    const expression = program.body[0];
    ok(expression.type === "ExpressionStatement");
    return (
      /** @type {Child | undefined} */
      state.evaluater.evaluateExpression(expression.expression)
    );
  }
  crashEstree(state, node.position);
}
function mdxEsm(state, node) {
  if (node.data && node.data.estree && state.evaluater) {
    return (
      /** @type {Child | undefined} */
      state.evaluater.evaluateProgram(node.data.estree)
    );
  }
  crashEstree(state, node.position);
}
function mdxJsxElement(state, node, key) {
  const parentSchema = state.schema;
  let schema = parentSchema;
  if (node.name === "svg" && parentSchema.space === "html") {
    schema = svg2;
    state.schema = schema;
  }
  state.ancestors.push(node);
  const type = node.name === null ? state.Fragment : findComponentFromName(state, node.name, true);
  const props = createJsxElementProps(state, node);
  const children = createChildren(state, node);
  addNode(state, props, type, node);
  addChildren(props, children);
  state.ancestors.pop();
  state.schema = parentSchema;
  return state.create(node, type, props, key);
}
function root(state, node, key) {
  const props = {};
  addChildren(props, createChildren(state, node));
  return state.create(node, state.Fragment, props, key);
}
function text(_, node) {
  return node.value;
}
function addNode(state, props, type, node) {
  if (typeof type !== "string" && type !== state.Fragment && state.passNode) {
    props.node = node;
  }
}
function addChildren(props, children) {
  if (children.length > 0) {
    const value = children.length > 1 ? children : children[0];
    if (value) {
      props.children = value;
    }
  }
}
function productionCreate(_, jsx4, jsxs4) {
  return create2;
  function create2(_2, type, props, key) {
    const isStaticChildren = Array.isArray(props.children);
    const fn = isStaticChildren ? jsxs4 : jsx4;
    return key ? fn(type, props, key) : fn(type, props);
  }
}
function developmentCreate(filePath, jsxDEV) {
  return create2;
  function create2(node, type, props, key) {
    const isStaticChildren = Array.isArray(props.children);
    const point3 = pointStart(node);
    return jsxDEV(
      type,
      props,
      key,
      isStaticChildren,
      {
        columnNumber: point3 ? point3.column - 1 : void 0,
        fileName: filePath,
        lineNumber: point3 ? point3.line : void 0
      },
      void 0
    );
  }
}
function createElementProps(state, node) {
  const props = {};
  let alignValue;
  let prop;
  for (prop in node.properties) {
    if (prop !== "children" && own.call(node.properties, prop)) {
      const result = createProperty(state, prop, node.properties[prop]);
      if (result) {
        const [key, value] = result;
        if (state.tableCellAlignToStyle && key === "align" && typeof value === "string" && tableCellElement.has(node.tagName)) {
          alignValue = value;
        } else {
          props[key] = value;
        }
      }
    }
  }
  if (alignValue) {
    const style = (
      /** @type {Style} */
      props.style || (props.style = {})
    );
    style[state.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = alignValue;
  }
  return props;
}
function createJsxElementProps(state, node) {
  const props = {};
  for (const attribute of node.attributes) {
    if (attribute.type === "mdxJsxExpressionAttribute") {
      if (attribute.data && attribute.data.estree && state.evaluater) {
        const program = attribute.data.estree;
        const expression = program.body[0];
        ok(expression.type === "ExpressionStatement");
        const objectExpression = expression.expression;
        ok(objectExpression.type === "ObjectExpression");
        const property = objectExpression.properties[0];
        ok(property.type === "SpreadElement");
        Object.assign(
          props,
          state.evaluater.evaluateExpression(property.argument)
        );
      } else {
        crashEstree(state, node.position);
      }
    } else {
      const name2 = attribute.name;
      let value;
      if (attribute.value && typeof attribute.value === "object") {
        if (attribute.value.data && attribute.value.data.estree && state.evaluater) {
          const program = attribute.value.data.estree;
          const expression = program.body[0];
          ok(expression.type === "ExpressionStatement");
          value = state.evaluater.evaluateExpression(expression.expression);
        } else {
          crashEstree(state, node.position);
        }
      } else {
        value = attribute.value === null ? true : attribute.value;
      }
      props[name2] = /** @type {Props[keyof Props]} */
      value;
    }
  }
  return props;
}
function createChildren(state, node) {
  const children = [];
  let index2 = -1;
  const countsByName = state.passKeys ? /* @__PURE__ */ new Map() : emptyMap;
  while (++index2 < node.children.length) {
    const child = node.children[index2];
    let key;
    if (state.passKeys) {
      const name2 = child.type === "element" ? child.tagName : child.type === "mdxJsxFlowElement" || child.type === "mdxJsxTextElement" ? child.name : void 0;
      if (name2) {
        const count = countsByName.get(name2) || 0;
        key = name2 + "-" + count;
        countsByName.set(name2, count + 1);
      }
    }
    const result = one(state, child, key);
    if (result !== void 0) children.push(result);
  }
  return children;
}
function createProperty(state, prop, value) {
  const info = find(state.schema, prop);
  if (value === null || value === void 0 || typeof value === "number" && Number.isNaN(value)) {
    return;
  }
  if (Array.isArray(value)) {
    value = info.commaSeparated ? stringify(value) : stringify2(value);
  }
  if (info.property === "style") {
    let styleObject = typeof value === "object" ? value : parseStyle(state, String(value));
    if (state.stylePropertyNameCase === "css") {
      styleObject = transformStylesToCssCasing(styleObject);
    }
    return ["style", styleObject];
  }
  return [
    state.elementAttributeNameCase === "react" && info.space ? hastToReact[info.property] || info.property : info.attribute,
    value
  ];
}
function parseStyle(state, value) {
  try {
    return (0, import_style_to_js.default)(value, { reactCompat: true });
  } catch (error) {
    if (state.ignoreInvalidStyle) {
      return {};
    }
    const cause = (
      /** @type {Error} */
      error
    );
    const message = new VFileMessage("Cannot parse `style` attribute", {
      ancestors: state.ancestors,
      cause,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    message.file = state.filePath || void 0;
    message.url = docs + "#cannot-parse-style-attribute";
    throw message;
  }
}
function findComponentFromName(state, name2, allowExpression) {
  let result;
  if (!allowExpression) {
    result = { type: "Literal", value: name2 };
  } else if (name2.includes(".")) {
    const identifiers = name2.split(".");
    let index2 = -1;
    let node;
    while (++index2 < identifiers.length) {
      const prop = name(identifiers[index2]) ? { type: "Identifier", name: identifiers[index2] } : { type: "Literal", value: identifiers[index2] };
      node = node ? {
        type: "MemberExpression",
        object: node,
        property: prop,
        computed: Boolean(index2 && prop.type === "Literal"),
        optional: false
      } : prop;
    }
    result = node;
  } else {
    result = name(name2) && !/^[a-z]/.test(name2) ? { type: "Identifier", name: name2 } : { type: "Literal", value: name2 };
  }
  if (result.type === "Literal") {
    const name3 = (
      /** @type {string | number} */
      result.value
    );
    return own.call(state.components, name3) ? state.components[name3] : name3;
  }
  if (state.evaluater) {
    return state.evaluater.evaluateExpression(result);
  }
  crashEstree(state);
}
function crashEstree(state, place) {
  const message = new VFileMessage(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: state.ancestors,
      place,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  message.file = state.filePath || void 0;
  message.url = docs + "#cannot-handle-mdx-estrees-without-createevaluater";
  throw message;
}
function transformStylesToCssCasing(domCasing) {
  const cssCasing = {};
  let from;
  for (from in domCasing) {
    if (own.call(domCasing, from)) {
      cssCasing[transformStyleToCssCasing(from)] = domCasing[from];
    }
  }
  return cssCasing;
}
function transformStyleToCssCasing(from) {
  let to = from.replace(cap2, toDash);
  if (to.slice(0, 3) === "ms-") to = "-" + to;
  return to;
}
function toDash($0) {
  return "-" + $0.toLowerCase();
}
function childrenToString(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(childrenToString).join("");
  return String(children ?? "");
}
var builtinComponents = {
  table: (props) => /* @__PURE__ */ jsx("div", { class: "table-container", children: /* @__PURE__ */ jsx("table", { ...props }) }),
  style: ({ children, ...rest }) => h("style", { ...rest, dangerouslySetInnerHTML: { __html: childrenToString(children) } }),
  script: ({ children, ...rest }) => h("script", { ...rest, dangerouslySetInnerHTML: { __html: childrenToString(children) } })
};
function htmlToJsx(tree, components) {
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    elementAttributeNameCase: "html",
    components: { ...builtinComponents, ...components }
  });
}

// node_modules/@quartz-community/utils/dist/path.js
function isFullSlug(s) {
  const validStart = !(s.startsWith(".") || s.startsWith("/"));
  const validEnding = !s.endsWith("/");
  return validStart && validEnding && !_containsForbiddenCharacters(s);
}
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments(...args) {
  if (args.length === 0) {
    return "";
  }
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) {
    joined = "/" + joined;
  }
  if (last?.endsWith("/")) {
    joined = joined + "/";
  }
  return joined;
}
function endsWith(s, suffix) {
  return s === suffix || s.endsWith("/" + suffix);
}
function trimSuffix(s, suffix) {
  if (endsWith(s, suffix)) {
    s = s.slice(0, -suffix.length);
  }
  return s;
}
function stripSlashes(s, onlyStripPrefix) {
  if (s.startsWith("/")) {
    s = s.substring(1);
  }
  if (!onlyStripPrefix && s.endsWith("/")) {
    s = s.slice(0, -1);
  }
  return s;
}
function pathToRoot(slug2) {
  let rootPath = slug2.split("/").filter((x) => x !== "").slice(0, -1).map((_) => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}
function resolveRelative(current, target) {
  const res = joinSegments(pathToRoot(current), simplifySlug(target));
  return res;
}
function _containsForbiddenCharacters(s) {
  return s.includes(" ") || s.includes("#") || s.includes("?") || s.includes("&");
}

// src/options.ts
var lucideIconSpecifierPattern = /^lucide:([a-z0-9]+(?:-[a-z0-9]+)*)$/;
var hexAccentPattern = /^#[0-9a-fA-F]{6}$/;
function isObjectRecord(value) {
  try {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  } catch {
    return false;
  }
}
function ownDataValue(value, key) {
  if (!isObjectRecord(value)) return void 0;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function normalizePanelIconIdentifier(value) {
  if (typeof value !== "string") return void 0;
  const normalized = value.trim();
  return lucideIconSpecifierPattern.test(normalized) ? normalized : void 0;
}
function lucideIconNameFromIdentifier(value) {
  return lucideIconSpecifierPattern.exec(value)?.[1];
}
function isDirectAccent(value) {
  return hexAccentPattern.test(value);
}
function normalizeDirectAccent(value) {
  if (typeof value !== "string") return void 0;
  const normalized = value.trim();
  return isDirectAccent(normalized) ? normalized.toLowerCase() : void 0;
}
function normalizeDefaultAccent(value) {
  if (typeof value !== "string") return "theme";
  const normalized = value.trim();
  if (normalized === "theme") return normalized;
  return normalizeDirectAccent(normalized) ?? "theme";
}
function normalizeRootIndexPanelsOptions(options = void 0) {
  const layout = ownDataValue(options, "layout");
  const sort = ownDataValue(options, "sort");
  const tagCount = ownDataValue(options, "tagCount");
  const descriptionFallback = ownDataValue(options, "descriptionFallback");
  const showDescription = ownDataValue(options, "showDescription");
  const showDocCount = ownDataValue(options, "showDocCount");
  const showTags = ownDataValue(options, "showTags");
  const defaultIcon = normalizePanelIconIdentifier(ownDataValue(options, "defaultIcon")) ?? "lucide:book-open";
  const replaceExplorer = ownDataValue(options, "replaceExplorer");
  return {
    layout: layout === "list" || layout === "cards" ? layout : "cards",
    showDescription: typeof showDescription === "boolean" ? showDescription : true,
    showDocCount: typeof showDocCount === "boolean" ? showDocCount : true,
    showTags: typeof showTags === "boolean" ? showTags : true,
    tagCount: typeof tagCount === "number" && Number.isFinite(tagCount) ? Math.max(0, Math.floor(tagCount)) : 3,
    sort: sort === "alphabetical" || sort === "docCount" || sort === "date" ? sort : "alphabetical",
    descriptionFallback: typeof descriptionFallback === "string" ? descriptionFallback : "",
    defaultIcon,
    defaultAccent: normalizeDefaultAccent(ownDataValue(options, "defaultAccent")),
    replaceExplorer: typeof replaceExplorer === "boolean" ? replaceExplorer : true
  };
}

// src/appearance.ts
var themeAccent = Object.freeze({ kind: "theme" });
function ownDataValue2(value, key) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function resolveDefaultAccent(value) {
  if (value === "theme") return themeAccent;
  const direct = normalizeDirectAccent(value);
  return direct ? { kind: "direct", value: direct } : themeAccent;
}
function resolvePanelAccent(panelAccent, options) {
  const direct = normalizeDirectAccent(panelAccent);
  if (direct) return { kind: "direct", value: direct };
  return resolveDefaultAccent(ownDataValue2(options, "defaultAccent"));
}

// src/panel.ts
function panelValues(value) {
  if (typeof value === "string") {
    const lines = value.replace(/\n$/, "").split("\n");
    if (lines.length !== 2) return void 0;
    const parsed = {};
    for (const line of lines) {
      const match = /^(icon|accent): (.+)$/.exec(line);
      const key = match?.[1];
      const content = match?.[2];
      if (!key || !content || Object.hasOwn(parsed, key)) return void 0;
      parsed[key] = content;
    }
    const accent = parsed.accent;
    if (!parsed.icon || !accent) return void 0;
    const quoted = /^(["'])(#[0-9a-fA-F]{6})\1$/.exec(accent);
    return { icon: parsed.icon, accent: quoted ? quoted[2] : accent };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
  try {
    const icon = Object.getOwnPropertyDescriptor(value, "icon");
    const accent = Object.getOwnPropertyDescriptor(value, "accent");
    return {
      icon: icon && "value" in icon ? icon.value : void 0,
      accent: accent && "value" in accent ? accent.value : void 0
    };
  } catch {
    return void 0;
  }
}

// src/slug.ts
function parseCanonicalSlug(value) {
  if (typeof value !== "string" || !isFullSlug(value) || value.includes("\\")) return void 0;
  const parts = value.split("/");
  if (parts.length === 0 || parts.some((part) => part.length === 0 || part === "." || part === "..")) {
    return void 0;
  }
  return { slug: value, parts };
}

// src/books.ts
var maximumDateTimestamp = 864e13;
function isRecord(value) {
  try {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  } catch {
    return false;
  }
}
function ownValue(record, key) {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function isPhysical(file) {
  const filePath = ownValue(file, "filePath");
  return typeof filePath === "string" && filePath.length > 0;
}
function hasOwnDataProperty(value, key) {
  try {
    if (!isRecord(value)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== void 0 && "value" in descriptor;
  } catch {
    return false;
  }
}
function safeStringArray(value, limit) {
  try {
    if (!Array.isArray(value)) return [];
    const values = [];
    const length = Math.min(value.length, limit);
    for (let index2 = 0; index2 < length; index2 += 1) {
      let item;
      try {
        item = value[index2];
      } catch {
        continue;
      }
      if (typeof item === "string") values.push(item);
    }
    return values;
  } catch {
    return [];
  }
}
function isSupportedDateTimestamp(value) {
  return Number.isFinite(value) && Math.abs(value) <= maximumDateTimestamp;
}
function toTimestamp(value) {
  try {
    if (value instanceof Date) {
      const timestamp = Date.prototype.getTime.call(value);
      return isSupportedDateTimestamp(timestamp) ? timestamp : void 0;
    }
  } catch {
    return void 0;
  }
  if (typeof value === "number" && isSupportedDateTimestamp(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return isSupportedDateTimestamp(parsed) ? parsed : void 0;
  }
  return void 0;
}
function getFileTimestamp(file) {
  const rawFrontmatter = ownValue(file, "frontmatter");
  const rawDates = ownValue(file, "dates");
  const frontmatter = isRecord(rawFrontmatter) ? rawFrontmatter : {};
  const dates = isRecord(rawDates) ? rawDates : {};
  const candidates = [
    ownValue(dates, "modified"),
    ownValue(dates, "created"),
    ownValue(dates, "published"),
    ownValue(file, "modified"),
    ownValue(file, "updated"),
    ownValue(file, "created"),
    ownValue(file, "date"),
    ownValue(frontmatter, "modified"),
    ownValue(frontmatter, "updated"),
    ownValue(frontmatter, "created"),
    ownValue(frontmatter, "published"),
    ownValue(frontmatter, "date")
  ];
  for (const candidate of candidates) {
    const timestamp = toTimestamp(candidate);
    if (timestamp !== void 0) return timestamp;
  }
  return Number.NEGATIVE_INFINITY;
}
function humanizeSegment(segment) {
  const text2 = segment.replace(/-/g, " ");
  return text2.length === 0 ? text2 : text2.charAt(0).toUpperCase() + text2.slice(1);
}
function compareTitle(a, b) {
  const leftTitle = a.title.toLowerCase();
  const rightTitle = b.title.toLowerCase();
  if (leftTitle < rightTitle) return -1;
  if (leftTitle > rightTitle) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return a.segment < b.segment ? -1 : a.segment > b.segment ? 1 : 0;
}
function collectBooks(allFiles, options) {
  const destinations = /* @__PURE__ */ new Set();
  const physicalSlugs = /* @__PURE__ */ new Set();
  const books = /* @__PURE__ */ new Map();
  for (const file of allFiles) {
    const parsed = parseCanonicalSlug(ownValue(file, "slug"));
    if (!parsed) continue;
    const { slug: slug2, parts } = parsed;
    if (parts.length < 2) continue;
    const segment = parts[0];
    if (!segment || segment === "tags") continue;
    const physical = isPhysical(file);
    const listed = ownValue(file, "unlisted") !== true;
    const isBookIndex = parts.length === 2 && parts[1] === "index";
    const syntheticIndex = !physical && (hasOwnDataProperty(file, "canvasData") || hasOwnDataProperty(file, "basesData"));
    if (isBookIndex && listed && !syntheticIndex) {
      destinations.add(segment);
    }
    if (!physical || !listed || physicalSlugs.has(slug2)) continue;
    physicalSlugs.add(slug2);
    let book = books.get(segment);
    if (!book) {
      book = { segment, docCount: 0, date: Number.NEGATIVE_INFINITY };
      books.set(segment, book);
    }
    if (slug2 !== `${segment}/index`) book.docCount += 1;
    book.date = Math.max(book.date, getFileTimestamp(file));
    if (isBookIndex && !book.metadata) book.metadata = file;
  }
  const entries = [];
  for (const book of books.values()) {
    if (!destinations.has(book.segment)) continue;
    const rawFrontmatter = book.metadata ? ownValue(book.metadata, "frontmatter") : void 0;
    const frontmatter = isRecord(rawFrontmatter) ? rawFrontmatter : {};
    const rawTitle = ownValue(frontmatter, "title");
    const rawDescription = ownValue(frontmatter, "description");
    const rawTags = ownValue(frontmatter, "tags");
    entries.push({
      segment: book.segment,
      title: typeof rawTitle === "string" ? rawTitle : humanizeSegment(book.segment),
      description: typeof rawDescription === "string" ? rawDescription : options.descriptionFallback,
      docCount: book.docCount,
      tags: safeStringArray(rawTags, options.tagCount),
      date: book.date,
      panel: panelValues(ownValue(frontmatter, "panel"))
    });
  }
  if (options.sort === "docCount") {
    entries.sort((a, b) => b.docCount - a.docCount || compareTitle(a, b));
  } else if (options.sort === "date") {
    entries.sort((a, b) => b.date - a.date || compareTitle(a, b));
  } else {
    entries.sort(compareTitle);
  }
  return entries;
}

// src/i18n/locales/en-US.ts
var enUS = {
  noteCount: (count) => `${count} ${count === 1 ? "note" : "notes"}`,
  bookCount: (count) => count === 1 ? "book" : "books",
  totalNotesLabel: "total notes",
  lastUpdatedLabel: "last edited",
  exploreLibrary: "Explore library",
  latestBooks: "Latest edited books",
  allBooks: "All books",
  sortBooks: "Sort books",
  sortNewest: "Edit date, newest first",
  sortOldest: "Edit date, oldest first",
  sortTitleAscending: "Title, A\u2013Z",
  sortTitleDescending: "Title, Z\u2013A",
  updatedLabel: (date) => `Edited ${date}`,
  sidebarNavigation: "Book navigation",
  switchBook: "Switch book",
  selectedBook: "selected book",
  bookHome: (title) => `Open ${title} home`,
  rootHome: "Open site home",
  toggleFolder: (title) => `Expand or collapse ${title}`,
  explorer: "Explorer",
  home: "Home",
  notes: "Notes",
  contents: "Contents",
  emptyState: "No books found."
};

// src/i18n/locales/fi-FI.ts
var fiFI = {
  noteCount: (count) => `${count} ${count === 1 ? "muistiinpano" : "muistiinpanoa"}`,
  bookCount: (count) => count === 1 ? "kirja" : "kirjaa",
  totalNotesLabel: "muistiinpanoja yhteens\xE4",
  lastUpdatedLabel: "muokattu viimeksi",
  exploreLibrary: "Selaa kirjastoa",
  latestBooks: "Viimeksi muokatut kirjat",
  allBooks: "Kaikki kirjat",
  sortBooks: "J\xE4rjest\xE4 kirjat",
  sortNewest: "Muokkausp\xE4iv\xE4, uusin ensin",
  sortOldest: "Muokkausp\xE4iv\xE4, vanhin ensin",
  sortTitleAscending: "Nimi, A\u2013\xD6",
  sortTitleDescending: "Nimi, \xD6\u2013A",
  updatedLabel: (date) => `Muokattu ${date}`,
  sidebarNavigation: "Kirjojen navigointi",
  switchBook: "Vaihda kirjaa",
  selectedBook: "valittu kirja",
  bookHome: (title) => `Avaa kirjan ${title} etusivu`,
  rootHome: "Avaa sivuston etusivu",
  toggleFolder: (title) => `Laajenna tai supista ${title}`,
  explorer: "Sis\xE4lt\xF6selain",
  home: "Etusivu",
  notes: "Muistiinpanot",
  contents: "Sis\xE4llys",
  emptyState: "Kirjoja ei l\xF6ytynyt."
};

// src/i18n/index.ts
var catalogs = {
  "en-US": enUS,
  "fi-FI": fiFI
};
function i18n(locale) {
  return typeof locale === "string" && Object.hasOwn(catalogs, locale) ? catalogs[locale] : enUS;
}

// node_modules/lucide-preact/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses = (...classes) => classes.filter((className, index2, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index2;
}).join(" ").trim();

// node_modules/lucide-preact/dist/esm/shared/src/utils/toLucideIconData.mjs
function toLucideIconData(iconName, iconNode, aliases = []) {
  {
    throw new Error("[lucide]: iconNode is required when icon name is used");
  }
}

// node_modules/lucide-preact/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase = (string) => {
  let out = "";
  let upperNext = false;
  for (const ch of string) {
    if (ch === "-" || ch === "_" || ch <= " ") {
      upperNext = out.length > 0;
      continue;
    }
    if (out.length === 0) {
      out += ch.toLowerCase();
    } else {
      out += upperNext ? ch.toUpperCase() : ch;
    }
    upperNext = false;
  }
  return out;
};

// node_modules/lucide-preact/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

// node_modules/lucide-preact/dist/esm/shared/src/build/defaultAttributes.mjs
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};

// node_modules/lucide-preact/dist/esm/shared/src/build/buildLucideIconNode.mjs
function isDefined(value) {
  return value !== null && value !== void 0;
}
function buildLucideIconNode(icon, params = {}) {
  const attributeNames = params.attributeNames ?? {};
  const getAttributeName = (attributeName) => attributeNames[attributeName] ?? attributeName;
  const viewBoxWidth = icon.size ?? icon.width ?? defaultAttributes["width"];
  const viewBoxHeight = icon.size ?? icon.height ?? defaultAttributes["height"];
  const aliasClassNames = icon.aliases?.filter((alias) => typeof alias === "string" && alias.trim() !== "").map((alias) => `lucide-${alias}`) ?? [];
  const iconClassNames = [...icon.name ? [`lucide-${icon.name}`] : [], ...aliasClassNames];
  const classNamesFromClassName = params.className?.split(" ").filter(Boolean) ?? [];
  const className = params.includeDefaultClasses === false ? mergeClasses(...classNamesFromClassName) : mergeClasses("lucide", ...iconClassNames, ...classNamesFromClassName);
  const calculatedStrokeWidth = params.absoluteStrokeWidth ? Number(params.strokeWidth ?? defaultAttributes["stroke-width"]) * Number(icon.size ?? icon.width ?? defaultAttributes["width"]) / Number(params.size ?? params.width ?? defaultAttributes["width"]) : params.strokeWidth ?? defaultAttributes["stroke-width"];
  const attributes = {
    ...Object.entries(defaultAttributes).reduce((attrs, [attrName, value]) => {
      attrs[getAttributeName(attrName)] = value;
      return attrs;
    }, {}),
    ..."color" in params && params.color && {
      [getAttributeName("stroke")]: params.color
    },
    ..."size" in params && isDefined(params.size) && {
      [getAttributeName("width")]: params.size,
      [getAttributeName("height")]: params.size
    },
    ..."width" in params && isDefined(params.width) && {
      [getAttributeName("width")]: params.width
    },
    ..."height" in params && isDefined(params.height) && {
      [getAttributeName("height")]: params.height
    },
    [getAttributeName("stroke-width")]: calculatedStrokeWidth,
    ...className && {
      [getAttributeName("class")]: className
    },
    [getAttributeName("viewBox")]: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    ...params.hasA11yProp === false ? {
      [getAttributeName("aria-hidden")]: "true"
    } : {},
    ..."attributes" in params && params.attributes
  };
  return [
    "svg",
    attributes,
    icon.node.map((child) => {
      const [name2, attrs, children] = child;
      const nextAttrs = params.nonScalingStroke ? { [getAttributeName("vector-effect")]: "non-scaling-stroke", ...attrs } : attrs;
      return children ? [name2, nextAttrs, children] : [name2, nextAttrs];
    })
  ];
}

// node_modules/lucide-preact/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};
var LucideContext = createContext({
  size: 24,
  color: "currentColor",
  strokeWidth: 2,
  absoluteStrokeWidth: false,
  nonScalingStroke: false,
  class: ""
});
var useLucideContext = () => useContext(LucideContext);

// node_modules/lucide-preact/dist/esm/Icon.mjs
var Icon = ({
  color,
  size,
  width,
  height,
  strokeWidth,
  absoluteStrokeWidth,
  nonScalingStroke,
  children,
  iconNode = [],
  icon = {
    node: iconNode,
    aliases: [],
    size: 24
  },
  class: classes = "",
  ...rest
}) => {
  const {
    size: contextSize = 24,
    strokeWidth: contextStrokeWidth = 2,
    absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
    nonScalingStroke: contextNonScalingStroke = false,
    color: contextColor = "currentColor",
    class: contextClass = ""
  } = useLucideContext() ?? {};
  const [name2, svgAttributes, builtIconNode = []] = buildLucideIconNode(icon, {
    color: color ?? contextColor,
    width: width ?? size ?? contextSize,
    height: height ?? size ?? contextSize,
    strokeWidth: strokeWidth ?? contextStrokeWidth,
    absoluteStrokeWidth: absoluteStrokeWidth ?? contextAbsoluteStrokeWidth,
    nonScalingStroke: nonScalingStroke ?? contextNonScalingStroke,
    className: mergeClasses(contextClass, classes),
    hasA11yProp: Boolean(children) || hasA11yProp(rest),
    attributes: rest
  });
  return h(name2, { ...svgAttributes }, [
    ...builtIconNode.map(([tag, attrs]) => h(tag, attrs)),
    ...toChildArray(children)
  ]);
};

// node_modules/lucide-preact/dist/esm/createLucideIcon.mjs
function createLucideIcon(iconDataOrName, iconNode, aliases = []) {
  const iconData = typeof iconDataOrName === "string" ? toLucideIconData(iconDataOrName, iconNode, aliases) : iconDataOrName;
  const Component = ({ class: classes = "", className = "", children, ...props }) => h(
    Icon,
    {
      ...props,
      icon: iconData,
      class: mergeClasses(classes, className)
    },
    children
  );
  if (iconData.name) {
    Component.displayName = toPascalCase(iconData.name);
  }
  return Component;
}

// node_modules/lucide-preact/dist/esm/icons/check.mjs
var __iconData = {
  name: "check",
  size: 24,
  node: [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]
};
__iconData.node;
var Check = createLucideIcon(__iconData);

// node_modules/lucide-preact/dist/esm/icons/chevron-right.mjs
var __iconData2 = {
  name: "chevron-right",
  size: 24,
  node: [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]
};
__iconData2.node;
var ChevronRight = createLucideIcon(__iconData2);

// node_modules/lucide-preact/dist/esm/icons/chevrons-up-down.mjs
var __iconData3 = {
  name: "chevrons-up-down",
  size: 24,
  node: [
    ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
    ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
  ]
};
__iconData3.node;
var ChevronsUpDown = createLucideIcon(__iconData3);

// node_modules/lucide-preact/dist/esm/icons/file-text.mjs
var __iconData4 = {
  name: "file-text",
  size: 24,
  node: [
    [
      "path",
      {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        key: "1oefj6"
      }
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
    ["path", { d: "M10 9H8", key: "b1mrlr" }],
    ["path", { d: "M16 13H8", key: "t4e002" }],
    ["path", { d: "M16 17H8", key: "z1uh3a" }]
  ]
};
__iconData4.node;
var FileText = createLucideIcon(__iconData4);

// node_modules/lucide-preact/dist/esm/icons/folder.mjs
var __iconData5 = {
  name: "folder",
  size: 24,
  node: [
    [
      "path",
      {
        d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
        key: "1kt360"
      }
    ]
  ]
};
__iconData5.node;
var Folder = createLucideIcon(__iconData5);

// node_modules/lucide-preact/dist/esm/icons/house.mjs
var __iconData6 = {
  name: "house",
  size: 24,
  node: [
    ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
    [
      "path",
      {
        d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        key: "r6nss1"
      }
    ]
  ],
  aliases: ["home"]
};
__iconData6.node;
var House = createLucideIcon(__iconData6);

// node_modules/lucide-preact/dist/esm/icons/table-properties.mjs
var __iconData7 = {
  name: "table-properties",
  size: 24,
  node: [
    ["path", { d: "M15 3v18", key: "14nvp0" }],
    ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
    ["path", { d: "M21 9H3", key: "1338ky" }],
    ["path", { d: "M21 15H3", key: "9uk58r" }]
  ]
};
__iconData7.node;
var TableProperties = createLucideIcon(__iconData7);

// node_modules/lucide-preact/dist/esm/icons/workflow.mjs
var __iconData8 = {
  name: "workflow",
  size: 24,
  node: [
    ["rect", { width: "8", height: "8", x: "3", y: "3", rx: "2", key: "by2w9f" }],
    ["path", { d: "M7 11v4a2 2 0 0 0 2 2h4", key: "xkn7yn" }],
    ["rect", { width: "8", height: "8", x: "13", y: "13", rx: "2", key: "1cgmvn" }]
  ]
};
__iconData8.node;
var Workflow = createLucideIcon(__iconData8);

// package.json
var package_default = {
  dependencies: {
    "lucide-preact": "1.49.0"
  }};

// src/icons.ts
function readLucideIconNode(icon) {
  const wrapper = icon({});
  const iconData = wrapper.props.icon;
  if (typeof iconData === "object" && iconData !== null && !Array.isArray(iconData) && Array.isArray(iconData.node)) {
    return iconData.node;
  }
  throw new TypeError("The current lucide-preact icon data contract changed");
}
function adaptLucideIcon(icon) {
  const iconNode = readLucideIconNode(icon);
  return ({ children, ...props }) => createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      ...props
    },
    ...iconNode.map(([tag, attributes]) => createElement(tag, attributes)),
    children
  );
}
var sidebarIcons = Object.freeze({
  base: adaptLucideIcon(TableProperties),
  canvas: adaptLucideIcon(Workflow),
  check: adaptLucideIcon(Check),
  chevronRight: adaptLucideIcon(ChevronRight),
  chevronsUpDown: adaptLucideIcon(ChevronsUpDown),
  folder: adaptLucideIcon(Folder),
  home: adaptLucideIcon(House),
  note: adaptLucideIcon(FileText)
});
var lucidePackageVersion = package_default.dependencies["lucide-preact"];
var lucideStaticBaseUrl = `https://cdn.jsdelivr.net/npm/lucide-static@${lucidePackageVersion}/icons`;
var remoteLucideIcons = /* @__PURE__ */ new Map();
function safeIconDimension(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.min(512, value) : 24;
}
function remoteLucideIcon(iconName) {
  const cached = remoteLucideIcons.get(iconName);
  if (cached) return cached;
  const url = `${lucideStaticBaseUrl}/${iconName}.svg`;
  const component = (props) => {
    const width = safeIconDimension(props.width);
    const height = safeIconDimension(props.height);
    const mask = `url(${url})`;
    return createElement("span", {
      "aria-hidden": "true",
      "data-rip-lucide-icon": iconName,
      style: [
        "display:block",
        `width:${width}px`,
        `height:${height}px`,
        "background:currentColor",
        `-webkit-mask:${mask} center/contain no-repeat`,
        `mask:${mask} center/contain no-repeat`,
        "pointer-events:none"
      ].join(";")
    });
  };
  remoteLucideIcons.set(iconName, component);
  return component;
}
function ownDataValue3(value, key) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function resolveIconName(value) {
  const name2 = normalizePanelIconIdentifier(value);
  if (!name2) return void 0;
  const lucideName = lucideIconNameFromIdentifier(name2);
  return lucideName ? { name: name2, component: remoteLucideIcon(lucideName) } : void 0;
}
function resolvePanelIcon(panelIcon, options) {
  return resolveIconName(panelIcon) ?? resolveIconName(ownDataValue3(options, "defaultIcon"));
}

// src/components/scripts/panels.inline.ts
var panels_inline_default = 'function m(e,t){let r=Number(e.dataset.ripDate);return{element:e,date:Number.isFinite(r)?r:Number.NEGATIVE_INFINITY,title:e.dataset.ripTitle??"",index:t}}function l(e,t){let r=e.title.toLowerCase(),n=t.title.toLowerCase();return r<n?-1:r>n?1:e.title<t.title?-1:e.title>t.title?1:e.index-t.index}function f(e,t,r){return r==="date-desc"?t.date-e.date||l(e,t):r==="date-asc"?e.date-t.date||l(e,t):r==="title-desc"?l(t,e)||e.index-t.index:l(e,t)}function p(e){let t=document.querySelector("#rip-books"),r=t?.querySelector("[data-rip-sort-control]"),n=t?.querySelector("[data-rip-book-list]");if(!r||!n)return;let o=Array.from(n.children).filter(c=>c instanceof HTMLElement).map(m),a=()=>{let c=r.value;if(["date-desc","date-asc","title-asc","title-desc"].includes(c))for(let d of[...o].sort((s,i)=>f(s,i,c)))n.append(d.element)};r.addEventListener("change",a),a(),e.push(()=>r.removeEventListener("change",a))}function y(e){let t=document.querySelectorAll(".rip-grid, .rip-list");for(let r of t){let n=Array.from(r.querySelectorAll(".rip-card, .rip-list-item"));if(n.length===0)continue;let u=o=>{if(o.altKey||o.ctrlKey||o.metaKey||o.shiftKey)return;let a=document.activeElement;if(!a)return;let d=a.closest(".rip-card-link, .rip-list-link")?.closest(".rip-card, .rip-list-item");if(!d)return;let s=n.indexOf(d);if(s===-1)return;let i;switch(o.key){case"ArrowRight":case"ArrowDown":i=n[s+1];break;case"ArrowLeft":case"ArrowUp":i=n[s-1];break;case"Home":i=n[0];break;case"End":i=n[n.length-1];break}i&&(o.preventDefault(),i.querySelector(".rip-card-link, .rip-list-link")?.focus())};r.addEventListener("keydown",u),e.push(()=>r.removeEventListener("keydown",u))}}function b(){let e=[];p(e),y(e),e.length>0&&typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>e.forEach(t=>t()))}typeof document<"u"&&document.addEventListener("nav",()=>b());\n';

// src/components/styles/root-library.scss
var root_library_default = ".rip-latest {\n  margin-top: 1.25rem;\n  padding-bottom: 1.5rem;\n  border-bottom: 1px solid var(--lightgray);\n}\n\n.rip-library-heading {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-bottom: 1rem;\n}\n.rip-library-heading .rip-section-heading {\n  min-width: 0;\n  flex: 1 1 auto;\n  margin: 0;\n}\n\n.rip-sort {\n  display: flex;\n  flex: 0 1 18rem;\n  flex-direction: column;\n  gap: 0.25rem;\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.7rem;\n}\n.rip-sort select {\n  width: 100%;\n  min-height: 2.4rem;\n  padding: 0.35rem 2rem 0.35rem 0.55rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 0.4rem;\n  color: var(--dark);\n  background: var(--light);\n  font: inherit;\n}\n.rip-sort select:hover {\n  border-color: var(--secondary);\n}\n.rip-sort select:focus-visible {\n  outline: 3px solid var(--secondary);\n  outline-offset: 2px;\n}\n\n.rip-updated {\n  display: block;\n  margin-top: auto;\n  padding-top: 0.35rem;\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  line-height: 1.45;\n}\n\n#rip-books {\n  scroll-margin-top: 1rem;\n}\n\n@media (max-width: 600px) {\n  .rip-library-heading {\n    align-items: stretch;\n    flex-direction: column;\n  }\n  .rip-sort {\n    width: 100%;\n    flex-basis: auto;\n  }\n}\n@media (forced-colors: active) {\n  .rip-latest,\n  .rip-sort select {\n    border-color: CanvasText;\n  }\n  .rip-sort select:focus-visible {\n    outline-color: Highlight;\n  }\n}";

// src/components/styles/panels.scss
var panels_default = '.rip {\n  width: 100%;\n  margin: 1.5rem 0 2.5rem;\n}\n.rip * {\n  box-sizing: border-box;\n}\n\n.rip-root-content {\n  margin-top: 1.25rem;\n  margin-bottom: 1.75rem;\n}\n\n.rip-overview {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 1.25rem;\n  padding: 1.15rem 0 1.35rem;\n  border-top: 1px solid var(--lightgray);\n}\n\n.rip-stats {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.25rem 2.5rem;\n  margin: 0;\n}\n\n.rip-stat {\n  display: flex;\n  min-width: 5.5rem;\n  flex-direction: column;\n}\n.rip-stat dt {\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.7rem;\n  letter-spacing: 0.03em;\n  line-height: 1.45;\n  text-transform: lowercase;\n}\n.rip-stat dd {\n  order: -1;\n  margin: 0;\n  color: var(--dark);\n  font-family: var(--headerFont);\n  font-size: 1.15rem;\n  font-weight: 700;\n  line-height: 1.35;\n}\n\n.rip-browse-link {\n  display: inline-flex;\n  flex: 0 0 auto;\n  align-items: center;\n  gap: 0.55rem;\n  padding: 0.55rem 0.75rem;\n  border: 1px solid color-mix(in srgb, var(--secondary) 60%, var(--lightgray));\n  border-radius: 0.45rem;\n  color: var(--secondary);\n  background: color-mix(in srgb, var(--secondary) 13%, var(--light));\n  font-size: 0.8rem;\n  font-weight: 650;\n  text-decoration: none;\n  transition: border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;\n}\n.rip-browse-link:hover {\n  border-color: var(--secondary);\n  background: color-mix(in srgb, var(--secondary) 21%, var(--light));\n  box-shadow: 0 0.25rem 0.8rem color-mix(in srgb, var(--secondary) 18%, transparent);\n  transform: translateY(-1px);\n}\n.rip-browse-link:focus-visible {\n  outline: 3px solid var(--secondary);\n  outline-offset: 3px;\n}\n\n.rip-directories {\n  scroll-margin-top: 1rem;\n}\n\n.rip-section-heading {\n  display: flex;\n  align-items: center;\n  gap: 0.8rem;\n  margin: 0 0 1rem;\n}\n.rip-section-heading::after {\n  height: 1px;\n  flex: 1 1 auto;\n  background: var(--lightgray);\n  content: "";\n}\n.rip-section-heading h2 {\n  margin: 0;\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.7rem;\n  font-weight: 500;\n  letter-spacing: 0.1em;\n  text-transform: uppercase;\n}\n.rip-section-heading span {\n  order: 2;\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n}\n\n.rip-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n.rip-empty {\n  margin: 0;\n  color: var(--gray);\n  font-size: 0.9rem;\n  font-style: italic;\n}\n\n.rip-desc {\n  flex: 1 1 auto;\n  margin: 0;\n  color: var(--gray);\n  font-size: 0.84rem;\n  line-height: 1.55;\n  overflow-wrap: anywhere;\n}\n\n.rip-panel-heading {\n  display: flex;\n  min-width: 0;\n  align-items: center;\n  gap: 0.65rem;\n}\n\n.rip-panel-icon {\n  display: inline-grid;\n  width: 2.35rem;\n  height: 2.35rem;\n  flex: 0 0 2.35rem;\n  place-items: center;\n  border: 1px solid var(--rip-panel-accent, var(--lightgray));\n  border-radius: 0.65rem;\n  color: var(--rip-panel-accent, var(--secondary));\n  background: var(--highlight);\n  pointer-events: none;\n}\n.rip-panel-icon svg {\n  display: block;\n  pointer-events: none;\n}\n\n.rip-count {\n  display: inline-block;\n  flex-shrink: 0;\n  padding: 0.1em 0.45em;\n  border: 1px solid var(--lightgray);\n  border-radius: 999px;\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  line-height: 1.6;\n  white-space: nowrap;\n}\n\n.rip-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-top: auto;\n  padding-top: 0.4rem;\n}\n\n.rip-tag {\n  padding: 0.12em 0.48em;\n  border-radius: 999px;\n  color: var(--rip-panel-accent, var(--secondary));\n  background: var(--highlight);\n  font-family: var(--codeFont);\n  font-size: 0.67rem;\n  overflow-wrap: anywhere;\n}\n\n.rip--cards .rip-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));\n  gap: 0.85rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n.rip--cards .rip-card {\n  min-width: 0;\n  margin: 0;\n}\n.rip--cards .rip-card-link {\n  position: relative;\n  isolation: isolate;\n  display: flex;\n  min-height: 10.5rem;\n  height: 100%;\n  flex-direction: column;\n  gap: 0.65rem;\n  padding: 1.05rem 1.1rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 0.8rem;\n  overflow: hidden;\n  color: var(--darkgray);\n  background: transparent;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);\n  text-decoration: none;\n  transition: transform 150ms ease-out;\n}\n.rip--cards .rip-card-link::before, .rip--cards .rip-card-link::after {\n  position: absolute;\n  z-index: 0;\n  opacity: 0;\n  content: "";\n  pointer-events: none;\n  transition: opacity 300ms ease;\n}\n.rip--cards .rip-card-link::before {\n  inset: 0;\n  border-radius: inherit;\n  background: radial-gradient(ellipse 120% 80% at 50% 0%, var(--highlight) 0%, transparent 70%);\n  background: radial-gradient(ellipse 120% 80% at 50% 0%, color-mix(in srgb, var(--rip-panel-accent, var(--secondary)) 8%, transparent) 0%, transparent 70%);\n}\n.rip--cards .rip-card-link::after {\n  right: 0;\n  bottom: 0;\n  left: 0;\n  height: 1px;\n  background: linear-gradient(90deg, transparent, var(--secondary), transparent);\n  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--rip-panel-accent, var(--secondary)) 50%, transparent), transparent);\n}\n.rip--cards .rip-card-link > * {\n  position: relative;\n  z-index: 1;\n}\n.rip--cards .rip-card-link:focus-visible {\n  outline: 3px solid var(--secondary);\n  outline-offset: 3px;\n}\n.rip--cards .rip-card-link:focus-visible::before, .rip--cards .rip-card-link:focus-visible::after {\n  opacity: 1;\n}\n.rip--cards .rip-card-top {\n  display: flex;\n  min-width: 0;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 0.65rem;\n}\n.rip--cards .rip-card-title {\n  min-width: 0;\n  color: var(--dark);\n  font-family: var(--headerFont);\n  font-size: 1rem;\n  font-weight: 650;\n  line-height: 1.3;\n  overflow-wrap: anywhere;\n  transition: color 150ms ease;\n}\n@media (hover: hover) {\n  .rip--cards .rip-card-link:hover {\n    transform: translateY(-2px);\n  }\n  .rip--cards .rip-card-link:hover::before, .rip--cards .rip-card-link:hover::after {\n    opacity: 1;\n  }\n}\n\n.rip--list .rip-list {\n  margin: 0;\n  padding: 0;\n  border-top: 1px solid var(--lightgray);\n  list-style: none;\n}\n.rip--list .rip-list-item {\n  margin: 0;\n  border-bottom: 1px solid var(--lightgray);\n}\n.rip--list .rip-list-link {\n  display: flex;\n  flex-direction: column;\n  gap: 0.35rem;\n  padding: 0.8rem 0.35rem 0.8rem 0.55rem;\n  border-inline-start: 0.2rem solid transparent;\n  color: var(--darkgray);\n  text-decoration: none;\n  transition: color 120ms ease, border-color 120ms ease, background-color 120ms ease;\n}\n.rip--list .rip-list-link[data-rip-accent] {\n  border-inline-start-color: var(--rip-panel-accent);\n}\n.rip--list .rip-list-link:hover {\n  color: var(--rip-panel-accent, var(--secondary));\n  background: var(--highlight);\n}\n.rip--list .rip-list-link:hover .rip-list-title {\n  color: var(--rip-panel-accent, var(--secondary));\n}\n.rip--list .rip-list-link:focus-visible {\n  outline: 3px solid var(--secondary);\n  outline-offset: 2px;\n}\n.rip--list .rip-list-row {\n  display: flex;\n  min-width: 0;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.rip--list .rip-list-title {\n  min-width: 0;\n  color: var(--dark);\n  font-family: var(--headerFont);\n  font-size: 0.96rem;\n  font-weight: 650;\n  overflow-wrap: anywhere;\n}\n.rip--list .rip-panel-icon {\n  width: 2rem;\n  height: 2rem;\n  flex-basis: 2rem;\n  border-radius: 0.55rem;\n}\n\n@media (max-width: 600px) {\n  .rip-overview {\n    align-items: stretch;\n    flex-direction: column;\n  }\n  .rip-stats {\n    gap: 1rem 1.5rem;\n  }\n  .rip-browse-link {\n    align-self: flex-start;\n  }\n  .rip--cards .rip-grid {\n    grid-template-columns: 1fr;\n  }\n  .rip--cards .rip-card-link {\n    min-height: 0;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .rip .rip-browse-link,\n  .rip .rip-card-link,\n  .rip .rip-card-link::before,\n  .rip .rip-card-link::after,\n  .rip .rip-card-title,\n  .rip .rip-list-link {\n    transition: none;\n  }\n  .rip .rip-browse-link:hover,\n  .rip--cards .rip-card-link:hover {\n    transform: none;\n  }\n}\n@media (forced-colors: active) {\n  .rip .rip-overview,\n  .rip .rip-browse-link,\n  .rip .rip-card-link,\n  .rip .rip-list,\n  .rip .rip-list-item,\n  .rip .rip-count,\n  .rip .rip-panel-icon {\n    border-color: CanvasText;\n  }\n  .rip .rip-card-link:focus-visible,\n  .rip .rip-list-link:focus-visible {\n    outline-color: Highlight;\n  }\n  .rip .rip-panel-icon,\n  .rip .rip-tag {\n    color: LinkText;\n    background: Canvas;\n  }\n  .rip .rip-list-link[data-rip-accent] {\n    border-inline-start-color: LinkText;\n  }\n  .rip .rip-card-link::before,\n  .rip .rip-card-link::after {\n    display: none;\n  }\n}';
var maximumDateTimestamp2 = 864e13;
function formatUpdatedDate(timestamp, locale) {
  if (!Number.isFinite(timestamp) || Math.abs(timestamp) > maximumDateTimestamp2) return void 0;
  const requestedLocale = typeof locale === "string" ? locale : "en-US";
  const locales = requestedLocale === "en-US" ? [requestedLocale] : [requestedLocale, "en-US"];
  for (const candidateLocale of locales) {
    try {
      const date = new Date(timestamp);
      return {
        display: new Intl.DateTimeFormat(candidateLocale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC"
        }).format(date),
        iso: date.toISOString().slice(0, 10)
      };
    } catch {
    }
  }
  return void 0;
}
function compareTitle2(left, right) {
  const leftFolded = left.title.toLowerCase();
  const rightFolded = right.title.toLowerCase();
  if (leftFolded < rightFolded) return -1;
  if (leftFolded > rightFolded) return 1;
  if (left.title < right.title) return -1;
  if (left.title > right.title) return 1;
  return left.segment < right.segment ? -1 : left.segment > right.segment ? 1 : 0;
}
function ownDataValue4(value, key) {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function safeStringArray2(value) {
  try {
    if (!Array.isArray(value)) return [];
    return value.filter((item) => typeof item === "string");
  } catch {
    return [];
  }
}
function rootArticleClass(fileData, layout) {
  const frontmatter = ownDataValue4(fileData, "frontmatter");
  return [
    "rip",
    "popover-hint",
    `rip--${layout}`,
    ...safeStringArray2(ownDataValue4(frontmatter, "cssclasses"))
  ].join(" ");
}
function hasRootContent(tree) {
  try {
    const children = ownDataValue4(tree, "children");
    return Array.isArray(children) && children.length > 0;
  } catch {
    return false;
  }
}
function panelAttributes(entry) {
  return {
    "data-rip-icon": entry.icon?.name,
    "data-rip-accent": entry.accent.kind === "direct" ? "direct" : void 0,
    "data-rip-title": entry.title,
    "data-rip-date": Number.isFinite(entry.date) ? String(entry.date) : "",
    style: entry.accent.kind === "theme" ? void 0 : `--rip-panel-accent: ${entry.accent.value}`
  };
}
function PanelIcon({ entry }) {
  if (!entry.icon) return null;
  const Icon2 = entry.icon.component;
  return /* @__PURE__ */ jsx("span", { class: "rip-panel-icon", "aria-hidden": "true", inert: true, children: /* @__PURE__ */ jsx(Icon2, { "aria-hidden": "true", focusable: "false", width: 20, height: 20, "stroke-width": 1.8 }) });
}
function UpdatedDate({
  entry,
  translation
}) {
  if (!entry.dateDisplay || !entry.dateIso) return null;
  return /* @__PURE__ */ jsx("time", { class: "rip-updated", dateTime: entry.dateIso, children: translation.updatedLabel(entry.dateDisplay) });
}
function ListPanel({
  entry,
  idPrefix,
  options,
  translation
}) {
  const titleId = `${idPrefix}-title`;
  const countId = `${idPrefix}-count`;
  const descriptionId = `${idPrefix}-description`;
  const describedBy = [
    options.showDocCount ? countId : void 0,
    options.showDescription && entry.description ? descriptionId : void 0
  ].filter((id) => id !== void 0);
  return /* @__PURE__ */ jsx("li", { class: "rip-list-item", ...panelAttributes(entry), children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: entry.href,
      class: "rip-list-link",
      "aria-labelledby": titleId,
      "aria-describedby": describedBy.length > 0 ? describedBy.join(" ") : void 0,
      children: [
        /* @__PURE__ */ jsxs("div", { class: "rip-list-row", children: [
          /* @__PURE__ */ jsxs("span", { class: "rip-panel-heading", children: [
            /* @__PURE__ */ jsx(PanelIcon, { entry }),
            /* @__PURE__ */ jsx("span", { class: "rip-list-title", id: titleId, children: entry.title })
          ] }),
          options.showDocCount && /* @__PURE__ */ jsx("span", { class: "rip-count", id: countId, children: translation.noteCount(entry.docCount) })
        ] }),
        options.showDescription && entry.description && /* @__PURE__ */ jsx("p", { class: "rip-desc", id: descriptionId, children: entry.description }),
        /* @__PURE__ */ jsx(UpdatedDate, { entry, translation })
      ]
    }
  ) });
}
function CardPanel({
  entry,
  idPrefix,
  options,
  translation
}) {
  const titleId = `${idPrefix}-title`;
  const countId = `${idPrefix}-count`;
  const descriptionId = `${idPrefix}-description`;
  const tagsId = `${idPrefix}-tags`;
  const describedBy = [
    options.showDocCount ? countId : void 0,
    options.showDescription && entry.description ? descriptionId : void 0,
    options.showTags && entry.tags.length > 0 ? tagsId : void 0
  ].filter((id) => id !== void 0);
  return /* @__PURE__ */ jsx("li", { class: "rip-card", ...panelAttributes(entry), children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: entry.href,
      class: "rip-card-link",
      "aria-labelledby": titleId,
      "aria-describedby": describedBy.length > 0 ? describedBy.join(" ") : void 0,
      children: [
        /* @__PURE__ */ jsxs("div", { class: "rip-card-top", children: [
          /* @__PURE__ */ jsxs("span", { class: "rip-panel-heading", children: [
            /* @__PURE__ */ jsx(PanelIcon, { entry }),
            /* @__PURE__ */ jsx("span", { class: "rip-card-title", id: titleId, children: entry.title })
          ] }),
          options.showDocCount && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { class: "rip-count", "aria-hidden": "true", children: entry.docCount }),
            /* @__PURE__ */ jsx("span", { class: "rip-sr-only", id: countId, children: translation.noteCount(entry.docCount) })
          ] })
        ] }),
        options.showDescription && entry.description && /* @__PURE__ */ jsx("p", { class: "rip-desc", id: descriptionId, children: entry.description }),
        options.showTags && entry.tags.length > 0 && /* @__PURE__ */ jsx("div", { class: "rip-tags", id: tagsId, children: entry.tags.map((tag, index2) => /* @__PURE__ */ jsxs("span", { class: "rip-tag", children: [
          "#",
          tag
        ] }, `${tag}-${index2}`)) }),
        /* @__PURE__ */ jsx(UpdatedDate, { entry, translation })
      ]
    }
  ) });
}
function BookCollection({
  entries,
  idPrefix,
  options,
  translation
}) {
  if (options.layout === "list") {
    return /* @__PURE__ */ jsx("ul", { class: "rip-list", "data-rip-book-list": true, children: entries.map((entry, index2) => /* @__PURE__ */ jsx(
      ListPanel,
      {
        entry,
        idPrefix: `${idPrefix}-${index2}`,
        options,
        translation
      },
      entry.segment
    )) });
  }
  return /* @__PURE__ */ jsx("ul", { class: "rip-grid", "data-rip-book-list": true, children: entries.map((entry, index2) => /* @__PURE__ */ jsx(
    CardPanel,
    {
      entry,
      idPrefix: `${idPrefix}-${index2}`,
      options,
      translation
    },
    entry.segment
  )) });
}
function RootOverview({
  entries,
  locale,
  translation
}) {
  const totalNotes = entries.reduce(
    (total, entry) => Math.min(Number.MAX_SAFE_INTEGER, total + entry.docCount),
    0
  );
  const latestTimestamp = entries.reduce(
    (latest, entry) => Math.max(latest, entry.date),
    Number.NEGATIVE_INFINITY
  );
  const updated = formatUpdatedDate(latestTimestamp, locale);
  return /* @__PURE__ */ jsxs("div", { class: "rip-overview", children: [
    /* @__PURE__ */ jsxs("dl", { class: "rip-stats", children: [
      /* @__PURE__ */ jsxs("div", { class: "rip-stat", children: [
        /* @__PURE__ */ jsx("dt", { children: translation.bookCount(entries.length) }),
        /* @__PURE__ */ jsx("dd", { children: entries.length })
      ] }),
      /* @__PURE__ */ jsxs("div", { class: "rip-stat", children: [
        /* @__PURE__ */ jsx("dt", { children: translation.totalNotesLabel }),
        /* @__PURE__ */ jsx("dd", { children: totalNotes })
      ] }),
      updated && /* @__PURE__ */ jsxs("div", { class: "rip-stat", children: [
        /* @__PURE__ */ jsx("dt", { children: translation.lastUpdatedLabel }),
        /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("time", { dateTime: updated.iso, children: updated.display }) })
      ] })
    ] }),
    entries.length > 0 && /* @__PURE__ */ jsxs("a", { class: "rip-browse-link", href: "#rip-books", children: [
      translation.exploreLibrary,
      /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "\u2193" })
    ] })
  ] });
}
var RootIndexPanels_default = ((userOptions) => {
  const options = normalizeRootIndexPanelsOptions(userOptions);
  const RootIndexPanels = ({
    fileData,
    allFiles,
    cfg,
    tree
  }) => {
    if (fileData.slug !== "index") return /* @__PURE__ */ jsx(Fragment, {});
    const translation = i18n(cfg.locale);
    const entries = collectBooks(allFiles, options).map((entry) => {
      const formattedDate = formatUpdatedDate(entry.date, cfg.locale);
      return {
        ...entry,
        href: resolveRelative(fileData.slug, `${entry.segment}/index`),
        icon: resolvePanelIcon(ownDataValue4(entry.panel, "icon"), options),
        accent: resolvePanelAccent(ownDataValue4(entry.panel, "accent"), options),
        dateDisplay: formattedDate?.display,
        dateIso: formattedDate?.iso
      };
    });
    const latestEntries = [...entries].sort((left, right) => right.date - left.date || compareTitle2(left, right)).slice(0, 3);
    const showRootContent = hasRootContent(tree);
    return /* @__PURE__ */ jsxs("article", { class: rootArticleClass(fileData, options.layout), children: [
      /* @__PURE__ */ jsx(RootOverview, { entries, locale: cfg.locale, translation }),
      latestEntries.length > 0 && /* @__PURE__ */ jsxs("section", { class: "rip-latest", "aria-labelledby": "rip-latest-heading", children: [
        /* @__PURE__ */ jsx("div", { class: "rip-section-heading", children: /* @__PURE__ */ jsx("h2", { id: "rip-latest-heading", children: translation.latestBooks }) }),
        /* @__PURE__ */ jsx(
          BookCollection,
          {
            entries: latestEntries,
            idPrefix: "rip-latest-book",
            options,
            translation
          }
        )
      ] }),
      showRootContent && /* @__PURE__ */ jsx("div", { class: "rip-root-content markdown-preview-view markdown-rendered", children: htmlToJsx(tree) }),
      /* @__PURE__ */ jsxs("section", { id: "rip-books", class: "rip-directories", "aria-labelledby": "rip-books-heading", children: [
        /* @__PURE__ */ jsxs("div", { class: "rip-library-heading", children: [
          /* @__PURE__ */ jsxs("div", { class: "rip-section-heading", children: [
            /* @__PURE__ */ jsx("h2", { id: "rip-books-heading", children: translation.allBooks }),
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: entries.length })
          ] }),
          entries.length > 1 && /* @__PURE__ */ jsxs("label", { class: "rip-sort", children: [
            /* @__PURE__ */ jsx("span", { children: translation.sortBooks }),
            /* @__PURE__ */ jsxs("select", { "data-rip-sort-control": true, children: [
              /* @__PURE__ */ jsx("option", { value: "date-desc", children: translation.sortNewest }),
              /* @__PURE__ */ jsx("option", { value: "date-asc", children: translation.sortOldest }),
              /* @__PURE__ */ jsx("option", { value: "title-asc", children: translation.sortTitleAscending }),
              /* @__PURE__ */ jsx("option", { value: "title-desc", children: translation.sortTitleDescending })
            ] })
          ] })
        ] }),
        entries.length === 0 ? /* @__PURE__ */ jsx("p", { class: "rip-empty", children: translation.emptyState }) : /* @__PURE__ */ jsx(
          BookCollection,
          {
            entries,
            idPrefix: "rip-book",
            options,
            translation
          }
        )
      ] })
    ] });
  };
  RootIndexPanels.css = `${panels_default}
${root_library_default}`;
  RootIndexPanels.afterDOMLoaded = panels_inline_default;
  return RootIndexPanels;
});

// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/sorting.ts
var NAVIGATION_SORTING_SERVICE_SYMBOL = "obsidian-material-plugins/navigation-sorting/v1";
function getNavigationSortingService() {
  try {
    const services = globalThis;
    const candidate = services[Symbol.for(NAVIGATION_SORTING_SERVICE_SYMBOL)];
    if (typeof candidate !== "object" || candidate === null) return void 0;
    const service = candidate;
    return service.apiVersion === 1 && typeof service.sort === "function" ? service : void 0;
  } catch {
    return void 0;
  }
}
function sortWithNavigationService(folderPath, items, allFiles) {
  const service = getNavigationSortingService();
  if (!service) return void 0;
  try {
    const result = service.sort(folderPath, items, allFiles);
    if (!result?.matched || !Array.isArray(result.items)) return void 0;
    const available = new Set(items.map((item) => item.value));
    const seen = /* @__PURE__ */ new Set();
    for (const item of result.items) {
      if (!available.has(item) || seen.has(item)) return void 0;
      seen.add(item);
    }
    return result.items;
  } catch {
    return void 0;
  }
}

// src/navigation.ts
var emptyChildren = Object.freeze([]);
var emptyModel = Object.freeze({
  books: Object.freeze([]),
  rootNotes: Object.freeze([])
});
var noSortingService = Object.freeze({});
var modelCache = /* @__PURE__ */ new WeakMap();
function ownDataValue5(value, key) {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function hasOwnDataProperty2(value, key) {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== void 0 && "value" in descriptor;
  } catch {
    return false;
  }
}
function normalizeInventoryOptions(options) {
  try {
    const normalized = normalizeRootIndexPanelsOptions(options);
    return {
      descriptionFallback: normalized.descriptionFallback,
      sort: normalized.sort,
      tagCount: normalized.tagCount
    };
  } catch {
    const normalized = normalizeRootIndexPanelsOptions();
    return {
      descriptionFallback: normalized.descriptionFallback,
      sort: normalized.sort,
      tagCount: normalized.tagCount
    };
  }
}
function safeDateValue(value) {
  if (typeof value === "string" || typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  try {
    if (value instanceof Date) {
      const timestamp = Date.prototype.getTime.call(value);
      return Number.isFinite(timestamp) ? new Date(timestamp) : void 0;
    }
  } catch {
    return void 0;
  }
  return void 0;
}
var dateKeys = ["modified", "updated", "created", "published", "date"];
function safeDateRecord(value) {
  const result = {};
  for (const key of dateKeys) {
    const safeValue = safeDateValue(ownDataValue5(value, key));
    if (safeValue !== void 0) {
      result[key] = safeValue;
    }
  }
  return result;
}
function safeFiles(value) {
  try {
    if (!Array.isArray(value)) return [];
  } catch {
    return [];
  }
  const files = [];
  let length = 0;
  try {
    length = value.length;
  } catch {
    return files;
  }
  for (let index2 = 0; index2 < length; index2 += 1) {
    let file;
    try {
      file = value[index2];
    } catch {
      continue;
    }
    if (typeof file === "object" && file !== null && !Array.isArray(file)) {
      files.push(file);
    }
  }
  return files;
}
function parseSlug(file) {
  return parseCanonicalSlug(ownDataValue5(file, "slug"));
}
function isListedPhysical(file) {
  return isPhysical2(file) && ownDataValue5(file, "unlisted") !== true;
}
function isPhysical2(file) {
  const filePath = ownDataValue5(file, "filePath");
  return typeof filePath === "string" && filePath.length > 0;
}
function isSyntheticVirtualIndex(file) {
  return !isPhysical2(file) && (hasOwnDataProperty2(file, "canvasData") || hasOwnDataProperty2(file, "basesData"));
}
function navigationDocumentKind(file, parsed) {
  if (ownDataValue5(file, "unlisted") === true) return void 0;
  if (isPhysical2(file)) return "note";
  const hasCanvasData = hasOwnDataProperty2(file, "canvasData");
  const hasBasesData = hasOwnDataProperty2(file, "basesData");
  if (hasCanvasData === hasBasesData) return void 0;
  if (hasCanvasData && parsed.slug.endsWith(".canvas")) return "canvas";
  if (hasBasesData && parsed.slug.endsWith(".base")) return "base";
  return void 0;
}
function humanizeSegment2(segment) {
  const text2 = segment.replace(/-/g, " ");
  return text2.length === 0 ? text2 : text2.charAt(0).toUpperCase() + text2.slice(1);
}
function fileTitle(file, fallbackSegment) {
  const frontmatter = ownDataValue5(file, "frontmatter");
  const title = ownDataValue5(frontmatter, "title");
  return typeof title === "string" ? title : humanizeSegment2(fallbackSegment);
}
function authoredTitle(file) {
  const frontmatter = ownDataValue5(file, "frontmatter");
  const title = ownDataValue5(frontmatter, "title");
  return typeof title === "string" && title.trim().length > 0 ? title : void 0;
}
function compareNodes(a, b) {
  const leftIsFolder = a.kind === "folder";
  const rightIsFolder = b.kind === "folder";
  if (leftIsFolder !== rightIsFolder) return leftIsFolder ? -1 : 1;
  const left = a.title.toLowerCase();
  const right = b.title.toLowerCase();
  if (left < right) return -1;
  if (left > right) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}
function inventoryFile(file) {
  const parsed = parseSlug(file);
  if (!parsed) return void 0;
  const filePath = ownDataValue5(file, "filePath");
  const frontmatter = ownDataValue5(file, "frontmatter");
  const dates = safeDateRecord(ownDataValue5(file, "dates"));
  const topLevelDates = safeDateRecord(file);
  const frontmatterDates = safeDateRecord(frontmatter);
  return {
    slug: parsed.slug,
    ...typeof filePath === "string" ? { filePath } : {},
    ...ownDataValue5(file, "unlisted") === true ? { unlisted: true } : {},
    ...hasOwnDataProperty2(file, "canvasData") ? { canvasData: true } : {},
    ...hasOwnDataProperty2(file, "basesData") ? { basesData: true } : {},
    ...Object.keys(dates).length > 0 ? { dates } : {},
    ...topLevelDates,
    frontmatter: {
      title: ownDataValue5(frontmatter, "title"),
      panel: panelValues(ownDataValue5(frontmatter, "panel")),
      ...frontmatterDates
    }
  };
}
function ensureFolder(parent, segment, keyPrefix) {
  const key = `folder:${keyPrefix}/${segment}`;
  const existing = parent.get(key);
  if (existing?.kind === "folder") return existing;
  const folder = {
    kind: "folder",
    key,
    path: `${keyPrefix}/${segment}`,
    segment,
    title: humanizeSegment2(segment),
    children: /* @__PURE__ */ new Map()
  };
  parent.set(key, folder);
  return folder;
}
function insertBookFile(root2, bookSegment, relativeParts, slug2, file, kind, folderDestinations) {
  if (relativeParts.length === 0) return;
  const isIndex = relativeParts.at(-1) === "index";
  const folderParts = relativeParts.slice(0, -1);
  let parent = root2;
  let keyPrefix = bookSegment;
  let currentFolder;
  for (const segment of folderParts) {
    currentFolder = ensureFolder(parent, segment, keyPrefix);
    const destinationSlug = `${keyPrefix}/${segment}/index`;
    if (isFullSlug(destinationSlug)) {
      const destination = folderDestinations.get(destinationSlug);
      if (destination) {
        currentFolder.slug = destinationSlug;
        currentFolder.title = fileTitle(destination, segment);
      }
    }
    parent = currentFolder.children;
    keyPrefix = `${keyPrefix}/${segment}`;
  }
  if (isIndex) {
    if (!currentFolder) return;
    currentFolder.slug = slug2;
    currentFolder.title = fileTitle(file, currentFolder.segment);
    return;
  }
  const leafSegment = relativeParts.at(-1);
  if (!leafSegment) return;
  const key = `document:${slug2}`;
  if (parent.has(key)) return;
  parent.set(key, {
    kind,
    key,
    slug: slug2,
    title: fileTitle(file, leafSegment)
  });
}
function freezeNodes(nodes, folderPath, allFiles) {
  const frozen = Array.from(nodes.values(), (node) => {
    if (node.kind !== "folder") return Object.freeze({ ...node });
    return Object.freeze({
      kind: node.kind,
      key: node.key,
      segment: node.segment,
      title: node.title,
      ...node.slug ? { slug: node.slug } : {},
      children: freezeNodes(node.children, node.path, allFiles)
    });
  });
  frozen.sort(compareNodes);
  const externallySorted = sortWithNavigationService(
    folderPath,
    frozen.map((node) => ({
      value: node,
      path: node.kind === "folder" ? node.key.slice("folder:".length) : node.slug,
      isFolder: node.kind === "folder"
    })),
    allFiles
  );
  return Object.freeze(externallySorted ?? frozen);
}
function buildSidebarNavigationModel(allFiles, options = void 0) {
  const files = safeFiles(allFiles);
  if (files.length === 0) return emptyModel;
  const validFiles = files.filter((file) => parseSlug(file) !== void 0);
  if (validFiles.length === 0) return emptyModel;
  const inventoryOptions = normalizeInventoryOptions(options);
  const inventoryFiles = [];
  for (const file of validFiles) {
    const inventory = inventoryFile(file);
    if (inventory) inventoryFiles.push(inventory);
  }
  const books = collectBooks(inventoryFiles, inventoryOptions);
  const bookTrees = new Map(
    books.map((book) => [book.segment, /* @__PURE__ */ new Map()])
  );
  const rootNotes = [];
  let rootTitle;
  const seenSlugs = /* @__PURE__ */ new Set();
  const folderDestinations = /* @__PURE__ */ new Map();
  for (const file of validFiles) {
    const parsed = parseSlug(file);
    if (!parsed || parsed.parts.length < 3 || parsed.parts.at(-1) !== "index" || ownDataValue5(file, "unlisted") === true || isSyntheticVirtualIndex(file) || !bookTrees.has(parsed.parts[0]) || folderDestinations.has(parsed.slug)) {
      continue;
    }
    folderDestinations.set(parsed.slug, file);
  }
  const navigationFiles = [];
  for (const file of validFiles) {
    const parsed = parseSlug(file);
    if (!parsed || !isListedPhysical(file)) continue;
    navigationFiles.push({ file, parsed, kind: "note" });
  }
  for (const file of validFiles) {
    const parsed = parseSlug(file);
    if (!parsed || isPhysical2(file)) continue;
    const kind = navigationDocumentKind(file, parsed);
    if (kind && kind !== "note") navigationFiles.push({ file, parsed, kind });
  }
  for (const { file, parsed, kind } of navigationFiles) {
    if (!parsed || seenSlugs.has(parsed.slug)) continue;
    seenSlugs.add(parsed.slug);
    if (parsed.parts.length === 1) {
      if (parsed.slug === "index") {
        rootTitle ??= authoredTitle(file);
        continue;
      }
      rootNotes.push(
        Object.freeze({
          kind,
          key: `document:${parsed.slug}`,
          slug: parsed.slug,
          title: fileTitle(file, parsed.parts[0])
        })
      );
      continue;
    }
    const bookSegment = parsed.parts[0];
    const tree = bookSegment ? bookTrees.get(bookSegment) : void 0;
    if (!tree || parsed.slug === `${bookSegment}/index`) continue;
    insertBookFile(
      tree,
      bookSegment,
      parsed.parts.slice(1),
      parsed.slug,
      file,
      kind,
      folderDestinations
    );
  }
  rootNotes.sort(compareNodes);
  const sortedRootNotes = sortWithNavigationService(
    "/",
    rootNotes.map((node) => ({ value: node, path: node.slug, isFolder: false })),
    allFiles
  ) ?? rootNotes;
  const frozenBooks = [];
  for (const book of books) {
    const slug2 = `${book.segment}/index`;
    if (!isFullSlug(slug2)) continue;
    frozenBooks.push(
      Object.freeze({
        segment: book.segment,
        slug: slug2,
        title: book.title,
        panel: book.panel,
        children: freezeNodes(bookTrees.get(book.segment) ?? /* @__PURE__ */ new Map(), book.segment, allFiles)
      })
    );
  }
  const sortedBooks = sortWithNavigationService(
    "/",
    frozenBooks.map((book) => ({ value: book, path: book.segment, isFolder: true })),
    allFiles
  ) ?? frozenBooks;
  return Object.freeze({
    books: Object.freeze(sortedBooks),
    ...rootTitle ? { rootTitle } : {},
    rootNotes: Object.freeze(sortedRootNotes)
  });
}
function getSidebarNavigationModel(allFiles, options = void 0) {
  try {
    if (!Array.isArray(allFiles)) return emptyModel;
  } catch {
    return emptyModel;
  }
  const inventoryOptions = normalizeInventoryOptions(options);
  const key = JSON.stringify(inventoryOptions);
  const sortingIdentity = getNavigationSortingService() ?? noSortingService;
  let sortingVariants = modelCache.get(allFiles);
  if (!sortingVariants) {
    sortingVariants = /* @__PURE__ */ new Map();
    modelCache.set(allFiles, sortingVariants);
  }
  let variants = sortingVariants.get(sortingIdentity);
  if (!variants) {
    variants = /* @__PURE__ */ new Map();
    sortingVariants.set(sortingIdentity, variants);
  }
  const cached = variants.get(key);
  if (cached) return cached;
  const model = buildSidebarNavigationModel(allFiles, inventoryOptions);
  variants.set(key, model);
  return model;
}
function comparisonSlug(value) {
  const parsed = parseCanonicalSlug(value);
  return parsed ? simplifySlug(parsed.slug).split("/").filter(Boolean).join("/") : void 0;
}
function getSidebarLinkState(target, current) {
  const targetSlug = comparisonSlug(target);
  const currentSlug2 = comparisonSlug(current);
  if (targetSlug === void 0 || currentSlug2 === void 0) return void 0;
  if (targetSlug === currentSlug2) return "current";
  if (targetSlug.length > 0 && currentSlug2.startsWith(`${targetSlug}/`)) return "ancestor";
  return void 0;
}
function selectSidebarNavigationScope(model, currentSlug2) {
  const parsed = parseCanonicalSlug(currentSlug2);
  if (!parsed) {
    return { kind: "none", children: emptyChildren };
  }
  const parts = parsed.parts;
  if (parts.length === 1) return { kind: "root", children: model.rootNotes };
  const segment = parts[0];
  const book = model.books.find((candidate) => candidate.segment === segment);
  return book ? { kind: "book", book, children: book.children } : { kind: "root", children: model.rootNotes };
}

// src/components/scripts/sidebar.inline.ts
var sidebar_inline_default = `function l(){try{return window.matchMedia?.("(max-width: 800px)").matches??window.innerWidth<=800}catch{return window.innerWidth<=800}}function d(o){let i=Array.from(document.querySelectorAll(".rip-sidebar .rip-sidebar-switcher"));for(let e of i){let n=()=>{if(e.open)for(let a of i)a!==e&&(a.open=!1)},r=a=>{a.target?.closest?.("a")&&(e.open=!1)};e.addEventListener("toggle",n),e.addEventListener("click",r),o.push(()=>{e.removeEventListener("toggle",n),e.removeEventListener("click",r)})}if(i.length===0)return;let t=e=>{let n=e.target;if(n)for(let r of i)r.open&&!r.contains(n)&&(r.open=!1)},s=e=>{if(e.key!=="Escape")return;let n=i.find(a=>a.open);if(!n)return;e.preventDefault(),n.open=!1,n.firstElementChild?.focus?.()};document.addEventListener("pointerdown",t),document.addEventListener("keydown",s),o.push(()=>{document.removeEventListener("pointerdown",t),document.removeEventListener("keydown",s)})}function u(o){let i=Array.from(document.querySelectorAll(".rip-sidebar [data-rip-disclosure]"));for(let t of i){let s=()=>{let e=t.getAttribute("aria-controls");if(!e)return;let n=document.getElementById(e),r=t.closest(".rip-sidebar-folder");if(!n||!r)return;let c=!(t.getAttribute("aria-expanded")==="true");t.setAttribute("aria-expanded",String(c)),n.hidden=!c,r.dataset.ripOpen=String(c)};t.addEventListener("click",s),o.push(()=>t.removeEventListener("click",s))}}function f(o){let i=Array.from(document.querySelectorAll(".rip-sidebar .rip-sidebar-explorer"));if(l())for(let t of i){let s=t.closest(".rip-sidebar"),e=t.closest('.page[data-frame="canvas"]'),n=s?.querySelector('.rip-sidebar-home-mark[aria-current="page"]');!e&&!n&&(t.open=!1)}for(let t of i){let s=e=>{if(e.defaultPrevented||!l()||e.button!==0||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;let r=e.target?.closest?.("a");!r||!t.contains(r)||r.getAttribute("aria-current")==="page"||r.dataset.ripNodeKind==="canvas"||(t.open=!1)};t.addEventListener("click",s),o.push(()=>t.removeEventListener("click",s))}}function p(){let o=[];d(o),f(o),u(o),o.length>0&&typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>o.forEach(i=>i()))}typeof document<"u"&&document.addEventListener("nav",()=>p());
`;

// src/components/styles/sidebar-rework.scss
var sidebar_rework_default = '.rip-sidebar-book-control {\n  display: grid;\n  grid-template-columns: 2.75rem minmax(0, 1fr);\n  gap: 0.45rem;\n  align-items: stretch;\n}\n\n.rip-sidebar-book-control > .rip-sidebar-switcher {\n  min-width: 0;\n  margin-top: 0;\n}\n\n.rip-sidebar-home-mark {\n  position: relative;\n  display: grid;\n  min-width: 0;\n  place-items: center;\n  border: 1px solid var(--lightgray);\n  border-radius: 0.5rem;\n  color: var(--dark);\n  background: color-mix(in srgb, var(--light) 92%, var(--dark) 8%);\n}\n\n.rip-sidebar-home-mark::before,\n.rip-sidebar-folder-link::before,\n.rip-sidebar-note-link::before {\n  position: absolute;\n  inset-block: 0.35rem;\n  inset-inline-start: 0;\n  width: 0.18rem;\n  border-radius: 999px;\n  background: var(--rip-sidebar-accent, var(--secondary));\n  content: "";\n  opacity: 0;\n}\n\n.rip-sidebar-home-mark[data-rip-state=current] {\n  border-color: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 55%, var(--lightgray));\n  color: var(--rip-sidebar-accent, var(--secondary));\n  background: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 12%, transparent);\n}\n\n.rip-sidebar-home-mark[data-rip-state=current]::before,\n.rip-sidebar-folder-link[data-rip-state=current]::before,\n.rip-sidebar-note-link[data-rip-state=current]::before {\n  opacity: 1;\n}\n\n.rip-sidebar-home-mark:hover {\n  border-color: var(--rip-sidebar-accent, var(--secondary));\n  color: var(--rip-sidebar-accent, var(--secondary));\n}\n\n.rip-sidebar-home-mark:focus-visible,\n.rip-sidebar-folder-link:focus-visible,\n.rip-sidebar-disclosure:focus-visible {\n  outline: 3px solid var(--secondary);\n  outline-offset: 2px;\n}\n\n.rip-sidebar-home-mark .rip-sidebar-book-icon,\n.rip-sidebar-home-mark .rip-sidebar-root-icon {\n  border: 0;\n  background: transparent;\n}\n\n.rip-sidebar-home-badge {\n  position: absolute;\n  inset-inline-end: -0.22rem;\n  inset-block-end: -0.3rem;\n  max-width: 2.2rem;\n  overflow: hidden;\n  padding: 0.08rem 0.24rem;\n  border: 1px solid var(--rip-sidebar-accent, var(--lightgray));\n  border-radius: 999px;\n  color: var(--rip-sidebar-accent, var(--secondary));\n  background: var(--light);\n  font-family: var(--codeFont);\n  font-size: 0.48rem;\n  font-weight: 700;\n  line-height: 1.25;\n  text-overflow: ellipsis;\n  text-transform: uppercase;\n  white-space: nowrap;\n  pointer-events: none;\n}\n\n.rip-sidebar-folder {\n  min-width: 0;\n}\n\n.rip-sidebar-folder-row {\n  position: relative;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) 2rem;\n  min-width: 0;\n  align-items: center;\n  border-radius: 0.45rem;\n}\n\n.rip-sidebar-folder-link,\n.rip-sidebar-folder-label-only {\n  position: relative;\n  display: flex;\n  min-width: 0;\n  min-height: 2.75rem;\n  align-items: center;\n  gap: 0.55rem;\n  padding: 0.42rem 0.35rem 0.42rem 0.6rem;\n  border-radius: 0.45rem;\n  font-weight: 550;\n}\n\n.rip-sidebar-folder-label-only {\n  color: var(--gray);\n}\n\n.rip-sidebar-note-link {\n  position: relative;\n}\n\n.rip-sidebar-folder-link[data-rip-state=current],\n.rip-sidebar-note-link[data-rip-state=current] {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  background: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 12%, transparent);\n  font-weight: 650;\n}\n\n.rip-sidebar-folder[data-rip-state=ancestor] > .rip-sidebar-folder-row > .rip-sidebar-folder-link,\n.rip-sidebar-folder[data-rip-state=ancestor] > .rip-sidebar-folder-row > .rip-sidebar-folder-label-only {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  font-weight: 600;\n}\n\n.rip-sidebar-disclosure {\n  display: inline-grid;\n  width: 1.75rem;\n  height: 1.75rem;\n  padding: 0;\n  border: 1px solid transparent;\n  border-radius: 0.35rem;\n  place-items: center;\n  color: var(--gray);\n  background: transparent;\n  cursor: pointer;\n}\n\n.rip-sidebar-disclosure:hover {\n  border-color: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 55%, var(--lightgray));\n  color: var(--rip-sidebar-accent, var(--secondary));\n}\n\n.rip-sidebar-disclosure-icon {\n  display: inline-grid;\n  place-items: center;\n  transition: transform 120ms ease;\n  pointer-events: none;\n}\n\n.rip-sidebar-folder[data-rip-open=true] > .rip-sidebar-folder-row > .rip-sidebar-disclosure .rip-sidebar-disclosure-icon {\n  transform: rotate(90deg);\n}\n\n.rip-sidebar-folder[data-rip-active-descendant=true][data-rip-open=false] > .rip-sidebar-folder-row > .rip-sidebar-disclosure {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  background: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 11%, transparent);\n}\n\n.rip-sidebar-folder[data-rip-active-descendant=true][data-rip-open=false] > .rip-sidebar-folder-row > .rip-sidebar-disclosure:hover,\n.rip-sidebar-folder[data-rip-active-descendant=true][data-rip-open=false] > .rip-sidebar-folder-row > .rip-sidebar-disclosure:focus-visible {\n  border-color: var(--rip-sidebar-accent, var(--secondary));\n}\n\n.rip-sidebar-children[hidden] {\n  display: none;\n}\n\n.rip-sidebar-folder-row + .rip-sidebar-children {\n  margin-inline-start: 1rem;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .rip-sidebar-disclosure-icon {\n    transition: none;\n  }\n}\n@media (forced-colors: active) {\n  .rip-sidebar-home-mark,\n  .rip-sidebar-disclosure:hover,\n  .rip-sidebar-disclosure:focus-visible {\n    border-color: CanvasText;\n  }\n  .rip-sidebar-home-mark:focus-visible,\n  .rip-sidebar-folder-link:focus-visible,\n  .rip-sidebar-disclosure:focus-visible {\n    outline-color: Highlight;\n  }\n  .rip-sidebar-home-mark[data-rip-state=current]::before,\n  .rip-sidebar-folder-link[data-rip-state=current]::before,\n  .rip-sidebar-note-link[data-rip-state=current]::before {\n    background: Highlight;\n  }\n}';

// src/components/styles/sidebar.scss
var sidebar_default = '.rip-sidebar {\n  width: 100%;\n  min-width: 0;\n  color: var(--darkgray);\n  font-size: 0.9rem;\n}\n.rip-sidebar *,\n.rip-sidebar *::before,\n.rip-sidebar *::after {\n  box-sizing: border-box;\n}\n.rip-sidebar a {\n  color: inherit;\n  text-decoration: none;\n}\n.rip-sidebar a:hover {\n  color: var(--rip-sidebar-accent, var(--secondary));\n}\n.rip-sidebar a:focus-visible,\n.rip-sidebar summary:focus-visible {\n  border-radius: 0.35rem;\n  outline: 3px solid var(--secondary);\n  outline-offset: 2px;\n}\n\n.rip-sidebar-home,\n.rip-sidebar-book-link,\n.rip-sidebar-note-link,\n.rip-sidebar-overview-link {\n  display: flex;\n  min-height: 2.75rem;\n  min-width: 0;\n  align-items: center;\n  gap: 0.55rem;\n  border-radius: 0.45rem;\n}\n\n.rip-sidebar-content {\n  width: 100%;\n  min-width: 0;\n}\n\n.rip-sidebar-content {\n  position: relative;\n}\n\n.rip-sidebar-home {\n  padding: 0.45rem 0.55rem;\n  color: var(--dark);\n  font-family: var(--headerFont);\n  font-weight: 650;\n}\n\n.rip-sidebar-home[data-rip-state=current],\n.rip-sidebar-book-link[data-rip-state=current],\n.rip-sidebar-note-link[data-rip-state=current] {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  background: var(--highlight);\n  background: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 12%, transparent);\n  font-weight: 650;\n}\n\n.rip-sidebar-home[data-rip-state=ancestor],\n.rip-sidebar-book-link[data-rip-state=ancestor],\n.rip-sidebar-note-link[data-rip-state=ancestor] {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  font-weight: 600;\n}\n\n.rip-sidebar-switcher {\n  position: relative;\n  z-index: 5;\n  margin-top: 0.35rem;\n}\n\n.rip-sidebar-switcher[open] {\n  z-index: 30;\n}\n\n.rip-sidebar-switcher > summary,\n.rip-sidebar-folder > details > summary {\n  display: flex;\n  min-height: 2.75rem;\n  min-width: 0;\n  align-items: center;\n  gap: 0.55rem;\n  color: var(--dark);\n  cursor: pointer;\n  list-style: none;\n  user-select: none;\n}\n\n.rip-sidebar-switcher > summary {\n  padding: 0.5rem 0.6rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 0.5rem;\n  background: var(--highlight);\n  background: color-mix(in srgb, var(--light) 92%, var(--dark) 8%);\n  font-family: var(--headerFont);\n  font-weight: 600;\n  transition: border-color 120ms ease, background-color 120ms ease;\n}\n\n.rip-sidebar-switcher > summary:hover {\n  border-color: var(--rip-sidebar-accent, var(--secondary));\n}\n\n.rip-sidebar-switcher > summary::-webkit-details-marker,\n.rip-sidebar-folder > details > summary::-webkit-details-marker,\n.rip-sidebar-scope-title::-webkit-details-marker {\n  display: none;\n}\n\n.rip-sidebar-switcher-label,\n.rip-sidebar-link-label,\n.rip-sidebar-folder-label {\n  min-width: 0;\n  overflow-wrap: anywhere;\n}\n\n.rip-sidebar-switcher-label {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.rip-sidebar-switcher-chevron {\n  display: inline-grid;\n  flex: 0 0 auto;\n  margin-inline-start: auto;\n  place-items: center;\n  color: var(--gray);\n  pointer-events: none;\n}\n\n.rip-sidebar-root-icon,\n.rip-sidebar-book-icon {\n  display: inline-grid;\n  width: 1.4rem;\n  height: 1.4rem;\n  flex: 0 0 1.4rem;\n  place-items: center;\n  border: 1px solid var(--rip-sidebar-accent, var(--lightgray));\n  border-radius: 0.38rem;\n  color: var(--rip-sidebar-accent, var(--secondary));\n  background: var(--highlight);\n  background: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 15%, transparent);\n  pointer-events: none;\n}\n\n.rip-sidebar-root-icon svg,\n.rip-sidebar-book-icon svg,\n.rip-sidebar-node-icon svg,\n.rip-sidebar-selected-check svg,\n.rip-sidebar-switcher-chevron svg {\n  display: block;\n  pointer-events: none;\n}\n\n.rip-sidebar-switcher-menu {\n  --rip-sidebar-accent: var(--secondary);\n  position: absolute;\n  z-index: 20;\n  top: calc(100% + 0.35rem);\n  inset-inline: 0;\n  overflow: hidden;\n  border: 1px solid var(--lightgray);\n  border-radius: 0.55rem;\n  color: var(--darkgray);\n  background: var(--light);\n  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.28);\n}\n\n.rip-sidebar-switcher-heading {\n  margin: 0;\n  padding: 0.5rem 0.7rem;\n  border-bottom: 1px solid var(--lightgray);\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  font-weight: 600;\n  letter-spacing: 0.1em;\n  line-height: 1.4;\n  text-transform: uppercase;\n}\n\n.rip-sidebar-home-list,\n.rip-sidebar-books,\n.rip-sidebar-tree,\n.rip-sidebar-children {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.rip-sidebar-home-list {\n  padding: 0.3rem 0.35rem;\n}\n\n.rip-sidebar-switcher-divider {\n  height: 1px;\n  margin-inline: 0.7rem;\n  background: var(--lightgray);\n}\n\n.rip-sidebar-books {\n  max-height: min(14rem, 100dvh - 12rem);\n  padding: 0.3rem 0.35rem 0.4rem;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  scrollbar-width: thin;\n}\n\n.rip-sidebar-switcher-menu [data-rip-selected=true] {\n  color: var(--rip-sidebar-accent, var(--dark));\n  background: var(--highlight);\n  background: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 10%, transparent);\n  font-weight: 650;\n}\n\n.rip-sidebar-selected-check {\n  display: inline-grid;\n  flex: 0 0 auto;\n  margin-inline-start: auto;\n  place-items: center;\n  color: var(--rip-sidebar-accent, var(--secondary));\n  pointer-events: none;\n}\n\n.rip-sidebar-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n.rip-sidebar-book-link,\n.rip-sidebar-note-link,\n.rip-sidebar-overview-link {\n  padding: 0.42rem 0.6rem;\n}\n\n.rip-sidebar-book-control:has(> .rip-sidebar-switcher[open]) + .rip-sidebar-scope {\n  visibility: hidden;\n  pointer-events: none;\n}\n\n.rip-sidebar-scope {\n  min-height: 0;\n  margin-top: 0.95rem;\n}\n\n.rip-sidebar-explorer {\n  min-width: 0;\n}\n\n.rip-sidebar-scope-title {\n  display: flex;\n  min-height: 2.75rem;\n  align-items: center;\n  gap: 0.55rem;\n  margin: 0;\n  padding-inline: 0.6rem;\n  color: var(--gray);\n  cursor: pointer;\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  font-weight: 600;\n  letter-spacing: 0.1em;\n  list-style: none;\n  text-transform: uppercase;\n}\n\n.rip-sidebar-scope-title::before {\n  width: 0.42rem;\n  height: 0.42rem;\n  flex: 0 0 0.42rem;\n  border-inline-end: 1.5px solid currentColor;\n  border-block-end: 1.5px solid currentColor;\n  content: "";\n  transform: rotate(-45deg);\n  transition: transform 120ms ease;\n}\n\n.rip-sidebar-scope-title > h2 {\n  margin: 0;\n  color: inherit;\n  font: inherit;\n  letter-spacing: inherit;\n  text-transform: inherit;\n}\n\n.rip-sidebar-explorer[open] > .rip-sidebar-scope-title::before {\n  transform: rotate(45deg);\n}\n\n.rip-sidebar-tree {\n  max-height: calc(100dvh - 19rem);\n  overflow: auto;\n  overscroll-behavior: contain;\n  scrollbar-width: thin;\n}\n\n.rip-sidebar-node-icon {\n  display: inline-grid;\n  width: 1rem;\n  height: 1rem;\n  flex: 0 0 1rem;\n  place-items: center;\n  color: inherit;\n  pointer-events: none;\n}\n\n.rip-sidebar-folder > details > summary {\n  padding: 0.42rem 0.6rem;\n  font-family: var(--bodyFont);\n  font-weight: 550;\n}\n\n.rip-sidebar-folder > details > summary::before {\n  width: 0.42rem;\n  height: 0.42rem;\n  flex: 0 0 0.42rem;\n  border-inline-end: 1.5px solid currentColor;\n  border-block-end: 1.5px solid currentColor;\n  content: "";\n  transform: rotate(-45deg);\n  transition: transform 120ms ease;\n}\n\n.rip-sidebar-folder > details[open] > summary::before {\n  transform: rotate(45deg);\n}\n\n.rip-sidebar-children {\n  margin-inline-start: 1rem;\n  padding-inline-start: 0.55rem;\n  border-inline-start: 1px solid var(--lightgray);\n}\n\n.rip-sidebar-overview-link {\n  margin-inline-start: 1rem;\n  color: var(--gray);\n  font-size: 0.82rem;\n}\n\n.rip-sidebar-book-overview-link {\n  margin: 0 0 0.15rem;\n}\n\n.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer=true]) > .explorer {\n  display: none !important;\n}\n\n.page[data-frame=canvas] > #quartz-body > .center.canvas-frame > .canvas-sidebar:has(> .rip-sidebar[data-rip-replace-explorer=true]) > .explorer {\n  display: none !important;\n}\n\n.page[data-frame=canvas] > #quartz-body > .center.canvas-frame:has(> .canvas-sidebar > .rip-sidebar) {\n  box-sizing: border-box;\n}\n\n.page[data-frame=default]:has(> #quartz-body > .left.sidebar > .rip-sidebar[data-rip-scope=book]) > #quartz-body > .center > .page-header > .popover-hint > .breadcrumb-container > .breadcrumb-element:first-child:not(:only-child) {\n  display: none;\n}\n\n@media (min-width: 800px) and (max-width: 1200px) {\n  .page[data-frame=default]:has(> #quartz-body > .left.sidebar > .rip-sidebar) > #quartz-body {\n    grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);\n  }\n}\n@media (max-width: 800px) {\n  .page[data-frame=default]:has(> #quartz-body > .left.sidebar > .rip-sidebar) > #quartz-body {\n    grid-template-columns: minmax(0, 1fr) !important;\n  }\n  .left.sidebar:has(> .rip-sidebar) {\n    min-width: 0;\n    width: 100%;\n    max-width: 100%;\n    flex-wrap: wrap;\n    overflow-wrap: anywhere;\n  }\n  .rip-sidebar {\n    width: 100%;\n    flex: 1 0 100%;\n    order: 100;\n    padding-top: 0.5rem;\n  }\n  .rip-sidebar-content {\n    padding-top: 0.35rem;\n  }\n  .rip-sidebar-tree {\n    max-height: min(45dvh, 24rem);\n  }\n  .rip-sidebar-books {\n    max-height: min(14rem, 45dvh);\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .rip-sidebar-switcher > summary,\n  .rip-sidebar-scope-title::before,\n  .rip-sidebar-folder > details > summary::before {\n    transition: none;\n  }\n}\n@media (forced-colors: active) {\n  .rip-sidebar-switcher > summary,\n  .rip-sidebar-switcher-menu,\n  .rip-sidebar-switcher-heading,\n  .rip-sidebar-switcher-divider,\n  .rip-sidebar-children,\n  .rip-sidebar-root-icon,\n  .rip-sidebar-book-icon {\n    border-color: CanvasText;\n  }\n  .rip-sidebar-switcher-menu {\n    background: Canvas;\n    box-shadow: none;\n  }\n  .rip-sidebar-switcher-divider {\n    background: CanvasText;\n  }\n  .rip-sidebar-home[data-rip-state=current],\n  .rip-sidebar-book-link[data-rip-state=current],\n  .rip-sidebar-note-link[data-rip-state=current],\n  .rip-sidebar-switcher-menu [data-rip-selected=true] {\n    color: LinkText;\n    background: Canvas;\n  }\n  .rip-sidebar a:focus-visible,\n  .rip-sidebar summary:focus-visible {\n    outline-color: Highlight;\n  }\n}';
function SidebarGlyph({
  className,
  icon: Icon2,
  iconName,
  size = 15
}) {
  return /* @__PURE__ */ jsx("span", { class: className, "data-rip-icon": iconName, "aria-hidden": "true", inert: true, children: /* @__PURE__ */ jsx(Icon2, { "aria-hidden": "true", focusable: "false", width: size, height: size, "stroke-width": 1.8 }) });
}
function ownDataValue6(value, key) {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function currentSlug(value) {
  return parseCanonicalSlug(value)?.slug ?? "index";
}
function panelAttributes2(panel, options) {
  const accent = resolvePanelAccent(ownDataValue6(panel, "accent"), options);
  return {
    "data-rip-accent": accent.kind === "direct" ? "direct" : void 0,
    style: accent.kind === "theme" ? void 0 : `--rip-sidebar-accent: ${accent.value}`
  };
}
function BookIcon({
  panel,
  options
}) {
  const icon = resolvePanelIcon(ownDataValue6(panel, "icon"), options);
  if (!icon) return null;
  const Icon2 = icon.component;
  return /* @__PURE__ */ jsx("span", { class: "rip-sidebar-book-icon", "data-rip-icon": icon.name, "aria-hidden": "true", inert: true, children: /* @__PURE__ */ jsx(Icon2, { "aria-hidden": "true", focusable: "false", width: 14, height: 14, "stroke-width": 1.8 }) });
}
function BookLink({
  book,
  current,
  options,
  selected,
  translation
}) {
  const state = getSidebarLinkState(book.slug, current);
  return /* @__PURE__ */ jsxs(
    "a",
    {
      class: "rip-sidebar-book-link",
      href: resolveRelative(current, book.slug),
      "aria-current": state === "current" ? "page" : void 0,
      "data-rip-state": state,
      "data-rip-selected": selected ? "true" : void 0,
      ...panelAttributes2(book.panel, options),
      children: [
        /* @__PURE__ */ jsx(BookIcon, { panel: book.panel, options }),
        /* @__PURE__ */ jsx("span", { class: "rip-sidebar-link-label", children: book.title }),
        selected && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("span", { class: "rip-sidebar-sr-only", children: [
            ", ",
            translation.selectedBook
          ] }),
          /* @__PURE__ */ jsx(
            SidebarGlyph,
            {
              className: "rip-sidebar-selected-check",
              icon: sidebarIcons.check,
              size: 13
            }
          )
        ] })
      ]
    }
  );
}
function NavigationLink({
  slug: slug2,
  title,
  current,
  className,
  kind = "note"
}) {
  const state = getSidebarLinkState(slug2, current);
  return /* @__PURE__ */ jsxs(
    "a",
    {
      class: className,
      href: resolveRelative(current, slug2),
      "aria-current": state === "current" ? "page" : void 0,
      "data-rip-state": state,
      "data-rip-node-kind": kind,
      children: [
        /* @__PURE__ */ jsx(SidebarGlyph, { className: "rip-sidebar-node-icon", icon: sidebarIcons[kind], iconName: kind }),
        /* @__PURE__ */ jsx("span", { class: "rip-sidebar-link-label", children: title })
      ]
    }
  );
}
function nodeContainsSlug(node, current) {
  if (node.slug && getSidebarLinkState(node.slug, current) !== void 0) return true;
  return node.kind === "folder" && node.children.some((child) => nodeContainsSlug(child, current));
}
function NavigationNode({
  node,
  current,
  depth,
  branchId,
  translation
}) {
  if (node.kind !== "folder") {
    return /* @__PURE__ */ jsx("li", { class: "rip-sidebar-note", children: /* @__PURE__ */ jsx(
      NavigationLink,
      {
        slug: node.slug,
        title: node.title,
        current,
        className: "rip-sidebar-note-link",
        kind: node.kind
      }
    ) });
  }
  const state = node.slug ? getSidebarLinkState(node.slug, current) : void 0;
  const descendantIsActive = node.children.some((child) => nodeContainsSlug(child, current));
  const rowState = state ?? (descendantIsActive ? "ancestor" : void 0);
  const defaultOpen = depth === 0 || state !== void 0 || descendantIsActive;
  const childrenId = `rip-sidebar-children-${branchId}`;
  return /* @__PURE__ */ jsxs(
    "li",
    {
      class: "rip-sidebar-folder",
      "data-rip-state": rowState,
      "data-rip-active-descendant": descendantIsActive ? "true" : void 0,
      "data-rip-open": defaultOpen ? "true" : "false",
      children: [
        /* @__PURE__ */ jsxs("div", { class: "rip-sidebar-folder-row", children: [
          node.slug ? /* @__PURE__ */ jsxs(
            "a",
            {
              class: "rip-sidebar-folder-link",
              href: resolveRelative(current, node.slug),
              "aria-current": state === "current" ? "page" : void 0,
              "data-rip-state": state,
              children: [
                /* @__PURE__ */ jsx(SidebarGlyph, { className: "rip-sidebar-node-icon", icon: sidebarIcons.folder }),
                /* @__PURE__ */ jsx("span", { class: "rip-sidebar-folder-label", children: node.title })
              ]
            }
          ) : /* @__PURE__ */ jsxs("span", { class: "rip-sidebar-folder-label-only", children: [
            /* @__PURE__ */ jsx(SidebarGlyph, { className: "rip-sidebar-node-icon", icon: sidebarIcons.folder }),
            /* @__PURE__ */ jsx("span", { class: "rip-sidebar-folder-label", children: node.title })
          ] }),
          node.children.length > 0 && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              class: "rip-sidebar-disclosure",
              "aria-expanded": defaultOpen ? "true" : "false",
              "aria-controls": childrenId,
              "aria-label": translation.toggleFolder(node.title),
              title: translation.toggleFolder(node.title),
              "data-rip-disclosure": true,
              children: /* @__PURE__ */ jsx(
                SidebarGlyph,
                {
                  className: "rip-sidebar-disclosure-icon",
                  icon: sidebarIcons.chevronRight,
                  size: 14
                }
              )
            }
          )
        ] }),
        node.children.length > 0 && /* @__PURE__ */ jsx("ul", { id: childrenId, class: "rip-sidebar-children", hidden: !defaultOpen, children: node.children.map((child, index2) => /* @__PURE__ */ jsx(
          NavigationNode,
          {
            node: child,
            current,
            depth: depth + 1,
            branchId: `${branchId}-${index2}`,
            translation
          },
          child.key
        )) })
      ]
    }
  );
}
function HomeMark({
  current,
  selectedBook,
  options,
  rootTitle,
  translation
}) {
  const target = selectedBook?.slug ?? "index";
  const state = getSidebarLinkState(target, current);
  const label = selectedBook ? translation.bookHome(selectedBook.title) : translation.rootHome;
  return /* @__PURE__ */ jsxs(
    "a",
    {
      class: "rip-sidebar-home-mark",
      href: resolveRelative(current, target),
      "aria-label": label,
      title: label,
      "aria-current": state === "current" ? "page" : void 0,
      "data-rip-state": state === "current" ? "current" : void 0,
      ...selectedBook ? panelAttributes2(selectedBook.panel, options) : {},
      children: [
        selectedBook ? /* @__PURE__ */ jsx(BookIcon, { panel: selectedBook.panel, options }) : /* @__PURE__ */ jsx(SidebarGlyph, { className: "rip-sidebar-root-icon", icon: sidebarIcons.home }),
        /* @__PURE__ */ jsx("span", { class: "rip-sidebar-home-badge", "aria-hidden": "true", children: translation.home }),
        /* @__PURE__ */ jsx("span", { class: "rip-sidebar-sr-only", children: selectedBook?.title ?? rootTitle })
      ]
    }
  );
}
var RootIndexSidebar_default = ((userOptions) => {
  let options;
  try {
    options = normalizeRootIndexPanelsOptions(userOptions);
  } catch {
    options = normalizeRootIndexPanelsOptions();
  }
  const RootIndexSidebar = (props) => {
    const current = currentSlug(ownDataValue6(props.fileData, "slug"));
    const model = getSidebarNavigationModel(props.allFiles, {
      descriptionFallback: options.descriptionFallback,
      sort: options.sort,
      tagCount: options.tagCount
    });
    const scope = selectSidebarNavigationScope(model, current);
    const translation = i18n(ownDataValue6(props.cfg, "locale"));
    const selectedBook = scope.kind === "book" ? scope.book : void 0;
    const rootTitle = model.rootTitle ?? translation.home;
    const rootSelected = selectedBook === void 0;
    const rootState = getSidebarLinkState("index", current);
    return /* @__PURE__ */ jsx(
      "nav",
      {
        class: classNames(props.displayClass, "rip-sidebar"),
        "aria-label": translation.sidebarNavigation,
        "data-rip-replace-explorer": options.replaceExplorer ? "true" : void 0,
        "data-rip-scope": scope.kind,
        ...selectedBook ? panelAttributes2(selectedBook.panel, options) : {},
        children: /* @__PURE__ */ jsxs("div", { class: "rip-sidebar-content", children: [
          /* @__PURE__ */ jsxs("div", { class: "rip-sidebar-book-control", children: [
            /* @__PURE__ */ jsx(
              HomeMark,
              {
                current,
                selectedBook,
                options,
                rootTitle,
                translation
              }
            ),
            /* @__PURE__ */ jsxs("details", { class: "rip-sidebar-switcher", children: [
              /* @__PURE__ */ jsxs("summary", { "data-rip-selected": "true", children: [
                /* @__PURE__ */ jsx("span", { class: "rip-sidebar-switcher-label", children: selectedBook?.title ?? rootTitle }),
                /* @__PURE__ */ jsx(
                  SidebarGlyph,
                  {
                    className: "rip-sidebar-switcher-chevron",
                    icon: sidebarIcons.chevronsUpDown,
                    size: 13
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { class: "rip-sidebar-switcher-menu", children: [
                /* @__PURE__ */ jsx("p", { class: "rip-sidebar-switcher-heading", children: translation.switchBook }),
                /* @__PURE__ */ jsx("ul", { class: "rip-sidebar-home-list", children: /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                  "a",
                  {
                    class: "rip-sidebar-home",
                    href: resolveRelative(current, "index"),
                    "aria-current": rootState === "current" ? "page" : void 0,
                    "data-rip-state": rootState,
                    "data-rip-selected": rootSelected ? "true" : void 0,
                    children: [
                      /* @__PURE__ */ jsx(SidebarGlyph, { className: "rip-sidebar-root-icon", icon: sidebarIcons.home }),
                      /* @__PURE__ */ jsx("span", { class: "rip-sidebar-link-label", children: rootTitle }),
                      rootSelected && /* @__PURE__ */ jsx(
                        SidebarGlyph,
                        {
                          className: "rip-sidebar-selected-check",
                          icon: sidebarIcons.check,
                          size: 13
                        }
                      )
                    ]
                  }
                ) }) }),
                /* @__PURE__ */ jsx("div", { class: "rip-sidebar-switcher-divider", role: "separator" }),
                /* @__PURE__ */ jsx("ul", { class: "rip-sidebar-books", children: model.books.map((book) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
                  BookLink,
                  {
                    book,
                    current,
                    options,
                    selected: book.segment === selectedBook?.segment,
                    translation
                  }
                ) }, book.segment)) })
              ] })
            ] })
          ] }),
          (scope.kind === "book" || scope.children.length > 0) && /* @__PURE__ */ jsx("section", { class: "rip-sidebar-scope", "aria-label": translation.explorer, children: /* @__PURE__ */ jsxs("details", { class: "rip-sidebar-explorer", open: true, children: [
            /* @__PURE__ */ jsx("summary", { class: "rip-sidebar-scope-title", children: /* @__PURE__ */ jsx("h2", { children: translation.explorer }) }),
            /* @__PURE__ */ jsx("ul", { class: "rip-sidebar-tree", children: scope.children.map((node, index2) => /* @__PURE__ */ jsx(
              NavigationNode,
              {
                node,
                current,
                depth: 0,
                branchId: String(index2),
                translation
              },
              node.key
            )) })
          ] }) })
        ] })
      }
    );
  };
  RootIndexSidebar.css = `${sidebar_default}
${sidebar_rework_default}`;
  RootIndexSidebar.afterDOMLoaded = sidebar_inline_default;
  return RootIndexSidebar;
});
/*! Bundled license information:

lucide-preact/dist/esm/shared/src/utils/mergeClasses.mjs:
lucide-preact/dist/esm/shared/src/utils/toKebabCase.mjs:
lucide-preact/dist/esm/shared/src/utils/toLucideIconData.mjs:
lucide-preact/dist/esm/shared/src/utils/toCamelCase.mjs:
lucide-preact/dist/esm/shared/src/utils/toPascalCase.mjs:
lucide-preact/dist/esm/shared/src/build/defaultAttributes.mjs:
lucide-preact/dist/esm/shared/src/build/buildLucideIconNode.mjs:
lucide-preact/dist/esm/shared/src/utils/hasA11yProp.mjs:
lucide-preact/dist/esm/context.mjs:
lucide-preact/dist/esm/Icon.mjs:
lucide-preact/dist/esm/createLucideIcon.mjs:
lucide-preact/dist/esm/icons/check.mjs:
lucide-preact/dist/esm/icons/chevron-right.mjs:
lucide-preact/dist/esm/icons/chevrons-up-down.mjs:
lucide-preact/dist/esm/icons/file-text.mjs:
lucide-preact/dist/esm/icons/folder.mjs:
lucide-preact/dist/esm/icons/house.mjs:
lucide-preact/dist/esm/icons/table-properties.mjs:
lucide-preact/dist/esm/icons/workflow.mjs:
lucide-preact/dist/esm/lucide-preact.mjs:
  (**
   * @license lucide-preact v1.49.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

export { RootIndexPanels_default as RootIndexPanels, RootIndexSidebar_default as RootIndexSidebar };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map