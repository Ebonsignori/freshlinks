require('./sourcemap-register.js');module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 3109:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path_1 = __importDefault(__nccwpck_require__(5622));
const url_1 = __nccwpck_require__(8835);
const core = __importStar(__nccwpck_require__(2186));
const glob = __importStar(__nccwpck_require__(8090));
const freshlinks = __importStar(__nccwpck_require__(7064));
const mustache_1 = __importDefault(__nccwpck_require__(8272));
const defaultErrorTemplate = `
Could not find {{link}}.
{{#suggestion}}
Perhaps you meant \`{{suggested_link}}\`?
{{/suggestion}}
`.trim();
const absolutePathErrorTemplate = `
{{link}} is absolute and should be relative.
{{#suggestion}}
Perhaps you meant \`{{suggested_link}}\`?
{{/suggestion}}
`.trim();
function calculatePossibleLinkDestinations(suggestions) {
    return __awaiter(this, void 0, void 0, function* () {
        let possibleLinkDestinations;
        if (suggestions) {
            possibleLinkDestinations = yield freshlinks.gitLsFiles();
        }
        else {
            possibleLinkDestinations = [];
        }
        return possibleLinkDestinations;
    });
}
function checkFiles(globber, suggestions, possibleLinkDestinations, annotationTemplate, absoluteBaseUrl, absoluteBasePath) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let failCount = 0;
        try {
            for (var _b = __asyncValues(freshlinks.validate_markdown_links_from_files(globber.globGenerator(), absoluteBaseUrl)), _c; _c = yield _b.next(), !_c.done;) {
                const [link, valid] = _c.value;
                if (valid === freshlinks.LinkValidity.Invalid) {
                    failCount++;
                }
                else if (valid === freshlinks.LinkValidity.NonRelative) {
                    failCount++;
                }
                if (valid === freshlinks.LinkValidity.Invalid) {
                    reportFile(link, suggestions, possibleLinkDestinations, annotationTemplate);
                }
                else if (valid === freshlinks.LinkValidity.NonRelative && absoluteBaseUrl !== '') {
                    reportFile(link, suggestions, possibleLinkDestinations, absolutePathErrorTemplate, valid, absoluteBaseUrl, absoluteBasePath);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return failCount > 0 ? true : false;
    });
}
function reportFile(link, suggestions, possibleLinkDestinations, annotationTemplate, valid, absoluteBaseUrl, absoluteBasePath) {
    const runnerLocation = core.getInput('runner-location') || '/home/runner/work/freshlinks/freshlinks';
    core.debug('runnerLocation: ' + runnerLocation);
    let sourceFile = link.sourceFile.replace(runnerLocation, '');
    let suggestion = null;
    if (valid === freshlinks.LinkValidity.NonRelative && absoluteBaseUrl !== '' && suggestions) {
        suggestion = calculateRelativePath();
    }
    else {
        suggestion = calculateSuggestion();
    }
    const templateArgs = { link: link.link, suggestion: undefined };
    if (suggestion) {
        templateArgs.suggestion = { suggested_link: suggestion };
    }
    // Replace newline with %0A
    const errorMsg = mustache_1.default.render(annotationTemplate, templateArgs).replace(
    // We can't simply use '\n', since replace with a string on replaces
    // the first occurrence
    /\n/g, '%0A');
    const msg = `file=${sourceFile},line=${link.startLine},col=${link.startCol}::${errorMsg}`;
    console.log(`::error ${msg}`); // eslint-disable-line no-console
    function calculateSuggestion() {
        if (suggestions) {
            const [suggestedLink, distance] = freshlinks.suggestPath(link.sourceFile, link.link, possibleLinkDestinations);
            // Don't suggest matches that are too far away from the original
            // link
            if (distance <= freshlinks.SUGGEST_MIN_DISTANCE) {
                return suggestedLink;
            }
        }
        return null;
    }
    function calculateRelativePath() {
        let absoluteFilePath;
        let hashLink = '';
        if (link.link.startsWith("/")) {
            absoluteFilePath = link.link;
        }
        else {
            const urlParts = link.link.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
            // urlParts[5] is the absolute path of the link, e.g. /epd/planning
            absoluteFilePath = (urlParts === null || urlParts === void 0 ? void 0 : urlParts[5]) || '';
            hashLink = (urlParts === null || urlParts === void 0 ? void 0 : urlParts[8]) || '';
        }
        if (absoluteBasePath && !absoluteFilePath.startsWith(`/${absoluteBasePath}`)) {
            absoluteFilePath = `/${absoluteBasePath}` + absoluteFilePath;
        }
        core.debug("sourceFile: " + sourceFile);
        core.debug("absoluteFilePath: " + absoluteFilePath);
        let relativePath = path_1.default.relative(sourceFile, absoluteFilePath);
        core.debug("relativePath: " + relativePath);
        // Append hash link from original URL if it exists, e.g. #first-heading
        if (hashLink) {
            relativePath += hashLink;
        }
        if (relativePath) {
            return relativePath;
        }
        return null;
    }
}
function getAnnotationTemplate() {
    const userTemplate = core.getInput('error-template');
    return userTemplate !== '' ? userTemplate : defaultErrorTemplate;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const scan_glob = core.getInput('glob', { required: true });
            const suggestions = core.getInput('suggestions') !== 'false';
            // Relative-only link enforcement is enabled when absolute-base-url is set
            let absoluteBaseUrl = core.getInput('absolute-base-url');
            try {
                absoluteBaseUrl = new url_1.URL(absoluteBaseUrl).hostname;
            }
            catch (error) {
                core.setFailed("absolute-base-url must be a valid URL");
            }
            // For suggesting relative paths, we need to know the absolute base path of the file in the repo relative to the ending of the absolute base url
            // e.g. if a link is https://thehub.github.com/epd/planning and absolute-base-url is thehub.github.com
            // and the file lives in thehub/docs/epd/planning.md then the absolute-base-path in this case is "docs/"
            let absoluteBasePath = core.getInput('absolute-base-path');
            if (absoluteBasePath !== '') {
                if (absoluteBasePath.slice(-1) === '/') {
                    absoluteBasePath = absoluteBasePath.slice(0, -1);
                }
                if (absoluteBasePath.startsWith('/')) {
                    core.setFailed('absolute-base-path cannot start with a /. Make this the path relative to the repo root');
                }
            }
            const annotationTemplate = getAnnotationTemplate();
            core.debug(`Scanning glob ${scan_glob}`); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
            const possibleLinkDestinations = yield calculatePossibleLinkDestinations(suggestions);
            const globber = yield glob.create(scan_glob);
            const failed = yield checkFiles(globber, suggestions, possibleLinkDestinations, annotationTemplate, absoluteBaseUrl, absoluteBasePath);
            if (failed) {
                core.setFailed('Invalid links found');
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
mustache_1.default.escape = (text) => text;
run();


/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(2087));
const utils_1 = __nccwpck_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(7351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(5278);
const os = __importStar(__nccwpck_require__(2087));
const path = __importStar(__nccwpck_require__(5622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    return inputs;
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issueCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(5747));
const os = __importStar(__nccwpck_require__(2087));
const utils_1 = __nccwpck_require__(5278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 8090:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.create = void 0;
const internal_globber_1 = __nccwpck_require__(8298);
/**
 * Constructs a globber
 *
 * @param patterns  Patterns separated by newlines
 * @param options   Glob options
 */
function create(patterns, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield internal_globber_1.DefaultGlobber.create(patterns, options);
    });
}
exports.create = create;
//# sourceMappingURL=glob.js.map

/***/ }),

/***/ 1026:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOptions = void 0;
const core = __importStar(__nccwpck_require__(2186));
/**
 * Returns a copy with defaults filled in.
 */
function getOptions(copy) {
    const result = {
        followSymbolicLinks: true,
        implicitDescendants: true,
        omitBrokenSymbolicLinks: true
    };
    if (copy) {
        if (typeof copy.followSymbolicLinks === 'boolean') {
            result.followSymbolicLinks = copy.followSymbolicLinks;
            core.debug(`followSymbolicLinks '${result.followSymbolicLinks}'`);
        }
        if (typeof copy.implicitDescendants === 'boolean') {
            result.implicitDescendants = copy.implicitDescendants;
            core.debug(`implicitDescendants '${result.implicitDescendants}'`);
        }
        if (typeof copy.omitBrokenSymbolicLinks === 'boolean') {
            result.omitBrokenSymbolicLinks = copy.omitBrokenSymbolicLinks;
            core.debug(`omitBrokenSymbolicLinks '${result.omitBrokenSymbolicLinks}'`);
        }
    }
    return result;
}
exports.getOptions = getOptions;
//# sourceMappingURL=internal-glob-options-helper.js.map

/***/ }),

/***/ 8298:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultGlobber = void 0;
const core = __importStar(__nccwpck_require__(2186));
const fs = __importStar(__nccwpck_require__(5747));
const globOptionsHelper = __importStar(__nccwpck_require__(1026));
const path = __importStar(__nccwpck_require__(5622));
const patternHelper = __importStar(__nccwpck_require__(9005));
const internal_match_kind_1 = __nccwpck_require__(1063);
const internal_pattern_1 = __nccwpck_require__(4536);
const internal_search_state_1 = __nccwpck_require__(9117);
const IS_WINDOWS = process.platform === 'win32';
class DefaultGlobber {
    constructor(options) {
        this.patterns = [];
        this.searchPaths = [];
        this.options = globOptionsHelper.getOptions(options);
    }
    getSearchPaths() {
        // Return a copy
        return this.searchPaths.slice();
    }
    glob() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            try {
                for (var _b = __asyncValues(this.globGenerator()), _c; _c = yield _b.next(), !_c.done;) {
                    const itemPath = _c.value;
                    result.push(itemPath);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        });
    }
    globGenerator() {
        return __asyncGenerator(this, arguments, function* globGenerator_1() {
            // Fill in defaults options
            const options = globOptionsHelper.getOptions(this.options);
            // Implicit descendants?
            const patterns = [];
            for (const pattern of this.patterns) {
                patterns.push(pattern);
                if (options.implicitDescendants &&
                    (pattern.trailingSeparator ||
                        pattern.segments[pattern.segments.length - 1] !== '**')) {
                    patterns.push(new internal_pattern_1.Pattern(pattern.negate, true, pattern.segments.concat('**')));
                }
            }
            // Push the search paths
            const stack = [];
            for (const searchPath of patternHelper.getSearchPaths(patterns)) {
                core.debug(`Search path '${searchPath}'`);
                // Exists?
                try {
                    // Intentionally using lstat. Detection for broken symlink
                    // will be performed later (if following symlinks).
                    yield __await(fs.promises.lstat(searchPath));
                }
                catch (err) {
                    if (err.code === 'ENOENT') {
                        continue;
                    }
                    throw err;
                }
                stack.unshift(new internal_search_state_1.SearchState(searchPath, 1));
            }
            // Search
            const traversalChain = []; // used to detect cycles
            while (stack.length) {
                // Pop
                const item = stack.pop();
                // Match?
                const match = patternHelper.match(patterns, item.path);
                const partialMatch = !!match || patternHelper.partialMatch(patterns, item.path);
                if (!match && !partialMatch) {
                    continue;
                }
                // Stat
                const stats = yield __await(DefaultGlobber.stat(item, options, traversalChain)
                // Broken symlink, or symlink cycle detected, or no longer exists
                );
                // Broken symlink, or symlink cycle detected, or no longer exists
                if (!stats) {
                    continue;
                }
                // Directory
                if (stats.isDirectory()) {
                    // Matched
                    if (match & internal_match_kind_1.MatchKind.Directory) {
                        yield yield __await(item.path);
                    }
                    // Descend?
                    else if (!partialMatch) {
                        continue;
                    }
                    // Push the child items in reverse
                    const childLevel = item.level + 1;
                    const childItems = (yield __await(fs.promises.readdir(item.path))).map(x => new internal_search_state_1.SearchState(path.join(item.path, x), childLevel));
                    stack.push(...childItems.reverse());
                }
                // File
                else if (match & internal_match_kind_1.MatchKind.File) {
                    yield yield __await(item.path);
                }
            }
        });
    }
    /**
     * Constructs a DefaultGlobber
     */
    static create(patterns, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new DefaultGlobber(options);
            if (IS_WINDOWS) {
                patterns = patterns.replace(/\r\n/g, '\n');
                patterns = patterns.replace(/\r/g, '\n');
            }
            const lines = patterns.split('\n').map(x => x.trim());
            for (const line of lines) {
                // Empty or comment
                if (!line || line.startsWith('#')) {
                    continue;
                }
                // Pattern
                else {
                    result.patterns.push(new internal_pattern_1.Pattern(line));
                }
            }
            result.searchPaths.push(...patternHelper.getSearchPaths(result.patterns));
            return result;
        });
    }
    static stat(item, options, traversalChain) {
        return __awaiter(this, void 0, void 0, function* () {
            // Note:
            // `stat` returns info about the target of a symlink (or symlink chain)
            // `lstat` returns info about a symlink itself
            let stats;
            if (options.followSymbolicLinks) {
                try {
                    // Use `stat` (following symlinks)
                    stats = yield fs.promises.stat(item.path);
                }
                catch (err) {
                    if (err.code === 'ENOENT') {
                        if (options.omitBrokenSymbolicLinks) {
                            core.debug(`Broken symlink '${item.path}'`);
                            return undefined;
                        }
                        throw new Error(`No information found for the path '${item.path}'. This may indicate a broken symbolic link.`);
                    }
                    throw err;
                }
            }
            else {
                // Use `lstat` (not following symlinks)
                stats = yield fs.promises.lstat(item.path);
            }
            // Note, isDirectory() returns false for the lstat of a symlink
            if (stats.isDirectory() && options.followSymbolicLinks) {
                // Get the realpath
                const realPath = yield fs.promises.realpath(item.path);
                // Fixup the traversal chain to match the item level
                while (traversalChain.length >= item.level) {
                    traversalChain.pop();
                }
                // Test for a cycle
                if (traversalChain.some((x) => x === realPath)) {
                    core.debug(`Symlink cycle detected for path '${item.path}' and realpath '${realPath}'`);
                    return undefined;
                }
                // Update the traversal chain
                traversalChain.push(realPath);
            }
            return stats;
        });
    }
}
exports.DefaultGlobber = DefaultGlobber;
//# sourceMappingURL=internal-globber.js.map

/***/ }),

/***/ 1063:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MatchKind = void 0;
/**
 * Indicates whether a pattern matches a path
 */
var MatchKind;
(function (MatchKind) {
    /** Not matched */
    MatchKind[MatchKind["None"] = 0] = "None";
    /** Matched if the path is a directory */
    MatchKind[MatchKind["Directory"] = 1] = "Directory";
    /** Matched if the path is a regular file */
    MatchKind[MatchKind["File"] = 2] = "File";
    /** Matched */
    MatchKind[MatchKind["All"] = 3] = "All";
})(MatchKind = exports.MatchKind || (exports.MatchKind = {}));
//# sourceMappingURL=internal-match-kind.js.map

/***/ }),

/***/ 1849:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.safeTrimTrailingSeparator = exports.normalizeSeparators = exports.hasRoot = exports.hasAbsoluteRoot = exports.ensureAbsoluteRoot = exports.dirname = void 0;
const path = __importStar(__nccwpck_require__(5622));
const assert_1 = __importDefault(__nccwpck_require__(2357));
const IS_WINDOWS = process.platform === 'win32';
/**
 * Similar to path.dirname except normalizes the path separators and slightly better handling for Windows UNC paths.
 *
 * For example, on Linux/macOS:
 * - `/               => /`
 * - `/hello          => /`
 *
 * For example, on Windows:
 * - `C:\             => C:\`
 * - `C:\hello        => C:\`
 * - `C:              => C:`
 * - `C:hello         => C:`
 * - `\               => \`
 * - `\hello          => \`
 * - `\\hello         => \\hello`
 * - `\\hello\world   => \\hello\world`
 */
function dirname(p) {
    // Normalize slashes and trim unnecessary trailing slash
    p = safeTrimTrailingSeparator(p);
    // Windows UNC root, e.g. \\hello or \\hello\world
    if (IS_WINDOWS && /^\\\\[^\\]+(\\[^\\]+)?$/.test(p)) {
        return p;
    }
    // Get dirname
    let result = path.dirname(p);
    // Trim trailing slash for Windows UNC root, e.g. \\hello\world\
    if (IS_WINDOWS && /^\\\\[^\\]+\\[^\\]+\\$/.test(result)) {
        result = safeTrimTrailingSeparator(result);
    }
    return result;
}
exports.dirname = dirname;
/**
 * Roots the path if not already rooted. On Windows, relative roots like `\`
 * or `C:` are expanded based on the current working directory.
 */
function ensureAbsoluteRoot(root, itemPath) {
    assert_1.default(root, `ensureAbsoluteRoot parameter 'root' must not be empty`);
    assert_1.default(itemPath, `ensureAbsoluteRoot parameter 'itemPath' must not be empty`);
    // Already rooted
    if (hasAbsoluteRoot(itemPath)) {
        return itemPath;
    }
    // Windows
    if (IS_WINDOWS) {
        // Check for itemPath like C: or C:foo
        if (itemPath.match(/^[A-Z]:[^\\/]|^[A-Z]:$/i)) {
            let cwd = process.cwd();
            assert_1.default(cwd.match(/^[A-Z]:\\/i), `Expected current directory to start with an absolute drive root. Actual '${cwd}'`);
            // Drive letter matches cwd? Expand to cwd
            if (itemPath[0].toUpperCase() === cwd[0].toUpperCase()) {
                // Drive only, e.g. C:
                if (itemPath.length === 2) {
                    // Preserve specified drive letter case (upper or lower)
                    return `${itemPath[0]}:\\${cwd.substr(3)}`;
                }
                // Drive + path, e.g. C:foo
                else {
                    if (!cwd.endsWith('\\')) {
                        cwd += '\\';
                    }
                    // Preserve specified drive letter case (upper or lower)
                    return `${itemPath[0]}:\\${cwd.substr(3)}${itemPath.substr(2)}`;
                }
            }
            // Different drive
            else {
                return `${itemPath[0]}:\\${itemPath.substr(2)}`;
            }
        }
        // Check for itemPath like \ or \foo
        else if (normalizeSeparators(itemPath).match(/^\\$|^\\[^\\]/)) {
            const cwd = process.cwd();
            assert_1.default(cwd.match(/^[A-Z]:\\/i), `Expected current directory to start with an absolute drive root. Actual '${cwd}'`);
            return `${cwd[0]}:\\${itemPath.substr(1)}`;
        }
    }
    assert_1.default(hasAbsoluteRoot(root), `ensureAbsoluteRoot parameter 'root' must have an absolute root`);
    // Otherwise ensure root ends with a separator
    if (root.endsWith('/') || (IS_WINDOWS && root.endsWith('\\'))) {
        // Intentionally empty
    }
    else {
        // Append separator
        root += path.sep;
    }
    return root + itemPath;
}
exports.ensureAbsoluteRoot = ensureAbsoluteRoot;
/**
 * On Linux/macOS, true if path starts with `/`. On Windows, true for paths like:
 * `\\hello\share` and `C:\hello` (and using alternate separator).
 */
function hasAbsoluteRoot(itemPath) {
    assert_1.default(itemPath, `hasAbsoluteRoot parameter 'itemPath' must not be empty`);
    // Normalize separators
    itemPath = normalizeSeparators(itemPath);
    // Windows
    if (IS_WINDOWS) {
        // E.g. \\hello\share or C:\hello
        return itemPath.startsWith('\\\\') || /^[A-Z]:\\/i.test(itemPath);
    }
    // E.g. /hello
    return itemPath.startsWith('/');
}
exports.hasAbsoluteRoot = hasAbsoluteRoot;
/**
 * On Linux/macOS, true if path starts with `/`. On Windows, true for paths like:
 * `\`, `\hello`, `\\hello\share`, `C:`, and `C:\hello` (and using alternate separator).
 */
function hasRoot(itemPath) {
    assert_1.default(itemPath, `isRooted parameter 'itemPath' must not be empty`);
    // Normalize separators
    itemPath = normalizeSeparators(itemPath);
    // Windows
    if (IS_WINDOWS) {
        // E.g. \ or \hello or \\hello
        // E.g. C: or C:\hello
        return itemPath.startsWith('\\') || /^[A-Z]:/i.test(itemPath);
    }
    // E.g. /hello
    return itemPath.startsWith('/');
}
exports.hasRoot = hasRoot;
/**
 * Removes redundant slashes and converts `/` to `\` on Windows
 */
function normalizeSeparators(p) {
    p = p || '';
    // Windows
    if (IS_WINDOWS) {
        // Convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // Remove redundant slashes
        const isUnc = /^\\\\+[^\\]/.test(p); // e.g. \\hello
        return (isUnc ? '\\' : '') + p.replace(/\\\\+/g, '\\'); // preserve leading \\ for UNC
    }
    // Remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
exports.normalizeSeparators = normalizeSeparators;
/**
 * Normalizes the path separators and trims the trailing separator (when safe).
 * For example, `/foo/ => /foo` but `/ => /`
 */
function safeTrimTrailingSeparator(p) {
    // Short-circuit if empty
    if (!p) {
        return '';
    }
    // Normalize separators
    p = normalizeSeparators(p);
    // No trailing slash
    if (!p.endsWith(path.sep)) {
        return p;
    }
    // Check '/' on Linux/macOS and '\' on Windows
    if (p === path.sep) {
        return p;
    }
    // On Windows check if drive root. E.g. C:\
    if (IS_WINDOWS && /^[A-Z]:\\$/i.test(p)) {
        return p;
    }
    // Otherwise trim trailing slash
    return p.substr(0, p.length - 1);
}
exports.safeTrimTrailingSeparator = safeTrimTrailingSeparator;
//# sourceMappingURL=internal-path-helper.js.map

/***/ }),

/***/ 6836:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Path = void 0;
const path = __importStar(__nccwpck_require__(5622));
const pathHelper = __importStar(__nccwpck_require__(1849));
const assert_1 = __importDefault(__nccwpck_require__(2357));
const IS_WINDOWS = process.platform === 'win32';
/**
 * Helper class for parsing paths into segments
 */
class Path {
    /**
     * Constructs a Path
     * @param itemPath Path or array of segments
     */
    constructor(itemPath) {
        this.segments = [];
        // String
        if (typeof itemPath === 'string') {
            assert_1.default(itemPath, `Parameter 'itemPath' must not be empty`);
            // Normalize slashes and trim unnecessary trailing slash
            itemPath = pathHelper.safeTrimTrailingSeparator(itemPath);
            // Not rooted
            if (!pathHelper.hasRoot(itemPath)) {
                this.segments = itemPath.split(path.sep);
            }
            // Rooted
            else {
                // Add all segments, while not at the root
                let remaining = itemPath;
                let dir = pathHelper.dirname(remaining);
                while (dir !== remaining) {
                    // Add the segment
                    const basename = path.basename(remaining);
                    this.segments.unshift(basename);
                    // Truncate the last segment
                    remaining = dir;
                    dir = pathHelper.dirname(remaining);
                }
                // Remainder is the root
                this.segments.unshift(remaining);
            }
        }
        // Array
        else {
            // Must not be empty
            assert_1.default(itemPath.length > 0, `Parameter 'itemPath' must not be an empty array`);
            // Each segment
            for (let i = 0; i < itemPath.length; i++) {
                let segment = itemPath[i];
                // Must not be empty
                assert_1.default(segment, `Parameter 'itemPath' must not contain any empty segments`);
                // Normalize slashes
                segment = pathHelper.normalizeSeparators(itemPath[i]);
                // Root segment
                if (i === 0 && pathHelper.hasRoot(segment)) {
                    segment = pathHelper.safeTrimTrailingSeparator(segment);
                    assert_1.default(segment === pathHelper.dirname(segment), `Parameter 'itemPath' root segment contains information for multiple segments`);
                    this.segments.push(segment);
                }
                // All other segments
                else {
                    // Must not contain slash
                    assert_1.default(!segment.includes(path.sep), `Parameter 'itemPath' contains unexpected path separators`);
                    this.segments.push(segment);
                }
            }
        }
    }
    /**
     * Converts the path to it's string representation
     */
    toString() {
        // First segment
        let result = this.segments[0];
        // All others
        let skipSlash = result.endsWith(path.sep) || (IS_WINDOWS && /^[A-Z]:$/i.test(result));
        for (let i = 1; i < this.segments.length; i++) {
            if (skipSlash) {
                skipSlash = false;
            }
            else {
                result += path.sep;
            }
            result += this.segments[i];
        }
        return result;
    }
}
exports.Path = Path;
//# sourceMappingURL=internal-path.js.map

/***/ }),

/***/ 9005:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.partialMatch = exports.match = exports.getSearchPaths = void 0;
const pathHelper = __importStar(__nccwpck_require__(1849));
const internal_match_kind_1 = __nccwpck_require__(1063);
const IS_WINDOWS = process.platform === 'win32';
/**
 * Given an array of patterns, returns an array of paths to search.
 * Duplicates and paths under other included paths are filtered out.
 */
function getSearchPaths(patterns) {
    // Ignore negate patterns
    patterns = patterns.filter(x => !x.negate);
    // Create a map of all search paths
    const searchPathMap = {};
    for (const pattern of patterns) {
        const key = IS_WINDOWS
            ? pattern.searchPath.toUpperCase()
            : pattern.searchPath;
        searchPathMap[key] = 'candidate';
    }
    const result = [];
    for (const pattern of patterns) {
        // Check if already included
        const key = IS_WINDOWS
            ? pattern.searchPath.toUpperCase()
            : pattern.searchPath;
        if (searchPathMap[key] === 'included') {
            continue;
        }
        // Check for an ancestor search path
        let foundAncestor = false;
        let tempKey = key;
        let parent = pathHelper.dirname(tempKey);
        while (parent !== tempKey) {
            if (searchPathMap[parent]) {
                foundAncestor = true;
                break;
            }
            tempKey = parent;
            parent = pathHelper.dirname(tempKey);
        }
        // Include the search pattern in the result
        if (!foundAncestor) {
            result.push(pattern.searchPath);
            searchPathMap[key] = 'included';
        }
    }
    return result;
}
exports.getSearchPaths = getSearchPaths;
/**
 * Matches the patterns against the path
 */
function match(patterns, itemPath) {
    let result = internal_match_kind_1.MatchKind.None;
    for (const pattern of patterns) {
        if (pattern.negate) {
            result &= ~pattern.match(itemPath);
        }
        else {
            result |= pattern.match(itemPath);
        }
    }
    return result;
}
exports.match = match;
/**
 * Checks whether to descend further into the directory
 */
function partialMatch(patterns, itemPath) {
    return patterns.some(x => !x.negate && x.partialMatch(itemPath));
}
exports.partialMatch = partialMatch;
//# sourceMappingURL=internal-pattern-helper.js.map

/***/ }),

/***/ 4536:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Pattern = void 0;
const os = __importStar(__nccwpck_require__(2087));
const path = __importStar(__nccwpck_require__(5622));
const pathHelper = __importStar(__nccwpck_require__(1849));
const assert_1 = __importDefault(__nccwpck_require__(2357));
const minimatch_1 = __nccwpck_require__(3973);
const internal_match_kind_1 = __nccwpck_require__(1063);
const internal_path_1 = __nccwpck_require__(6836);
const IS_WINDOWS = process.platform === 'win32';
class Pattern {
    constructor(patternOrNegate, isImplicitPattern = false, segments, homedir) {
        /**
         * Indicates whether matches should be excluded from the result set
         */
        this.negate = false;
        // Pattern overload
        let pattern;
        if (typeof patternOrNegate === 'string') {
            pattern = patternOrNegate.trim();
        }
        // Segments overload
        else {
            // Convert to pattern
            segments = segments || [];
            assert_1.default(segments.length, `Parameter 'segments' must not empty`);
            const root = Pattern.getLiteral(segments[0]);
            assert_1.default(root && pathHelper.hasAbsoluteRoot(root), `Parameter 'segments' first element must be a root path`);
            pattern = new internal_path_1.Path(segments).toString().trim();
            if (patternOrNegate) {
                pattern = `!${pattern}`;
            }
        }
        // Negate
        while (pattern.startsWith('!')) {
            this.negate = !this.negate;
            pattern = pattern.substr(1).trim();
        }
        // Normalize slashes and ensures absolute root
        pattern = Pattern.fixupPattern(pattern, homedir);
        // Segments
        this.segments = new internal_path_1.Path(pattern).segments;
        // Trailing slash indicates the pattern should only match directories, not regular files
        this.trailingSeparator = pathHelper
            .normalizeSeparators(pattern)
            .endsWith(path.sep);
        pattern = pathHelper.safeTrimTrailingSeparator(pattern);
        // Search path (literal path prior to the first glob segment)
        let foundGlob = false;
        const searchSegments = this.segments
            .map(x => Pattern.getLiteral(x))
            .filter(x => !foundGlob && !(foundGlob = x === ''));
        this.searchPath = new internal_path_1.Path(searchSegments).toString();
        // Root RegExp (required when determining partial match)
        this.rootRegExp = new RegExp(Pattern.regExpEscape(searchSegments[0]), IS_WINDOWS ? 'i' : '');
        this.isImplicitPattern = isImplicitPattern;
        // Create minimatch
        const minimatchOptions = {
            dot: true,
            nobrace: true,
            nocase: IS_WINDOWS,
            nocomment: true,
            noext: true,
            nonegate: true
        };
        pattern = IS_WINDOWS ? pattern.replace(/\\/g, '/') : pattern;
        this.minimatch = new minimatch_1.Minimatch(pattern, minimatchOptions);
    }
    /**
     * Matches the pattern against the specified path
     */
    match(itemPath) {
        // Last segment is globstar?
        if (this.segments[this.segments.length - 1] === '**') {
            // Normalize slashes
            itemPath = pathHelper.normalizeSeparators(itemPath);
            // Append a trailing slash. Otherwise Minimatch will not match the directory immediately
            // preceding the globstar. For example, given the pattern `/foo/**`, Minimatch returns
            // false for `/foo` but returns true for `/foo/`. Append a trailing slash to handle that quirk.
            if (!itemPath.endsWith(path.sep) && this.isImplicitPattern === false) {
                // Note, this is safe because the constructor ensures the pattern has an absolute root.
                // For example, formats like C: and C:foo on Windows are resolved to an absolute root.
                itemPath = `${itemPath}${path.sep}`;
            }
        }
        else {
            // Normalize slashes and trim unnecessary trailing slash
            itemPath = pathHelper.safeTrimTrailingSeparator(itemPath);
        }
        // Match
        if (this.minimatch.match(itemPath)) {
            return this.trailingSeparator ? internal_match_kind_1.MatchKind.Directory : internal_match_kind_1.MatchKind.All;
        }
        return internal_match_kind_1.MatchKind.None;
    }
    /**
     * Indicates whether the pattern may match descendants of the specified path
     */
    partialMatch(itemPath) {
        // Normalize slashes and trim unnecessary trailing slash
        itemPath = pathHelper.safeTrimTrailingSeparator(itemPath);
        // matchOne does not handle root path correctly
        if (pathHelper.dirname(itemPath) === itemPath) {
            return this.rootRegExp.test(itemPath);
        }
        return this.minimatch.matchOne(itemPath.split(IS_WINDOWS ? /\\+/ : /\/+/), this.minimatch.set[0], true);
    }
    /**
     * Escapes glob patterns within a path
     */
    static globEscape(s) {
        return (IS_WINDOWS ? s : s.replace(/\\/g, '\\\\')) // escape '\' on Linux/macOS
            .replace(/(\[)(?=[^/]+\])/g, '[[]') // escape '[' when ']' follows within the path segment
            .replace(/\?/g, '[?]') // escape '?'
            .replace(/\*/g, '[*]'); // escape '*'
    }
    /**
     * Normalizes slashes and ensures absolute root
     */
    static fixupPattern(pattern, homedir) {
        // Empty
        assert_1.default(pattern, 'pattern cannot be empty');
        // Must not contain `.` segment, unless first segment
        // Must not contain `..` segment
        const literalSegments = new internal_path_1.Path(pattern).segments.map(x => Pattern.getLiteral(x));
        assert_1.default(literalSegments.every((x, i) => (x !== '.' || i === 0) && x !== '..'), `Invalid pattern '${pattern}'. Relative pathing '.' and '..' is not allowed.`);
        // Must not contain globs in root, e.g. Windows UNC path \\foo\b*r
        assert_1.default(!pathHelper.hasRoot(pattern) || literalSegments[0], `Invalid pattern '${pattern}'. Root segment must not contain globs.`);
        // Normalize slashes
        pattern = pathHelper.normalizeSeparators(pattern);
        // Replace leading `.` segment
        if (pattern === '.' || pattern.startsWith(`.${path.sep}`)) {
            pattern = Pattern.globEscape(process.cwd()) + pattern.substr(1);
        }
        // Replace leading `~` segment
        else if (pattern === '~' || pattern.startsWith(`~${path.sep}`)) {
            homedir = homedir || os.homedir();
            assert_1.default(homedir, 'Unable to determine HOME directory');
            assert_1.default(pathHelper.hasAbsoluteRoot(homedir), `Expected HOME directory to be a rooted path. Actual '${homedir}'`);
            pattern = Pattern.globEscape(homedir) + pattern.substr(1);
        }
        // Replace relative drive root, e.g. pattern is C: or C:foo
        else if (IS_WINDOWS &&
            (pattern.match(/^[A-Z]:$/i) || pattern.match(/^[A-Z]:[^\\]/i))) {
            let root = pathHelper.ensureAbsoluteRoot('C:\\dummy-root', pattern.substr(0, 2));
            if (pattern.length > 2 && !root.endsWith('\\')) {
                root += '\\';
            }
            pattern = Pattern.globEscape(root) + pattern.substr(2);
        }
        // Replace relative root, e.g. pattern is \ or \foo
        else if (IS_WINDOWS && (pattern === '\\' || pattern.match(/^\\[^\\]/))) {
            let root = pathHelper.ensureAbsoluteRoot('C:\\dummy-root', '\\');
            if (!root.endsWith('\\')) {
                root += '\\';
            }
            pattern = Pattern.globEscape(root) + pattern.substr(1);
        }
        // Otherwise ensure absolute root
        else {
            pattern = pathHelper.ensureAbsoluteRoot(Pattern.globEscape(process.cwd()), pattern);
        }
        return pathHelper.normalizeSeparators(pattern);
    }
    /**
     * Attempts to unescape a pattern segment to create a literal path segment.
     * Otherwise returns empty string.
     */
    static getLiteral(segment) {
        let literal = '';
        for (let i = 0; i < segment.length; i++) {
            const c = segment[i];
            // Escape
            if (c === '\\' && !IS_WINDOWS && i + 1 < segment.length) {
                literal += segment[++i];
                continue;
            }
            // Wildcard
            else if (c === '*' || c === '?') {
                return '';
            }
            // Character set
            else if (c === '[' && i + 1 < segment.length) {
                let set = '';
                let closed = -1;
                for (let i2 = i + 1; i2 < segment.length; i2++) {
                    const c2 = segment[i2];
                    // Escape
                    if (c2 === '\\' && !IS_WINDOWS && i2 + 1 < segment.length) {
                        set += segment[++i2];
                        continue;
                    }
                    // Closed
                    else if (c2 === ']') {
                        closed = i2;
                        break;
                    }
                    // Otherwise
                    else {
                        set += c2;
                    }
                }
                // Closed?
                if (closed >= 0) {
                    // Cannot convert
                    if (set.length > 1) {
                        return '';
                    }
                    // Convert to literal
                    if (set) {
                        literal += set;
                        i = closed;
                        continue;
                    }
                }
                // Otherwise fall thru
            }
            // Append
            literal += c;
        }
        return literal;
    }
    /**
     * Escapes regexp special characters
     * https://javascript.info/regexp-escaping
     */
    static regExpEscape(s) {
        return s.replace(/[[\\^$.|?*+()]/g, '\\$&');
    }
}
exports.Pattern = Pattern;
//# sourceMappingURL=internal-pattern.js.map

/***/ }),

/***/ 9117:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchState = void 0;
class SearchState {
    constructor(path, level) {
        this.path = path;
        this.level = level;
    }
}
exports.SearchState = SearchState;
//# sourceMappingURL=internal-search-state.js.map

/***/ }),

/***/ 9417:
/***/ ((module) => {

"use strict";

module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    if(a===b) {
      return [ai, bi];
    }
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}


/***/ }),

/***/ 3717:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var concatMap = __nccwpck_require__(6891);
var balanced = __nccwpck_require__(9417);

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function identity(e) {
  return e;
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length)
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}



/***/ }),

/***/ 6891:
/***/ ((module) => {

module.exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),

/***/ 3973:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = { sep: '/' }
try {
  path = __nccwpck_require__(5622)
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = __nccwpck_require__(3717)

var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]'

// * => any number of characters
var star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!')

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows support: need to use /, not \
  if (path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/')
  }

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function () {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
  var negate = false
  var options = this.options
  var negateOffset = 0

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate
    negateOffset++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
}

Minimatch.prototype.braceExpand = braceExpand

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options
    } else {
      options = {}
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = ''
  var hasMagic = !!options.nocase
  var escaping = false
  // ? => one single character
  var patternListStack = []
  var negativeLists = []
  var stateChar
  var inClass = false
  var reClassStart = -1
  var classStart = -1
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)'
  var self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star
          hasMagic = true
        break
        case '?':
          re += qmark
          hasMagic = true
        break
        default:
          re += '\\' + stateChar
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c
      escaping = false
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar()
        escaping = true
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === '!' && i === classStart + 1) c = '^'
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
      continue

      case '(':
        if (inClass) {
          re += '('
          continue
        }

        if (!stateChar) {
          re += '\\('
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)'
          continue
        }

        clearStateChar()
        hasMagic = true
        var pl = patternListStack.pop()
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close
        if (pl.type === '!') {
          negativeLists.push(pl)
        }
        pl.reEnd = re.length
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|'
          escaping = false
          continue
        }

        clearStateChar()
        re += '|'
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += '\\' + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c
          escaping = false
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + cs + ']')
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE)
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
            hasMagic = hasMagic || sp[1]
            inClass = false
            continue
          }
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\'
        }

        re += c

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1)
    sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + '\\[' + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length)
    this.debug('setting tail', re, pl)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\'
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    })

    this.debug('tail=%j\n   %s', tail, tail, pl, re)
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart) + t + '\\(' + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += '\\\\'
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n]

    var nlBefore = re.slice(0, nl.reStart)
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
    var nlAfter = re.slice(nl.reEnd)

    nlLast += nlAfter

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1
    var cleanAfter = nlAfter
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
    }
    nlAfter = cleanAfter

    var dollar = ''
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$'
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
    re = newRe
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re
  }

  if (addPatternStart) {
    re = patternStart + re
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : ''
  try {
    var regExp = new RegExp('^' + re + '$', flags)
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) {
    this.regexp = false
    return this.regexp
  }
  var options = this.options

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot
  var flags = options.nocase ? 'i' : ''

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|')

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$'

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$'

  try {
    this.regexp = new RegExp(re, flags)
  } catch (ex) {
    this.regexp = false
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug('match', f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/')
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, 'split', f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, 'set', set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename
  var i
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i]
    var file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern })

  this.debug('matchOne', file.length, pattern.length)

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop')
    var p = pattern[pi]
    var f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
      var pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr)
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr++
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug('string match', p, f, hit)
    } else {
      hit = f.match(p)
      this.debug('pattern match', p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '')
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
}

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}


/***/ }),

/***/ 8272:
/***/ (function(module) {

(function (global, factory) {
   true ? module.exports = factory() :
  0;
}(this, (function () { 'use strict';

  /*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   */

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  /**
   * Safe way of detecting whether or not the given thing is a primitive and
   * whether it has the given property
   */
  function primitiveHasOwnProperty (primitive, propName) {
    return (
      primitive != null
      && typeof primitive !== 'object'
      && primitive.hasOwnProperty
      && primitive.hasOwnProperty(propName)
    );
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   *
   * Tokens for partials also contain two more elements: 1) a string value of
   * indendation prior to that tag and 2) the index of that tag on that line -
   * eg a value of 2 indicates the partial is the third tag on this line.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];
    var lineHasNonSpace = false;
    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?
    var indentation = '';  // Tracks indentation for tags that use it
    var tagIndex = 0;      // Stores a count of number of tags encountered on a line

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
            indentation += chr;
          } else {
            nonSpace = true;
            lineHasNonSpace = true;
            indentation += ' ';
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n') {
            stripSpace();
            indentation = '';
            tagIndex = 0;
            lineHasNonSpace = false;
          }
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      if (type == '>') {
        token = [ type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace ];
      } else {
        token = [ type, value, start, scanner.pos ];
      }
      tagIndex++;
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    stripSpace();

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, intermediateValue, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           *
           * In the case where dot notation is used, we consider the lookup
           * to be successful even if the last "object" in the path is
           * not actually an object but a primitive (e.g., a string, or an
           * integer), because it is sometimes useful to access a property
           * of an autoboxed primitive, such as the length of a string.
           **/
          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = (
                hasProperty(intermediateValue, names[index])
                || primitiveHasOwnProperty(intermediateValue, names[index])
              );

            intermediateValue = intermediateValue[names[index++]];
          }
        } else {
          intermediateValue = context.view[name];

          /**
           * Only checking against `hasProperty`, which always returns `false` if
           * `context.view` is not an object. Deliberately omitting the check
           * against `primitiveHasOwnProperty` if dot notation is not used.
           *
           * Consider this example:
           * ```
           * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
           * ```
           *
           * If we were to check also against `primitiveHasOwnProperty`, as we do
           * in the dot notation case, then render call would return:
           *
           * "The length of a football field is 9."
           *
           * rather than the expected:
           *
           * "The length of a football field is 100 yards."
           **/
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) {
          value = intermediateValue;
          break;
        }

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.templateCache = {
      _cache: {},
      set: function set (key, value) {
        this._cache[key] = value;
      },
      get: function get (key) {
        return this._cache[key];
      },
      clear: function clear () {
        this._cache = {};
      }
    };
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    if (typeof this.templateCache !== 'undefined') {
      this.templateCache.clear();
    }
  };

  /**
   * Parses and caches the given `template` according to the given `tags` or
   * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.templateCache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var isCacheEnabled = typeof cache !== 'undefined';
    var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;

    if (tokens == undefined) {
      tokens = parseTemplate(template, tags);
      isCacheEnabled && cache.set(cacheKey, tokens);
    }
    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   *
   * If the optional `config` argument is given here, then it should be an
   * object with a `tags` attribute or an `escape` attribute or both.
   * If an array is passed, then it will be interpreted the same way as
   * a `tags` attribute on a `config` object.
   *
   * The `tags` attribute of a `config` object must be an array with two
   * string values: the opening and closing tags used in the template (e.g.
   * [ "<%", "%>" ]). The default is to mustache.tags.
   *
   * The `escape` attribute of a `config` object must be a function which
   * accepts a string as input and outputs a safely escaped string.
   * If an `escape` function is not provided, then an HTML-safe string
   * escaping function is used as the default.
   */
  Writer.prototype.render = function render (template, view, partials, config) {
    var tags = this.getConfigTags(config);
    var tokens = this.parse(template, tags);
    var context = (view instanceof Context) ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, config);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate, config) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate, config);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate, config);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, config);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context, config);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate, config) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials, config);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate, config) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate, config);
  };

  Writer.prototype.indentPartial = function indentPartial (partial, indentation, lineHasNonSpace) {
    var filteredIndentation = indentation.replace(/[^ \t]/g, '');
    var partialByNl = partial.split('\n');
    for (var i = 0; i < partialByNl.length; i++) {
      if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
        partialByNl[i] = filteredIndentation + partialByNl[i];
      }
    }
    return partialByNl.join('\n');
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials, config) {
    if (!partials) return;
    var tags = this.getConfigTags(config);

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
      var lineHasNonSpace = token[6];
      var tagIndex = token[5];
      var indentation = token[4];
      var indentedValue = value;
      if (tagIndex == 0 && indentation) {
        indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
      }
      var tokens = this.parse(indentedValue, tags);
      return this.renderTokens(tokens, context, partials, indentedValue, config);
    }
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context, config) {
    var escape = this.getConfigEscape(config) || mustache.escape;
    var value = context.lookup(token[1]);
    if (value != null)
      return (typeof value === 'number' && escape === mustache.escape) ? String(value) : escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  Writer.prototype.getConfigTags = function getConfigTags (config) {
    if (isArray(config)) {
      return config;
    }
    else if (config && typeof config === 'object') {
      return config.tags;
    }
    else {
      return undefined;
    }
  };

  Writer.prototype.getConfigEscape = function getConfigEscape (config) {
    if (config && typeof config === 'object' && !isArray(config)) {
      return config.escape;
    }
    else {
      return undefined;
    }
  };

  var mustache = {
    name: 'mustache.js',
    version: '4.2.0',
    tags: [ '{{', '}}' ],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,
    /**
     * Allows a user to override the default caching strategy, by providing an
     * object with set, get and clear methods. This can also be used to disable
     * the cache by setting it to the literal `undefined`.
     */
    set templateCache (cache) {
      defaultWriter.templateCache = cache;
    },
    /**
     * Gets the default or overridden caching object from the default writer.
     */
    get templateCache () {
      return defaultWriter.templateCache;
    }
  };

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view`, `partials`, and `config`
   * using the default writer.
   */
  mustache.render = function render (template, view, partials, config) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials, config);
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  return mustache;

})));


/***/ }),

/***/ 1894:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatNonRelativeMarkdownLink = exports.formatInvalidMarkdownLink = exports.formatMarkdownLink = void 0;
const validate_link_1 = __nccwpck_require__(1831);
const chalk_1 = __importDefault(__nccwpck_require__(2341));
function formatMarkdownLink(link, valid) {
    return `File: ${link.sourceFile}\tLink: ${link.link}\tLocation: [[${link.startLine},${link.startCol}],[${link.endLine},${link.endCol}]]\tValid: ${validate_link_1.LinkValidity[valid]}`;
}
exports.formatMarkdownLink = formatMarkdownLink;
function formatInvalidMarkdownLink(link) {
    const errorString = `
${chalk_1.default.underline(`${link.sourceFile}:${link.startLine}`)}
${chalk_1.default.bold.red('Error')} Could not resolve link: ${chalk_1.default.yellow(link.link)}`;
    return errorString;
}
exports.formatInvalidMarkdownLink = formatInvalidMarkdownLink;
function formatNonRelativeMarkdownLink(link) {
    const errorString = `
${chalk_1.default.underline(`${link.sourceFile}:${link.startLine}`)}
${chalk_1.default.bold.red('Error')} Please make link relative: ${chalk_1.default.yellow(link.link)}`;
    return errorString;
}
exports.formatNonRelativeMarkdownLink = formatNonRelativeMarkdownLink;


/***/ }),

/***/ 3926:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gitLsFiles = void 0;
const exec_1 = __nccwpck_require__(1509);
function gitLsFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        const [gitRoot] = yield execCaptureOutput('git', [
            'rev-parse',
            '--show-toplevel'
        ]);
        const [rawFiles] = yield execCaptureOutput('git', [
            '-C',
            gitRoot.trim(),
            'ls-files'
        ]);
        return rawFiles.split(/[\r\n]+/).filter(line => {
            return line !== '';
        });
    });
}
exports.gitLsFiles = gitLsFiles;
function execCaptureOutput(cmd, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let out = '';
        let err = '';
        const options = {};
        options.silent = true;
        options.listeners = {
            stdout: (data) => {
                out += data.toString();
            },
            stderr: (data) => {
                err += data.toString();
            }
        };
        yield exec_1.exec(cmd, args, options);
        return [out, err];
    });
}


/***/ }),

/***/ 7064:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validate_markdown_links_from_files = exports.SUGGEST_MIN_DISTANCE = exports.suggestPath = exports.gitLsFiles = exports.valid_link = exports.LinkValidity = exports.parse_markdown_links_from_files = exports.parse_markdown_links_from_file = exports.formatInvalidMarkdownLink = exports.formatMarkdownLink = void 0;
const format_1 = __nccwpck_require__(1894);
Object.defineProperty(exports, "formatMarkdownLink", ({ enumerable: true, get: function () { return format_1.formatMarkdownLink; } }));
Object.defineProperty(exports, "formatInvalidMarkdownLink", ({ enumerable: true, get: function () { return format_1.formatInvalidMarkdownLink; } }));
const parse_markdown_links_1 = __nccwpck_require__(155);
Object.defineProperty(exports, "parse_markdown_links_from_file", ({ enumerable: true, get: function () { return parse_markdown_links_1.parse_markdown_links_from_file; } }));
Object.defineProperty(exports, "parse_markdown_links_from_files", ({ enumerable: true, get: function () { return parse_markdown_links_1.parse_markdown_links_from_files; } }));
const validate_link_1 = __nccwpck_require__(1831);
Object.defineProperty(exports, "LinkValidity", ({ enumerable: true, get: function () { return validate_link_1.LinkValidity; } }));
Object.defineProperty(exports, "valid_link", ({ enumerable: true, get: function () { return validate_link_1.valid_link; } }));
const suggest_path_1 = __nccwpck_require__(6795);
Object.defineProperty(exports, "suggestPath", ({ enumerable: true, get: function () { return suggest_path_1.suggestPath; } }));
Object.defineProperty(exports, "SUGGEST_MIN_DISTANCE", ({ enumerable: true, get: function () { return suggest_path_1.SUGGEST_MIN_DISTANCE; } }));
const git_1 = __nccwpck_require__(3926);
Object.defineProperty(exports, "gitLsFiles", ({ enumerable: true, get: function () { return git_1.gitLsFiles; } }));
function validate_markdown_links_from_files(filenames, absoluteBaseUrl) {
    return __asyncGenerator(this, arguments, function* validate_markdown_links_from_files_1() {
        var e_1, _a;
        try {
            for (var _b = __asyncValues(parse_markdown_links_1.parse_markdown_links_from_files(filenames)), _c; _c = yield __await(_b.next()), !_c.done;) {
                const links = _c.value;
                for (const link of links) {
                    const valid = yield __await(validate_link_1.valid_link(link, absoluteBaseUrl));
                    yield yield __await([link, valid]);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.validate_markdown_links_from_files = validate_markdown_links_from_files;


/***/ }),

/***/ 155:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parse_markdown_links_from_files = exports.parse_markdown_links_from_file = void 0;
const commonmark_1 = __nccwpck_require__(148);
const fs_1 = __nccwpck_require__(5747);
function parse_markdown_links_from_file(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileContents = yield fs_1.promises.readFile(filename, 'utf-8');
        const reader = new commonmark_1.Parser();
        const parsed = reader.parse(fileContents);
        const walker = parsed.walker();
        let event, node;
        const links = [];
        try {
            while ((event = walker.next())) {
                node = event.node;
                if (event.entering && (node.type === 'link' || node.type === 'image')) {
                    if (node.destination && node.parent) {
                        let startLine, startCol, endLine, endCol;
                        const maybe_sourcepos = find_source_pos(node);
                        if (maybe_sourcepos) {
                            ;
                            [[startLine, startCol], [endLine, endCol]] = maybe_sourcepos;
                        }
                        else {
                            startLine = undefined;
                            startCol = undefined;
                            endLine = undefined;
                            endCol = undefined;
                        }
                        const link = {
                            sourceFile: filename,
                            link: node.destination,
                            startLine,
                            startCol,
                            endLine,
                            endCol
                        };
                        links.push(link);
                    }
                }
            }
        }
        catch (error) {
            // TODO: log and return empty links set
        }
        return links;
    });
}
exports.parse_markdown_links_from_file = parse_markdown_links_from_file;
function parse_markdown_links_from_files(filenames) {
    return __asyncGenerator(this, arguments, function* parse_markdown_links_from_files_1() {
        var e_1, _a;
        try {
            for (var filenames_1 = __asyncValues(filenames), filenames_1_1; filenames_1_1 = yield __await(filenames_1.next()), !filenames_1_1.done;) {
                const filename = filenames_1_1.value;
                const links = yield __await(parse_markdown_links_from_file(filename));
                yield yield __await(links);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (filenames_1_1 && !filenames_1_1.done && (_a = filenames_1.return)) yield __await(_a.call(filenames_1));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.parse_markdown_links_from_files = parse_markdown_links_from_files;
// Keep walking up the node's lineage until there is a sourcepos field
function find_source_pos(node) {
    while (node && node.parent && !node.parent.sourcepos) {
        node = node.parent;
    }
    if (node && node.parent && node.parent.sourcepos) {
        return node.parent.sourcepos;
    }
    else {
        return null;
    }
}


/***/ }),

/***/ 6795:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SUGGEST_MIN_DISTANCE = exports.suggestPath = void 0;
const path_1 = __nccwpck_require__(5622);
const fastest_levenshtein_1 = __nccwpck_require__(9488);
function suggestPath(sourceFile, badLink, candidatePaths) {
    const relativePathCandidates = candidatePaths.map(path => {
        const relativeLink = path_1.relative(sourceFile, path);
        // the relative links calculated will have an extra `../`,
        // if the directory is 'above', or the file is in the same
        // directory as the current file. So if this relative path
        // starts with a `../`, we remove one layer of it
        if (relativeLink.startsWith('../')) {
            return relativeLink.slice(3);
        }
        else {
            return relativeLink;
        }
    });
    // Don't include a link to the sourceFile itself
    const withoutSelfLink = relativePathCandidates.filter(link => {
        return link !== '';
    });
    const match = fastest_levenshtein_1.closest(badLink, withoutSelfLink);
    return [match, fastest_levenshtein_1.distance(badLink, match)];
}
exports.suggestPath = suggestPath;
// A constant that can be used to only suggest
// paths that are 'close enough' to the incorrect path
exports.SUGGEST_MIN_DISTANCE = 8;


/***/ }),

/***/ 1831:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.valid_link = exports.LinkValidity = void 0;
const path_1 = __nccwpck_require__(5622);
const url_1 = __nccwpck_require__(8835);
const fs_1 = __nccwpck_require__(5747);
var LinkValidity;
(function (LinkValidity) {
    LinkValidity[LinkValidity["Valid"] = 0] = "Valid";
    LinkValidity[LinkValidity["Invalid"] = 1] = "Invalid";
    LinkValidity[LinkValidity["Unknown"] = 2] = "Unknown";
    LinkValidity[LinkValidity["NonRelative"] = 3] = "NonRelative";
})(LinkValidity = exports.LinkValidity || (exports.LinkValidity = {}));
function valid_link(link, absoluteBaseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        // If link is using an absolute link with the base url, and absoluteBaseUrl is set, then we throw
        // an "NonRelative" error because we want it to be a relative link instead
        if (absoluteBaseUrl && link.link.includes(absoluteBaseUrl) && !link.link.includes('javascript:void')) {
            return LinkValidity.NonRelative;
        }
        const parsedUrl = url_1.parse(link.link);
        if (!parsedUrl.protocol && !parsedUrl.host) {
            let linkPath = parsedUrl.pathname;
            if (!linkPath) {
                linkPath = '';
            }
            const decodedLinkPath = decodeURIComponent(linkPath);
            const sourceFile = path_1.dirname(link.sourceFile);
            // Throw NonRelative error for absolute paths too
            if (decodedLinkPath.startsWith('/')) {
                return LinkValidity.NonRelative;
            }
            else {
                const joinedLinkPath = path_1.join(sourceFile, decodedLinkPath);
                try {
                    yield fs_1.promises.access(joinedLinkPath);
                    return LinkValidity.Valid;
                }
                catch (error) {
                    return LinkValidity.Invalid;
                }
            }
        }
        else {
            return LinkValidity.Unknown;
        }
    });
}
exports.valid_link = valid_link;


/***/ }),

/***/ 1509:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getExecOutput = exports.exec = void 0;
const string_decoder_1 = __nccwpck_require__(4304);
const tr = __importStar(__nccwpck_require__(6846));
/**
 * Exec a command.
 * Output will be streamed to the live console.
 * Returns promise with return code
 *
 * @param     commandLine        command to execute (can include additional args). Must be correctly escaped.
 * @param     args               optional arguments for tool. Escaping is handled by the lib.
 * @param     options            optional exec options.  See ExecOptions
 * @returns   Promise<number>    exit code
 */
function exec(commandLine, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = tr.argStringToArray(commandLine);
        if (commandArgs.length === 0) {
            throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
        }
        // Path to tool to execute should be first arg
        const toolPath = commandArgs[0];
        args = commandArgs.slice(1).concat(args || []);
        const runner = new tr.ToolRunner(toolPath, args, options);
        return runner.exec();
    });
}
exports.exec = exec;
/**
 * Exec a command and get the output.
 * Output will be streamed to the live console.
 * Returns promise with the exit code and collected stdout and stderr
 *
 * @param     commandLine           command to execute (can include additional args). Must be correctly escaped.
 * @param     args                  optional arguments for tool. Escaping is handled by the lib.
 * @param     options               optional exec options.  See ExecOptions
 * @returns   Promise<ExecOutput>   exit code, stdout, and stderr
 */
function getExecOutput(commandLine, args, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let stdout = '';
        let stderr = '';
        //Using string decoder covers the case where a mult-byte character is split
        const stdoutDecoder = new string_decoder_1.StringDecoder('utf8');
        const stderrDecoder = new string_decoder_1.StringDecoder('utf8');
        const originalStdoutListener = (_a = options === null || options === void 0 ? void 0 : options.listeners) === null || _a === void 0 ? void 0 : _a.stdout;
        const originalStdErrListener = (_b = options === null || options === void 0 ? void 0 : options.listeners) === null || _b === void 0 ? void 0 : _b.stderr;
        const stdErrListener = (data) => {
            stderr += stderrDecoder.write(data);
            if (originalStdErrListener) {
                originalStdErrListener(data);
            }
        };
        const stdOutListener = (data) => {
            stdout += stdoutDecoder.write(data);
            if (originalStdoutListener) {
                originalStdoutListener(data);
            }
        };
        const listeners = Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.listeners), { stdout: stdOutListener, stderr: stdErrListener });
        const exitCode = yield exec(commandLine, args, Object.assign(Object.assign({}, options), { listeners }));
        //flush any remaining characters
        stdout += stdoutDecoder.end();
        stderr += stderrDecoder.end();
        return {
            exitCode,
            stdout,
            stderr
        };
    });
}
exports.getExecOutput = getExecOutput;
//# sourceMappingURL=exec.js.map

/***/ }),

/***/ 6846:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.argStringToArray = exports.ToolRunner = void 0;
const os = __importStar(__nccwpck_require__(2087));
const events = __importStar(__nccwpck_require__(8614));
const child = __importStar(__nccwpck_require__(3129));
const path = __importStar(__nccwpck_require__(5622));
const io = __importStar(__nccwpck_require__(7719));
const ioUtil = __importStar(__nccwpck_require__(8498));
const timers_1 = __nccwpck_require__(8213);
/* eslint-disable @typescript-eslint/unbound-method */
const IS_WINDOWS = process.platform === 'win32';
/*
 * Class for running command line tools. Handles quoting and arg parsing in a platform agnostic way.
 */
class ToolRunner extends events.EventEmitter {
    constructor(toolPath, args, options) {
        super();
        if (!toolPath) {
            throw new Error("Parameter 'toolPath' cannot be null or empty.");
        }
        this.toolPath = toolPath;
        this.args = args || [];
        this.options = options || {};
    }
    _debug(message) {
        if (this.options.listeners && this.options.listeners.debug) {
            this.options.listeners.debug(message);
        }
    }
    _getCommandString(options, noPrefix) {
        const toolPath = this._getSpawnFileName();
        const args = this._getSpawnArgs(options);
        let cmd = noPrefix ? '' : '[command]'; // omit prefix when piped to a second tool
        if (IS_WINDOWS) {
            // Windows + cmd file
            if (this._isCmdFile()) {
                cmd += toolPath;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows + verbatim
            else if (options.windowsVerbatimArguments) {
                cmd += `"${toolPath}"`;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows (regular)
            else {
                cmd += this._windowsQuoteCmdArg(toolPath);
                for (const a of args) {
                    cmd += ` ${this._windowsQuoteCmdArg(a)}`;
                }
            }
        }
        else {
            // OSX/Linux - this can likely be improved with some form of quoting.
            // creating processes on Unix is fundamentally different than Windows.
            // on Unix, execvp() takes an arg array.
            cmd += toolPath;
            for (const a of args) {
                cmd += ` ${a}`;
            }
        }
        return cmd;
    }
    _processLineBuffer(data, strBuffer, onLine) {
        try {
            let s = strBuffer + data.toString();
            let n = s.indexOf(os.EOL);
            while (n > -1) {
                const line = s.substring(0, n);
                onLine(line);
                // the rest of the string ...
                s = s.substring(n + os.EOL.length);
                n = s.indexOf(os.EOL);
            }
            return s;
        }
        catch (err) {
            // streaming lines to console is best effort.  Don't fail a build.
            this._debug(`error processing line. Failed with error ${err}`);
            return '';
        }
    }
    _getSpawnFileName() {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                return process.env['COMSPEC'] || 'cmd.exe';
            }
        }
        return this.toolPath;
    }
    _getSpawnArgs(options) {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
                for (const a of this.args) {
                    argline += ' ';
                    argline += options.windowsVerbatimArguments
                        ? a
                        : this._windowsQuoteCmdArg(a);
                }
                argline += '"';
                return [argline];
            }
        }
        return this.args;
    }
    _endsWith(str, end) {
        return str.endsWith(end);
    }
    _isCmdFile() {
        const upperToolPath = this.toolPath.toUpperCase();
        return (this._endsWith(upperToolPath, '.CMD') ||
            this._endsWith(upperToolPath, '.BAT'));
    }
    _windowsQuoteCmdArg(arg) {
        // for .exe, apply the normal quoting rules that libuv applies
        if (!this._isCmdFile()) {
            return this._uvQuoteCmdArg(arg);
        }
        // otherwise apply quoting rules specific to the cmd.exe command line parser.
        // the libuv rules are generic and are not designed specifically for cmd.exe
        // command line parser.
        //
        // for a detailed description of the cmd.exe command line parser, refer to
        // http://stackoverflow.com/questions/4094699/how-does-the-windows-command-interpreter-cmd-exe-parse-scripts/7970912#7970912
        // need quotes for empty arg
        if (!arg) {
            return '""';
        }
        // determine whether the arg needs to be quoted
        const cmdSpecialChars = [
            ' ',
            '\t',
            '&',
            '(',
            ')',
            '[',
            ']',
            '{',
            '}',
            '^',
            '=',
            ';',
            '!',
            "'",
            '+',
            ',',
            '`',
            '~',
            '|',
            '<',
            '>',
            '"'
        ];
        let needsQuotes = false;
        for (const char of arg) {
            if (cmdSpecialChars.some(x => x === char)) {
                needsQuotes = true;
                break;
            }
        }
        // short-circuit if quotes not needed
        if (!needsQuotes) {
            return arg;
        }
        // the following quoting rules are very similar to the rules that by libuv applies.
        //
        // 1) wrap the string in quotes
        //
        // 2) double-up quotes - i.e. " => ""
        //
        //    this is different from the libuv quoting rules. libuv replaces " with \", which unfortunately
        //    doesn't work well with a cmd.exe command line.
        //
        //    note, replacing " with "" also works well if the arg is passed to a downstream .NET console app.
        //    for example, the command line:
        //          foo.exe "myarg:""my val"""
        //    is parsed by a .NET console app into an arg array:
        //          [ "myarg:\"my val\"" ]
        //    which is the same end result when applying libuv quoting rules. although the actual
        //    command line from libuv quoting rules would look like:
        //          foo.exe "myarg:\"my val\""
        //
        // 3) double-up slashes that precede a quote,
        //    e.g.  hello \world    => "hello \world"
        //          hello\"world    => "hello\\""world"
        //          hello\\"world   => "hello\\\\""world"
        //          hello world\    => "hello world\\"
        //
        //    technically this is not required for a cmd.exe command line, or the batch argument parser.
        //    the reasons for including this as a .cmd quoting rule are:
        //
        //    a) this is optimized for the scenario where the argument is passed from the .cmd file to an
        //       external program. many programs (e.g. .NET console apps) rely on the slash-doubling rule.
        //
        //    b) it's what we've been doing previously (by deferring to node default behavior) and we
        //       haven't heard any complaints about that aspect.
        //
        // note, a weakness of the quoting rules chosen here, is that % is not escaped. in fact, % cannot be
        // escaped when used on the command line directly - even though within a .cmd file % can be escaped
        // by using %%.
        //
        // the saving grace is, on the command line, %var% is left as-is if var is not defined. this contrasts
        // the line parsing rules within a .cmd file, where if var is not defined it is replaced with nothing.
        //
        // one option that was explored was replacing % with ^% - i.e. %var% => ^%var^%. this hack would
        // often work, since it is unlikely that var^ would exist, and the ^ character is removed when the
        // variable is used. the problem, however, is that ^ is not removed when %* is used to pass the args
        // to an external program.
        //
        // an unexplored potential solution for the % escaping problem, is to create a wrapper .cmd file.
        // % can be escaped within a .cmd file.
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\'; // double the slash
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '"'; // double the quote
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _uvQuoteCmdArg(arg) {
        // Tool runner wraps child_process.spawn() and needs to apply the same quoting as
        // Node in certain cases where the undocumented spawn option windowsVerbatimArguments
        // is used.
        //
        // Since this function is a port of quote_cmd_arg from Node 4.x (technically, lib UV,
        // see https://github.com/nodejs/node/blob/v4.x/deps/uv/src/win/process.c for details),
        // pasting copyright notice from Node within this function:
        //
        //      Copyright Joyent, Inc. and other Node contributors. All rights reserved.
        //
        //      Permission is hereby granted, free of charge, to any person obtaining a copy
        //      of this software and associated documentation files (the "Software"), to
        //      deal in the Software without restriction, including without limitation the
        //      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        //      sell copies of the Software, and to permit persons to whom the Software is
        //      furnished to do so, subject to the following conditions:
        //
        //      The above copyright notice and this permission notice shall be included in
        //      all copies or substantial portions of the Software.
        //
        //      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        //      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        //      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        //      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        //      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        //      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        //      IN THE SOFTWARE.
        if (!arg) {
            // Need double quotation for empty argument
            return '""';
        }
        if (!arg.includes(' ') && !arg.includes('\t') && !arg.includes('"')) {
            // No quotation needed
            return arg;
        }
        if (!arg.includes('"') && !arg.includes('\\')) {
            // No embedded double quotes or backslashes, so I can just wrap
            // quote marks around the whole thing.
            return `"${arg}"`;
        }
        // Expected input/output:
        //   input : hello"world
        //   output: "hello\"world"
        //   input : hello""world
        //   output: "hello\"\"world"
        //   input : hello\world
        //   output: hello\world
        //   input : hello\\world
        //   output: hello\\world
        //   input : hello\"world
        //   output: "hello\\\"world"
        //   input : hello\\"world
        //   output: "hello\\\\\"world"
        //   input : hello world\
        //   output: "hello world\\" - note the comment in libuv actually reads "hello world\"
        //                             but it appears the comment is wrong, it should be "hello world\\"
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\';
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '\\';
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _cloneExecOptions(options) {
        options = options || {};
        const result = {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            silent: options.silent || false,
            windowsVerbatimArguments: options.windowsVerbatimArguments || false,
            failOnStdErr: options.failOnStdErr || false,
            ignoreReturnCode: options.ignoreReturnCode || false,
            delay: options.delay || 10000
        };
        result.outStream = options.outStream || process.stdout;
        result.errStream = options.errStream || process.stderr;
        return result;
    }
    _getSpawnOptions(options, toolPath) {
        options = options || {};
        const result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result['windowsVerbatimArguments'] =
            options.windowsVerbatimArguments || this._isCmdFile();
        if (options.windowsVerbatimArguments) {
            result.argv0 = `"${toolPath}"`;
        }
        return result;
    }
    /**
     * Exec a tool.
     * Output will be streamed to the live console.
     * Returns promise with return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See ExecOptions
     * @returns   number
     */
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            // root the tool path if it is unrooted and contains relative pathing
            if (!ioUtil.isRooted(this.toolPath) &&
                (this.toolPath.includes('/') ||
                    (IS_WINDOWS && this.toolPath.includes('\\')))) {
                // prefer options.cwd if it is specified, however options.cwd may also need to be rooted
                this.toolPath = path.resolve(process.cwd(), this.options.cwd || process.cwd(), this.toolPath);
            }
            // if the tool is only a file name, then resolve it from the PATH
            // otherwise verify it exists (add extension on Windows if necessary)
            this.toolPath = yield io.which(this.toolPath, true);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this._debug(`exec tool: ${this.toolPath}`);
                this._debug('arguments:');
                for (const arg of this.args) {
                    this._debug(`   ${arg}`);
                }
                const optionsNonNull = this._cloneExecOptions(this.options);
                if (!optionsNonNull.silent && optionsNonNull.outStream) {
                    optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
                }
                const state = new ExecState(optionsNonNull, this.toolPath);
                state.on('debug', (message) => {
                    this._debug(message);
                });
                if (this.options.cwd && !(yield ioUtil.exists(this.options.cwd))) {
                    return reject(new Error(`The cwd: ${this.options.cwd} does not exist!`));
                }
                const fileName = this._getSpawnFileName();
                const cp = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
                let stdbuffer = '';
                if (cp.stdout) {
                    cp.stdout.on('data', (data) => {
                        if (this.options.listeners && this.options.listeners.stdout) {
                            this.options.listeners.stdout(data);
                        }
                        if (!optionsNonNull.silent && optionsNonNull.outStream) {
                            optionsNonNull.outStream.write(data);
                        }
                        stdbuffer = this._processLineBuffer(data, stdbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.stdline) {
                                this.options.listeners.stdline(line);
                            }
                        });
                    });
                }
                let errbuffer = '';
                if (cp.stderr) {
                    cp.stderr.on('data', (data) => {
                        state.processStderr = true;
                        if (this.options.listeners && this.options.listeners.stderr) {
                            this.options.listeners.stderr(data);
                        }
                        if (!optionsNonNull.silent &&
                            optionsNonNull.errStream &&
                            optionsNonNull.outStream) {
                            const s = optionsNonNull.failOnStdErr
                                ? optionsNonNull.errStream
                                : optionsNonNull.outStream;
                            s.write(data);
                        }
                        errbuffer = this._processLineBuffer(data, errbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.errline) {
                                this.options.listeners.errline(line);
                            }
                        });
                    });
                }
                cp.on('error', (err) => {
                    state.processError = err.message;
                    state.processExited = true;
                    state.processClosed = true;
                    state.CheckComplete();
                });
                cp.on('exit', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                cp.on('close', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    state.processClosed = true;
                    this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                state.on('done', (error, exitCode) => {
                    if (stdbuffer.length > 0) {
                        this.emit('stdline', stdbuffer);
                    }
                    if (errbuffer.length > 0) {
                        this.emit('errline', errbuffer);
                    }
                    cp.removeAllListeners();
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(exitCode);
                    }
                });
                if (this.options.input) {
                    if (!cp.stdin) {
                        throw new Error('child process missing stdin');
                    }
                    cp.stdin.end(this.options.input);
                }
            }));
        });
    }
}
exports.ToolRunner = ToolRunner;
/**
 * Convert an arg string to an array of args. Handles escaping
 *
 * @param    argString   string of arguments
 * @returns  string[]    array of arguments
 */
function argStringToArray(argString) {
    const args = [];
    let inQuotes = false;
    let escaped = false;
    let arg = '';
    function append(c) {
        // we only escape double quotes.
        if (escaped && c !== '"') {
            arg += '\\';
        }
        arg += c;
        escaped = false;
    }
    for (let i = 0; i < argString.length; i++) {
        const c = argString.charAt(i);
        if (c === '"') {
            if (!escaped) {
                inQuotes = !inQuotes;
            }
            else {
                append(c);
            }
            continue;
        }
        if (c === '\\' && escaped) {
            append(c);
            continue;
        }
        if (c === '\\' && inQuotes) {
            escaped = true;
            continue;
        }
        if (c === ' ' && !inQuotes) {
            if (arg.length > 0) {
                args.push(arg);
                arg = '';
            }
            continue;
        }
        append(c);
    }
    if (arg.length > 0) {
        args.push(arg.trim());
    }
    return args;
}
exports.argStringToArray = argStringToArray;
class ExecState extends events.EventEmitter {
    constructor(options, toolPath) {
        super();
        this.processClosed = false; // tracks whether the process has exited and stdio is closed
        this.processError = '';
        this.processExitCode = 0;
        this.processExited = false; // tracks whether the process has exited
        this.processStderr = false; // tracks whether stderr was written to
        this.delay = 10000; // 10 seconds
        this.done = false;
        this.timeout = null;
        if (!toolPath) {
            throw new Error('toolPath must not be empty');
        }
        this.options = options;
        this.toolPath = toolPath;
        if (options.delay) {
            this.delay = options.delay;
        }
    }
    CheckComplete() {
        if (this.done) {
            return;
        }
        if (this.processClosed) {
            this._setResult();
        }
        else if (this.processExited) {
            this.timeout = timers_1.setTimeout(ExecState.HandleTimeout, this.delay, this);
        }
    }
    _debug(message) {
        this.emit('debug', message);
    }
    _setResult() {
        // determine whether there is an error
        let error;
        if (this.processExited) {
            if (this.processError) {
                error = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
            }
            else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
                error = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
            }
            else if (this.processStderr && this.options.failOnStdErr) {
                error = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
            }
        }
        // clear the timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.done = true;
        this.emit('done', error, this.processExitCode);
    }
    static HandleTimeout(state) {
        if (state.done) {
            return;
        }
        if (!state.processClosed && state.processExited) {
            const message = `The STDIO streams did not close within ${state.delay /
                1000} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
            state._debug(message);
        }
        state._setResult();
    }
}
//# sourceMappingURL=toolrunner.js.map

/***/ }),

/***/ 8498:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCmdPath = exports.tryGetExecutablePath = exports.isRooted = exports.isDirectory = exports.exists = exports.IS_WINDOWS = exports.unlink = exports.symlink = exports.stat = exports.rmdir = exports.rename = exports.readlink = exports.readdir = exports.mkdir = exports.lstat = exports.copyFile = exports.chmod = void 0;
const fs = __importStar(__nccwpck_require__(5747));
const path = __importStar(__nccwpck_require__(5622));
_a = fs.promises, exports.chmod = _a.chmod, exports.copyFile = _a.copyFile, exports.lstat = _a.lstat, exports.mkdir = _a.mkdir, exports.readdir = _a.readdir, exports.readlink = _a.readlink, exports.rename = _a.rename, exports.rmdir = _a.rmdir, exports.stat = _a.stat, exports.symlink = _a.symlink, exports.unlink = _a.unlink;
exports.IS_WINDOWS = process.platform === 'win32';
function exists(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.stat(fsPath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
        return true;
    });
}
exports.exists = exists;
function isDirectory(fsPath, useStat = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = useStat ? yield exports.stat(fsPath) : yield exports.lstat(fsPath);
        return stats.isDirectory();
    });
}
exports.isDirectory = isDirectory;
/**
 * On OSX/Linux, true if path starts with '/'. On Windows, true for paths like:
 * \, \hello, \\hello\share, C:, and C:\hello (and corresponding alternate separator cases).
 */
function isRooted(p) {
    p = normalizeSeparators(p);
    if (!p) {
        throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (exports.IS_WINDOWS) {
        return (p.startsWith('\\') || /^[A-Z]:/i.test(p) // e.g. \ or \hello or \\hello
        ); // e.g. C: or C:\hello
    }
    return p.startsWith('/');
}
exports.isRooted = isRooted;
/**
 * Best effort attempt to determine whether a file exists and is executable.
 * @param filePath    file path to check
 * @param extensions  additional file extensions to try
 * @return if file exists and is executable, returns the file path. otherwise empty string.
 */
function tryGetExecutablePath(filePath, extensions) {
    return __awaiter(this, void 0, void 0, function* () {
        let stats = undefined;
        try {
            // test file exists
            stats = yield exports.stat(filePath);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                // eslint-disable-next-line no-console
                console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
            }
        }
        if (stats && stats.isFile()) {
            if (exports.IS_WINDOWS) {
                // on Windows, test for valid extension
                const upperExt = path.extname(filePath).toUpperCase();
                if (extensions.some(validExt => validExt.toUpperCase() === upperExt)) {
                    return filePath;
                }
            }
            else {
                if (isUnixExecutable(stats)) {
                    return filePath;
                }
            }
        }
        // try each extension
        const originalFilePath = filePath;
        for (const extension of extensions) {
            filePath = originalFilePath + extension;
            stats = undefined;
            try {
                stats = yield exports.stat(filePath);
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    // eslint-disable-next-line no-console
                    console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
                }
            }
            if (stats && stats.isFile()) {
                if (exports.IS_WINDOWS) {
                    // preserve the case of the actual file (since an extension was appended)
                    try {
                        const directory = path.dirname(filePath);
                        const upperName = path.basename(filePath).toUpperCase();
                        for (const actualName of yield exports.readdir(directory)) {
                            if (upperName === actualName.toUpperCase()) {
                                filePath = path.join(directory, actualName);
                                break;
                            }
                        }
                    }
                    catch (err) {
                        // eslint-disable-next-line no-console
                        console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
                    }
                    return filePath;
                }
                else {
                    if (isUnixExecutable(stats)) {
                        return filePath;
                    }
                }
            }
        }
        return '';
    });
}
exports.tryGetExecutablePath = tryGetExecutablePath;
function normalizeSeparators(p) {
    p = p || '';
    if (exports.IS_WINDOWS) {
        // convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // remove redundant slashes
        return p.replace(/\\\\+/g, '\\');
    }
    // remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
// on Mac/Linux, test the execute bit
//     R   W  X  R  W X R W X
//   256 128 64 32 16 8 4 2 1
function isUnixExecutable(stats) {
    return ((stats.mode & 1) > 0 ||
        ((stats.mode & 8) > 0 && stats.gid === process.getgid()) ||
        ((stats.mode & 64) > 0 && stats.uid === process.getuid()));
}
// Get the path of cmd.exe in windows
function getCmdPath() {
    var _a;
    return (_a = process.env['COMSPEC']) !== null && _a !== void 0 ? _a : `cmd.exe`;
}
exports.getCmdPath = getCmdPath;
//# sourceMappingURL=io-util.js.map

/***/ }),

/***/ 7719:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findInPath = exports.which = exports.mkdirP = exports.rmRF = exports.mv = exports.cp = void 0;
const assert_1 = __nccwpck_require__(2357);
const childProcess = __importStar(__nccwpck_require__(3129));
const path = __importStar(__nccwpck_require__(5622));
const util_1 = __nccwpck_require__(1669);
const ioUtil = __importStar(__nccwpck_require__(8498));
const exec = util_1.promisify(childProcess.exec);
const execFile = util_1.promisify(childProcess.execFile);
/**
 * Copies a file or folder.
 * Based off of shelljs - https://github.com/shelljs/shelljs/blob/9237f66c52e5daa40458f94f9565e18e8132f5a6/src/cp.js
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See CopyOptions.
 */
function cp(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { force, recursive, copySourceDirectory } = readCopyOptions(options);
        const destStat = (yield ioUtil.exists(dest)) ? yield ioUtil.stat(dest) : null;
        // Dest is an existing file, but not forcing
        if (destStat && destStat.isFile() && !force) {
            return;
        }
        // If dest is an existing directory, should copy inside.
        const newDest = destStat && destStat.isDirectory() && copySourceDirectory
            ? path.join(dest, path.basename(source))
            : dest;
        if (!(yield ioUtil.exists(source))) {
            throw new Error(`no such file or directory: ${source}`);
        }
        const sourceStat = yield ioUtil.stat(source);
        if (sourceStat.isDirectory()) {
            if (!recursive) {
                throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
            }
            else {
                yield cpDirRecursive(source, newDest, 0, force);
            }
        }
        else {
            if (path.relative(source, newDest) === '') {
                // a file cannot be copied to itself
                throw new Error(`'${newDest}' and '${source}' are the same file`);
            }
            yield copyFile(source, newDest, force);
        }
    });
}
exports.cp = cp;
/**
 * Moves a path.
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See MoveOptions.
 */
function mv(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield ioUtil.exists(dest)) {
            let destExists = true;
            if (yield ioUtil.isDirectory(dest)) {
                // If dest is directory copy src into dest
                dest = path.join(dest, path.basename(source));
                destExists = yield ioUtil.exists(dest);
            }
            if (destExists) {
                if (options.force == null || options.force) {
                    yield rmRF(dest);
                }
                else {
                    throw new Error('Destination already exists');
                }
            }
        }
        yield mkdirP(path.dirname(dest));
        yield ioUtil.rename(source, dest);
    });
}
exports.mv = mv;
/**
 * Remove a path recursively with force
 *
 * @param inputPath path to remove
 */
function rmRF(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ioUtil.IS_WINDOWS) {
            // Node doesn't provide a delete operation, only an unlink function. This means that if the file is being used by another
            // program (e.g. antivirus), it won't be deleted. To address this, we shell out the work to rd/del.
            // Check for invalid characters
            // https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file
            if (/[*"<>|]/.test(inputPath)) {
                throw new Error('File path must not contain `*`, `"`, `<`, `>` or `|` on Windows');
            }
            try {
                const cmdPath = ioUtil.getCmdPath();
                if (yield ioUtil.isDirectory(inputPath, true)) {
                    yield exec(`${cmdPath} /s /c "rd /s /q "%inputPath%""`, {
                        env: { inputPath }
                    });
                }
                else {
                    yield exec(`${cmdPath} /s /c "del /f /a "%inputPath%""`, {
                        env: { inputPath }
                    });
                }
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
            }
            // Shelling out fails to remove a symlink folder with missing source, this unlink catches that
            try {
                yield ioUtil.unlink(inputPath);
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
            }
        }
        else {
            let isDir = false;
            try {
                isDir = yield ioUtil.isDirectory(inputPath);
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
                return;
            }
            if (isDir) {
                yield execFile(`rm`, [`-rf`, `${inputPath}`]);
            }
            else {
                yield ioUtil.unlink(inputPath);
            }
        }
    });
}
exports.rmRF = rmRF;
/**
 * Make a directory.  Creates the full path with folders in between
 * Will throw if it fails
 *
 * @param   fsPath        path to create
 * @returns Promise<void>
 */
function mkdirP(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.ok(fsPath, 'a path argument must be provided');
        yield ioUtil.mkdir(fsPath, { recursive: true });
    });
}
exports.mkdirP = mkdirP;
/**
 * Returns path of a tool had the tool actually been invoked.  Resolves via paths.
 * If you check and the tool does not exist, it will throw.
 *
 * @param     tool              name of the tool
 * @param     check             whether to check if tool exists
 * @returns   Promise<string>   path to tool
 */
function which(tool, check) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // recursive when check=true
        if (check) {
            const result = yield which(tool, false);
            if (!result) {
                if (ioUtil.IS_WINDOWS) {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
                }
                else {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
                }
            }
            return result;
        }
        const matches = yield findInPath(tool);
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return '';
    });
}
exports.which = which;
/**
 * Returns a list of all occurrences of the given tool on the system path.
 *
 * @returns   Promise<string[]>  the paths of the tool
 */
function findInPath(tool) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // build the list of extensions to try
        const extensions = [];
        if (ioUtil.IS_WINDOWS && process.env['PATHEXT']) {
            for (const extension of process.env['PATHEXT'].split(path.delimiter)) {
                if (extension) {
                    extensions.push(extension);
                }
            }
        }
        // if it's rooted, return it if exists. otherwise return empty.
        if (ioUtil.isRooted(tool)) {
            const filePath = yield ioUtil.tryGetExecutablePath(tool, extensions);
            if (filePath) {
                return [filePath];
            }
            return [];
        }
        // if any path separators, return empty
        if (tool.includes(path.sep)) {
            return [];
        }
        // build the list of directories
        //
        // Note, technically "where" checks the current directory on Windows. From a toolkit perspective,
        // it feels like we should not do this. Checking the current directory seems like more of a use
        // case of a shell, and the which() function exposed by the toolkit should strive for consistency
        // across platforms.
        const directories = [];
        if (process.env.PATH) {
            for (const p of process.env.PATH.split(path.delimiter)) {
                if (p) {
                    directories.push(p);
                }
            }
        }
        // find all matches
        const matches = [];
        for (const directory of directories) {
            const filePath = yield ioUtil.tryGetExecutablePath(path.join(directory, tool), extensions);
            if (filePath) {
                matches.push(filePath);
            }
        }
        return matches;
    });
}
exports.findInPath = findInPath;
function readCopyOptions(options) {
    const force = options.force == null ? true : options.force;
    const recursive = Boolean(options.recursive);
    const copySourceDirectory = options.copySourceDirectory == null
        ? true
        : Boolean(options.copySourceDirectory);
    return { force, recursive, copySourceDirectory };
}
function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure there is not a run away recursive copy
        if (currentDepth >= 255)
            return;
        currentDepth++;
        yield mkdirP(destDir);
        const files = yield ioUtil.readdir(sourceDir);
        for (const fileName of files) {
            const srcFile = `${sourceDir}/${fileName}`;
            const destFile = `${destDir}/${fileName}`;
            const srcFileStat = yield ioUtil.lstat(srcFile);
            if (srcFileStat.isDirectory()) {
                // Recurse
                yield cpDirRecursive(srcFile, destFile, currentDepth, force);
            }
            else {
                yield copyFile(srcFile, destFile, force);
            }
        }
        // Change the mode for the newly created directory
        yield ioUtil.chmod(destDir, (yield ioUtil.stat(sourceDir)).mode);
    });
}
// Buffered file copy
function copyFile(srcFile, destFile, force) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield ioUtil.lstat(srcFile)).isSymbolicLink()) {
            // unlink/re-link it
            try {
                yield ioUtil.lstat(destFile);
                yield ioUtil.unlink(destFile);
            }
            catch (e) {
                // Try to override file permission
                if (e.code === 'EPERM') {
                    yield ioUtil.chmod(destFile, '0666');
                    yield ioUtil.unlink(destFile);
                }
                // other errors = it doesn't exist, no work to do
            }
            // Copy over symlink
            const symlinkFull = yield ioUtil.readlink(srcFile);
            yield ioUtil.symlink(symlinkFull, destFile, ioUtil.IS_WINDOWS ? 'junction' : null);
        }
        else if (!(yield ioUtil.exists(destFile)) || force) {
            yield ioUtil.copyFile(srcFile, destFile);
        }
    });
}
//# sourceMappingURL=io.js.map

/***/ }),

/***/ 4213:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* module decorator */ module = __nccwpck_require__.nmd(module);


const wrapAnsi16 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => (...args) => {
	const rgb = fn(...args);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

const ansi2ansi = n => n;
const rgb2rgb = (r, g, b) => [r, g, b];

const setLazyProperty = (object, property, get) => {
	Object.defineProperty(object, property, {
		get: () => {
			const value = get();

			Object.defineProperty(object, property, {
				value,
				enumerable: true,
				configurable: true
			});

			return value;
		},
		enumerable: true,
		configurable: true
	});
};

/** @type {typeof import('color-convert')} */
let colorConvert;
const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
	if (colorConvert === undefined) {
		colorConvert = __nccwpck_require__(8072);
	}

	const offset = isBackground ? 10 : 0;
	const styles = {};

	for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
		const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
		if (sourceSpace === targetSpace) {
			styles[name] = wrap(identity, offset);
		} else if (typeof suite === 'object') {
			styles[name] = wrap(suite[targetSpace], offset);
		}
	}

	return styles;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
	setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});


/***/ }),

/***/ 2341:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const ansiStyles = __nccwpck_require__(4213);
const {stdout: stdoutColor, stderr: stderrColor} = __nccwpck_require__(7797);
const {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
} = __nccwpck_require__(4700);

const {isArray} = Array;

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m'
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class ChalkClass {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = {};
	applyOptions(chalk, options);

	chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

	Object.setPrototypeOf(chalk, Chalk.prototype);
	Object.setPrototypeOf(chalk.template, chalk);

	chalk.template.constructor = () => {
		throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
	};

	chalk.template.Instance = ChalkClass;

	return chalk.template;
};

function Chalk(options) {
	return chalkFactory(options);
}

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		}
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	}
};

const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

for (const model of usedModels) {
	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this._generator.level;
		},
		set(level) {
			this._generator.level = level;
		}
	}
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => {
		if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
			// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
			return applyStyle(builder, chalkTag(builder, ...arguments_));
		}

		// Single argument is hot path, implicit coercion is faster than anything
		// eslint-disable-next-line no-implicit-coercion
		return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
	};

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder._generator = self;
	builder._styler = _styler;
	builder._isEmpty = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self._isEmpty ? '' : string;
	}

	let styler = self._styler;

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.indexOf('\u001B') !== -1) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

let template;
const chalkTag = (chalk, ...strings) => {
	const [firstString] = strings;

	if (!isArray(firstString) || !isArray(firstString.raw)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return strings.join(' ');
	}

	const arguments_ = strings.slice(1);
	const parts = [firstString.raw[0]];

	for (let i = 1; i < firstString.length; i++) {
		parts.push(
			String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
			String(firstString.raw[i])
		);
	}

	if (template === undefined) {
		template = __nccwpck_require__(3003);
	}

	return template(chalk, parts.join(''));
};

Object.defineProperties(Chalk.prototype, styles);

const chalk = Chalk(); // eslint-disable-line new-cap
chalk.supportsColor = stdoutColor;
chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
chalk.stderr.supportsColor = stderrColor;

module.exports = chalk;


/***/ }),

/***/ 3003:
/***/ ((module) => {

"use strict";

const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007']
]);

function unescape(c) {
	const u = c[0] === 'u';
	const bracket = c[1] === '{';

	if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	if (u && bracket) {
		return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseArguments(name, arguments_) {
	const results = [];
	const chunks = arguments_.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		const number = Number(chunk);
		if (!Number.isNaN(number)) {
			results.push(number);
		} else if ((matches = chunk.match(STRING_REGEX))) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const [styleName, styles] of Object.entries(enabled)) {
		if (!Array.isArray(styles)) {
			continue;
		}

		if (!(styleName in current)) {
			throw new Error(`Unknown Chalk style: ${styleName}`);
		}

		current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
	}

	return current;
}

module.exports = (chalk, temporary) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
		if (escapeCharacter) {
			chunk.push(unescape(escapeCharacter));
		} else if (style) {
			const string = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
			styles.push({inverse, styles: parseStyle(style)});
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(character);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMessage);
	}

	return chunks.join('');
};


/***/ }),

/***/ 4700:
/***/ ((module) => {

"use strict";


const stringReplaceAll = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

module.exports = {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
};


/***/ }),

/***/ 5349:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* MIT license */
/* eslint-disable no-mixed-operators */
const cssKeywords = __nccwpck_require__(8936);

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(cssKeywords)) {
	reverseKeywords[cssKeywords[key]] = key;
}

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

module.exports = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(cssKeywords)) {
		const value = cssKeywords[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),

/***/ 8072:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const conversions = __nccwpck_require__(5349);
const route = __nccwpck_require__(8257);

const convert = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),

/***/ 8257:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const conversions = __nccwpck_require__(5349);

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),

/***/ 8936:
/***/ ((module) => {

"use strict";


module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};


/***/ }),

/***/ 148:
/***/ (function(__unused_webpack_module, exports) {

/* commonmark 0.29 https://github.com/commonmark/commonmark.js @license BSD3 */
(function (global, factory) {
     true ? factory(exports) :
    0;
}(this, (function (exports) { 'use strict';

    function isContainer(node) {
        switch (node._type) {
            case "document":
            case "block_quote":
            case "list":
            case "item":
            case "paragraph":
            case "heading":
            case "emph":
            case "strong":
            case "link":
            case "image":
            case "custom_inline":
            case "custom_block":
                return true;
            default:
                return false;
        }
    }

    var resumeAt = function(node, entering) {
        this.current = node;
        this.entering = entering === true;
    };

    var next = function() {
        var cur = this.current;
        var entering = this.entering;

        if (cur === null) {
            return null;
        }

        var container = isContainer(cur);

        if (entering && container) {
            if (cur._firstChild) {
                this.current = cur._firstChild;
                this.entering = true;
            } else {
                // stay on node but exit
                this.entering = false;
            }
        } else if (cur === this.root) {
            this.current = null;
        } else if (cur._next === null) {
            this.current = cur._parent;
            this.entering = false;
        } else {
            this.current = cur._next;
            this.entering = true;
        }

        return { entering: entering, node: cur };
    };

    var NodeWalker = function(root) {
        return {
            current: root,
            root: root,
            entering: true,
            next: next,
            resumeAt: resumeAt
        };
    };

    var Node = function(nodeType, sourcepos) {
        this._type = nodeType;
        this._parent = null;
        this._firstChild = null;
        this._lastChild = null;
        this._prev = null;
        this._next = null;
        this._sourcepos = sourcepos;
        this._lastLineBlank = false;
        this._lastLineChecked = false;
        this._open = true;
        this._string_content = null;
        this._literal = null;
        this._listData = {};
        this._info = null;
        this._destination = null;
        this._title = null;
        this._isFenced = false;
        this._fenceChar = null;
        this._fenceLength = 0;
        this._fenceOffset = null;
        this._level = null;
        this._onEnter = null;
        this._onExit = null;
    };

    var proto = Node.prototype;

    Object.defineProperty(proto, "isContainer", {
        get: function() {
            return isContainer(this);
        }
    });

    Object.defineProperty(proto, "type", {
        get: function() {
            return this._type;
        }
    });

    Object.defineProperty(proto, "firstChild", {
        get: function() {
            return this._firstChild;
        }
    });

    Object.defineProperty(proto, "lastChild", {
        get: function() {
            return this._lastChild;
        }
    });

    Object.defineProperty(proto, "next", {
        get: function() {
            return this._next;
        }
    });

    Object.defineProperty(proto, "prev", {
        get: function() {
            return this._prev;
        }
    });

    Object.defineProperty(proto, "parent", {
        get: function() {
            return this._parent;
        }
    });

    Object.defineProperty(proto, "sourcepos", {
        get: function() {
            return this._sourcepos;
        }
    });

    Object.defineProperty(proto, "literal", {
        get: function() {
            return this._literal;
        },
        set: function(s) {
            this._literal = s;
        }
    });

    Object.defineProperty(proto, "destination", {
        get: function() {
            return this._destination;
        },
        set: function(s) {
            this._destination = s;
        }
    });

    Object.defineProperty(proto, "title", {
        get: function() {
            return this._title;
        },
        set: function(s) {
            this._title = s;
        }
    });

    Object.defineProperty(proto, "info", {
        get: function() {
            return this._info;
        },
        set: function(s) {
            this._info = s;
        }
    });

    Object.defineProperty(proto, "level", {
        get: function() {
            return this._level;
        },
        set: function(s) {
            this._level = s;
        }
    });

    Object.defineProperty(proto, "listType", {
        get: function() {
            return this._listData.type;
        },
        set: function(t) {
            this._listData.type = t;
        }
    });

    Object.defineProperty(proto, "listTight", {
        get: function() {
            return this._listData.tight;
        },
        set: function(t) {
            this._listData.tight = t;
        }
    });

    Object.defineProperty(proto, "listStart", {
        get: function() {
            return this._listData.start;
        },
        set: function(n) {
            this._listData.start = n;
        }
    });

    Object.defineProperty(proto, "listDelimiter", {
        get: function() {
            return this._listData.delimiter;
        },
        set: function(delim) {
            this._listData.delimiter = delim;
        }
    });

    Object.defineProperty(proto, "onEnter", {
        get: function() {
            return this._onEnter;
        },
        set: function(s) {
            this._onEnter = s;
        }
    });

    Object.defineProperty(proto, "onExit", {
        get: function() {
            return this._onExit;
        },
        set: function(s) {
            this._onExit = s;
        }
    });

    Node.prototype.appendChild = function(child) {
        child.unlink();
        child._parent = this;
        if (this._lastChild) {
            this._lastChild._next = child;
            child._prev = this._lastChild;
            this._lastChild = child;
        } else {
            this._firstChild = child;
            this._lastChild = child;
        }
    };

    Node.prototype.prependChild = function(child) {
        child.unlink();
        child._parent = this;
        if (this._firstChild) {
            this._firstChild._prev = child;
            child._next = this._firstChild;
            this._firstChild = child;
        } else {
            this._firstChild = child;
            this._lastChild = child;
        }
    };

    Node.prototype.unlink = function() {
        if (this._prev) {
            this._prev._next = this._next;
        } else if (this._parent) {
            this._parent._firstChild = this._next;
        }
        if (this._next) {
            this._next._prev = this._prev;
        } else if (this._parent) {
            this._parent._lastChild = this._prev;
        }
        this._parent = null;
        this._next = null;
        this._prev = null;
    };

    Node.prototype.insertAfter = function(sibling) {
        sibling.unlink();
        sibling._next = this._next;
        if (sibling._next) {
            sibling._next._prev = sibling;
        }
        sibling._prev = this;
        this._next = sibling;
        sibling._parent = this._parent;
        if (!sibling._next) {
            sibling._parent._lastChild = sibling;
        }
    };

    Node.prototype.insertBefore = function(sibling) {
        sibling.unlink();
        sibling._prev = this._prev;
        if (sibling._prev) {
            sibling._prev._next = sibling;
        }
        sibling._next = this;
        this._prev = sibling;
        sibling._parent = this._parent;
        if (!sibling._prev) {
            sibling._parent._firstChild = sibling;
        }
    };

    Node.prototype.walker = function() {
        var walker = new NodeWalker(this);
        return walker;
    };

    /* Example of use of walker:

     var walker = w.walker();
     var event;

     while (event = walker.next()) {
     console.log(event.entering, event.node.type);
     }

     */

    var encodeCache = {};


    // Create a lookup array where anything but characters in `chars` string
    // and alphanumeric chars is percent-encoded.
    //
    function getEncodeCache(exclude) {
      var i, ch, cache = encodeCache[exclude];
      if (cache) { return cache; }

      cache = encodeCache[exclude] = [];

      for (i = 0; i < 128; i++) {
        ch = String.fromCharCode(i);

        if (/^[0-9a-z]$/i.test(ch)) {
          // always allow unencoded alphanumeric characters
          cache.push(ch);
        } else {
          cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
        }
      }

      for (i = 0; i < exclude.length; i++) {
        cache[exclude.charCodeAt(i)] = exclude[i];
      }

      return cache;
    }


    // Encode unsafe characters with percent-encoding, skipping already
    // encoded sequences.
    //
    //  - string       - string to encode
    //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
    //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
    //
    function encode(string, exclude, keepEscaped) {
      var i, l, code, nextCode, cache,
          result = '';

      if (typeof exclude !== 'string') {
        // encode(string, keepEscaped)
        keepEscaped  = exclude;
        exclude = encode.defaultChars;
      }

      if (typeof keepEscaped === 'undefined') {
        keepEscaped = true;
      }

      cache = getEncodeCache(exclude);

      for (i = 0, l = string.length; i < l; i++) {
        code = string.charCodeAt(i);

        if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
          if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
            result += string.slice(i, i + 3);
            i += 2;
            continue;
          }
        }

        if (code < 128) {
          result += cache[code];
          continue;
        }

        if (code >= 0xD800 && code <= 0xDFFF) {
          if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
            nextCode = string.charCodeAt(i + 1);
            if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
              result += encodeURIComponent(string[i] + string[i + 1]);
              i++;
              continue;
            }
          }
          result += '%EF%BF%BD';
          continue;
        }

        result += encodeURIComponent(string[i]);
      }

      return result;
    }

    encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
    encode.componentChars = "-_.!~*'()";


    var encode_1 = encode;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var Aacute = "Á";
    var aacute = "á";
    var Abreve = "Ă";
    var abreve = "ă";
    var ac = "∾";
    var acd = "∿";
    var acE = "∾̳";
    var Acirc = "Â";
    var acirc = "â";
    var acute = "´";
    var Acy = "А";
    var acy = "а";
    var AElig = "Æ";
    var aelig = "æ";
    var af = "⁡";
    var Afr = "𝔄";
    var afr = "𝔞";
    var Agrave = "À";
    var agrave = "à";
    var alefsym = "ℵ";
    var aleph = "ℵ";
    var Alpha = "Α";
    var alpha = "α";
    var Amacr = "Ā";
    var amacr = "ā";
    var amalg = "⨿";
    var amp = "&";
    var AMP = "&";
    var andand = "⩕";
    var And = "⩓";
    var and = "∧";
    var andd = "⩜";
    var andslope = "⩘";
    var andv = "⩚";
    var ang = "∠";
    var ange = "⦤";
    var angle = "∠";
    var angmsdaa = "⦨";
    var angmsdab = "⦩";
    var angmsdac = "⦪";
    var angmsdad = "⦫";
    var angmsdae = "⦬";
    var angmsdaf = "⦭";
    var angmsdag = "⦮";
    var angmsdah = "⦯";
    var angmsd = "∡";
    var angrt = "∟";
    var angrtvb = "⊾";
    var angrtvbd = "⦝";
    var angsph = "∢";
    var angst = "Å";
    var angzarr = "⍼";
    var Aogon = "Ą";
    var aogon = "ą";
    var Aopf = "𝔸";
    var aopf = "𝕒";
    var apacir = "⩯";
    var ap = "≈";
    var apE = "⩰";
    var ape = "≊";
    var apid = "≋";
    var apos = "'";
    var ApplyFunction = "⁡";
    var approx = "≈";
    var approxeq = "≊";
    var Aring = "Å";
    var aring = "å";
    var Ascr = "𝒜";
    var ascr = "𝒶";
    var Assign = "≔";
    var ast = "*";
    var asymp = "≈";
    var asympeq = "≍";
    var Atilde = "Ã";
    var atilde = "ã";
    var Auml = "Ä";
    var auml = "ä";
    var awconint = "∳";
    var awint = "⨑";
    var backcong = "≌";
    var backepsilon = "϶";
    var backprime = "‵";
    var backsim = "∽";
    var backsimeq = "⋍";
    var Backslash = "∖";
    var Barv = "⫧";
    var barvee = "⊽";
    var barwed = "⌅";
    var Barwed = "⌆";
    var barwedge = "⌅";
    var bbrk = "⎵";
    var bbrktbrk = "⎶";
    var bcong = "≌";
    var Bcy = "Б";
    var bcy = "б";
    var bdquo = "„";
    var becaus = "∵";
    var because = "∵";
    var Because = "∵";
    var bemptyv = "⦰";
    var bepsi = "϶";
    var bernou = "ℬ";
    var Bernoullis = "ℬ";
    var Beta = "Β";
    var beta = "β";
    var beth = "ℶ";
    var between = "≬";
    var Bfr = "𝔅";
    var bfr = "𝔟";
    var bigcap = "⋂";
    var bigcirc = "◯";
    var bigcup = "⋃";
    var bigodot = "⨀";
    var bigoplus = "⨁";
    var bigotimes = "⨂";
    var bigsqcup = "⨆";
    var bigstar = "★";
    var bigtriangledown = "▽";
    var bigtriangleup = "△";
    var biguplus = "⨄";
    var bigvee = "⋁";
    var bigwedge = "⋀";
    var bkarow = "⤍";
    var blacklozenge = "⧫";
    var blacksquare = "▪";
    var blacktriangle = "▴";
    var blacktriangledown = "▾";
    var blacktriangleleft = "◂";
    var blacktriangleright = "▸";
    var blank = "␣";
    var blk12 = "▒";
    var blk14 = "░";
    var blk34 = "▓";
    var block = "█";
    var bne = "=⃥";
    var bnequiv = "≡⃥";
    var bNot = "⫭";
    var bnot = "⌐";
    var Bopf = "𝔹";
    var bopf = "𝕓";
    var bot = "⊥";
    var bottom = "⊥";
    var bowtie = "⋈";
    var boxbox = "⧉";
    var boxdl = "┐";
    var boxdL = "╕";
    var boxDl = "╖";
    var boxDL = "╗";
    var boxdr = "┌";
    var boxdR = "╒";
    var boxDr = "╓";
    var boxDR = "╔";
    var boxh = "─";
    var boxH = "═";
    var boxhd = "┬";
    var boxHd = "╤";
    var boxhD = "╥";
    var boxHD = "╦";
    var boxhu = "┴";
    var boxHu = "╧";
    var boxhU = "╨";
    var boxHU = "╩";
    var boxminus = "⊟";
    var boxplus = "⊞";
    var boxtimes = "⊠";
    var boxul = "┘";
    var boxuL = "╛";
    var boxUl = "╜";
    var boxUL = "╝";
    var boxur = "└";
    var boxuR = "╘";
    var boxUr = "╙";
    var boxUR = "╚";
    var boxv = "│";
    var boxV = "║";
    var boxvh = "┼";
    var boxvH = "╪";
    var boxVh = "╫";
    var boxVH = "╬";
    var boxvl = "┤";
    var boxvL = "╡";
    var boxVl = "╢";
    var boxVL = "╣";
    var boxvr = "├";
    var boxvR = "╞";
    var boxVr = "╟";
    var boxVR = "╠";
    var bprime = "‵";
    var breve = "˘";
    var Breve = "˘";
    var brvbar = "¦";
    var bscr = "𝒷";
    var Bscr = "ℬ";
    var bsemi = "⁏";
    var bsim = "∽";
    var bsime = "⋍";
    var bsolb = "⧅";
    var bsol = "\\";
    var bsolhsub = "⟈";
    var bull = "•";
    var bullet = "•";
    var bump = "≎";
    var bumpE = "⪮";
    var bumpe = "≏";
    var Bumpeq = "≎";
    var bumpeq = "≏";
    var Cacute = "Ć";
    var cacute = "ć";
    var capand = "⩄";
    var capbrcup = "⩉";
    var capcap = "⩋";
    var cap = "∩";
    var Cap = "⋒";
    var capcup = "⩇";
    var capdot = "⩀";
    var CapitalDifferentialD = "ⅅ";
    var caps = "∩︀";
    var caret = "⁁";
    var caron = "ˇ";
    var Cayleys = "ℭ";
    var ccaps = "⩍";
    var Ccaron = "Č";
    var ccaron = "č";
    var Ccedil = "Ç";
    var ccedil = "ç";
    var Ccirc = "Ĉ";
    var ccirc = "ĉ";
    var Cconint = "∰";
    var ccups = "⩌";
    var ccupssm = "⩐";
    var Cdot = "Ċ";
    var cdot = "ċ";
    var cedil = "¸";
    var Cedilla = "¸";
    var cemptyv = "⦲";
    var cent = "¢";
    var centerdot = "·";
    var CenterDot = "·";
    var cfr = "𝔠";
    var Cfr = "ℭ";
    var CHcy = "Ч";
    var chcy = "ч";
    var check = "✓";
    var checkmark = "✓";
    var Chi = "Χ";
    var chi = "χ";
    var circ = "ˆ";
    var circeq = "≗";
    var circlearrowleft = "↺";
    var circlearrowright = "↻";
    var circledast = "⊛";
    var circledcirc = "⊚";
    var circleddash = "⊝";
    var CircleDot = "⊙";
    var circledR = "®";
    var circledS = "Ⓢ";
    var CircleMinus = "⊖";
    var CirclePlus = "⊕";
    var CircleTimes = "⊗";
    var cir = "○";
    var cirE = "⧃";
    var cire = "≗";
    var cirfnint = "⨐";
    var cirmid = "⫯";
    var cirscir = "⧂";
    var ClockwiseContourIntegral = "∲";
    var CloseCurlyDoubleQuote = "”";
    var CloseCurlyQuote = "’";
    var clubs = "♣";
    var clubsuit = "♣";
    var colon = ":";
    var Colon = "∷";
    var Colone = "⩴";
    var colone = "≔";
    var coloneq = "≔";
    var comma = ",";
    var commat = "@";
    var comp = "∁";
    var compfn = "∘";
    var complement = "∁";
    var complexes = "ℂ";
    var cong = "≅";
    var congdot = "⩭";
    var Congruent = "≡";
    var conint = "∮";
    var Conint = "∯";
    var ContourIntegral = "∮";
    var copf = "𝕔";
    var Copf = "ℂ";
    var coprod = "∐";
    var Coproduct = "∐";
    var copy = "©";
    var COPY = "©";
    var copysr = "℗";
    var CounterClockwiseContourIntegral = "∳";
    var crarr = "↵";
    var cross = "✗";
    var Cross = "⨯";
    var Cscr = "𝒞";
    var cscr = "𝒸";
    var csub = "⫏";
    var csube = "⫑";
    var csup = "⫐";
    var csupe = "⫒";
    var ctdot = "⋯";
    var cudarrl = "⤸";
    var cudarrr = "⤵";
    var cuepr = "⋞";
    var cuesc = "⋟";
    var cularr = "↶";
    var cularrp = "⤽";
    var cupbrcap = "⩈";
    var cupcap = "⩆";
    var CupCap = "≍";
    var cup = "∪";
    var Cup = "⋓";
    var cupcup = "⩊";
    var cupdot = "⊍";
    var cupor = "⩅";
    var cups = "∪︀";
    var curarr = "↷";
    var curarrm = "⤼";
    var curlyeqprec = "⋞";
    var curlyeqsucc = "⋟";
    var curlyvee = "⋎";
    var curlywedge = "⋏";
    var curren = "¤";
    var curvearrowleft = "↶";
    var curvearrowright = "↷";
    var cuvee = "⋎";
    var cuwed = "⋏";
    var cwconint = "∲";
    var cwint = "∱";
    var cylcty = "⌭";
    var dagger = "†";
    var Dagger = "‡";
    var daleth = "ℸ";
    var darr = "↓";
    var Darr = "↡";
    var dArr = "⇓";
    var dash = "‐";
    var Dashv = "⫤";
    var dashv = "⊣";
    var dbkarow = "⤏";
    var dblac = "˝";
    var Dcaron = "Ď";
    var dcaron = "ď";
    var Dcy = "Д";
    var dcy = "д";
    var ddagger = "‡";
    var ddarr = "⇊";
    var DD = "ⅅ";
    var dd = "ⅆ";
    var DDotrahd = "⤑";
    var ddotseq = "⩷";
    var deg = "°";
    var Del = "∇";
    var Delta = "Δ";
    var delta = "δ";
    var demptyv = "⦱";
    var dfisht = "⥿";
    var Dfr = "𝔇";
    var dfr = "𝔡";
    var dHar = "⥥";
    var dharl = "⇃";
    var dharr = "⇂";
    var DiacriticalAcute = "´";
    var DiacriticalDot = "˙";
    var DiacriticalDoubleAcute = "˝";
    var DiacriticalGrave = "`";
    var DiacriticalTilde = "˜";
    var diam = "⋄";
    var diamond = "⋄";
    var Diamond = "⋄";
    var diamondsuit = "♦";
    var diams = "♦";
    var die = "¨";
    var DifferentialD = "ⅆ";
    var digamma = "ϝ";
    var disin = "⋲";
    var div = "÷";
    var divide = "÷";
    var divideontimes = "⋇";
    var divonx = "⋇";
    var DJcy = "Ђ";
    var djcy = "ђ";
    var dlcorn = "⌞";
    var dlcrop = "⌍";
    var dollar = "$";
    var Dopf = "𝔻";
    var dopf = "𝕕";
    var Dot = "¨";
    var dot = "˙";
    var DotDot = "⃜";
    var doteq = "≐";
    var doteqdot = "≑";
    var DotEqual = "≐";
    var dotminus = "∸";
    var dotplus = "∔";
    var dotsquare = "⊡";
    var doublebarwedge = "⌆";
    var DoubleContourIntegral = "∯";
    var DoubleDot = "¨";
    var DoubleDownArrow = "⇓";
    var DoubleLeftArrow = "⇐";
    var DoubleLeftRightArrow = "⇔";
    var DoubleLeftTee = "⫤";
    var DoubleLongLeftArrow = "⟸";
    var DoubleLongLeftRightArrow = "⟺";
    var DoubleLongRightArrow = "⟹";
    var DoubleRightArrow = "⇒";
    var DoubleRightTee = "⊨";
    var DoubleUpArrow = "⇑";
    var DoubleUpDownArrow = "⇕";
    var DoubleVerticalBar = "∥";
    var DownArrowBar = "⤓";
    var downarrow = "↓";
    var DownArrow = "↓";
    var Downarrow = "⇓";
    var DownArrowUpArrow = "⇵";
    var DownBreve = "̑";
    var downdownarrows = "⇊";
    var downharpoonleft = "⇃";
    var downharpoonright = "⇂";
    var DownLeftRightVector = "⥐";
    var DownLeftTeeVector = "⥞";
    var DownLeftVectorBar = "⥖";
    var DownLeftVector = "↽";
    var DownRightTeeVector = "⥟";
    var DownRightVectorBar = "⥗";
    var DownRightVector = "⇁";
    var DownTeeArrow = "↧";
    var DownTee = "⊤";
    var drbkarow = "⤐";
    var drcorn = "⌟";
    var drcrop = "⌌";
    var Dscr = "𝒟";
    var dscr = "𝒹";
    var DScy = "Ѕ";
    var dscy = "ѕ";
    var dsol = "⧶";
    var Dstrok = "Đ";
    var dstrok = "đ";
    var dtdot = "⋱";
    var dtri = "▿";
    var dtrif = "▾";
    var duarr = "⇵";
    var duhar = "⥯";
    var dwangle = "⦦";
    var DZcy = "Џ";
    var dzcy = "џ";
    var dzigrarr = "⟿";
    var Eacute = "É";
    var eacute = "é";
    var easter = "⩮";
    var Ecaron = "Ě";
    var ecaron = "ě";
    var Ecirc = "Ê";
    var ecirc = "ê";
    var ecir = "≖";
    var ecolon = "≕";
    var Ecy = "Э";
    var ecy = "э";
    var eDDot = "⩷";
    var Edot = "Ė";
    var edot = "ė";
    var eDot = "≑";
    var ee = "ⅇ";
    var efDot = "≒";
    var Efr = "𝔈";
    var efr = "𝔢";
    var eg = "⪚";
    var Egrave = "È";
    var egrave = "è";
    var egs = "⪖";
    var egsdot = "⪘";
    var el = "⪙";
    var Element = "∈";
    var elinters = "⏧";
    var ell = "ℓ";
    var els = "⪕";
    var elsdot = "⪗";
    var Emacr = "Ē";
    var emacr = "ē";
    var empty = "∅";
    var emptyset = "∅";
    var EmptySmallSquare = "◻";
    var emptyv = "∅";
    var EmptyVerySmallSquare = "▫";
    var emsp13 = " ";
    var emsp14 = " ";
    var emsp = " ";
    var ENG = "Ŋ";
    var eng = "ŋ";
    var ensp = " ";
    var Eogon = "Ę";
    var eogon = "ę";
    var Eopf = "𝔼";
    var eopf = "𝕖";
    var epar = "⋕";
    var eparsl = "⧣";
    var eplus = "⩱";
    var epsi = "ε";
    var Epsilon = "Ε";
    var epsilon = "ε";
    var epsiv = "ϵ";
    var eqcirc = "≖";
    var eqcolon = "≕";
    var eqsim = "≂";
    var eqslantgtr = "⪖";
    var eqslantless = "⪕";
    var Equal = "⩵";
    var equals = "=";
    var EqualTilde = "≂";
    var equest = "≟";
    var Equilibrium = "⇌";
    var equiv = "≡";
    var equivDD = "⩸";
    var eqvparsl = "⧥";
    var erarr = "⥱";
    var erDot = "≓";
    var escr = "ℯ";
    var Escr = "ℰ";
    var esdot = "≐";
    var Esim = "⩳";
    var esim = "≂";
    var Eta = "Η";
    var eta = "η";
    var ETH = "Ð";
    var eth = "ð";
    var Euml = "Ë";
    var euml = "ë";
    var euro = "€";
    var excl = "!";
    var exist = "∃";
    var Exists = "∃";
    var expectation = "ℰ";
    var exponentiale = "ⅇ";
    var ExponentialE = "ⅇ";
    var fallingdotseq = "≒";
    var Fcy = "Ф";
    var fcy = "ф";
    var female = "♀";
    var ffilig = "ﬃ";
    var fflig = "ﬀ";
    var ffllig = "ﬄ";
    var Ffr = "𝔉";
    var ffr = "𝔣";
    var filig = "ﬁ";
    var FilledSmallSquare = "◼";
    var FilledVerySmallSquare = "▪";
    var fjlig = "fj";
    var flat = "♭";
    var fllig = "ﬂ";
    var fltns = "▱";
    var fnof = "ƒ";
    var Fopf = "𝔽";
    var fopf = "𝕗";
    var forall = "∀";
    var ForAll = "∀";
    var fork = "⋔";
    var forkv = "⫙";
    var Fouriertrf = "ℱ";
    var fpartint = "⨍";
    var frac12 = "½";
    var frac13 = "⅓";
    var frac14 = "¼";
    var frac15 = "⅕";
    var frac16 = "⅙";
    var frac18 = "⅛";
    var frac23 = "⅔";
    var frac25 = "⅖";
    var frac34 = "¾";
    var frac35 = "⅗";
    var frac38 = "⅜";
    var frac45 = "⅘";
    var frac56 = "⅚";
    var frac58 = "⅝";
    var frac78 = "⅞";
    var frasl = "⁄";
    var frown = "⌢";
    var fscr = "𝒻";
    var Fscr = "ℱ";
    var gacute = "ǵ";
    var Gamma = "Γ";
    var gamma = "γ";
    var Gammad = "Ϝ";
    var gammad = "ϝ";
    var gap = "⪆";
    var Gbreve = "Ğ";
    var gbreve = "ğ";
    var Gcedil = "Ģ";
    var Gcirc = "Ĝ";
    var gcirc = "ĝ";
    var Gcy = "Г";
    var gcy = "г";
    var Gdot = "Ġ";
    var gdot = "ġ";
    var ge = "≥";
    var gE = "≧";
    var gEl = "⪌";
    var gel = "⋛";
    var geq = "≥";
    var geqq = "≧";
    var geqslant = "⩾";
    var gescc = "⪩";
    var ges = "⩾";
    var gesdot = "⪀";
    var gesdoto = "⪂";
    var gesdotol = "⪄";
    var gesl = "⋛︀";
    var gesles = "⪔";
    var Gfr = "𝔊";
    var gfr = "𝔤";
    var gg = "≫";
    var Gg = "⋙";
    var ggg = "⋙";
    var gimel = "ℷ";
    var GJcy = "Ѓ";
    var gjcy = "ѓ";
    var gla = "⪥";
    var gl = "≷";
    var glE = "⪒";
    var glj = "⪤";
    var gnap = "⪊";
    var gnapprox = "⪊";
    var gne = "⪈";
    var gnE = "≩";
    var gneq = "⪈";
    var gneqq = "≩";
    var gnsim = "⋧";
    var Gopf = "𝔾";
    var gopf = "𝕘";
    var grave = "`";
    var GreaterEqual = "≥";
    var GreaterEqualLess = "⋛";
    var GreaterFullEqual = "≧";
    var GreaterGreater = "⪢";
    var GreaterLess = "≷";
    var GreaterSlantEqual = "⩾";
    var GreaterTilde = "≳";
    var Gscr = "𝒢";
    var gscr = "ℊ";
    var gsim = "≳";
    var gsime = "⪎";
    var gsiml = "⪐";
    var gtcc = "⪧";
    var gtcir = "⩺";
    var gt = ">";
    var GT = ">";
    var Gt = "≫";
    var gtdot = "⋗";
    var gtlPar = "⦕";
    var gtquest = "⩼";
    var gtrapprox = "⪆";
    var gtrarr = "⥸";
    var gtrdot = "⋗";
    var gtreqless = "⋛";
    var gtreqqless = "⪌";
    var gtrless = "≷";
    var gtrsim = "≳";
    var gvertneqq = "≩︀";
    var gvnE = "≩︀";
    var Hacek = "ˇ";
    var hairsp = " ";
    var half = "½";
    var hamilt = "ℋ";
    var HARDcy = "Ъ";
    var hardcy = "ъ";
    var harrcir = "⥈";
    var harr = "↔";
    var hArr = "⇔";
    var harrw = "↭";
    var Hat = "^";
    var hbar = "ℏ";
    var Hcirc = "Ĥ";
    var hcirc = "ĥ";
    var hearts = "♥";
    var heartsuit = "♥";
    var hellip = "…";
    var hercon = "⊹";
    var hfr = "𝔥";
    var Hfr = "ℌ";
    var HilbertSpace = "ℋ";
    var hksearow = "⤥";
    var hkswarow = "⤦";
    var hoarr = "⇿";
    var homtht = "∻";
    var hookleftarrow = "↩";
    var hookrightarrow = "↪";
    var hopf = "𝕙";
    var Hopf = "ℍ";
    var horbar = "―";
    var HorizontalLine = "─";
    var hscr = "𝒽";
    var Hscr = "ℋ";
    var hslash = "ℏ";
    var Hstrok = "Ħ";
    var hstrok = "ħ";
    var HumpDownHump = "≎";
    var HumpEqual = "≏";
    var hybull = "⁃";
    var hyphen = "‐";
    var Iacute = "Í";
    var iacute = "í";
    var ic = "⁣";
    var Icirc = "Î";
    var icirc = "î";
    var Icy = "И";
    var icy = "и";
    var Idot = "İ";
    var IEcy = "Е";
    var iecy = "е";
    var iexcl = "¡";
    var iff = "⇔";
    var ifr = "𝔦";
    var Ifr = "ℑ";
    var Igrave = "Ì";
    var igrave = "ì";
    var ii = "ⅈ";
    var iiiint = "⨌";
    var iiint = "∭";
    var iinfin = "⧜";
    var iiota = "℩";
    var IJlig = "Ĳ";
    var ijlig = "ĳ";
    var Imacr = "Ī";
    var imacr = "ī";
    var image = "ℑ";
    var ImaginaryI = "ⅈ";
    var imagline = "ℐ";
    var imagpart = "ℑ";
    var imath = "ı";
    var Im = "ℑ";
    var imof = "⊷";
    var imped = "Ƶ";
    var Implies = "⇒";
    var incare = "℅";
    var infin = "∞";
    var infintie = "⧝";
    var inodot = "ı";
    var intcal = "⊺";
    var int = "∫";
    var Int = "∬";
    var integers = "ℤ";
    var Integral = "∫";
    var intercal = "⊺";
    var Intersection = "⋂";
    var intlarhk = "⨗";
    var intprod = "⨼";
    var InvisibleComma = "⁣";
    var InvisibleTimes = "⁢";
    var IOcy = "Ё";
    var iocy = "ё";
    var Iogon = "Į";
    var iogon = "į";
    var Iopf = "𝕀";
    var iopf = "𝕚";
    var Iota = "Ι";
    var iota = "ι";
    var iprod = "⨼";
    var iquest = "¿";
    var iscr = "𝒾";
    var Iscr = "ℐ";
    var isin = "∈";
    var isindot = "⋵";
    var isinE = "⋹";
    var isins = "⋴";
    var isinsv = "⋳";
    var isinv = "∈";
    var it = "⁢";
    var Itilde = "Ĩ";
    var itilde = "ĩ";
    var Iukcy = "І";
    var iukcy = "і";
    var Iuml = "Ï";
    var iuml = "ï";
    var Jcirc = "Ĵ";
    var jcirc = "ĵ";
    var Jcy = "Й";
    var jcy = "й";
    var Jfr = "𝔍";
    var jfr = "𝔧";
    var jmath = "ȷ";
    var Jopf = "𝕁";
    var jopf = "𝕛";
    var Jscr = "𝒥";
    var jscr = "𝒿";
    var Jsercy = "Ј";
    var jsercy = "ј";
    var Jukcy = "Є";
    var jukcy = "є";
    var Kappa = "Κ";
    var kappa = "κ";
    var kappav = "ϰ";
    var Kcedil = "Ķ";
    var kcedil = "ķ";
    var Kcy = "К";
    var kcy = "к";
    var Kfr = "𝔎";
    var kfr = "𝔨";
    var kgreen = "ĸ";
    var KHcy = "Х";
    var khcy = "х";
    var KJcy = "Ќ";
    var kjcy = "ќ";
    var Kopf = "𝕂";
    var kopf = "𝕜";
    var Kscr = "𝒦";
    var kscr = "𝓀";
    var lAarr = "⇚";
    var Lacute = "Ĺ";
    var lacute = "ĺ";
    var laemptyv = "⦴";
    var lagran = "ℒ";
    var Lambda = "Λ";
    var lambda = "λ";
    var lang = "⟨";
    var Lang = "⟪";
    var langd = "⦑";
    var langle = "⟨";
    var lap = "⪅";
    var Laplacetrf = "ℒ";
    var laquo = "«";
    var larrb = "⇤";
    var larrbfs = "⤟";
    var larr = "←";
    var Larr = "↞";
    var lArr = "⇐";
    var larrfs = "⤝";
    var larrhk = "↩";
    var larrlp = "↫";
    var larrpl = "⤹";
    var larrsim = "⥳";
    var larrtl = "↢";
    var latail = "⤙";
    var lAtail = "⤛";
    var lat = "⪫";
    var late = "⪭";
    var lates = "⪭︀";
    var lbarr = "⤌";
    var lBarr = "⤎";
    var lbbrk = "❲";
    var lbrace = "{";
    var lbrack = "[";
    var lbrke = "⦋";
    var lbrksld = "⦏";
    var lbrkslu = "⦍";
    var Lcaron = "Ľ";
    var lcaron = "ľ";
    var Lcedil = "Ļ";
    var lcedil = "ļ";
    var lceil = "⌈";
    var lcub = "{";
    var Lcy = "Л";
    var lcy = "л";
    var ldca = "⤶";
    var ldquo = "“";
    var ldquor = "„";
    var ldrdhar = "⥧";
    var ldrushar = "⥋";
    var ldsh = "↲";
    var le = "≤";
    var lE = "≦";
    var LeftAngleBracket = "⟨";
    var LeftArrowBar = "⇤";
    var leftarrow = "←";
    var LeftArrow = "←";
    var Leftarrow = "⇐";
    var LeftArrowRightArrow = "⇆";
    var leftarrowtail = "↢";
    var LeftCeiling = "⌈";
    var LeftDoubleBracket = "⟦";
    var LeftDownTeeVector = "⥡";
    var LeftDownVectorBar = "⥙";
    var LeftDownVector = "⇃";
    var LeftFloor = "⌊";
    var leftharpoondown = "↽";
    var leftharpoonup = "↼";
    var leftleftarrows = "⇇";
    var leftrightarrow = "↔";
    var LeftRightArrow = "↔";
    var Leftrightarrow = "⇔";
    var leftrightarrows = "⇆";
    var leftrightharpoons = "⇋";
    var leftrightsquigarrow = "↭";
    var LeftRightVector = "⥎";
    var LeftTeeArrow = "↤";
    var LeftTee = "⊣";
    var LeftTeeVector = "⥚";
    var leftthreetimes = "⋋";
    var LeftTriangleBar = "⧏";
    var LeftTriangle = "⊲";
    var LeftTriangleEqual = "⊴";
    var LeftUpDownVector = "⥑";
    var LeftUpTeeVector = "⥠";
    var LeftUpVectorBar = "⥘";
    var LeftUpVector = "↿";
    var LeftVectorBar = "⥒";
    var LeftVector = "↼";
    var lEg = "⪋";
    var leg = "⋚";
    var leq = "≤";
    var leqq = "≦";
    var leqslant = "⩽";
    var lescc = "⪨";
    var les = "⩽";
    var lesdot = "⩿";
    var lesdoto = "⪁";
    var lesdotor = "⪃";
    var lesg = "⋚︀";
    var lesges = "⪓";
    var lessapprox = "⪅";
    var lessdot = "⋖";
    var lesseqgtr = "⋚";
    var lesseqqgtr = "⪋";
    var LessEqualGreater = "⋚";
    var LessFullEqual = "≦";
    var LessGreater = "≶";
    var lessgtr = "≶";
    var LessLess = "⪡";
    var lesssim = "≲";
    var LessSlantEqual = "⩽";
    var LessTilde = "≲";
    var lfisht = "⥼";
    var lfloor = "⌊";
    var Lfr = "𝔏";
    var lfr = "𝔩";
    var lg = "≶";
    var lgE = "⪑";
    var lHar = "⥢";
    var lhard = "↽";
    var lharu = "↼";
    var lharul = "⥪";
    var lhblk = "▄";
    var LJcy = "Љ";
    var ljcy = "љ";
    var llarr = "⇇";
    var ll = "≪";
    var Ll = "⋘";
    var llcorner = "⌞";
    var Lleftarrow = "⇚";
    var llhard = "⥫";
    var lltri = "◺";
    var Lmidot = "Ŀ";
    var lmidot = "ŀ";
    var lmoustache = "⎰";
    var lmoust = "⎰";
    var lnap = "⪉";
    var lnapprox = "⪉";
    var lne = "⪇";
    var lnE = "≨";
    var lneq = "⪇";
    var lneqq = "≨";
    var lnsim = "⋦";
    var loang = "⟬";
    var loarr = "⇽";
    var lobrk = "⟦";
    var longleftarrow = "⟵";
    var LongLeftArrow = "⟵";
    var Longleftarrow = "⟸";
    var longleftrightarrow = "⟷";
    var LongLeftRightArrow = "⟷";
    var Longleftrightarrow = "⟺";
    var longmapsto = "⟼";
    var longrightarrow = "⟶";
    var LongRightArrow = "⟶";
    var Longrightarrow = "⟹";
    var looparrowleft = "↫";
    var looparrowright = "↬";
    var lopar = "⦅";
    var Lopf = "𝕃";
    var lopf = "𝕝";
    var loplus = "⨭";
    var lotimes = "⨴";
    var lowast = "∗";
    var lowbar = "_";
    var LowerLeftArrow = "↙";
    var LowerRightArrow = "↘";
    var loz = "◊";
    var lozenge = "◊";
    var lozf = "⧫";
    var lpar = "(";
    var lparlt = "⦓";
    var lrarr = "⇆";
    var lrcorner = "⌟";
    var lrhar = "⇋";
    var lrhard = "⥭";
    var lrm = "‎";
    var lrtri = "⊿";
    var lsaquo = "‹";
    var lscr = "𝓁";
    var Lscr = "ℒ";
    var lsh = "↰";
    var Lsh = "↰";
    var lsim = "≲";
    var lsime = "⪍";
    var lsimg = "⪏";
    var lsqb = "[";
    var lsquo = "‘";
    var lsquor = "‚";
    var Lstrok = "Ł";
    var lstrok = "ł";
    var ltcc = "⪦";
    var ltcir = "⩹";
    var lt = "<";
    var LT = "<";
    var Lt = "≪";
    var ltdot = "⋖";
    var lthree = "⋋";
    var ltimes = "⋉";
    var ltlarr = "⥶";
    var ltquest = "⩻";
    var ltri = "◃";
    var ltrie = "⊴";
    var ltrif = "◂";
    var ltrPar = "⦖";
    var lurdshar = "⥊";
    var luruhar = "⥦";
    var lvertneqq = "≨︀";
    var lvnE = "≨︀";
    var macr = "¯";
    var male = "♂";
    var malt = "✠";
    var maltese = "✠";
    var map = "↦";
    var mapsto = "↦";
    var mapstodown = "↧";
    var mapstoleft = "↤";
    var mapstoup = "↥";
    var marker = "▮";
    var mcomma = "⨩";
    var Mcy = "М";
    var mcy = "м";
    var mdash = "—";
    var mDDot = "∺";
    var measuredangle = "∡";
    var MediumSpace = " ";
    var Mellintrf = "ℳ";
    var Mfr = "𝔐";
    var mfr = "𝔪";
    var mho = "℧";
    var micro = "µ";
    var midast = "*";
    var midcir = "⫰";
    var mid = "∣";
    var middot = "·";
    var minusb = "⊟";
    var minus = "−";
    var minusd = "∸";
    var minusdu = "⨪";
    var MinusPlus = "∓";
    var mlcp = "⫛";
    var mldr = "…";
    var mnplus = "∓";
    var models = "⊧";
    var Mopf = "𝕄";
    var mopf = "𝕞";
    var mp = "∓";
    var mscr = "𝓂";
    var Mscr = "ℳ";
    var mstpos = "∾";
    var Mu = "Μ";
    var mu = "μ";
    var multimap = "⊸";
    var mumap = "⊸";
    var nabla = "∇";
    var Nacute = "Ń";
    var nacute = "ń";
    var nang = "∠⃒";
    var nap = "≉";
    var napE = "⩰̸";
    var napid = "≋̸";
    var napos = "ŉ";
    var napprox = "≉";
    var natural = "♮";
    var naturals = "ℕ";
    var natur = "♮";
    var nbsp = " ";
    var nbump = "≎̸";
    var nbumpe = "≏̸";
    var ncap = "⩃";
    var Ncaron = "Ň";
    var ncaron = "ň";
    var Ncedil = "Ņ";
    var ncedil = "ņ";
    var ncong = "≇";
    var ncongdot = "⩭̸";
    var ncup = "⩂";
    var Ncy = "Н";
    var ncy = "н";
    var ndash = "–";
    var nearhk = "⤤";
    var nearr = "↗";
    var neArr = "⇗";
    var nearrow = "↗";
    var ne = "≠";
    var nedot = "≐̸";
    var NegativeMediumSpace = "​";
    var NegativeThickSpace = "​";
    var NegativeThinSpace = "​";
    var NegativeVeryThinSpace = "​";
    var nequiv = "≢";
    var nesear = "⤨";
    var nesim = "≂̸";
    var NestedGreaterGreater = "≫";
    var NestedLessLess = "≪";
    var NewLine = "\n";
    var nexist = "∄";
    var nexists = "∄";
    var Nfr = "𝔑";
    var nfr = "𝔫";
    var ngE = "≧̸";
    var nge = "≱";
    var ngeq = "≱";
    var ngeqq = "≧̸";
    var ngeqslant = "⩾̸";
    var nges = "⩾̸";
    var nGg = "⋙̸";
    var ngsim = "≵";
    var nGt = "≫⃒";
    var ngt = "≯";
    var ngtr = "≯";
    var nGtv = "≫̸";
    var nharr = "↮";
    var nhArr = "⇎";
    var nhpar = "⫲";
    var ni = "∋";
    var nis = "⋼";
    var nisd = "⋺";
    var niv = "∋";
    var NJcy = "Њ";
    var njcy = "њ";
    var nlarr = "↚";
    var nlArr = "⇍";
    var nldr = "‥";
    var nlE = "≦̸";
    var nle = "≰";
    var nleftarrow = "↚";
    var nLeftarrow = "⇍";
    var nleftrightarrow = "↮";
    var nLeftrightarrow = "⇎";
    var nleq = "≰";
    var nleqq = "≦̸";
    var nleqslant = "⩽̸";
    var nles = "⩽̸";
    var nless = "≮";
    var nLl = "⋘̸";
    var nlsim = "≴";
    var nLt = "≪⃒";
    var nlt = "≮";
    var nltri = "⋪";
    var nltrie = "⋬";
    var nLtv = "≪̸";
    var nmid = "∤";
    var NoBreak = "⁠";
    var NonBreakingSpace = " ";
    var nopf = "𝕟";
    var Nopf = "ℕ";
    var Not = "⫬";
    var not = "¬";
    var NotCongruent = "≢";
    var NotCupCap = "≭";
    var NotDoubleVerticalBar = "∦";
    var NotElement = "∉";
    var NotEqual = "≠";
    var NotEqualTilde = "≂̸";
    var NotExists = "∄";
    var NotGreater = "≯";
    var NotGreaterEqual = "≱";
    var NotGreaterFullEqual = "≧̸";
    var NotGreaterGreater = "≫̸";
    var NotGreaterLess = "≹";
    var NotGreaterSlantEqual = "⩾̸";
    var NotGreaterTilde = "≵";
    var NotHumpDownHump = "≎̸";
    var NotHumpEqual = "≏̸";
    var notin = "∉";
    var notindot = "⋵̸";
    var notinE = "⋹̸";
    var notinva = "∉";
    var notinvb = "⋷";
    var notinvc = "⋶";
    var NotLeftTriangleBar = "⧏̸";
    var NotLeftTriangle = "⋪";
    var NotLeftTriangleEqual = "⋬";
    var NotLess = "≮";
    var NotLessEqual = "≰";
    var NotLessGreater = "≸";
    var NotLessLess = "≪̸";
    var NotLessSlantEqual = "⩽̸";
    var NotLessTilde = "≴";
    var NotNestedGreaterGreater = "⪢̸";
    var NotNestedLessLess = "⪡̸";
    var notni = "∌";
    var notniva = "∌";
    var notnivb = "⋾";
    var notnivc = "⋽";
    var NotPrecedes = "⊀";
    var NotPrecedesEqual = "⪯̸";
    var NotPrecedesSlantEqual = "⋠";
    var NotReverseElement = "∌";
    var NotRightTriangleBar = "⧐̸";
    var NotRightTriangle = "⋫";
    var NotRightTriangleEqual = "⋭";
    var NotSquareSubset = "⊏̸";
    var NotSquareSubsetEqual = "⋢";
    var NotSquareSuperset = "⊐̸";
    var NotSquareSupersetEqual = "⋣";
    var NotSubset = "⊂⃒";
    var NotSubsetEqual = "⊈";
    var NotSucceeds = "⊁";
    var NotSucceedsEqual = "⪰̸";
    var NotSucceedsSlantEqual = "⋡";
    var NotSucceedsTilde = "≿̸";
    var NotSuperset = "⊃⃒";
    var NotSupersetEqual = "⊉";
    var NotTilde = "≁";
    var NotTildeEqual = "≄";
    var NotTildeFullEqual = "≇";
    var NotTildeTilde = "≉";
    var NotVerticalBar = "∤";
    var nparallel = "∦";
    var npar = "∦";
    var nparsl = "⫽⃥";
    var npart = "∂̸";
    var npolint = "⨔";
    var npr = "⊀";
    var nprcue = "⋠";
    var nprec = "⊀";
    var npreceq = "⪯̸";
    var npre = "⪯̸";
    var nrarrc = "⤳̸";
    var nrarr = "↛";
    var nrArr = "⇏";
    var nrarrw = "↝̸";
    var nrightarrow = "↛";
    var nRightarrow = "⇏";
    var nrtri = "⋫";
    var nrtrie = "⋭";
    var nsc = "⊁";
    var nsccue = "⋡";
    var nsce = "⪰̸";
    var Nscr = "𝒩";
    var nscr = "𝓃";
    var nshortmid = "∤";
    var nshortparallel = "∦";
    var nsim = "≁";
    var nsime = "≄";
    var nsimeq = "≄";
    var nsmid = "∤";
    var nspar = "∦";
    var nsqsube = "⋢";
    var nsqsupe = "⋣";
    var nsub = "⊄";
    var nsubE = "⫅̸";
    var nsube = "⊈";
    var nsubset = "⊂⃒";
    var nsubseteq = "⊈";
    var nsubseteqq = "⫅̸";
    var nsucc = "⊁";
    var nsucceq = "⪰̸";
    var nsup = "⊅";
    var nsupE = "⫆̸";
    var nsupe = "⊉";
    var nsupset = "⊃⃒";
    var nsupseteq = "⊉";
    var nsupseteqq = "⫆̸";
    var ntgl = "≹";
    var Ntilde = "Ñ";
    var ntilde = "ñ";
    var ntlg = "≸";
    var ntriangleleft = "⋪";
    var ntrianglelefteq = "⋬";
    var ntriangleright = "⋫";
    var ntrianglerighteq = "⋭";
    var Nu = "Ν";
    var nu = "ν";
    var num = "#";
    var numero = "№";
    var numsp = " ";
    var nvap = "≍⃒";
    var nvdash = "⊬";
    var nvDash = "⊭";
    var nVdash = "⊮";
    var nVDash = "⊯";
    var nvge = "≥⃒";
    var nvgt = ">⃒";
    var nvHarr = "⤄";
    var nvinfin = "⧞";
    var nvlArr = "⤂";
    var nvle = "≤⃒";
    var nvlt = "<⃒";
    var nvltrie = "⊴⃒";
    var nvrArr = "⤃";
    var nvrtrie = "⊵⃒";
    var nvsim = "∼⃒";
    var nwarhk = "⤣";
    var nwarr = "↖";
    var nwArr = "⇖";
    var nwarrow = "↖";
    var nwnear = "⤧";
    var Oacute = "Ó";
    var oacute = "ó";
    var oast = "⊛";
    var Ocirc = "Ô";
    var ocirc = "ô";
    var ocir = "⊚";
    var Ocy = "О";
    var ocy = "о";
    var odash = "⊝";
    var Odblac = "Ő";
    var odblac = "ő";
    var odiv = "⨸";
    var odot = "⊙";
    var odsold = "⦼";
    var OElig = "Œ";
    var oelig = "œ";
    var ofcir = "⦿";
    var Ofr = "𝔒";
    var ofr = "𝔬";
    var ogon = "˛";
    var Ograve = "Ò";
    var ograve = "ò";
    var ogt = "⧁";
    var ohbar = "⦵";
    var ohm = "Ω";
    var oint = "∮";
    var olarr = "↺";
    var olcir = "⦾";
    var olcross = "⦻";
    var oline = "‾";
    var olt = "⧀";
    var Omacr = "Ō";
    var omacr = "ō";
    var Omega = "Ω";
    var omega = "ω";
    var Omicron = "Ο";
    var omicron = "ο";
    var omid = "⦶";
    var ominus = "⊖";
    var Oopf = "𝕆";
    var oopf = "𝕠";
    var opar = "⦷";
    var OpenCurlyDoubleQuote = "“";
    var OpenCurlyQuote = "‘";
    var operp = "⦹";
    var oplus = "⊕";
    var orarr = "↻";
    var Or = "⩔";
    var or = "∨";
    var ord = "⩝";
    var order = "ℴ";
    var orderof = "ℴ";
    var ordf = "ª";
    var ordm = "º";
    var origof = "⊶";
    var oror = "⩖";
    var orslope = "⩗";
    var orv = "⩛";
    var oS = "Ⓢ";
    var Oscr = "𝒪";
    var oscr = "ℴ";
    var Oslash = "Ø";
    var oslash = "ø";
    var osol = "⊘";
    var Otilde = "Õ";
    var otilde = "õ";
    var otimesas = "⨶";
    var Otimes = "⨷";
    var otimes = "⊗";
    var Ouml = "Ö";
    var ouml = "ö";
    var ovbar = "⌽";
    var OverBar = "‾";
    var OverBrace = "⏞";
    var OverBracket = "⎴";
    var OverParenthesis = "⏜";
    var para = "¶";
    var parallel = "∥";
    var par = "∥";
    var parsim = "⫳";
    var parsl = "⫽";
    var part = "∂";
    var PartialD = "∂";
    var Pcy = "П";
    var pcy = "п";
    var percnt = "%";
    var period = ".";
    var permil = "‰";
    var perp = "⊥";
    var pertenk = "‱";
    var Pfr = "𝔓";
    var pfr = "𝔭";
    var Phi = "Φ";
    var phi = "φ";
    var phiv = "ϕ";
    var phmmat = "ℳ";
    var phone = "☎";
    var Pi = "Π";
    var pi = "π";
    var pitchfork = "⋔";
    var piv = "ϖ";
    var planck = "ℏ";
    var planckh = "ℎ";
    var plankv = "ℏ";
    var plusacir = "⨣";
    var plusb = "⊞";
    var pluscir = "⨢";
    var plus = "+";
    var plusdo = "∔";
    var plusdu = "⨥";
    var pluse = "⩲";
    var PlusMinus = "±";
    var plusmn = "±";
    var plussim = "⨦";
    var plustwo = "⨧";
    var pm = "±";
    var Poincareplane = "ℌ";
    var pointint = "⨕";
    var popf = "𝕡";
    var Popf = "ℙ";
    var pound = "£";
    var prap = "⪷";
    var Pr = "⪻";
    var pr = "≺";
    var prcue = "≼";
    var precapprox = "⪷";
    var prec = "≺";
    var preccurlyeq = "≼";
    var Precedes = "≺";
    var PrecedesEqual = "⪯";
    var PrecedesSlantEqual = "≼";
    var PrecedesTilde = "≾";
    var preceq = "⪯";
    var precnapprox = "⪹";
    var precneqq = "⪵";
    var precnsim = "⋨";
    var pre = "⪯";
    var prE = "⪳";
    var precsim = "≾";
    var prime = "′";
    var Prime = "″";
    var primes = "ℙ";
    var prnap = "⪹";
    var prnE = "⪵";
    var prnsim = "⋨";
    var prod = "∏";
    var Product = "∏";
    var profalar = "⌮";
    var profline = "⌒";
    var profsurf = "⌓";
    var prop = "∝";
    var Proportional = "∝";
    var Proportion = "∷";
    var propto = "∝";
    var prsim = "≾";
    var prurel = "⊰";
    var Pscr = "𝒫";
    var pscr = "𝓅";
    var Psi = "Ψ";
    var psi = "ψ";
    var puncsp = " ";
    var Qfr = "𝔔";
    var qfr = "𝔮";
    var qint = "⨌";
    var qopf = "𝕢";
    var Qopf = "ℚ";
    var qprime = "⁗";
    var Qscr = "𝒬";
    var qscr = "𝓆";
    var quaternions = "ℍ";
    var quatint = "⨖";
    var quest = "?";
    var questeq = "≟";
    var quot = "\"";
    var QUOT = "\"";
    var rAarr = "⇛";
    var race = "∽̱";
    var Racute = "Ŕ";
    var racute = "ŕ";
    var radic = "√";
    var raemptyv = "⦳";
    var rang = "⟩";
    var Rang = "⟫";
    var rangd = "⦒";
    var range = "⦥";
    var rangle = "⟩";
    var raquo = "»";
    var rarrap = "⥵";
    var rarrb = "⇥";
    var rarrbfs = "⤠";
    var rarrc = "⤳";
    var rarr = "→";
    var Rarr = "↠";
    var rArr = "⇒";
    var rarrfs = "⤞";
    var rarrhk = "↪";
    var rarrlp = "↬";
    var rarrpl = "⥅";
    var rarrsim = "⥴";
    var Rarrtl = "⤖";
    var rarrtl = "↣";
    var rarrw = "↝";
    var ratail = "⤚";
    var rAtail = "⤜";
    var ratio = "∶";
    var rationals = "ℚ";
    var rbarr = "⤍";
    var rBarr = "⤏";
    var RBarr = "⤐";
    var rbbrk = "❳";
    var rbrace = "}";
    var rbrack = "]";
    var rbrke = "⦌";
    var rbrksld = "⦎";
    var rbrkslu = "⦐";
    var Rcaron = "Ř";
    var rcaron = "ř";
    var Rcedil = "Ŗ";
    var rcedil = "ŗ";
    var rceil = "⌉";
    var rcub = "}";
    var Rcy = "Р";
    var rcy = "р";
    var rdca = "⤷";
    var rdldhar = "⥩";
    var rdquo = "”";
    var rdquor = "”";
    var rdsh = "↳";
    var real = "ℜ";
    var realine = "ℛ";
    var realpart = "ℜ";
    var reals = "ℝ";
    var Re = "ℜ";
    var rect = "▭";
    var reg = "®";
    var REG = "®";
    var ReverseElement = "∋";
    var ReverseEquilibrium = "⇋";
    var ReverseUpEquilibrium = "⥯";
    var rfisht = "⥽";
    var rfloor = "⌋";
    var rfr = "𝔯";
    var Rfr = "ℜ";
    var rHar = "⥤";
    var rhard = "⇁";
    var rharu = "⇀";
    var rharul = "⥬";
    var Rho = "Ρ";
    var rho = "ρ";
    var rhov = "ϱ";
    var RightAngleBracket = "⟩";
    var RightArrowBar = "⇥";
    var rightarrow = "→";
    var RightArrow = "→";
    var Rightarrow = "⇒";
    var RightArrowLeftArrow = "⇄";
    var rightarrowtail = "↣";
    var RightCeiling = "⌉";
    var RightDoubleBracket = "⟧";
    var RightDownTeeVector = "⥝";
    var RightDownVectorBar = "⥕";
    var RightDownVector = "⇂";
    var RightFloor = "⌋";
    var rightharpoondown = "⇁";
    var rightharpoonup = "⇀";
    var rightleftarrows = "⇄";
    var rightleftharpoons = "⇌";
    var rightrightarrows = "⇉";
    var rightsquigarrow = "↝";
    var RightTeeArrow = "↦";
    var RightTee = "⊢";
    var RightTeeVector = "⥛";
    var rightthreetimes = "⋌";
    var RightTriangleBar = "⧐";
    var RightTriangle = "⊳";
    var RightTriangleEqual = "⊵";
    var RightUpDownVector = "⥏";
    var RightUpTeeVector = "⥜";
    var RightUpVectorBar = "⥔";
    var RightUpVector = "↾";
    var RightVectorBar = "⥓";
    var RightVector = "⇀";
    var ring = "˚";
    var risingdotseq = "≓";
    var rlarr = "⇄";
    var rlhar = "⇌";
    var rlm = "‏";
    var rmoustache = "⎱";
    var rmoust = "⎱";
    var rnmid = "⫮";
    var roang = "⟭";
    var roarr = "⇾";
    var robrk = "⟧";
    var ropar = "⦆";
    var ropf = "𝕣";
    var Ropf = "ℝ";
    var roplus = "⨮";
    var rotimes = "⨵";
    var RoundImplies = "⥰";
    var rpar = ")";
    var rpargt = "⦔";
    var rppolint = "⨒";
    var rrarr = "⇉";
    var Rrightarrow = "⇛";
    var rsaquo = "›";
    var rscr = "𝓇";
    var Rscr = "ℛ";
    var rsh = "↱";
    var Rsh = "↱";
    var rsqb = "]";
    var rsquo = "’";
    var rsquor = "’";
    var rthree = "⋌";
    var rtimes = "⋊";
    var rtri = "▹";
    var rtrie = "⊵";
    var rtrif = "▸";
    var rtriltri = "⧎";
    var RuleDelayed = "⧴";
    var ruluhar = "⥨";
    var rx = "℞";
    var Sacute = "Ś";
    var sacute = "ś";
    var sbquo = "‚";
    var scap = "⪸";
    var Scaron = "Š";
    var scaron = "š";
    var Sc = "⪼";
    var sc = "≻";
    var sccue = "≽";
    var sce = "⪰";
    var scE = "⪴";
    var Scedil = "Ş";
    var scedil = "ş";
    var Scirc = "Ŝ";
    var scirc = "ŝ";
    var scnap = "⪺";
    var scnE = "⪶";
    var scnsim = "⋩";
    var scpolint = "⨓";
    var scsim = "≿";
    var Scy = "С";
    var scy = "с";
    var sdotb = "⊡";
    var sdot = "⋅";
    var sdote = "⩦";
    var searhk = "⤥";
    var searr = "↘";
    var seArr = "⇘";
    var searrow = "↘";
    var sect = "§";
    var semi = ";";
    var seswar = "⤩";
    var setminus = "∖";
    var setmn = "∖";
    var sext = "✶";
    var Sfr = "𝔖";
    var sfr = "𝔰";
    var sfrown = "⌢";
    var sharp = "♯";
    var SHCHcy = "Щ";
    var shchcy = "щ";
    var SHcy = "Ш";
    var shcy = "ш";
    var ShortDownArrow = "↓";
    var ShortLeftArrow = "←";
    var shortmid = "∣";
    var shortparallel = "∥";
    var ShortRightArrow = "→";
    var ShortUpArrow = "↑";
    var shy = "­";
    var Sigma = "Σ";
    var sigma = "σ";
    var sigmaf = "ς";
    var sigmav = "ς";
    var sim = "∼";
    var simdot = "⩪";
    var sime = "≃";
    var simeq = "≃";
    var simg = "⪞";
    var simgE = "⪠";
    var siml = "⪝";
    var simlE = "⪟";
    var simne = "≆";
    var simplus = "⨤";
    var simrarr = "⥲";
    var slarr = "←";
    var SmallCircle = "∘";
    var smallsetminus = "∖";
    var smashp = "⨳";
    var smeparsl = "⧤";
    var smid = "∣";
    var smile = "⌣";
    var smt = "⪪";
    var smte = "⪬";
    var smtes = "⪬︀";
    var SOFTcy = "Ь";
    var softcy = "ь";
    var solbar = "⌿";
    var solb = "⧄";
    var sol = "/";
    var Sopf = "𝕊";
    var sopf = "𝕤";
    var spades = "♠";
    var spadesuit = "♠";
    var spar = "∥";
    var sqcap = "⊓";
    var sqcaps = "⊓︀";
    var sqcup = "⊔";
    var sqcups = "⊔︀";
    var Sqrt = "√";
    var sqsub = "⊏";
    var sqsube = "⊑";
    var sqsubset = "⊏";
    var sqsubseteq = "⊑";
    var sqsup = "⊐";
    var sqsupe = "⊒";
    var sqsupset = "⊐";
    var sqsupseteq = "⊒";
    var square = "□";
    var Square = "□";
    var SquareIntersection = "⊓";
    var SquareSubset = "⊏";
    var SquareSubsetEqual = "⊑";
    var SquareSuperset = "⊐";
    var SquareSupersetEqual = "⊒";
    var SquareUnion = "⊔";
    var squarf = "▪";
    var squ = "□";
    var squf = "▪";
    var srarr = "→";
    var Sscr = "𝒮";
    var sscr = "𝓈";
    var ssetmn = "∖";
    var ssmile = "⌣";
    var sstarf = "⋆";
    var Star = "⋆";
    var star = "☆";
    var starf = "★";
    var straightepsilon = "ϵ";
    var straightphi = "ϕ";
    var strns = "¯";
    var sub = "⊂";
    var Sub = "⋐";
    var subdot = "⪽";
    var subE = "⫅";
    var sube = "⊆";
    var subedot = "⫃";
    var submult = "⫁";
    var subnE = "⫋";
    var subne = "⊊";
    var subplus = "⪿";
    var subrarr = "⥹";
    var subset = "⊂";
    var Subset = "⋐";
    var subseteq = "⊆";
    var subseteqq = "⫅";
    var SubsetEqual = "⊆";
    var subsetneq = "⊊";
    var subsetneqq = "⫋";
    var subsim = "⫇";
    var subsub = "⫕";
    var subsup = "⫓";
    var succapprox = "⪸";
    var succ = "≻";
    var succcurlyeq = "≽";
    var Succeeds = "≻";
    var SucceedsEqual = "⪰";
    var SucceedsSlantEqual = "≽";
    var SucceedsTilde = "≿";
    var succeq = "⪰";
    var succnapprox = "⪺";
    var succneqq = "⪶";
    var succnsim = "⋩";
    var succsim = "≿";
    var SuchThat = "∋";
    var sum = "∑";
    var Sum = "∑";
    var sung = "♪";
    var sup1 = "¹";
    var sup2 = "²";
    var sup3 = "³";
    var sup = "⊃";
    var Sup = "⋑";
    var supdot = "⪾";
    var supdsub = "⫘";
    var supE = "⫆";
    var supe = "⊇";
    var supedot = "⫄";
    var Superset = "⊃";
    var SupersetEqual = "⊇";
    var suphsol = "⟉";
    var suphsub = "⫗";
    var suplarr = "⥻";
    var supmult = "⫂";
    var supnE = "⫌";
    var supne = "⊋";
    var supplus = "⫀";
    var supset = "⊃";
    var Supset = "⋑";
    var supseteq = "⊇";
    var supseteqq = "⫆";
    var supsetneq = "⊋";
    var supsetneqq = "⫌";
    var supsim = "⫈";
    var supsub = "⫔";
    var supsup = "⫖";
    var swarhk = "⤦";
    var swarr = "↙";
    var swArr = "⇙";
    var swarrow = "↙";
    var swnwar = "⤪";
    var szlig = "ß";
    var Tab = "\t";
    var target = "⌖";
    var Tau = "Τ";
    var tau = "τ";
    var tbrk = "⎴";
    var Tcaron = "Ť";
    var tcaron = "ť";
    var Tcedil = "Ţ";
    var tcedil = "ţ";
    var Tcy = "Т";
    var tcy = "т";
    var tdot = "⃛";
    var telrec = "⌕";
    var Tfr = "𝔗";
    var tfr = "𝔱";
    var there4 = "∴";
    var therefore = "∴";
    var Therefore = "∴";
    var Theta = "Θ";
    var theta = "θ";
    var thetasym = "ϑ";
    var thetav = "ϑ";
    var thickapprox = "≈";
    var thicksim = "∼";
    var ThickSpace = "  ";
    var ThinSpace = " ";
    var thinsp = " ";
    var thkap = "≈";
    var thksim = "∼";
    var THORN = "Þ";
    var thorn = "þ";
    var tilde = "˜";
    var Tilde = "∼";
    var TildeEqual = "≃";
    var TildeFullEqual = "≅";
    var TildeTilde = "≈";
    var timesbar = "⨱";
    var timesb = "⊠";
    var times = "×";
    var timesd = "⨰";
    var tint = "∭";
    var toea = "⤨";
    var topbot = "⌶";
    var topcir = "⫱";
    var top = "⊤";
    var Topf = "𝕋";
    var topf = "𝕥";
    var topfork = "⫚";
    var tosa = "⤩";
    var tprime = "‴";
    var trade = "™";
    var TRADE = "™";
    var triangle = "▵";
    var triangledown = "▿";
    var triangleleft = "◃";
    var trianglelefteq = "⊴";
    var triangleq = "≜";
    var triangleright = "▹";
    var trianglerighteq = "⊵";
    var tridot = "◬";
    var trie = "≜";
    var triminus = "⨺";
    var TripleDot = "⃛";
    var triplus = "⨹";
    var trisb = "⧍";
    var tritime = "⨻";
    var trpezium = "⏢";
    var Tscr = "𝒯";
    var tscr = "𝓉";
    var TScy = "Ц";
    var tscy = "ц";
    var TSHcy = "Ћ";
    var tshcy = "ћ";
    var Tstrok = "Ŧ";
    var tstrok = "ŧ";
    var twixt = "≬";
    var twoheadleftarrow = "↞";
    var twoheadrightarrow = "↠";
    var Uacute = "Ú";
    var uacute = "ú";
    var uarr = "↑";
    var Uarr = "↟";
    var uArr = "⇑";
    var Uarrocir = "⥉";
    var Ubrcy = "Ў";
    var ubrcy = "ў";
    var Ubreve = "Ŭ";
    var ubreve = "ŭ";
    var Ucirc = "Û";
    var ucirc = "û";
    var Ucy = "У";
    var ucy = "у";
    var udarr = "⇅";
    var Udblac = "Ű";
    var udblac = "ű";
    var udhar = "⥮";
    var ufisht = "⥾";
    var Ufr = "𝔘";
    var ufr = "𝔲";
    var Ugrave = "Ù";
    var ugrave = "ù";
    var uHar = "⥣";
    var uharl = "↿";
    var uharr = "↾";
    var uhblk = "▀";
    var ulcorn = "⌜";
    var ulcorner = "⌜";
    var ulcrop = "⌏";
    var ultri = "◸";
    var Umacr = "Ū";
    var umacr = "ū";
    var uml = "¨";
    var UnderBar = "_";
    var UnderBrace = "⏟";
    var UnderBracket = "⎵";
    var UnderParenthesis = "⏝";
    var Union = "⋃";
    var UnionPlus = "⊎";
    var Uogon = "Ų";
    var uogon = "ų";
    var Uopf = "𝕌";
    var uopf = "𝕦";
    var UpArrowBar = "⤒";
    var uparrow = "↑";
    var UpArrow = "↑";
    var Uparrow = "⇑";
    var UpArrowDownArrow = "⇅";
    var updownarrow = "↕";
    var UpDownArrow = "↕";
    var Updownarrow = "⇕";
    var UpEquilibrium = "⥮";
    var upharpoonleft = "↿";
    var upharpoonright = "↾";
    var uplus = "⊎";
    var UpperLeftArrow = "↖";
    var UpperRightArrow = "↗";
    var upsi = "υ";
    var Upsi = "ϒ";
    var upsih = "ϒ";
    var Upsilon = "Υ";
    var upsilon = "υ";
    var UpTeeArrow = "↥";
    var UpTee = "⊥";
    var upuparrows = "⇈";
    var urcorn = "⌝";
    var urcorner = "⌝";
    var urcrop = "⌎";
    var Uring = "Ů";
    var uring = "ů";
    var urtri = "◹";
    var Uscr = "𝒰";
    var uscr = "𝓊";
    var utdot = "⋰";
    var Utilde = "Ũ";
    var utilde = "ũ";
    var utri = "▵";
    var utrif = "▴";
    var uuarr = "⇈";
    var Uuml = "Ü";
    var uuml = "ü";
    var uwangle = "⦧";
    var vangrt = "⦜";
    var varepsilon = "ϵ";
    var varkappa = "ϰ";
    var varnothing = "∅";
    var varphi = "ϕ";
    var varpi = "ϖ";
    var varpropto = "∝";
    var varr = "↕";
    var vArr = "⇕";
    var varrho = "ϱ";
    var varsigma = "ς";
    var varsubsetneq = "⊊︀";
    var varsubsetneqq = "⫋︀";
    var varsupsetneq = "⊋︀";
    var varsupsetneqq = "⫌︀";
    var vartheta = "ϑ";
    var vartriangleleft = "⊲";
    var vartriangleright = "⊳";
    var vBar = "⫨";
    var Vbar = "⫫";
    var vBarv = "⫩";
    var Vcy = "В";
    var vcy = "в";
    var vdash = "⊢";
    var vDash = "⊨";
    var Vdash = "⊩";
    var VDash = "⊫";
    var Vdashl = "⫦";
    var veebar = "⊻";
    var vee = "∨";
    var Vee = "⋁";
    var veeeq = "≚";
    var vellip = "⋮";
    var verbar = "|";
    var Verbar = "‖";
    var vert = "|";
    var Vert = "‖";
    var VerticalBar = "∣";
    var VerticalLine = "|";
    var VerticalSeparator = "❘";
    var VerticalTilde = "≀";
    var VeryThinSpace = " ";
    var Vfr = "𝔙";
    var vfr = "𝔳";
    var vltri = "⊲";
    var vnsub = "⊂⃒";
    var vnsup = "⊃⃒";
    var Vopf = "𝕍";
    var vopf = "𝕧";
    var vprop = "∝";
    var vrtri = "⊳";
    var Vscr = "𝒱";
    var vscr = "𝓋";
    var vsubnE = "⫋︀";
    var vsubne = "⊊︀";
    var vsupnE = "⫌︀";
    var vsupne = "⊋︀";
    var Vvdash = "⊪";
    var vzigzag = "⦚";
    var Wcirc = "Ŵ";
    var wcirc = "ŵ";
    var wedbar = "⩟";
    var wedge = "∧";
    var Wedge = "⋀";
    var wedgeq = "≙";
    var weierp = "℘";
    var Wfr = "𝔚";
    var wfr = "𝔴";
    var Wopf = "𝕎";
    var wopf = "𝕨";
    var wp = "℘";
    var wr = "≀";
    var wreath = "≀";
    var Wscr = "𝒲";
    var wscr = "𝓌";
    var xcap = "⋂";
    var xcirc = "◯";
    var xcup = "⋃";
    var xdtri = "▽";
    var Xfr = "𝔛";
    var xfr = "𝔵";
    var xharr = "⟷";
    var xhArr = "⟺";
    var Xi = "Ξ";
    var xi = "ξ";
    var xlarr = "⟵";
    var xlArr = "⟸";
    var xmap = "⟼";
    var xnis = "⋻";
    var xodot = "⨀";
    var Xopf = "𝕏";
    var xopf = "𝕩";
    var xoplus = "⨁";
    var xotime = "⨂";
    var xrarr = "⟶";
    var xrArr = "⟹";
    var Xscr = "𝒳";
    var xscr = "𝓍";
    var xsqcup = "⨆";
    var xuplus = "⨄";
    var xutri = "△";
    var xvee = "⋁";
    var xwedge = "⋀";
    var Yacute = "Ý";
    var yacute = "ý";
    var YAcy = "Я";
    var yacy = "я";
    var Ycirc = "Ŷ";
    var ycirc = "ŷ";
    var Ycy = "Ы";
    var ycy = "ы";
    var yen = "¥";
    var Yfr = "𝔜";
    var yfr = "𝔶";
    var YIcy = "Ї";
    var yicy = "ї";
    var Yopf = "𝕐";
    var yopf = "𝕪";
    var Yscr = "𝒴";
    var yscr = "𝓎";
    var YUcy = "Ю";
    var yucy = "ю";
    var yuml = "ÿ";
    var Yuml = "Ÿ";
    var Zacute = "Ź";
    var zacute = "ź";
    var Zcaron = "Ž";
    var zcaron = "ž";
    var Zcy = "З";
    var zcy = "з";
    var Zdot = "Ż";
    var zdot = "ż";
    var zeetrf = "ℨ";
    var ZeroWidthSpace = "​";
    var Zeta = "Ζ";
    var zeta = "ζ";
    var zfr = "𝔷";
    var Zfr = "ℨ";
    var ZHcy = "Ж";
    var zhcy = "ж";
    var zigrarr = "⇝";
    var zopf = "𝕫";
    var Zopf = "ℤ";
    var Zscr = "𝒵";
    var zscr = "𝓏";
    var zwj = "‍";
    var zwnj = "‌";
    var entities = {
    	Aacute: Aacute,
    	aacute: aacute,
    	Abreve: Abreve,
    	abreve: abreve,
    	ac: ac,
    	acd: acd,
    	acE: acE,
    	Acirc: Acirc,
    	acirc: acirc,
    	acute: acute,
    	Acy: Acy,
    	acy: acy,
    	AElig: AElig,
    	aelig: aelig,
    	af: af,
    	Afr: Afr,
    	afr: afr,
    	Agrave: Agrave,
    	agrave: agrave,
    	alefsym: alefsym,
    	aleph: aleph,
    	Alpha: Alpha,
    	alpha: alpha,
    	Amacr: Amacr,
    	amacr: amacr,
    	amalg: amalg,
    	amp: amp,
    	AMP: AMP,
    	andand: andand,
    	And: And,
    	and: and,
    	andd: andd,
    	andslope: andslope,
    	andv: andv,
    	ang: ang,
    	ange: ange,
    	angle: angle,
    	angmsdaa: angmsdaa,
    	angmsdab: angmsdab,
    	angmsdac: angmsdac,
    	angmsdad: angmsdad,
    	angmsdae: angmsdae,
    	angmsdaf: angmsdaf,
    	angmsdag: angmsdag,
    	angmsdah: angmsdah,
    	angmsd: angmsd,
    	angrt: angrt,
    	angrtvb: angrtvb,
    	angrtvbd: angrtvbd,
    	angsph: angsph,
    	angst: angst,
    	angzarr: angzarr,
    	Aogon: Aogon,
    	aogon: aogon,
    	Aopf: Aopf,
    	aopf: aopf,
    	apacir: apacir,
    	ap: ap,
    	apE: apE,
    	ape: ape,
    	apid: apid,
    	apos: apos,
    	ApplyFunction: ApplyFunction,
    	approx: approx,
    	approxeq: approxeq,
    	Aring: Aring,
    	aring: aring,
    	Ascr: Ascr,
    	ascr: ascr,
    	Assign: Assign,
    	ast: ast,
    	asymp: asymp,
    	asympeq: asympeq,
    	Atilde: Atilde,
    	atilde: atilde,
    	Auml: Auml,
    	auml: auml,
    	awconint: awconint,
    	awint: awint,
    	backcong: backcong,
    	backepsilon: backepsilon,
    	backprime: backprime,
    	backsim: backsim,
    	backsimeq: backsimeq,
    	Backslash: Backslash,
    	Barv: Barv,
    	barvee: barvee,
    	barwed: barwed,
    	Barwed: Barwed,
    	barwedge: barwedge,
    	bbrk: bbrk,
    	bbrktbrk: bbrktbrk,
    	bcong: bcong,
    	Bcy: Bcy,
    	bcy: bcy,
    	bdquo: bdquo,
    	becaus: becaus,
    	because: because,
    	Because: Because,
    	bemptyv: bemptyv,
    	bepsi: bepsi,
    	bernou: bernou,
    	Bernoullis: Bernoullis,
    	Beta: Beta,
    	beta: beta,
    	beth: beth,
    	between: between,
    	Bfr: Bfr,
    	bfr: bfr,
    	bigcap: bigcap,
    	bigcirc: bigcirc,
    	bigcup: bigcup,
    	bigodot: bigodot,
    	bigoplus: bigoplus,
    	bigotimes: bigotimes,
    	bigsqcup: bigsqcup,
    	bigstar: bigstar,
    	bigtriangledown: bigtriangledown,
    	bigtriangleup: bigtriangleup,
    	biguplus: biguplus,
    	bigvee: bigvee,
    	bigwedge: bigwedge,
    	bkarow: bkarow,
    	blacklozenge: blacklozenge,
    	blacksquare: blacksquare,
    	blacktriangle: blacktriangle,
    	blacktriangledown: blacktriangledown,
    	blacktriangleleft: blacktriangleleft,
    	blacktriangleright: blacktriangleright,
    	blank: blank,
    	blk12: blk12,
    	blk14: blk14,
    	blk34: blk34,
    	block: block,
    	bne: bne,
    	bnequiv: bnequiv,
    	bNot: bNot,
    	bnot: bnot,
    	Bopf: Bopf,
    	bopf: bopf,
    	bot: bot,
    	bottom: bottom,
    	bowtie: bowtie,
    	boxbox: boxbox,
    	boxdl: boxdl,
    	boxdL: boxdL,
    	boxDl: boxDl,
    	boxDL: boxDL,
    	boxdr: boxdr,
    	boxdR: boxdR,
    	boxDr: boxDr,
    	boxDR: boxDR,
    	boxh: boxh,
    	boxH: boxH,
    	boxhd: boxhd,
    	boxHd: boxHd,
    	boxhD: boxhD,
    	boxHD: boxHD,
    	boxhu: boxhu,
    	boxHu: boxHu,
    	boxhU: boxhU,
    	boxHU: boxHU,
    	boxminus: boxminus,
    	boxplus: boxplus,
    	boxtimes: boxtimes,
    	boxul: boxul,
    	boxuL: boxuL,
    	boxUl: boxUl,
    	boxUL: boxUL,
    	boxur: boxur,
    	boxuR: boxuR,
    	boxUr: boxUr,
    	boxUR: boxUR,
    	boxv: boxv,
    	boxV: boxV,
    	boxvh: boxvh,
    	boxvH: boxvH,
    	boxVh: boxVh,
    	boxVH: boxVH,
    	boxvl: boxvl,
    	boxvL: boxvL,
    	boxVl: boxVl,
    	boxVL: boxVL,
    	boxvr: boxvr,
    	boxvR: boxvR,
    	boxVr: boxVr,
    	boxVR: boxVR,
    	bprime: bprime,
    	breve: breve,
    	Breve: Breve,
    	brvbar: brvbar,
    	bscr: bscr,
    	Bscr: Bscr,
    	bsemi: bsemi,
    	bsim: bsim,
    	bsime: bsime,
    	bsolb: bsolb,
    	bsol: bsol,
    	bsolhsub: bsolhsub,
    	bull: bull,
    	bullet: bullet,
    	bump: bump,
    	bumpE: bumpE,
    	bumpe: bumpe,
    	Bumpeq: Bumpeq,
    	bumpeq: bumpeq,
    	Cacute: Cacute,
    	cacute: cacute,
    	capand: capand,
    	capbrcup: capbrcup,
    	capcap: capcap,
    	cap: cap,
    	Cap: Cap,
    	capcup: capcup,
    	capdot: capdot,
    	CapitalDifferentialD: CapitalDifferentialD,
    	caps: caps,
    	caret: caret,
    	caron: caron,
    	Cayleys: Cayleys,
    	ccaps: ccaps,
    	Ccaron: Ccaron,
    	ccaron: ccaron,
    	Ccedil: Ccedil,
    	ccedil: ccedil,
    	Ccirc: Ccirc,
    	ccirc: ccirc,
    	Cconint: Cconint,
    	ccups: ccups,
    	ccupssm: ccupssm,
    	Cdot: Cdot,
    	cdot: cdot,
    	cedil: cedil,
    	Cedilla: Cedilla,
    	cemptyv: cemptyv,
    	cent: cent,
    	centerdot: centerdot,
    	CenterDot: CenterDot,
    	cfr: cfr,
    	Cfr: Cfr,
    	CHcy: CHcy,
    	chcy: chcy,
    	check: check,
    	checkmark: checkmark,
    	Chi: Chi,
    	chi: chi,
    	circ: circ,
    	circeq: circeq,
    	circlearrowleft: circlearrowleft,
    	circlearrowright: circlearrowright,
    	circledast: circledast,
    	circledcirc: circledcirc,
    	circleddash: circleddash,
    	CircleDot: CircleDot,
    	circledR: circledR,
    	circledS: circledS,
    	CircleMinus: CircleMinus,
    	CirclePlus: CirclePlus,
    	CircleTimes: CircleTimes,
    	cir: cir,
    	cirE: cirE,
    	cire: cire,
    	cirfnint: cirfnint,
    	cirmid: cirmid,
    	cirscir: cirscir,
    	ClockwiseContourIntegral: ClockwiseContourIntegral,
    	CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
    	CloseCurlyQuote: CloseCurlyQuote,
    	clubs: clubs,
    	clubsuit: clubsuit,
    	colon: colon,
    	Colon: Colon,
    	Colone: Colone,
    	colone: colone,
    	coloneq: coloneq,
    	comma: comma,
    	commat: commat,
    	comp: comp,
    	compfn: compfn,
    	complement: complement,
    	complexes: complexes,
    	cong: cong,
    	congdot: congdot,
    	Congruent: Congruent,
    	conint: conint,
    	Conint: Conint,
    	ContourIntegral: ContourIntegral,
    	copf: copf,
    	Copf: Copf,
    	coprod: coprod,
    	Coproduct: Coproduct,
    	copy: copy,
    	COPY: COPY,
    	copysr: copysr,
    	CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
    	crarr: crarr,
    	cross: cross,
    	Cross: Cross,
    	Cscr: Cscr,
    	cscr: cscr,
    	csub: csub,
    	csube: csube,
    	csup: csup,
    	csupe: csupe,
    	ctdot: ctdot,
    	cudarrl: cudarrl,
    	cudarrr: cudarrr,
    	cuepr: cuepr,
    	cuesc: cuesc,
    	cularr: cularr,
    	cularrp: cularrp,
    	cupbrcap: cupbrcap,
    	cupcap: cupcap,
    	CupCap: CupCap,
    	cup: cup,
    	Cup: Cup,
    	cupcup: cupcup,
    	cupdot: cupdot,
    	cupor: cupor,
    	cups: cups,
    	curarr: curarr,
    	curarrm: curarrm,
    	curlyeqprec: curlyeqprec,
    	curlyeqsucc: curlyeqsucc,
    	curlyvee: curlyvee,
    	curlywedge: curlywedge,
    	curren: curren,
    	curvearrowleft: curvearrowleft,
    	curvearrowright: curvearrowright,
    	cuvee: cuvee,
    	cuwed: cuwed,
    	cwconint: cwconint,
    	cwint: cwint,
    	cylcty: cylcty,
    	dagger: dagger,
    	Dagger: Dagger,
    	daleth: daleth,
    	darr: darr,
    	Darr: Darr,
    	dArr: dArr,
    	dash: dash,
    	Dashv: Dashv,
    	dashv: dashv,
    	dbkarow: dbkarow,
    	dblac: dblac,
    	Dcaron: Dcaron,
    	dcaron: dcaron,
    	Dcy: Dcy,
    	dcy: dcy,
    	ddagger: ddagger,
    	ddarr: ddarr,
    	DD: DD,
    	dd: dd,
    	DDotrahd: DDotrahd,
    	ddotseq: ddotseq,
    	deg: deg,
    	Del: Del,
    	Delta: Delta,
    	delta: delta,
    	demptyv: demptyv,
    	dfisht: dfisht,
    	Dfr: Dfr,
    	dfr: dfr,
    	dHar: dHar,
    	dharl: dharl,
    	dharr: dharr,
    	DiacriticalAcute: DiacriticalAcute,
    	DiacriticalDot: DiacriticalDot,
    	DiacriticalDoubleAcute: DiacriticalDoubleAcute,
    	DiacriticalGrave: DiacriticalGrave,
    	DiacriticalTilde: DiacriticalTilde,
    	diam: diam,
    	diamond: diamond,
    	Diamond: Diamond,
    	diamondsuit: diamondsuit,
    	diams: diams,
    	die: die,
    	DifferentialD: DifferentialD,
    	digamma: digamma,
    	disin: disin,
    	div: div,
    	divide: divide,
    	divideontimes: divideontimes,
    	divonx: divonx,
    	DJcy: DJcy,
    	djcy: djcy,
    	dlcorn: dlcorn,
    	dlcrop: dlcrop,
    	dollar: dollar,
    	Dopf: Dopf,
    	dopf: dopf,
    	Dot: Dot,
    	dot: dot,
    	DotDot: DotDot,
    	doteq: doteq,
    	doteqdot: doteqdot,
    	DotEqual: DotEqual,
    	dotminus: dotminus,
    	dotplus: dotplus,
    	dotsquare: dotsquare,
    	doublebarwedge: doublebarwedge,
    	DoubleContourIntegral: DoubleContourIntegral,
    	DoubleDot: DoubleDot,
    	DoubleDownArrow: DoubleDownArrow,
    	DoubleLeftArrow: DoubleLeftArrow,
    	DoubleLeftRightArrow: DoubleLeftRightArrow,
    	DoubleLeftTee: DoubleLeftTee,
    	DoubleLongLeftArrow: DoubleLongLeftArrow,
    	DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
    	DoubleLongRightArrow: DoubleLongRightArrow,
    	DoubleRightArrow: DoubleRightArrow,
    	DoubleRightTee: DoubleRightTee,
    	DoubleUpArrow: DoubleUpArrow,
    	DoubleUpDownArrow: DoubleUpDownArrow,
    	DoubleVerticalBar: DoubleVerticalBar,
    	DownArrowBar: DownArrowBar,
    	downarrow: downarrow,
    	DownArrow: DownArrow,
    	Downarrow: Downarrow,
    	DownArrowUpArrow: DownArrowUpArrow,
    	DownBreve: DownBreve,
    	downdownarrows: downdownarrows,
    	downharpoonleft: downharpoonleft,
    	downharpoonright: downharpoonright,
    	DownLeftRightVector: DownLeftRightVector,
    	DownLeftTeeVector: DownLeftTeeVector,
    	DownLeftVectorBar: DownLeftVectorBar,
    	DownLeftVector: DownLeftVector,
    	DownRightTeeVector: DownRightTeeVector,
    	DownRightVectorBar: DownRightVectorBar,
    	DownRightVector: DownRightVector,
    	DownTeeArrow: DownTeeArrow,
    	DownTee: DownTee,
    	drbkarow: drbkarow,
    	drcorn: drcorn,
    	drcrop: drcrop,
    	Dscr: Dscr,
    	dscr: dscr,
    	DScy: DScy,
    	dscy: dscy,
    	dsol: dsol,
    	Dstrok: Dstrok,
    	dstrok: dstrok,
    	dtdot: dtdot,
    	dtri: dtri,
    	dtrif: dtrif,
    	duarr: duarr,
    	duhar: duhar,
    	dwangle: dwangle,
    	DZcy: DZcy,
    	dzcy: dzcy,
    	dzigrarr: dzigrarr,
    	Eacute: Eacute,
    	eacute: eacute,
    	easter: easter,
    	Ecaron: Ecaron,
    	ecaron: ecaron,
    	Ecirc: Ecirc,
    	ecirc: ecirc,
    	ecir: ecir,
    	ecolon: ecolon,
    	Ecy: Ecy,
    	ecy: ecy,
    	eDDot: eDDot,
    	Edot: Edot,
    	edot: edot,
    	eDot: eDot,
    	ee: ee,
    	efDot: efDot,
    	Efr: Efr,
    	efr: efr,
    	eg: eg,
    	Egrave: Egrave,
    	egrave: egrave,
    	egs: egs,
    	egsdot: egsdot,
    	el: el,
    	Element: Element,
    	elinters: elinters,
    	ell: ell,
    	els: els,
    	elsdot: elsdot,
    	Emacr: Emacr,
    	emacr: emacr,
    	empty: empty,
    	emptyset: emptyset,
    	EmptySmallSquare: EmptySmallSquare,
    	emptyv: emptyv,
    	EmptyVerySmallSquare: EmptyVerySmallSquare,
    	emsp13: emsp13,
    	emsp14: emsp14,
    	emsp: emsp,
    	ENG: ENG,
    	eng: eng,
    	ensp: ensp,
    	Eogon: Eogon,
    	eogon: eogon,
    	Eopf: Eopf,
    	eopf: eopf,
    	epar: epar,
    	eparsl: eparsl,
    	eplus: eplus,
    	epsi: epsi,
    	Epsilon: Epsilon,
    	epsilon: epsilon,
    	epsiv: epsiv,
    	eqcirc: eqcirc,
    	eqcolon: eqcolon,
    	eqsim: eqsim,
    	eqslantgtr: eqslantgtr,
    	eqslantless: eqslantless,
    	Equal: Equal,
    	equals: equals,
    	EqualTilde: EqualTilde,
    	equest: equest,
    	Equilibrium: Equilibrium,
    	equiv: equiv,
    	equivDD: equivDD,
    	eqvparsl: eqvparsl,
    	erarr: erarr,
    	erDot: erDot,
    	escr: escr,
    	Escr: Escr,
    	esdot: esdot,
    	Esim: Esim,
    	esim: esim,
    	Eta: Eta,
    	eta: eta,
    	ETH: ETH,
    	eth: eth,
    	Euml: Euml,
    	euml: euml,
    	euro: euro,
    	excl: excl,
    	exist: exist,
    	Exists: Exists,
    	expectation: expectation,
    	exponentiale: exponentiale,
    	ExponentialE: ExponentialE,
    	fallingdotseq: fallingdotseq,
    	Fcy: Fcy,
    	fcy: fcy,
    	female: female,
    	ffilig: ffilig,
    	fflig: fflig,
    	ffllig: ffllig,
    	Ffr: Ffr,
    	ffr: ffr,
    	filig: filig,
    	FilledSmallSquare: FilledSmallSquare,
    	FilledVerySmallSquare: FilledVerySmallSquare,
    	fjlig: fjlig,
    	flat: flat,
    	fllig: fllig,
    	fltns: fltns,
    	fnof: fnof,
    	Fopf: Fopf,
    	fopf: fopf,
    	forall: forall,
    	ForAll: ForAll,
    	fork: fork,
    	forkv: forkv,
    	Fouriertrf: Fouriertrf,
    	fpartint: fpartint,
    	frac12: frac12,
    	frac13: frac13,
    	frac14: frac14,
    	frac15: frac15,
    	frac16: frac16,
    	frac18: frac18,
    	frac23: frac23,
    	frac25: frac25,
    	frac34: frac34,
    	frac35: frac35,
    	frac38: frac38,
    	frac45: frac45,
    	frac56: frac56,
    	frac58: frac58,
    	frac78: frac78,
    	frasl: frasl,
    	frown: frown,
    	fscr: fscr,
    	Fscr: Fscr,
    	gacute: gacute,
    	Gamma: Gamma,
    	gamma: gamma,
    	Gammad: Gammad,
    	gammad: gammad,
    	gap: gap,
    	Gbreve: Gbreve,
    	gbreve: gbreve,
    	Gcedil: Gcedil,
    	Gcirc: Gcirc,
    	gcirc: gcirc,
    	Gcy: Gcy,
    	gcy: gcy,
    	Gdot: Gdot,
    	gdot: gdot,
    	ge: ge,
    	gE: gE,
    	gEl: gEl,
    	gel: gel,
    	geq: geq,
    	geqq: geqq,
    	geqslant: geqslant,
    	gescc: gescc,
    	ges: ges,
    	gesdot: gesdot,
    	gesdoto: gesdoto,
    	gesdotol: gesdotol,
    	gesl: gesl,
    	gesles: gesles,
    	Gfr: Gfr,
    	gfr: gfr,
    	gg: gg,
    	Gg: Gg,
    	ggg: ggg,
    	gimel: gimel,
    	GJcy: GJcy,
    	gjcy: gjcy,
    	gla: gla,
    	gl: gl,
    	glE: glE,
    	glj: glj,
    	gnap: gnap,
    	gnapprox: gnapprox,
    	gne: gne,
    	gnE: gnE,
    	gneq: gneq,
    	gneqq: gneqq,
    	gnsim: gnsim,
    	Gopf: Gopf,
    	gopf: gopf,
    	grave: grave,
    	GreaterEqual: GreaterEqual,
    	GreaterEqualLess: GreaterEqualLess,
    	GreaterFullEqual: GreaterFullEqual,
    	GreaterGreater: GreaterGreater,
    	GreaterLess: GreaterLess,
    	GreaterSlantEqual: GreaterSlantEqual,
    	GreaterTilde: GreaterTilde,
    	Gscr: Gscr,
    	gscr: gscr,
    	gsim: gsim,
    	gsime: gsime,
    	gsiml: gsiml,
    	gtcc: gtcc,
    	gtcir: gtcir,
    	gt: gt,
    	GT: GT,
    	Gt: Gt,
    	gtdot: gtdot,
    	gtlPar: gtlPar,
    	gtquest: gtquest,
    	gtrapprox: gtrapprox,
    	gtrarr: gtrarr,
    	gtrdot: gtrdot,
    	gtreqless: gtreqless,
    	gtreqqless: gtreqqless,
    	gtrless: gtrless,
    	gtrsim: gtrsim,
    	gvertneqq: gvertneqq,
    	gvnE: gvnE,
    	Hacek: Hacek,
    	hairsp: hairsp,
    	half: half,
    	hamilt: hamilt,
    	HARDcy: HARDcy,
    	hardcy: hardcy,
    	harrcir: harrcir,
    	harr: harr,
    	hArr: hArr,
    	harrw: harrw,
    	Hat: Hat,
    	hbar: hbar,
    	Hcirc: Hcirc,
    	hcirc: hcirc,
    	hearts: hearts,
    	heartsuit: heartsuit,
    	hellip: hellip,
    	hercon: hercon,
    	hfr: hfr,
    	Hfr: Hfr,
    	HilbertSpace: HilbertSpace,
    	hksearow: hksearow,
    	hkswarow: hkswarow,
    	hoarr: hoarr,
    	homtht: homtht,
    	hookleftarrow: hookleftarrow,
    	hookrightarrow: hookrightarrow,
    	hopf: hopf,
    	Hopf: Hopf,
    	horbar: horbar,
    	HorizontalLine: HorizontalLine,
    	hscr: hscr,
    	Hscr: Hscr,
    	hslash: hslash,
    	Hstrok: Hstrok,
    	hstrok: hstrok,
    	HumpDownHump: HumpDownHump,
    	HumpEqual: HumpEqual,
    	hybull: hybull,
    	hyphen: hyphen,
    	Iacute: Iacute,
    	iacute: iacute,
    	ic: ic,
    	Icirc: Icirc,
    	icirc: icirc,
    	Icy: Icy,
    	icy: icy,
    	Idot: Idot,
    	IEcy: IEcy,
    	iecy: iecy,
    	iexcl: iexcl,
    	iff: iff,
    	ifr: ifr,
    	Ifr: Ifr,
    	Igrave: Igrave,
    	igrave: igrave,
    	ii: ii,
    	iiiint: iiiint,
    	iiint: iiint,
    	iinfin: iinfin,
    	iiota: iiota,
    	IJlig: IJlig,
    	ijlig: ijlig,
    	Imacr: Imacr,
    	imacr: imacr,
    	image: image,
    	ImaginaryI: ImaginaryI,
    	imagline: imagline,
    	imagpart: imagpart,
    	imath: imath,
    	Im: Im,
    	imof: imof,
    	imped: imped,
    	Implies: Implies,
    	incare: incare,
    	"in": "∈",
    	infin: infin,
    	infintie: infintie,
    	inodot: inodot,
    	intcal: intcal,
    	int: int,
    	Int: Int,
    	integers: integers,
    	Integral: Integral,
    	intercal: intercal,
    	Intersection: Intersection,
    	intlarhk: intlarhk,
    	intprod: intprod,
    	InvisibleComma: InvisibleComma,
    	InvisibleTimes: InvisibleTimes,
    	IOcy: IOcy,
    	iocy: iocy,
    	Iogon: Iogon,
    	iogon: iogon,
    	Iopf: Iopf,
    	iopf: iopf,
    	Iota: Iota,
    	iota: iota,
    	iprod: iprod,
    	iquest: iquest,
    	iscr: iscr,
    	Iscr: Iscr,
    	isin: isin,
    	isindot: isindot,
    	isinE: isinE,
    	isins: isins,
    	isinsv: isinsv,
    	isinv: isinv,
    	it: it,
    	Itilde: Itilde,
    	itilde: itilde,
    	Iukcy: Iukcy,
    	iukcy: iukcy,
    	Iuml: Iuml,
    	iuml: iuml,
    	Jcirc: Jcirc,
    	jcirc: jcirc,
    	Jcy: Jcy,
    	jcy: jcy,
    	Jfr: Jfr,
    	jfr: jfr,
    	jmath: jmath,
    	Jopf: Jopf,
    	jopf: jopf,
    	Jscr: Jscr,
    	jscr: jscr,
    	Jsercy: Jsercy,
    	jsercy: jsercy,
    	Jukcy: Jukcy,
    	jukcy: jukcy,
    	Kappa: Kappa,
    	kappa: kappa,
    	kappav: kappav,
    	Kcedil: Kcedil,
    	kcedil: kcedil,
    	Kcy: Kcy,
    	kcy: kcy,
    	Kfr: Kfr,
    	kfr: kfr,
    	kgreen: kgreen,
    	KHcy: KHcy,
    	khcy: khcy,
    	KJcy: KJcy,
    	kjcy: kjcy,
    	Kopf: Kopf,
    	kopf: kopf,
    	Kscr: Kscr,
    	kscr: kscr,
    	lAarr: lAarr,
    	Lacute: Lacute,
    	lacute: lacute,
    	laemptyv: laemptyv,
    	lagran: lagran,
    	Lambda: Lambda,
    	lambda: lambda,
    	lang: lang,
    	Lang: Lang,
    	langd: langd,
    	langle: langle,
    	lap: lap,
    	Laplacetrf: Laplacetrf,
    	laquo: laquo,
    	larrb: larrb,
    	larrbfs: larrbfs,
    	larr: larr,
    	Larr: Larr,
    	lArr: lArr,
    	larrfs: larrfs,
    	larrhk: larrhk,
    	larrlp: larrlp,
    	larrpl: larrpl,
    	larrsim: larrsim,
    	larrtl: larrtl,
    	latail: latail,
    	lAtail: lAtail,
    	lat: lat,
    	late: late,
    	lates: lates,
    	lbarr: lbarr,
    	lBarr: lBarr,
    	lbbrk: lbbrk,
    	lbrace: lbrace,
    	lbrack: lbrack,
    	lbrke: lbrke,
    	lbrksld: lbrksld,
    	lbrkslu: lbrkslu,
    	Lcaron: Lcaron,
    	lcaron: lcaron,
    	Lcedil: Lcedil,
    	lcedil: lcedil,
    	lceil: lceil,
    	lcub: lcub,
    	Lcy: Lcy,
    	lcy: lcy,
    	ldca: ldca,
    	ldquo: ldquo,
    	ldquor: ldquor,
    	ldrdhar: ldrdhar,
    	ldrushar: ldrushar,
    	ldsh: ldsh,
    	le: le,
    	lE: lE,
    	LeftAngleBracket: LeftAngleBracket,
    	LeftArrowBar: LeftArrowBar,
    	leftarrow: leftarrow,
    	LeftArrow: LeftArrow,
    	Leftarrow: Leftarrow,
    	LeftArrowRightArrow: LeftArrowRightArrow,
    	leftarrowtail: leftarrowtail,
    	LeftCeiling: LeftCeiling,
    	LeftDoubleBracket: LeftDoubleBracket,
    	LeftDownTeeVector: LeftDownTeeVector,
    	LeftDownVectorBar: LeftDownVectorBar,
    	LeftDownVector: LeftDownVector,
    	LeftFloor: LeftFloor,
    	leftharpoondown: leftharpoondown,
    	leftharpoonup: leftharpoonup,
    	leftleftarrows: leftleftarrows,
    	leftrightarrow: leftrightarrow,
    	LeftRightArrow: LeftRightArrow,
    	Leftrightarrow: Leftrightarrow,
    	leftrightarrows: leftrightarrows,
    	leftrightharpoons: leftrightharpoons,
    	leftrightsquigarrow: leftrightsquigarrow,
    	LeftRightVector: LeftRightVector,
    	LeftTeeArrow: LeftTeeArrow,
    	LeftTee: LeftTee,
    	LeftTeeVector: LeftTeeVector,
    	leftthreetimes: leftthreetimes,
    	LeftTriangleBar: LeftTriangleBar,
    	LeftTriangle: LeftTriangle,
    	LeftTriangleEqual: LeftTriangleEqual,
    	LeftUpDownVector: LeftUpDownVector,
    	LeftUpTeeVector: LeftUpTeeVector,
    	LeftUpVectorBar: LeftUpVectorBar,
    	LeftUpVector: LeftUpVector,
    	LeftVectorBar: LeftVectorBar,
    	LeftVector: LeftVector,
    	lEg: lEg,
    	leg: leg,
    	leq: leq,
    	leqq: leqq,
    	leqslant: leqslant,
    	lescc: lescc,
    	les: les,
    	lesdot: lesdot,
    	lesdoto: lesdoto,
    	lesdotor: lesdotor,
    	lesg: lesg,
    	lesges: lesges,
    	lessapprox: lessapprox,
    	lessdot: lessdot,
    	lesseqgtr: lesseqgtr,
    	lesseqqgtr: lesseqqgtr,
    	LessEqualGreater: LessEqualGreater,
    	LessFullEqual: LessFullEqual,
    	LessGreater: LessGreater,
    	lessgtr: lessgtr,
    	LessLess: LessLess,
    	lesssim: lesssim,
    	LessSlantEqual: LessSlantEqual,
    	LessTilde: LessTilde,
    	lfisht: lfisht,
    	lfloor: lfloor,
    	Lfr: Lfr,
    	lfr: lfr,
    	lg: lg,
    	lgE: lgE,
    	lHar: lHar,
    	lhard: lhard,
    	lharu: lharu,
    	lharul: lharul,
    	lhblk: lhblk,
    	LJcy: LJcy,
    	ljcy: ljcy,
    	llarr: llarr,
    	ll: ll,
    	Ll: Ll,
    	llcorner: llcorner,
    	Lleftarrow: Lleftarrow,
    	llhard: llhard,
    	lltri: lltri,
    	Lmidot: Lmidot,
    	lmidot: lmidot,
    	lmoustache: lmoustache,
    	lmoust: lmoust,
    	lnap: lnap,
    	lnapprox: lnapprox,
    	lne: lne,
    	lnE: lnE,
    	lneq: lneq,
    	lneqq: lneqq,
    	lnsim: lnsim,
    	loang: loang,
    	loarr: loarr,
    	lobrk: lobrk,
    	longleftarrow: longleftarrow,
    	LongLeftArrow: LongLeftArrow,
    	Longleftarrow: Longleftarrow,
    	longleftrightarrow: longleftrightarrow,
    	LongLeftRightArrow: LongLeftRightArrow,
    	Longleftrightarrow: Longleftrightarrow,
    	longmapsto: longmapsto,
    	longrightarrow: longrightarrow,
    	LongRightArrow: LongRightArrow,
    	Longrightarrow: Longrightarrow,
    	looparrowleft: looparrowleft,
    	looparrowright: looparrowright,
    	lopar: lopar,
    	Lopf: Lopf,
    	lopf: lopf,
    	loplus: loplus,
    	lotimes: lotimes,
    	lowast: lowast,
    	lowbar: lowbar,
    	LowerLeftArrow: LowerLeftArrow,
    	LowerRightArrow: LowerRightArrow,
    	loz: loz,
    	lozenge: lozenge,
    	lozf: lozf,
    	lpar: lpar,
    	lparlt: lparlt,
    	lrarr: lrarr,
    	lrcorner: lrcorner,
    	lrhar: lrhar,
    	lrhard: lrhard,
    	lrm: lrm,
    	lrtri: lrtri,
    	lsaquo: lsaquo,
    	lscr: lscr,
    	Lscr: Lscr,
    	lsh: lsh,
    	Lsh: Lsh,
    	lsim: lsim,
    	lsime: lsime,
    	lsimg: lsimg,
    	lsqb: lsqb,
    	lsquo: lsquo,
    	lsquor: lsquor,
    	Lstrok: Lstrok,
    	lstrok: lstrok,
    	ltcc: ltcc,
    	ltcir: ltcir,
    	lt: lt,
    	LT: LT,
    	Lt: Lt,
    	ltdot: ltdot,
    	lthree: lthree,
    	ltimes: ltimes,
    	ltlarr: ltlarr,
    	ltquest: ltquest,
    	ltri: ltri,
    	ltrie: ltrie,
    	ltrif: ltrif,
    	ltrPar: ltrPar,
    	lurdshar: lurdshar,
    	luruhar: luruhar,
    	lvertneqq: lvertneqq,
    	lvnE: lvnE,
    	macr: macr,
    	male: male,
    	malt: malt,
    	maltese: maltese,
    	"Map": "⤅",
    	map: map,
    	mapsto: mapsto,
    	mapstodown: mapstodown,
    	mapstoleft: mapstoleft,
    	mapstoup: mapstoup,
    	marker: marker,
    	mcomma: mcomma,
    	Mcy: Mcy,
    	mcy: mcy,
    	mdash: mdash,
    	mDDot: mDDot,
    	measuredangle: measuredangle,
    	MediumSpace: MediumSpace,
    	Mellintrf: Mellintrf,
    	Mfr: Mfr,
    	mfr: mfr,
    	mho: mho,
    	micro: micro,
    	midast: midast,
    	midcir: midcir,
    	mid: mid,
    	middot: middot,
    	minusb: minusb,
    	minus: minus,
    	minusd: minusd,
    	minusdu: minusdu,
    	MinusPlus: MinusPlus,
    	mlcp: mlcp,
    	mldr: mldr,
    	mnplus: mnplus,
    	models: models,
    	Mopf: Mopf,
    	mopf: mopf,
    	mp: mp,
    	mscr: mscr,
    	Mscr: Mscr,
    	mstpos: mstpos,
    	Mu: Mu,
    	mu: mu,
    	multimap: multimap,
    	mumap: mumap,
    	nabla: nabla,
    	Nacute: Nacute,
    	nacute: nacute,
    	nang: nang,
    	nap: nap,
    	napE: napE,
    	napid: napid,
    	napos: napos,
    	napprox: napprox,
    	natural: natural,
    	naturals: naturals,
    	natur: natur,
    	nbsp: nbsp,
    	nbump: nbump,
    	nbumpe: nbumpe,
    	ncap: ncap,
    	Ncaron: Ncaron,
    	ncaron: ncaron,
    	Ncedil: Ncedil,
    	ncedil: ncedil,
    	ncong: ncong,
    	ncongdot: ncongdot,
    	ncup: ncup,
    	Ncy: Ncy,
    	ncy: ncy,
    	ndash: ndash,
    	nearhk: nearhk,
    	nearr: nearr,
    	neArr: neArr,
    	nearrow: nearrow,
    	ne: ne,
    	nedot: nedot,
    	NegativeMediumSpace: NegativeMediumSpace,
    	NegativeThickSpace: NegativeThickSpace,
    	NegativeThinSpace: NegativeThinSpace,
    	NegativeVeryThinSpace: NegativeVeryThinSpace,
    	nequiv: nequiv,
    	nesear: nesear,
    	nesim: nesim,
    	NestedGreaterGreater: NestedGreaterGreater,
    	NestedLessLess: NestedLessLess,
    	NewLine: NewLine,
    	nexist: nexist,
    	nexists: nexists,
    	Nfr: Nfr,
    	nfr: nfr,
    	ngE: ngE,
    	nge: nge,
    	ngeq: ngeq,
    	ngeqq: ngeqq,
    	ngeqslant: ngeqslant,
    	nges: nges,
    	nGg: nGg,
    	ngsim: ngsim,
    	nGt: nGt,
    	ngt: ngt,
    	ngtr: ngtr,
    	nGtv: nGtv,
    	nharr: nharr,
    	nhArr: nhArr,
    	nhpar: nhpar,
    	ni: ni,
    	nis: nis,
    	nisd: nisd,
    	niv: niv,
    	NJcy: NJcy,
    	njcy: njcy,
    	nlarr: nlarr,
    	nlArr: nlArr,
    	nldr: nldr,
    	nlE: nlE,
    	nle: nle,
    	nleftarrow: nleftarrow,
    	nLeftarrow: nLeftarrow,
    	nleftrightarrow: nleftrightarrow,
    	nLeftrightarrow: nLeftrightarrow,
    	nleq: nleq,
    	nleqq: nleqq,
    	nleqslant: nleqslant,
    	nles: nles,
    	nless: nless,
    	nLl: nLl,
    	nlsim: nlsim,
    	nLt: nLt,
    	nlt: nlt,
    	nltri: nltri,
    	nltrie: nltrie,
    	nLtv: nLtv,
    	nmid: nmid,
    	NoBreak: NoBreak,
    	NonBreakingSpace: NonBreakingSpace,
    	nopf: nopf,
    	Nopf: Nopf,
    	Not: Not,
    	not: not,
    	NotCongruent: NotCongruent,
    	NotCupCap: NotCupCap,
    	NotDoubleVerticalBar: NotDoubleVerticalBar,
    	NotElement: NotElement,
    	NotEqual: NotEqual,
    	NotEqualTilde: NotEqualTilde,
    	NotExists: NotExists,
    	NotGreater: NotGreater,
    	NotGreaterEqual: NotGreaterEqual,
    	NotGreaterFullEqual: NotGreaterFullEqual,
    	NotGreaterGreater: NotGreaterGreater,
    	NotGreaterLess: NotGreaterLess,
    	NotGreaterSlantEqual: NotGreaterSlantEqual,
    	NotGreaterTilde: NotGreaterTilde,
    	NotHumpDownHump: NotHumpDownHump,
    	NotHumpEqual: NotHumpEqual,
    	notin: notin,
    	notindot: notindot,
    	notinE: notinE,
    	notinva: notinva,
    	notinvb: notinvb,
    	notinvc: notinvc,
    	NotLeftTriangleBar: NotLeftTriangleBar,
    	NotLeftTriangle: NotLeftTriangle,
    	NotLeftTriangleEqual: NotLeftTriangleEqual,
    	NotLess: NotLess,
    	NotLessEqual: NotLessEqual,
    	NotLessGreater: NotLessGreater,
    	NotLessLess: NotLessLess,
    	NotLessSlantEqual: NotLessSlantEqual,
    	NotLessTilde: NotLessTilde,
    	NotNestedGreaterGreater: NotNestedGreaterGreater,
    	NotNestedLessLess: NotNestedLessLess,
    	notni: notni,
    	notniva: notniva,
    	notnivb: notnivb,
    	notnivc: notnivc,
    	NotPrecedes: NotPrecedes,
    	NotPrecedesEqual: NotPrecedesEqual,
    	NotPrecedesSlantEqual: NotPrecedesSlantEqual,
    	NotReverseElement: NotReverseElement,
    	NotRightTriangleBar: NotRightTriangleBar,
    	NotRightTriangle: NotRightTriangle,
    	NotRightTriangleEqual: NotRightTriangleEqual,
    	NotSquareSubset: NotSquareSubset,
    	NotSquareSubsetEqual: NotSquareSubsetEqual,
    	NotSquareSuperset: NotSquareSuperset,
    	NotSquareSupersetEqual: NotSquareSupersetEqual,
    	NotSubset: NotSubset,
    	NotSubsetEqual: NotSubsetEqual,
    	NotSucceeds: NotSucceeds,
    	NotSucceedsEqual: NotSucceedsEqual,
    	NotSucceedsSlantEqual: NotSucceedsSlantEqual,
    	NotSucceedsTilde: NotSucceedsTilde,
    	NotSuperset: NotSuperset,
    	NotSupersetEqual: NotSupersetEqual,
    	NotTilde: NotTilde,
    	NotTildeEqual: NotTildeEqual,
    	NotTildeFullEqual: NotTildeFullEqual,
    	NotTildeTilde: NotTildeTilde,
    	NotVerticalBar: NotVerticalBar,
    	nparallel: nparallel,
    	npar: npar,
    	nparsl: nparsl,
    	npart: npart,
    	npolint: npolint,
    	npr: npr,
    	nprcue: nprcue,
    	nprec: nprec,
    	npreceq: npreceq,
    	npre: npre,
    	nrarrc: nrarrc,
    	nrarr: nrarr,
    	nrArr: nrArr,
    	nrarrw: nrarrw,
    	nrightarrow: nrightarrow,
    	nRightarrow: nRightarrow,
    	nrtri: nrtri,
    	nrtrie: nrtrie,
    	nsc: nsc,
    	nsccue: nsccue,
    	nsce: nsce,
    	Nscr: Nscr,
    	nscr: nscr,
    	nshortmid: nshortmid,
    	nshortparallel: nshortparallel,
    	nsim: nsim,
    	nsime: nsime,
    	nsimeq: nsimeq,
    	nsmid: nsmid,
    	nspar: nspar,
    	nsqsube: nsqsube,
    	nsqsupe: nsqsupe,
    	nsub: nsub,
    	nsubE: nsubE,
    	nsube: nsube,
    	nsubset: nsubset,
    	nsubseteq: nsubseteq,
    	nsubseteqq: nsubseteqq,
    	nsucc: nsucc,
    	nsucceq: nsucceq,
    	nsup: nsup,
    	nsupE: nsupE,
    	nsupe: nsupe,
    	nsupset: nsupset,
    	nsupseteq: nsupseteq,
    	nsupseteqq: nsupseteqq,
    	ntgl: ntgl,
    	Ntilde: Ntilde,
    	ntilde: ntilde,
    	ntlg: ntlg,
    	ntriangleleft: ntriangleleft,
    	ntrianglelefteq: ntrianglelefteq,
    	ntriangleright: ntriangleright,
    	ntrianglerighteq: ntrianglerighteq,
    	Nu: Nu,
    	nu: nu,
    	num: num,
    	numero: numero,
    	numsp: numsp,
    	nvap: nvap,
    	nvdash: nvdash,
    	nvDash: nvDash,
    	nVdash: nVdash,
    	nVDash: nVDash,
    	nvge: nvge,
    	nvgt: nvgt,
    	nvHarr: nvHarr,
    	nvinfin: nvinfin,
    	nvlArr: nvlArr,
    	nvle: nvle,
    	nvlt: nvlt,
    	nvltrie: nvltrie,
    	nvrArr: nvrArr,
    	nvrtrie: nvrtrie,
    	nvsim: nvsim,
    	nwarhk: nwarhk,
    	nwarr: nwarr,
    	nwArr: nwArr,
    	nwarrow: nwarrow,
    	nwnear: nwnear,
    	Oacute: Oacute,
    	oacute: oacute,
    	oast: oast,
    	Ocirc: Ocirc,
    	ocirc: ocirc,
    	ocir: ocir,
    	Ocy: Ocy,
    	ocy: ocy,
    	odash: odash,
    	Odblac: Odblac,
    	odblac: odblac,
    	odiv: odiv,
    	odot: odot,
    	odsold: odsold,
    	OElig: OElig,
    	oelig: oelig,
    	ofcir: ofcir,
    	Ofr: Ofr,
    	ofr: ofr,
    	ogon: ogon,
    	Ograve: Ograve,
    	ograve: ograve,
    	ogt: ogt,
    	ohbar: ohbar,
    	ohm: ohm,
    	oint: oint,
    	olarr: olarr,
    	olcir: olcir,
    	olcross: olcross,
    	oline: oline,
    	olt: olt,
    	Omacr: Omacr,
    	omacr: omacr,
    	Omega: Omega,
    	omega: omega,
    	Omicron: Omicron,
    	omicron: omicron,
    	omid: omid,
    	ominus: ominus,
    	Oopf: Oopf,
    	oopf: oopf,
    	opar: opar,
    	OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
    	OpenCurlyQuote: OpenCurlyQuote,
    	operp: operp,
    	oplus: oplus,
    	orarr: orarr,
    	Or: Or,
    	or: or,
    	ord: ord,
    	order: order,
    	orderof: orderof,
    	ordf: ordf,
    	ordm: ordm,
    	origof: origof,
    	oror: oror,
    	orslope: orslope,
    	orv: orv,
    	oS: oS,
    	Oscr: Oscr,
    	oscr: oscr,
    	Oslash: Oslash,
    	oslash: oslash,
    	osol: osol,
    	Otilde: Otilde,
    	otilde: otilde,
    	otimesas: otimesas,
    	Otimes: Otimes,
    	otimes: otimes,
    	Ouml: Ouml,
    	ouml: ouml,
    	ovbar: ovbar,
    	OverBar: OverBar,
    	OverBrace: OverBrace,
    	OverBracket: OverBracket,
    	OverParenthesis: OverParenthesis,
    	para: para,
    	parallel: parallel,
    	par: par,
    	parsim: parsim,
    	parsl: parsl,
    	part: part,
    	PartialD: PartialD,
    	Pcy: Pcy,
    	pcy: pcy,
    	percnt: percnt,
    	period: period,
    	permil: permil,
    	perp: perp,
    	pertenk: pertenk,
    	Pfr: Pfr,
    	pfr: pfr,
    	Phi: Phi,
    	phi: phi,
    	phiv: phiv,
    	phmmat: phmmat,
    	phone: phone,
    	Pi: Pi,
    	pi: pi,
    	pitchfork: pitchfork,
    	piv: piv,
    	planck: planck,
    	planckh: planckh,
    	plankv: plankv,
    	plusacir: plusacir,
    	plusb: plusb,
    	pluscir: pluscir,
    	plus: plus,
    	plusdo: plusdo,
    	plusdu: plusdu,
    	pluse: pluse,
    	PlusMinus: PlusMinus,
    	plusmn: plusmn,
    	plussim: plussim,
    	plustwo: plustwo,
    	pm: pm,
    	Poincareplane: Poincareplane,
    	pointint: pointint,
    	popf: popf,
    	Popf: Popf,
    	pound: pound,
    	prap: prap,
    	Pr: Pr,
    	pr: pr,
    	prcue: prcue,
    	precapprox: precapprox,
    	prec: prec,
    	preccurlyeq: preccurlyeq,
    	Precedes: Precedes,
    	PrecedesEqual: PrecedesEqual,
    	PrecedesSlantEqual: PrecedesSlantEqual,
    	PrecedesTilde: PrecedesTilde,
    	preceq: preceq,
    	precnapprox: precnapprox,
    	precneqq: precneqq,
    	precnsim: precnsim,
    	pre: pre,
    	prE: prE,
    	precsim: precsim,
    	prime: prime,
    	Prime: Prime,
    	primes: primes,
    	prnap: prnap,
    	prnE: prnE,
    	prnsim: prnsim,
    	prod: prod,
    	Product: Product,
    	profalar: profalar,
    	profline: profline,
    	profsurf: profsurf,
    	prop: prop,
    	Proportional: Proportional,
    	Proportion: Proportion,
    	propto: propto,
    	prsim: prsim,
    	prurel: prurel,
    	Pscr: Pscr,
    	pscr: pscr,
    	Psi: Psi,
    	psi: psi,
    	puncsp: puncsp,
    	Qfr: Qfr,
    	qfr: qfr,
    	qint: qint,
    	qopf: qopf,
    	Qopf: Qopf,
    	qprime: qprime,
    	Qscr: Qscr,
    	qscr: qscr,
    	quaternions: quaternions,
    	quatint: quatint,
    	quest: quest,
    	questeq: questeq,
    	quot: quot,
    	QUOT: QUOT,
    	rAarr: rAarr,
    	race: race,
    	Racute: Racute,
    	racute: racute,
    	radic: radic,
    	raemptyv: raemptyv,
    	rang: rang,
    	Rang: Rang,
    	rangd: rangd,
    	range: range,
    	rangle: rangle,
    	raquo: raquo,
    	rarrap: rarrap,
    	rarrb: rarrb,
    	rarrbfs: rarrbfs,
    	rarrc: rarrc,
    	rarr: rarr,
    	Rarr: Rarr,
    	rArr: rArr,
    	rarrfs: rarrfs,
    	rarrhk: rarrhk,
    	rarrlp: rarrlp,
    	rarrpl: rarrpl,
    	rarrsim: rarrsim,
    	Rarrtl: Rarrtl,
    	rarrtl: rarrtl,
    	rarrw: rarrw,
    	ratail: ratail,
    	rAtail: rAtail,
    	ratio: ratio,
    	rationals: rationals,
    	rbarr: rbarr,
    	rBarr: rBarr,
    	RBarr: RBarr,
    	rbbrk: rbbrk,
    	rbrace: rbrace,
    	rbrack: rbrack,
    	rbrke: rbrke,
    	rbrksld: rbrksld,
    	rbrkslu: rbrkslu,
    	Rcaron: Rcaron,
    	rcaron: rcaron,
    	Rcedil: Rcedil,
    	rcedil: rcedil,
    	rceil: rceil,
    	rcub: rcub,
    	Rcy: Rcy,
    	rcy: rcy,
    	rdca: rdca,
    	rdldhar: rdldhar,
    	rdquo: rdquo,
    	rdquor: rdquor,
    	rdsh: rdsh,
    	real: real,
    	realine: realine,
    	realpart: realpart,
    	reals: reals,
    	Re: Re,
    	rect: rect,
    	reg: reg,
    	REG: REG,
    	ReverseElement: ReverseElement,
    	ReverseEquilibrium: ReverseEquilibrium,
    	ReverseUpEquilibrium: ReverseUpEquilibrium,
    	rfisht: rfisht,
    	rfloor: rfloor,
    	rfr: rfr,
    	Rfr: Rfr,
    	rHar: rHar,
    	rhard: rhard,
    	rharu: rharu,
    	rharul: rharul,
    	Rho: Rho,
    	rho: rho,
    	rhov: rhov,
    	RightAngleBracket: RightAngleBracket,
    	RightArrowBar: RightArrowBar,
    	rightarrow: rightarrow,
    	RightArrow: RightArrow,
    	Rightarrow: Rightarrow,
    	RightArrowLeftArrow: RightArrowLeftArrow,
    	rightarrowtail: rightarrowtail,
    	RightCeiling: RightCeiling,
    	RightDoubleBracket: RightDoubleBracket,
    	RightDownTeeVector: RightDownTeeVector,
    	RightDownVectorBar: RightDownVectorBar,
    	RightDownVector: RightDownVector,
    	RightFloor: RightFloor,
    	rightharpoondown: rightharpoondown,
    	rightharpoonup: rightharpoonup,
    	rightleftarrows: rightleftarrows,
    	rightleftharpoons: rightleftharpoons,
    	rightrightarrows: rightrightarrows,
    	rightsquigarrow: rightsquigarrow,
    	RightTeeArrow: RightTeeArrow,
    	RightTee: RightTee,
    	RightTeeVector: RightTeeVector,
    	rightthreetimes: rightthreetimes,
    	RightTriangleBar: RightTriangleBar,
    	RightTriangle: RightTriangle,
    	RightTriangleEqual: RightTriangleEqual,
    	RightUpDownVector: RightUpDownVector,
    	RightUpTeeVector: RightUpTeeVector,
    	RightUpVectorBar: RightUpVectorBar,
    	RightUpVector: RightUpVector,
    	RightVectorBar: RightVectorBar,
    	RightVector: RightVector,
    	ring: ring,
    	risingdotseq: risingdotseq,
    	rlarr: rlarr,
    	rlhar: rlhar,
    	rlm: rlm,
    	rmoustache: rmoustache,
    	rmoust: rmoust,
    	rnmid: rnmid,
    	roang: roang,
    	roarr: roarr,
    	robrk: robrk,
    	ropar: ropar,
    	ropf: ropf,
    	Ropf: Ropf,
    	roplus: roplus,
    	rotimes: rotimes,
    	RoundImplies: RoundImplies,
    	rpar: rpar,
    	rpargt: rpargt,
    	rppolint: rppolint,
    	rrarr: rrarr,
    	Rrightarrow: Rrightarrow,
    	rsaquo: rsaquo,
    	rscr: rscr,
    	Rscr: Rscr,
    	rsh: rsh,
    	Rsh: Rsh,
    	rsqb: rsqb,
    	rsquo: rsquo,
    	rsquor: rsquor,
    	rthree: rthree,
    	rtimes: rtimes,
    	rtri: rtri,
    	rtrie: rtrie,
    	rtrif: rtrif,
    	rtriltri: rtriltri,
    	RuleDelayed: RuleDelayed,
    	ruluhar: ruluhar,
    	rx: rx,
    	Sacute: Sacute,
    	sacute: sacute,
    	sbquo: sbquo,
    	scap: scap,
    	Scaron: Scaron,
    	scaron: scaron,
    	Sc: Sc,
    	sc: sc,
    	sccue: sccue,
    	sce: sce,
    	scE: scE,
    	Scedil: Scedil,
    	scedil: scedil,
    	Scirc: Scirc,
    	scirc: scirc,
    	scnap: scnap,
    	scnE: scnE,
    	scnsim: scnsim,
    	scpolint: scpolint,
    	scsim: scsim,
    	Scy: Scy,
    	scy: scy,
    	sdotb: sdotb,
    	sdot: sdot,
    	sdote: sdote,
    	searhk: searhk,
    	searr: searr,
    	seArr: seArr,
    	searrow: searrow,
    	sect: sect,
    	semi: semi,
    	seswar: seswar,
    	setminus: setminus,
    	setmn: setmn,
    	sext: sext,
    	Sfr: Sfr,
    	sfr: sfr,
    	sfrown: sfrown,
    	sharp: sharp,
    	SHCHcy: SHCHcy,
    	shchcy: shchcy,
    	SHcy: SHcy,
    	shcy: shcy,
    	ShortDownArrow: ShortDownArrow,
    	ShortLeftArrow: ShortLeftArrow,
    	shortmid: shortmid,
    	shortparallel: shortparallel,
    	ShortRightArrow: ShortRightArrow,
    	ShortUpArrow: ShortUpArrow,
    	shy: shy,
    	Sigma: Sigma,
    	sigma: sigma,
    	sigmaf: sigmaf,
    	sigmav: sigmav,
    	sim: sim,
    	simdot: simdot,
    	sime: sime,
    	simeq: simeq,
    	simg: simg,
    	simgE: simgE,
    	siml: siml,
    	simlE: simlE,
    	simne: simne,
    	simplus: simplus,
    	simrarr: simrarr,
    	slarr: slarr,
    	SmallCircle: SmallCircle,
    	smallsetminus: smallsetminus,
    	smashp: smashp,
    	smeparsl: smeparsl,
    	smid: smid,
    	smile: smile,
    	smt: smt,
    	smte: smte,
    	smtes: smtes,
    	SOFTcy: SOFTcy,
    	softcy: softcy,
    	solbar: solbar,
    	solb: solb,
    	sol: sol,
    	Sopf: Sopf,
    	sopf: sopf,
    	spades: spades,
    	spadesuit: spadesuit,
    	spar: spar,
    	sqcap: sqcap,
    	sqcaps: sqcaps,
    	sqcup: sqcup,
    	sqcups: sqcups,
    	Sqrt: Sqrt,
    	sqsub: sqsub,
    	sqsube: sqsube,
    	sqsubset: sqsubset,
    	sqsubseteq: sqsubseteq,
    	sqsup: sqsup,
    	sqsupe: sqsupe,
    	sqsupset: sqsupset,
    	sqsupseteq: sqsupseteq,
    	square: square,
    	Square: Square,
    	SquareIntersection: SquareIntersection,
    	SquareSubset: SquareSubset,
    	SquareSubsetEqual: SquareSubsetEqual,
    	SquareSuperset: SquareSuperset,
    	SquareSupersetEqual: SquareSupersetEqual,
    	SquareUnion: SquareUnion,
    	squarf: squarf,
    	squ: squ,
    	squf: squf,
    	srarr: srarr,
    	Sscr: Sscr,
    	sscr: sscr,
    	ssetmn: ssetmn,
    	ssmile: ssmile,
    	sstarf: sstarf,
    	Star: Star,
    	star: star,
    	starf: starf,
    	straightepsilon: straightepsilon,
    	straightphi: straightphi,
    	strns: strns,
    	sub: sub,
    	Sub: Sub,
    	subdot: subdot,
    	subE: subE,
    	sube: sube,
    	subedot: subedot,
    	submult: submult,
    	subnE: subnE,
    	subne: subne,
    	subplus: subplus,
    	subrarr: subrarr,
    	subset: subset,
    	Subset: Subset,
    	subseteq: subseteq,
    	subseteqq: subseteqq,
    	SubsetEqual: SubsetEqual,
    	subsetneq: subsetneq,
    	subsetneqq: subsetneqq,
    	subsim: subsim,
    	subsub: subsub,
    	subsup: subsup,
    	succapprox: succapprox,
    	succ: succ,
    	succcurlyeq: succcurlyeq,
    	Succeeds: Succeeds,
    	SucceedsEqual: SucceedsEqual,
    	SucceedsSlantEqual: SucceedsSlantEqual,
    	SucceedsTilde: SucceedsTilde,
    	succeq: succeq,
    	succnapprox: succnapprox,
    	succneqq: succneqq,
    	succnsim: succnsim,
    	succsim: succsim,
    	SuchThat: SuchThat,
    	sum: sum,
    	Sum: Sum,
    	sung: sung,
    	sup1: sup1,
    	sup2: sup2,
    	sup3: sup3,
    	sup: sup,
    	Sup: Sup,
    	supdot: supdot,
    	supdsub: supdsub,
    	supE: supE,
    	supe: supe,
    	supedot: supedot,
    	Superset: Superset,
    	SupersetEqual: SupersetEqual,
    	suphsol: suphsol,
    	suphsub: suphsub,
    	suplarr: suplarr,
    	supmult: supmult,
    	supnE: supnE,
    	supne: supne,
    	supplus: supplus,
    	supset: supset,
    	Supset: Supset,
    	supseteq: supseteq,
    	supseteqq: supseteqq,
    	supsetneq: supsetneq,
    	supsetneqq: supsetneqq,
    	supsim: supsim,
    	supsub: supsub,
    	supsup: supsup,
    	swarhk: swarhk,
    	swarr: swarr,
    	swArr: swArr,
    	swarrow: swarrow,
    	swnwar: swnwar,
    	szlig: szlig,
    	Tab: Tab,
    	target: target,
    	Tau: Tau,
    	tau: tau,
    	tbrk: tbrk,
    	Tcaron: Tcaron,
    	tcaron: tcaron,
    	Tcedil: Tcedil,
    	tcedil: tcedil,
    	Tcy: Tcy,
    	tcy: tcy,
    	tdot: tdot,
    	telrec: telrec,
    	Tfr: Tfr,
    	tfr: tfr,
    	there4: there4,
    	therefore: therefore,
    	Therefore: Therefore,
    	Theta: Theta,
    	theta: theta,
    	thetasym: thetasym,
    	thetav: thetav,
    	thickapprox: thickapprox,
    	thicksim: thicksim,
    	ThickSpace: ThickSpace,
    	ThinSpace: ThinSpace,
    	thinsp: thinsp,
    	thkap: thkap,
    	thksim: thksim,
    	THORN: THORN,
    	thorn: thorn,
    	tilde: tilde,
    	Tilde: Tilde,
    	TildeEqual: TildeEqual,
    	TildeFullEqual: TildeFullEqual,
    	TildeTilde: TildeTilde,
    	timesbar: timesbar,
    	timesb: timesb,
    	times: times,
    	timesd: timesd,
    	tint: tint,
    	toea: toea,
    	topbot: topbot,
    	topcir: topcir,
    	top: top,
    	Topf: Topf,
    	topf: topf,
    	topfork: topfork,
    	tosa: tosa,
    	tprime: tprime,
    	trade: trade,
    	TRADE: TRADE,
    	triangle: triangle,
    	triangledown: triangledown,
    	triangleleft: triangleleft,
    	trianglelefteq: trianglelefteq,
    	triangleq: triangleq,
    	triangleright: triangleright,
    	trianglerighteq: trianglerighteq,
    	tridot: tridot,
    	trie: trie,
    	triminus: triminus,
    	TripleDot: TripleDot,
    	triplus: triplus,
    	trisb: trisb,
    	tritime: tritime,
    	trpezium: trpezium,
    	Tscr: Tscr,
    	tscr: tscr,
    	TScy: TScy,
    	tscy: tscy,
    	TSHcy: TSHcy,
    	tshcy: tshcy,
    	Tstrok: Tstrok,
    	tstrok: tstrok,
    	twixt: twixt,
    	twoheadleftarrow: twoheadleftarrow,
    	twoheadrightarrow: twoheadrightarrow,
    	Uacute: Uacute,
    	uacute: uacute,
    	uarr: uarr,
    	Uarr: Uarr,
    	uArr: uArr,
    	Uarrocir: Uarrocir,
    	Ubrcy: Ubrcy,
    	ubrcy: ubrcy,
    	Ubreve: Ubreve,
    	ubreve: ubreve,
    	Ucirc: Ucirc,
    	ucirc: ucirc,
    	Ucy: Ucy,
    	ucy: ucy,
    	udarr: udarr,
    	Udblac: Udblac,
    	udblac: udblac,
    	udhar: udhar,
    	ufisht: ufisht,
    	Ufr: Ufr,
    	ufr: ufr,
    	Ugrave: Ugrave,
    	ugrave: ugrave,
    	uHar: uHar,
    	uharl: uharl,
    	uharr: uharr,
    	uhblk: uhblk,
    	ulcorn: ulcorn,
    	ulcorner: ulcorner,
    	ulcrop: ulcrop,
    	ultri: ultri,
    	Umacr: Umacr,
    	umacr: umacr,
    	uml: uml,
    	UnderBar: UnderBar,
    	UnderBrace: UnderBrace,
    	UnderBracket: UnderBracket,
    	UnderParenthesis: UnderParenthesis,
    	Union: Union,
    	UnionPlus: UnionPlus,
    	Uogon: Uogon,
    	uogon: uogon,
    	Uopf: Uopf,
    	uopf: uopf,
    	UpArrowBar: UpArrowBar,
    	uparrow: uparrow,
    	UpArrow: UpArrow,
    	Uparrow: Uparrow,
    	UpArrowDownArrow: UpArrowDownArrow,
    	updownarrow: updownarrow,
    	UpDownArrow: UpDownArrow,
    	Updownarrow: Updownarrow,
    	UpEquilibrium: UpEquilibrium,
    	upharpoonleft: upharpoonleft,
    	upharpoonright: upharpoonright,
    	uplus: uplus,
    	UpperLeftArrow: UpperLeftArrow,
    	UpperRightArrow: UpperRightArrow,
    	upsi: upsi,
    	Upsi: Upsi,
    	upsih: upsih,
    	Upsilon: Upsilon,
    	upsilon: upsilon,
    	UpTeeArrow: UpTeeArrow,
    	UpTee: UpTee,
    	upuparrows: upuparrows,
    	urcorn: urcorn,
    	urcorner: urcorner,
    	urcrop: urcrop,
    	Uring: Uring,
    	uring: uring,
    	urtri: urtri,
    	Uscr: Uscr,
    	uscr: uscr,
    	utdot: utdot,
    	Utilde: Utilde,
    	utilde: utilde,
    	utri: utri,
    	utrif: utrif,
    	uuarr: uuarr,
    	Uuml: Uuml,
    	uuml: uuml,
    	uwangle: uwangle,
    	vangrt: vangrt,
    	varepsilon: varepsilon,
    	varkappa: varkappa,
    	varnothing: varnothing,
    	varphi: varphi,
    	varpi: varpi,
    	varpropto: varpropto,
    	varr: varr,
    	vArr: vArr,
    	varrho: varrho,
    	varsigma: varsigma,
    	varsubsetneq: varsubsetneq,
    	varsubsetneqq: varsubsetneqq,
    	varsupsetneq: varsupsetneq,
    	varsupsetneqq: varsupsetneqq,
    	vartheta: vartheta,
    	vartriangleleft: vartriangleleft,
    	vartriangleright: vartriangleright,
    	vBar: vBar,
    	Vbar: Vbar,
    	vBarv: vBarv,
    	Vcy: Vcy,
    	vcy: vcy,
    	vdash: vdash,
    	vDash: vDash,
    	Vdash: Vdash,
    	VDash: VDash,
    	Vdashl: Vdashl,
    	veebar: veebar,
    	vee: vee,
    	Vee: Vee,
    	veeeq: veeeq,
    	vellip: vellip,
    	verbar: verbar,
    	Verbar: Verbar,
    	vert: vert,
    	Vert: Vert,
    	VerticalBar: VerticalBar,
    	VerticalLine: VerticalLine,
    	VerticalSeparator: VerticalSeparator,
    	VerticalTilde: VerticalTilde,
    	VeryThinSpace: VeryThinSpace,
    	Vfr: Vfr,
    	vfr: vfr,
    	vltri: vltri,
    	vnsub: vnsub,
    	vnsup: vnsup,
    	Vopf: Vopf,
    	vopf: vopf,
    	vprop: vprop,
    	vrtri: vrtri,
    	Vscr: Vscr,
    	vscr: vscr,
    	vsubnE: vsubnE,
    	vsubne: vsubne,
    	vsupnE: vsupnE,
    	vsupne: vsupne,
    	Vvdash: Vvdash,
    	vzigzag: vzigzag,
    	Wcirc: Wcirc,
    	wcirc: wcirc,
    	wedbar: wedbar,
    	wedge: wedge,
    	Wedge: Wedge,
    	wedgeq: wedgeq,
    	weierp: weierp,
    	Wfr: Wfr,
    	wfr: wfr,
    	Wopf: Wopf,
    	wopf: wopf,
    	wp: wp,
    	wr: wr,
    	wreath: wreath,
    	Wscr: Wscr,
    	wscr: wscr,
    	xcap: xcap,
    	xcirc: xcirc,
    	xcup: xcup,
    	xdtri: xdtri,
    	Xfr: Xfr,
    	xfr: xfr,
    	xharr: xharr,
    	xhArr: xhArr,
    	Xi: Xi,
    	xi: xi,
    	xlarr: xlarr,
    	xlArr: xlArr,
    	xmap: xmap,
    	xnis: xnis,
    	xodot: xodot,
    	Xopf: Xopf,
    	xopf: xopf,
    	xoplus: xoplus,
    	xotime: xotime,
    	xrarr: xrarr,
    	xrArr: xrArr,
    	Xscr: Xscr,
    	xscr: xscr,
    	xsqcup: xsqcup,
    	xuplus: xuplus,
    	xutri: xutri,
    	xvee: xvee,
    	xwedge: xwedge,
    	Yacute: Yacute,
    	yacute: yacute,
    	YAcy: YAcy,
    	yacy: yacy,
    	Ycirc: Ycirc,
    	ycirc: ycirc,
    	Ycy: Ycy,
    	ycy: ycy,
    	yen: yen,
    	Yfr: Yfr,
    	yfr: yfr,
    	YIcy: YIcy,
    	yicy: yicy,
    	Yopf: Yopf,
    	yopf: yopf,
    	Yscr: Yscr,
    	yscr: yscr,
    	YUcy: YUcy,
    	yucy: yucy,
    	yuml: yuml,
    	Yuml: Yuml,
    	Zacute: Zacute,
    	zacute: zacute,
    	Zcaron: Zcaron,
    	zcaron: zcaron,
    	Zcy: Zcy,
    	zcy: zcy,
    	Zdot: Zdot,
    	zdot: zdot,
    	zeetrf: zeetrf,
    	ZeroWidthSpace: ZeroWidthSpace,
    	Zeta: Zeta,
    	zeta: zeta,
    	zfr: zfr,
    	Zfr: Zfr,
    	ZHcy: ZHcy,
    	zhcy: zhcy,
    	zigrarr: zigrarr,
    	zopf: zopf,
    	Zopf: Zopf,
    	Zscr: Zscr,
    	zscr: zscr,
    	zwj: zwj,
    	zwnj: zwnj
    };

    var entities$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Aacute: Aacute,
        aacute: aacute,
        Abreve: Abreve,
        abreve: abreve,
        ac: ac,
        acd: acd,
        acE: acE,
        Acirc: Acirc,
        acirc: acirc,
        acute: acute,
        Acy: Acy,
        acy: acy,
        AElig: AElig,
        aelig: aelig,
        af: af,
        Afr: Afr,
        afr: afr,
        Agrave: Agrave,
        agrave: agrave,
        alefsym: alefsym,
        aleph: aleph,
        Alpha: Alpha,
        alpha: alpha,
        Amacr: Amacr,
        amacr: amacr,
        amalg: amalg,
        amp: amp,
        AMP: AMP,
        andand: andand,
        And: And,
        and: and,
        andd: andd,
        andslope: andslope,
        andv: andv,
        ang: ang,
        ange: ange,
        angle: angle,
        angmsdaa: angmsdaa,
        angmsdab: angmsdab,
        angmsdac: angmsdac,
        angmsdad: angmsdad,
        angmsdae: angmsdae,
        angmsdaf: angmsdaf,
        angmsdag: angmsdag,
        angmsdah: angmsdah,
        angmsd: angmsd,
        angrt: angrt,
        angrtvb: angrtvb,
        angrtvbd: angrtvbd,
        angsph: angsph,
        angst: angst,
        angzarr: angzarr,
        Aogon: Aogon,
        aogon: aogon,
        Aopf: Aopf,
        aopf: aopf,
        apacir: apacir,
        ap: ap,
        apE: apE,
        ape: ape,
        apid: apid,
        apos: apos,
        ApplyFunction: ApplyFunction,
        approx: approx,
        approxeq: approxeq,
        Aring: Aring,
        aring: aring,
        Ascr: Ascr,
        ascr: ascr,
        Assign: Assign,
        ast: ast,
        asymp: asymp,
        asympeq: asympeq,
        Atilde: Atilde,
        atilde: atilde,
        Auml: Auml,
        auml: auml,
        awconint: awconint,
        awint: awint,
        backcong: backcong,
        backepsilon: backepsilon,
        backprime: backprime,
        backsim: backsim,
        backsimeq: backsimeq,
        Backslash: Backslash,
        Barv: Barv,
        barvee: barvee,
        barwed: barwed,
        Barwed: Barwed,
        barwedge: barwedge,
        bbrk: bbrk,
        bbrktbrk: bbrktbrk,
        bcong: bcong,
        Bcy: Bcy,
        bcy: bcy,
        bdquo: bdquo,
        becaus: becaus,
        because: because,
        Because: Because,
        bemptyv: bemptyv,
        bepsi: bepsi,
        bernou: bernou,
        Bernoullis: Bernoullis,
        Beta: Beta,
        beta: beta,
        beth: beth,
        between: between,
        Bfr: Bfr,
        bfr: bfr,
        bigcap: bigcap,
        bigcirc: bigcirc,
        bigcup: bigcup,
        bigodot: bigodot,
        bigoplus: bigoplus,
        bigotimes: bigotimes,
        bigsqcup: bigsqcup,
        bigstar: bigstar,
        bigtriangledown: bigtriangledown,
        bigtriangleup: bigtriangleup,
        biguplus: biguplus,
        bigvee: bigvee,
        bigwedge: bigwedge,
        bkarow: bkarow,
        blacklozenge: blacklozenge,
        blacksquare: blacksquare,
        blacktriangle: blacktriangle,
        blacktriangledown: blacktriangledown,
        blacktriangleleft: blacktriangleleft,
        blacktriangleright: blacktriangleright,
        blank: blank,
        blk12: blk12,
        blk14: blk14,
        blk34: blk34,
        block: block,
        bne: bne,
        bnequiv: bnequiv,
        bNot: bNot,
        bnot: bnot,
        Bopf: Bopf,
        bopf: bopf,
        bot: bot,
        bottom: bottom,
        bowtie: bowtie,
        boxbox: boxbox,
        boxdl: boxdl,
        boxdL: boxdL,
        boxDl: boxDl,
        boxDL: boxDL,
        boxdr: boxdr,
        boxdR: boxdR,
        boxDr: boxDr,
        boxDR: boxDR,
        boxh: boxh,
        boxH: boxH,
        boxhd: boxhd,
        boxHd: boxHd,
        boxhD: boxhD,
        boxHD: boxHD,
        boxhu: boxhu,
        boxHu: boxHu,
        boxhU: boxhU,
        boxHU: boxHU,
        boxminus: boxminus,
        boxplus: boxplus,
        boxtimes: boxtimes,
        boxul: boxul,
        boxuL: boxuL,
        boxUl: boxUl,
        boxUL: boxUL,
        boxur: boxur,
        boxuR: boxuR,
        boxUr: boxUr,
        boxUR: boxUR,
        boxv: boxv,
        boxV: boxV,
        boxvh: boxvh,
        boxvH: boxvH,
        boxVh: boxVh,
        boxVH: boxVH,
        boxvl: boxvl,
        boxvL: boxvL,
        boxVl: boxVl,
        boxVL: boxVL,
        boxvr: boxvr,
        boxvR: boxvR,
        boxVr: boxVr,
        boxVR: boxVR,
        bprime: bprime,
        breve: breve,
        Breve: Breve,
        brvbar: brvbar,
        bscr: bscr,
        Bscr: Bscr,
        bsemi: bsemi,
        bsim: bsim,
        bsime: bsime,
        bsolb: bsolb,
        bsol: bsol,
        bsolhsub: bsolhsub,
        bull: bull,
        bullet: bullet,
        bump: bump,
        bumpE: bumpE,
        bumpe: bumpe,
        Bumpeq: Bumpeq,
        bumpeq: bumpeq,
        Cacute: Cacute,
        cacute: cacute,
        capand: capand,
        capbrcup: capbrcup,
        capcap: capcap,
        cap: cap,
        Cap: Cap,
        capcup: capcup,
        capdot: capdot,
        CapitalDifferentialD: CapitalDifferentialD,
        caps: caps,
        caret: caret,
        caron: caron,
        Cayleys: Cayleys,
        ccaps: ccaps,
        Ccaron: Ccaron,
        ccaron: ccaron,
        Ccedil: Ccedil,
        ccedil: ccedil,
        Ccirc: Ccirc,
        ccirc: ccirc,
        Cconint: Cconint,
        ccups: ccups,
        ccupssm: ccupssm,
        Cdot: Cdot,
        cdot: cdot,
        cedil: cedil,
        Cedilla: Cedilla,
        cemptyv: cemptyv,
        cent: cent,
        centerdot: centerdot,
        CenterDot: CenterDot,
        cfr: cfr,
        Cfr: Cfr,
        CHcy: CHcy,
        chcy: chcy,
        check: check,
        checkmark: checkmark,
        Chi: Chi,
        chi: chi,
        circ: circ,
        circeq: circeq,
        circlearrowleft: circlearrowleft,
        circlearrowright: circlearrowright,
        circledast: circledast,
        circledcirc: circledcirc,
        circleddash: circleddash,
        CircleDot: CircleDot,
        circledR: circledR,
        circledS: circledS,
        CircleMinus: CircleMinus,
        CirclePlus: CirclePlus,
        CircleTimes: CircleTimes,
        cir: cir,
        cirE: cirE,
        cire: cire,
        cirfnint: cirfnint,
        cirmid: cirmid,
        cirscir: cirscir,
        ClockwiseContourIntegral: ClockwiseContourIntegral,
        CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
        CloseCurlyQuote: CloseCurlyQuote,
        clubs: clubs,
        clubsuit: clubsuit,
        colon: colon,
        Colon: Colon,
        Colone: Colone,
        colone: colone,
        coloneq: coloneq,
        comma: comma,
        commat: commat,
        comp: comp,
        compfn: compfn,
        complement: complement,
        complexes: complexes,
        cong: cong,
        congdot: congdot,
        Congruent: Congruent,
        conint: conint,
        Conint: Conint,
        ContourIntegral: ContourIntegral,
        copf: copf,
        Copf: Copf,
        coprod: coprod,
        Coproduct: Coproduct,
        copy: copy,
        COPY: COPY,
        copysr: copysr,
        CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
        crarr: crarr,
        cross: cross,
        Cross: Cross,
        Cscr: Cscr,
        cscr: cscr,
        csub: csub,
        csube: csube,
        csup: csup,
        csupe: csupe,
        ctdot: ctdot,
        cudarrl: cudarrl,
        cudarrr: cudarrr,
        cuepr: cuepr,
        cuesc: cuesc,
        cularr: cularr,
        cularrp: cularrp,
        cupbrcap: cupbrcap,
        cupcap: cupcap,
        CupCap: CupCap,
        cup: cup,
        Cup: Cup,
        cupcup: cupcup,
        cupdot: cupdot,
        cupor: cupor,
        cups: cups,
        curarr: curarr,
        curarrm: curarrm,
        curlyeqprec: curlyeqprec,
        curlyeqsucc: curlyeqsucc,
        curlyvee: curlyvee,
        curlywedge: curlywedge,
        curren: curren,
        curvearrowleft: curvearrowleft,
        curvearrowright: curvearrowright,
        cuvee: cuvee,
        cuwed: cuwed,
        cwconint: cwconint,
        cwint: cwint,
        cylcty: cylcty,
        dagger: dagger,
        Dagger: Dagger,
        daleth: daleth,
        darr: darr,
        Darr: Darr,
        dArr: dArr,
        dash: dash,
        Dashv: Dashv,
        dashv: dashv,
        dbkarow: dbkarow,
        dblac: dblac,
        Dcaron: Dcaron,
        dcaron: dcaron,
        Dcy: Dcy,
        dcy: dcy,
        ddagger: ddagger,
        ddarr: ddarr,
        DD: DD,
        dd: dd,
        DDotrahd: DDotrahd,
        ddotseq: ddotseq,
        deg: deg,
        Del: Del,
        Delta: Delta,
        delta: delta,
        demptyv: demptyv,
        dfisht: dfisht,
        Dfr: Dfr,
        dfr: dfr,
        dHar: dHar,
        dharl: dharl,
        dharr: dharr,
        DiacriticalAcute: DiacriticalAcute,
        DiacriticalDot: DiacriticalDot,
        DiacriticalDoubleAcute: DiacriticalDoubleAcute,
        DiacriticalGrave: DiacriticalGrave,
        DiacriticalTilde: DiacriticalTilde,
        diam: diam,
        diamond: diamond,
        Diamond: Diamond,
        diamondsuit: diamondsuit,
        diams: diams,
        die: die,
        DifferentialD: DifferentialD,
        digamma: digamma,
        disin: disin,
        div: div,
        divide: divide,
        divideontimes: divideontimes,
        divonx: divonx,
        DJcy: DJcy,
        djcy: djcy,
        dlcorn: dlcorn,
        dlcrop: dlcrop,
        dollar: dollar,
        Dopf: Dopf,
        dopf: dopf,
        Dot: Dot,
        dot: dot,
        DotDot: DotDot,
        doteq: doteq,
        doteqdot: doteqdot,
        DotEqual: DotEqual,
        dotminus: dotminus,
        dotplus: dotplus,
        dotsquare: dotsquare,
        doublebarwedge: doublebarwedge,
        DoubleContourIntegral: DoubleContourIntegral,
        DoubleDot: DoubleDot,
        DoubleDownArrow: DoubleDownArrow,
        DoubleLeftArrow: DoubleLeftArrow,
        DoubleLeftRightArrow: DoubleLeftRightArrow,
        DoubleLeftTee: DoubleLeftTee,
        DoubleLongLeftArrow: DoubleLongLeftArrow,
        DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
        DoubleLongRightArrow: DoubleLongRightArrow,
        DoubleRightArrow: DoubleRightArrow,
        DoubleRightTee: DoubleRightTee,
        DoubleUpArrow: DoubleUpArrow,
        DoubleUpDownArrow: DoubleUpDownArrow,
        DoubleVerticalBar: DoubleVerticalBar,
        DownArrowBar: DownArrowBar,
        downarrow: downarrow,
        DownArrow: DownArrow,
        Downarrow: Downarrow,
        DownArrowUpArrow: DownArrowUpArrow,
        DownBreve: DownBreve,
        downdownarrows: downdownarrows,
        downharpoonleft: downharpoonleft,
        downharpoonright: downharpoonright,
        DownLeftRightVector: DownLeftRightVector,
        DownLeftTeeVector: DownLeftTeeVector,
        DownLeftVectorBar: DownLeftVectorBar,
        DownLeftVector: DownLeftVector,
        DownRightTeeVector: DownRightTeeVector,
        DownRightVectorBar: DownRightVectorBar,
        DownRightVector: DownRightVector,
        DownTeeArrow: DownTeeArrow,
        DownTee: DownTee,
        drbkarow: drbkarow,
        drcorn: drcorn,
        drcrop: drcrop,
        Dscr: Dscr,
        dscr: dscr,
        DScy: DScy,
        dscy: dscy,
        dsol: dsol,
        Dstrok: Dstrok,
        dstrok: dstrok,
        dtdot: dtdot,
        dtri: dtri,
        dtrif: dtrif,
        duarr: duarr,
        duhar: duhar,
        dwangle: dwangle,
        DZcy: DZcy,
        dzcy: dzcy,
        dzigrarr: dzigrarr,
        Eacute: Eacute,
        eacute: eacute,
        easter: easter,
        Ecaron: Ecaron,
        ecaron: ecaron,
        Ecirc: Ecirc,
        ecirc: ecirc,
        ecir: ecir,
        ecolon: ecolon,
        Ecy: Ecy,
        ecy: ecy,
        eDDot: eDDot,
        Edot: Edot,
        edot: edot,
        eDot: eDot,
        ee: ee,
        efDot: efDot,
        Efr: Efr,
        efr: efr,
        eg: eg,
        Egrave: Egrave,
        egrave: egrave,
        egs: egs,
        egsdot: egsdot,
        el: el,
        Element: Element,
        elinters: elinters,
        ell: ell,
        els: els,
        elsdot: elsdot,
        Emacr: Emacr,
        emacr: emacr,
        empty: empty,
        emptyset: emptyset,
        EmptySmallSquare: EmptySmallSquare,
        emptyv: emptyv,
        EmptyVerySmallSquare: EmptyVerySmallSquare,
        emsp13: emsp13,
        emsp14: emsp14,
        emsp: emsp,
        ENG: ENG,
        eng: eng,
        ensp: ensp,
        Eogon: Eogon,
        eogon: eogon,
        Eopf: Eopf,
        eopf: eopf,
        epar: epar,
        eparsl: eparsl,
        eplus: eplus,
        epsi: epsi,
        Epsilon: Epsilon,
        epsilon: epsilon,
        epsiv: epsiv,
        eqcirc: eqcirc,
        eqcolon: eqcolon,
        eqsim: eqsim,
        eqslantgtr: eqslantgtr,
        eqslantless: eqslantless,
        Equal: Equal,
        equals: equals,
        EqualTilde: EqualTilde,
        equest: equest,
        Equilibrium: Equilibrium,
        equiv: equiv,
        equivDD: equivDD,
        eqvparsl: eqvparsl,
        erarr: erarr,
        erDot: erDot,
        escr: escr,
        Escr: Escr,
        esdot: esdot,
        Esim: Esim,
        esim: esim,
        Eta: Eta,
        eta: eta,
        ETH: ETH,
        eth: eth,
        Euml: Euml,
        euml: euml,
        euro: euro,
        excl: excl,
        exist: exist,
        Exists: Exists,
        expectation: expectation,
        exponentiale: exponentiale,
        ExponentialE: ExponentialE,
        fallingdotseq: fallingdotseq,
        Fcy: Fcy,
        fcy: fcy,
        female: female,
        ffilig: ffilig,
        fflig: fflig,
        ffllig: ffllig,
        Ffr: Ffr,
        ffr: ffr,
        filig: filig,
        FilledSmallSquare: FilledSmallSquare,
        FilledVerySmallSquare: FilledVerySmallSquare,
        fjlig: fjlig,
        flat: flat,
        fllig: fllig,
        fltns: fltns,
        fnof: fnof,
        Fopf: Fopf,
        fopf: fopf,
        forall: forall,
        ForAll: ForAll,
        fork: fork,
        forkv: forkv,
        Fouriertrf: Fouriertrf,
        fpartint: fpartint,
        frac12: frac12,
        frac13: frac13,
        frac14: frac14,
        frac15: frac15,
        frac16: frac16,
        frac18: frac18,
        frac23: frac23,
        frac25: frac25,
        frac34: frac34,
        frac35: frac35,
        frac38: frac38,
        frac45: frac45,
        frac56: frac56,
        frac58: frac58,
        frac78: frac78,
        frasl: frasl,
        frown: frown,
        fscr: fscr,
        Fscr: Fscr,
        gacute: gacute,
        Gamma: Gamma,
        gamma: gamma,
        Gammad: Gammad,
        gammad: gammad,
        gap: gap,
        Gbreve: Gbreve,
        gbreve: gbreve,
        Gcedil: Gcedil,
        Gcirc: Gcirc,
        gcirc: gcirc,
        Gcy: Gcy,
        gcy: gcy,
        Gdot: Gdot,
        gdot: gdot,
        ge: ge,
        gE: gE,
        gEl: gEl,
        gel: gel,
        geq: geq,
        geqq: geqq,
        geqslant: geqslant,
        gescc: gescc,
        ges: ges,
        gesdot: gesdot,
        gesdoto: gesdoto,
        gesdotol: gesdotol,
        gesl: gesl,
        gesles: gesles,
        Gfr: Gfr,
        gfr: gfr,
        gg: gg,
        Gg: Gg,
        ggg: ggg,
        gimel: gimel,
        GJcy: GJcy,
        gjcy: gjcy,
        gla: gla,
        gl: gl,
        glE: glE,
        glj: glj,
        gnap: gnap,
        gnapprox: gnapprox,
        gne: gne,
        gnE: gnE,
        gneq: gneq,
        gneqq: gneqq,
        gnsim: gnsim,
        Gopf: Gopf,
        gopf: gopf,
        grave: grave,
        GreaterEqual: GreaterEqual,
        GreaterEqualLess: GreaterEqualLess,
        GreaterFullEqual: GreaterFullEqual,
        GreaterGreater: GreaterGreater,
        GreaterLess: GreaterLess,
        GreaterSlantEqual: GreaterSlantEqual,
        GreaterTilde: GreaterTilde,
        Gscr: Gscr,
        gscr: gscr,
        gsim: gsim,
        gsime: gsime,
        gsiml: gsiml,
        gtcc: gtcc,
        gtcir: gtcir,
        gt: gt,
        GT: GT,
        Gt: Gt,
        gtdot: gtdot,
        gtlPar: gtlPar,
        gtquest: gtquest,
        gtrapprox: gtrapprox,
        gtrarr: gtrarr,
        gtrdot: gtrdot,
        gtreqless: gtreqless,
        gtreqqless: gtreqqless,
        gtrless: gtrless,
        gtrsim: gtrsim,
        gvertneqq: gvertneqq,
        gvnE: gvnE,
        Hacek: Hacek,
        hairsp: hairsp,
        half: half,
        hamilt: hamilt,
        HARDcy: HARDcy,
        hardcy: hardcy,
        harrcir: harrcir,
        harr: harr,
        hArr: hArr,
        harrw: harrw,
        Hat: Hat,
        hbar: hbar,
        Hcirc: Hcirc,
        hcirc: hcirc,
        hearts: hearts,
        heartsuit: heartsuit,
        hellip: hellip,
        hercon: hercon,
        hfr: hfr,
        Hfr: Hfr,
        HilbertSpace: HilbertSpace,
        hksearow: hksearow,
        hkswarow: hkswarow,
        hoarr: hoarr,
        homtht: homtht,
        hookleftarrow: hookleftarrow,
        hookrightarrow: hookrightarrow,
        hopf: hopf,
        Hopf: Hopf,
        horbar: horbar,
        HorizontalLine: HorizontalLine,
        hscr: hscr,
        Hscr: Hscr,
        hslash: hslash,
        Hstrok: Hstrok,
        hstrok: hstrok,
        HumpDownHump: HumpDownHump,
        HumpEqual: HumpEqual,
        hybull: hybull,
        hyphen: hyphen,
        Iacute: Iacute,
        iacute: iacute,
        ic: ic,
        Icirc: Icirc,
        icirc: icirc,
        Icy: Icy,
        icy: icy,
        Idot: Idot,
        IEcy: IEcy,
        iecy: iecy,
        iexcl: iexcl,
        iff: iff,
        ifr: ifr,
        Ifr: Ifr,
        Igrave: Igrave,
        igrave: igrave,
        ii: ii,
        iiiint: iiiint,
        iiint: iiint,
        iinfin: iinfin,
        iiota: iiota,
        IJlig: IJlig,
        ijlig: ijlig,
        Imacr: Imacr,
        imacr: imacr,
        image: image,
        ImaginaryI: ImaginaryI,
        imagline: imagline,
        imagpart: imagpart,
        imath: imath,
        Im: Im,
        imof: imof,
        imped: imped,
        Implies: Implies,
        incare: incare,
        infin: infin,
        infintie: infintie,
        inodot: inodot,
        intcal: intcal,
        int: int,
        Int: Int,
        integers: integers,
        Integral: Integral,
        intercal: intercal,
        Intersection: Intersection,
        intlarhk: intlarhk,
        intprod: intprod,
        InvisibleComma: InvisibleComma,
        InvisibleTimes: InvisibleTimes,
        IOcy: IOcy,
        iocy: iocy,
        Iogon: Iogon,
        iogon: iogon,
        Iopf: Iopf,
        iopf: iopf,
        Iota: Iota,
        iota: iota,
        iprod: iprod,
        iquest: iquest,
        iscr: iscr,
        Iscr: Iscr,
        isin: isin,
        isindot: isindot,
        isinE: isinE,
        isins: isins,
        isinsv: isinsv,
        isinv: isinv,
        it: it,
        Itilde: Itilde,
        itilde: itilde,
        Iukcy: Iukcy,
        iukcy: iukcy,
        Iuml: Iuml,
        iuml: iuml,
        Jcirc: Jcirc,
        jcirc: jcirc,
        Jcy: Jcy,
        jcy: jcy,
        Jfr: Jfr,
        jfr: jfr,
        jmath: jmath,
        Jopf: Jopf,
        jopf: jopf,
        Jscr: Jscr,
        jscr: jscr,
        Jsercy: Jsercy,
        jsercy: jsercy,
        Jukcy: Jukcy,
        jukcy: jukcy,
        Kappa: Kappa,
        kappa: kappa,
        kappav: kappav,
        Kcedil: Kcedil,
        kcedil: kcedil,
        Kcy: Kcy,
        kcy: kcy,
        Kfr: Kfr,
        kfr: kfr,
        kgreen: kgreen,
        KHcy: KHcy,
        khcy: khcy,
        KJcy: KJcy,
        kjcy: kjcy,
        Kopf: Kopf,
        kopf: kopf,
        Kscr: Kscr,
        kscr: kscr,
        lAarr: lAarr,
        Lacute: Lacute,
        lacute: lacute,
        laemptyv: laemptyv,
        lagran: lagran,
        Lambda: Lambda,
        lambda: lambda,
        lang: lang,
        Lang: Lang,
        langd: langd,
        langle: langle,
        lap: lap,
        Laplacetrf: Laplacetrf,
        laquo: laquo,
        larrb: larrb,
        larrbfs: larrbfs,
        larr: larr,
        Larr: Larr,
        lArr: lArr,
        larrfs: larrfs,
        larrhk: larrhk,
        larrlp: larrlp,
        larrpl: larrpl,
        larrsim: larrsim,
        larrtl: larrtl,
        latail: latail,
        lAtail: lAtail,
        lat: lat,
        late: late,
        lates: lates,
        lbarr: lbarr,
        lBarr: lBarr,
        lbbrk: lbbrk,
        lbrace: lbrace,
        lbrack: lbrack,
        lbrke: lbrke,
        lbrksld: lbrksld,
        lbrkslu: lbrkslu,
        Lcaron: Lcaron,
        lcaron: lcaron,
        Lcedil: Lcedil,
        lcedil: lcedil,
        lceil: lceil,
        lcub: lcub,
        Lcy: Lcy,
        lcy: lcy,
        ldca: ldca,
        ldquo: ldquo,
        ldquor: ldquor,
        ldrdhar: ldrdhar,
        ldrushar: ldrushar,
        ldsh: ldsh,
        le: le,
        lE: lE,
        LeftAngleBracket: LeftAngleBracket,
        LeftArrowBar: LeftArrowBar,
        leftarrow: leftarrow,
        LeftArrow: LeftArrow,
        Leftarrow: Leftarrow,
        LeftArrowRightArrow: LeftArrowRightArrow,
        leftarrowtail: leftarrowtail,
        LeftCeiling: LeftCeiling,
        LeftDoubleBracket: LeftDoubleBracket,
        LeftDownTeeVector: LeftDownTeeVector,
        LeftDownVectorBar: LeftDownVectorBar,
        LeftDownVector: LeftDownVector,
        LeftFloor: LeftFloor,
        leftharpoondown: leftharpoondown,
        leftharpoonup: leftharpoonup,
        leftleftarrows: leftleftarrows,
        leftrightarrow: leftrightarrow,
        LeftRightArrow: LeftRightArrow,
        Leftrightarrow: Leftrightarrow,
        leftrightarrows: leftrightarrows,
        leftrightharpoons: leftrightharpoons,
        leftrightsquigarrow: leftrightsquigarrow,
        LeftRightVector: LeftRightVector,
        LeftTeeArrow: LeftTeeArrow,
        LeftTee: LeftTee,
        LeftTeeVector: LeftTeeVector,
        leftthreetimes: leftthreetimes,
        LeftTriangleBar: LeftTriangleBar,
        LeftTriangle: LeftTriangle,
        LeftTriangleEqual: LeftTriangleEqual,
        LeftUpDownVector: LeftUpDownVector,
        LeftUpTeeVector: LeftUpTeeVector,
        LeftUpVectorBar: LeftUpVectorBar,
        LeftUpVector: LeftUpVector,
        LeftVectorBar: LeftVectorBar,
        LeftVector: LeftVector,
        lEg: lEg,
        leg: leg,
        leq: leq,
        leqq: leqq,
        leqslant: leqslant,
        lescc: lescc,
        les: les,
        lesdot: lesdot,
        lesdoto: lesdoto,
        lesdotor: lesdotor,
        lesg: lesg,
        lesges: lesges,
        lessapprox: lessapprox,
        lessdot: lessdot,
        lesseqgtr: lesseqgtr,
        lesseqqgtr: lesseqqgtr,
        LessEqualGreater: LessEqualGreater,
        LessFullEqual: LessFullEqual,
        LessGreater: LessGreater,
        lessgtr: lessgtr,
        LessLess: LessLess,
        lesssim: lesssim,
        LessSlantEqual: LessSlantEqual,
        LessTilde: LessTilde,
        lfisht: lfisht,
        lfloor: lfloor,
        Lfr: Lfr,
        lfr: lfr,
        lg: lg,
        lgE: lgE,
        lHar: lHar,
        lhard: lhard,
        lharu: lharu,
        lharul: lharul,
        lhblk: lhblk,
        LJcy: LJcy,
        ljcy: ljcy,
        llarr: llarr,
        ll: ll,
        Ll: Ll,
        llcorner: llcorner,
        Lleftarrow: Lleftarrow,
        llhard: llhard,
        lltri: lltri,
        Lmidot: Lmidot,
        lmidot: lmidot,
        lmoustache: lmoustache,
        lmoust: lmoust,
        lnap: lnap,
        lnapprox: lnapprox,
        lne: lne,
        lnE: lnE,
        lneq: lneq,
        lneqq: lneqq,
        lnsim: lnsim,
        loang: loang,
        loarr: loarr,
        lobrk: lobrk,
        longleftarrow: longleftarrow,
        LongLeftArrow: LongLeftArrow,
        Longleftarrow: Longleftarrow,
        longleftrightarrow: longleftrightarrow,
        LongLeftRightArrow: LongLeftRightArrow,
        Longleftrightarrow: Longleftrightarrow,
        longmapsto: longmapsto,
        longrightarrow: longrightarrow,
        LongRightArrow: LongRightArrow,
        Longrightarrow: Longrightarrow,
        looparrowleft: looparrowleft,
        looparrowright: looparrowright,
        lopar: lopar,
        Lopf: Lopf,
        lopf: lopf,
        loplus: loplus,
        lotimes: lotimes,
        lowast: lowast,
        lowbar: lowbar,
        LowerLeftArrow: LowerLeftArrow,
        LowerRightArrow: LowerRightArrow,
        loz: loz,
        lozenge: lozenge,
        lozf: lozf,
        lpar: lpar,
        lparlt: lparlt,
        lrarr: lrarr,
        lrcorner: lrcorner,
        lrhar: lrhar,
        lrhard: lrhard,
        lrm: lrm,
        lrtri: lrtri,
        lsaquo: lsaquo,
        lscr: lscr,
        Lscr: Lscr,
        lsh: lsh,
        Lsh: Lsh,
        lsim: lsim,
        lsime: lsime,
        lsimg: lsimg,
        lsqb: lsqb,
        lsquo: lsquo,
        lsquor: lsquor,
        Lstrok: Lstrok,
        lstrok: lstrok,
        ltcc: ltcc,
        ltcir: ltcir,
        lt: lt,
        LT: LT,
        Lt: Lt,
        ltdot: ltdot,
        lthree: lthree,
        ltimes: ltimes,
        ltlarr: ltlarr,
        ltquest: ltquest,
        ltri: ltri,
        ltrie: ltrie,
        ltrif: ltrif,
        ltrPar: ltrPar,
        lurdshar: lurdshar,
        luruhar: luruhar,
        lvertneqq: lvertneqq,
        lvnE: lvnE,
        macr: macr,
        male: male,
        malt: malt,
        maltese: maltese,
        map: map,
        mapsto: mapsto,
        mapstodown: mapstodown,
        mapstoleft: mapstoleft,
        mapstoup: mapstoup,
        marker: marker,
        mcomma: mcomma,
        Mcy: Mcy,
        mcy: mcy,
        mdash: mdash,
        mDDot: mDDot,
        measuredangle: measuredangle,
        MediumSpace: MediumSpace,
        Mellintrf: Mellintrf,
        Mfr: Mfr,
        mfr: mfr,
        mho: mho,
        micro: micro,
        midast: midast,
        midcir: midcir,
        mid: mid,
        middot: middot,
        minusb: minusb,
        minus: minus,
        minusd: minusd,
        minusdu: minusdu,
        MinusPlus: MinusPlus,
        mlcp: mlcp,
        mldr: mldr,
        mnplus: mnplus,
        models: models,
        Mopf: Mopf,
        mopf: mopf,
        mp: mp,
        mscr: mscr,
        Mscr: Mscr,
        mstpos: mstpos,
        Mu: Mu,
        mu: mu,
        multimap: multimap,
        mumap: mumap,
        nabla: nabla,
        Nacute: Nacute,
        nacute: nacute,
        nang: nang,
        nap: nap,
        napE: napE,
        napid: napid,
        napos: napos,
        napprox: napprox,
        natural: natural,
        naturals: naturals,
        natur: natur,
        nbsp: nbsp,
        nbump: nbump,
        nbumpe: nbumpe,
        ncap: ncap,
        Ncaron: Ncaron,
        ncaron: ncaron,
        Ncedil: Ncedil,
        ncedil: ncedil,
        ncong: ncong,
        ncongdot: ncongdot,
        ncup: ncup,
        Ncy: Ncy,
        ncy: ncy,
        ndash: ndash,
        nearhk: nearhk,
        nearr: nearr,
        neArr: neArr,
        nearrow: nearrow,
        ne: ne,
        nedot: nedot,
        NegativeMediumSpace: NegativeMediumSpace,
        NegativeThickSpace: NegativeThickSpace,
        NegativeThinSpace: NegativeThinSpace,
        NegativeVeryThinSpace: NegativeVeryThinSpace,
        nequiv: nequiv,
        nesear: nesear,
        nesim: nesim,
        NestedGreaterGreater: NestedGreaterGreater,
        NestedLessLess: NestedLessLess,
        NewLine: NewLine,
        nexist: nexist,
        nexists: nexists,
        Nfr: Nfr,
        nfr: nfr,
        ngE: ngE,
        nge: nge,
        ngeq: ngeq,
        ngeqq: ngeqq,
        ngeqslant: ngeqslant,
        nges: nges,
        nGg: nGg,
        ngsim: ngsim,
        nGt: nGt,
        ngt: ngt,
        ngtr: ngtr,
        nGtv: nGtv,
        nharr: nharr,
        nhArr: nhArr,
        nhpar: nhpar,
        ni: ni,
        nis: nis,
        nisd: nisd,
        niv: niv,
        NJcy: NJcy,
        njcy: njcy,
        nlarr: nlarr,
        nlArr: nlArr,
        nldr: nldr,
        nlE: nlE,
        nle: nle,
        nleftarrow: nleftarrow,
        nLeftarrow: nLeftarrow,
        nleftrightarrow: nleftrightarrow,
        nLeftrightarrow: nLeftrightarrow,
        nleq: nleq,
        nleqq: nleqq,
        nleqslant: nleqslant,
        nles: nles,
        nless: nless,
        nLl: nLl,
        nlsim: nlsim,
        nLt: nLt,
        nlt: nlt,
        nltri: nltri,
        nltrie: nltrie,
        nLtv: nLtv,
        nmid: nmid,
        NoBreak: NoBreak,
        NonBreakingSpace: NonBreakingSpace,
        nopf: nopf,
        Nopf: Nopf,
        Not: Not,
        not: not,
        NotCongruent: NotCongruent,
        NotCupCap: NotCupCap,
        NotDoubleVerticalBar: NotDoubleVerticalBar,
        NotElement: NotElement,
        NotEqual: NotEqual,
        NotEqualTilde: NotEqualTilde,
        NotExists: NotExists,
        NotGreater: NotGreater,
        NotGreaterEqual: NotGreaterEqual,
        NotGreaterFullEqual: NotGreaterFullEqual,
        NotGreaterGreater: NotGreaterGreater,
        NotGreaterLess: NotGreaterLess,
        NotGreaterSlantEqual: NotGreaterSlantEqual,
        NotGreaterTilde: NotGreaterTilde,
        NotHumpDownHump: NotHumpDownHump,
        NotHumpEqual: NotHumpEqual,
        notin: notin,
        notindot: notindot,
        notinE: notinE,
        notinva: notinva,
        notinvb: notinvb,
        notinvc: notinvc,
        NotLeftTriangleBar: NotLeftTriangleBar,
        NotLeftTriangle: NotLeftTriangle,
        NotLeftTriangleEqual: NotLeftTriangleEqual,
        NotLess: NotLess,
        NotLessEqual: NotLessEqual,
        NotLessGreater: NotLessGreater,
        NotLessLess: NotLessLess,
        NotLessSlantEqual: NotLessSlantEqual,
        NotLessTilde: NotLessTilde,
        NotNestedGreaterGreater: NotNestedGreaterGreater,
        NotNestedLessLess: NotNestedLessLess,
        notni: notni,
        notniva: notniva,
        notnivb: notnivb,
        notnivc: notnivc,
        NotPrecedes: NotPrecedes,
        NotPrecedesEqual: NotPrecedesEqual,
        NotPrecedesSlantEqual: NotPrecedesSlantEqual,
        NotReverseElement: NotReverseElement,
        NotRightTriangleBar: NotRightTriangleBar,
        NotRightTriangle: NotRightTriangle,
        NotRightTriangleEqual: NotRightTriangleEqual,
        NotSquareSubset: NotSquareSubset,
        NotSquareSubsetEqual: NotSquareSubsetEqual,
        NotSquareSuperset: NotSquareSuperset,
        NotSquareSupersetEqual: NotSquareSupersetEqual,
        NotSubset: NotSubset,
        NotSubsetEqual: NotSubsetEqual,
        NotSucceeds: NotSucceeds,
        NotSucceedsEqual: NotSucceedsEqual,
        NotSucceedsSlantEqual: NotSucceedsSlantEqual,
        NotSucceedsTilde: NotSucceedsTilde,
        NotSuperset: NotSuperset,
        NotSupersetEqual: NotSupersetEqual,
        NotTilde: NotTilde,
        NotTildeEqual: NotTildeEqual,
        NotTildeFullEqual: NotTildeFullEqual,
        NotTildeTilde: NotTildeTilde,
        NotVerticalBar: NotVerticalBar,
        nparallel: nparallel,
        npar: npar,
        nparsl: nparsl,
        npart: npart,
        npolint: npolint,
        npr: npr,
        nprcue: nprcue,
        nprec: nprec,
        npreceq: npreceq,
        npre: npre,
        nrarrc: nrarrc,
        nrarr: nrarr,
        nrArr: nrArr,
        nrarrw: nrarrw,
        nrightarrow: nrightarrow,
        nRightarrow: nRightarrow,
        nrtri: nrtri,
        nrtrie: nrtrie,
        nsc: nsc,
        nsccue: nsccue,
        nsce: nsce,
        Nscr: Nscr,
        nscr: nscr,
        nshortmid: nshortmid,
        nshortparallel: nshortparallel,
        nsim: nsim,
        nsime: nsime,
        nsimeq: nsimeq,
        nsmid: nsmid,
        nspar: nspar,
        nsqsube: nsqsube,
        nsqsupe: nsqsupe,
        nsub: nsub,
        nsubE: nsubE,
        nsube: nsube,
        nsubset: nsubset,
        nsubseteq: nsubseteq,
        nsubseteqq: nsubseteqq,
        nsucc: nsucc,
        nsucceq: nsucceq,
        nsup: nsup,
        nsupE: nsupE,
        nsupe: nsupe,
        nsupset: nsupset,
        nsupseteq: nsupseteq,
        nsupseteqq: nsupseteqq,
        ntgl: ntgl,
        Ntilde: Ntilde,
        ntilde: ntilde,
        ntlg: ntlg,
        ntriangleleft: ntriangleleft,
        ntrianglelefteq: ntrianglelefteq,
        ntriangleright: ntriangleright,
        ntrianglerighteq: ntrianglerighteq,
        Nu: Nu,
        nu: nu,
        num: num,
        numero: numero,
        numsp: numsp,
        nvap: nvap,
        nvdash: nvdash,
        nvDash: nvDash,
        nVdash: nVdash,
        nVDash: nVDash,
        nvge: nvge,
        nvgt: nvgt,
        nvHarr: nvHarr,
        nvinfin: nvinfin,
        nvlArr: nvlArr,
        nvle: nvle,
        nvlt: nvlt,
        nvltrie: nvltrie,
        nvrArr: nvrArr,
        nvrtrie: nvrtrie,
        nvsim: nvsim,
        nwarhk: nwarhk,
        nwarr: nwarr,
        nwArr: nwArr,
        nwarrow: nwarrow,
        nwnear: nwnear,
        Oacute: Oacute,
        oacute: oacute,
        oast: oast,
        Ocirc: Ocirc,
        ocirc: ocirc,
        ocir: ocir,
        Ocy: Ocy,
        ocy: ocy,
        odash: odash,
        Odblac: Odblac,
        odblac: odblac,
        odiv: odiv,
        odot: odot,
        odsold: odsold,
        OElig: OElig,
        oelig: oelig,
        ofcir: ofcir,
        Ofr: Ofr,
        ofr: ofr,
        ogon: ogon,
        Ograve: Ograve,
        ograve: ograve,
        ogt: ogt,
        ohbar: ohbar,
        ohm: ohm,
        oint: oint,
        olarr: olarr,
        olcir: olcir,
        olcross: olcross,
        oline: oline,
        olt: olt,
        Omacr: Omacr,
        omacr: omacr,
        Omega: Omega,
        omega: omega,
        Omicron: Omicron,
        omicron: omicron,
        omid: omid,
        ominus: ominus,
        Oopf: Oopf,
        oopf: oopf,
        opar: opar,
        OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
        OpenCurlyQuote: OpenCurlyQuote,
        operp: operp,
        oplus: oplus,
        orarr: orarr,
        Or: Or,
        or: or,
        ord: ord,
        order: order,
        orderof: orderof,
        ordf: ordf,
        ordm: ordm,
        origof: origof,
        oror: oror,
        orslope: orslope,
        orv: orv,
        oS: oS,
        Oscr: Oscr,
        oscr: oscr,
        Oslash: Oslash,
        oslash: oslash,
        osol: osol,
        Otilde: Otilde,
        otilde: otilde,
        otimesas: otimesas,
        Otimes: Otimes,
        otimes: otimes,
        Ouml: Ouml,
        ouml: ouml,
        ovbar: ovbar,
        OverBar: OverBar,
        OverBrace: OverBrace,
        OverBracket: OverBracket,
        OverParenthesis: OverParenthesis,
        para: para,
        parallel: parallel,
        par: par,
        parsim: parsim,
        parsl: parsl,
        part: part,
        PartialD: PartialD,
        Pcy: Pcy,
        pcy: pcy,
        percnt: percnt,
        period: period,
        permil: permil,
        perp: perp,
        pertenk: pertenk,
        Pfr: Pfr,
        pfr: pfr,
        Phi: Phi,
        phi: phi,
        phiv: phiv,
        phmmat: phmmat,
        phone: phone,
        Pi: Pi,
        pi: pi,
        pitchfork: pitchfork,
        piv: piv,
        planck: planck,
        planckh: planckh,
        plankv: plankv,
        plusacir: plusacir,
        plusb: plusb,
        pluscir: pluscir,
        plus: plus,
        plusdo: plusdo,
        plusdu: plusdu,
        pluse: pluse,
        PlusMinus: PlusMinus,
        plusmn: plusmn,
        plussim: plussim,
        plustwo: plustwo,
        pm: pm,
        Poincareplane: Poincareplane,
        pointint: pointint,
        popf: popf,
        Popf: Popf,
        pound: pound,
        prap: prap,
        Pr: Pr,
        pr: pr,
        prcue: prcue,
        precapprox: precapprox,
        prec: prec,
        preccurlyeq: preccurlyeq,
        Precedes: Precedes,
        PrecedesEqual: PrecedesEqual,
        PrecedesSlantEqual: PrecedesSlantEqual,
        PrecedesTilde: PrecedesTilde,
        preceq: preceq,
        precnapprox: precnapprox,
        precneqq: precneqq,
        precnsim: precnsim,
        pre: pre,
        prE: prE,
        precsim: precsim,
        prime: prime,
        Prime: Prime,
        primes: primes,
        prnap: prnap,
        prnE: prnE,
        prnsim: prnsim,
        prod: prod,
        Product: Product,
        profalar: profalar,
        profline: profline,
        profsurf: profsurf,
        prop: prop,
        Proportional: Proportional,
        Proportion: Proportion,
        propto: propto,
        prsim: prsim,
        prurel: prurel,
        Pscr: Pscr,
        pscr: pscr,
        Psi: Psi,
        psi: psi,
        puncsp: puncsp,
        Qfr: Qfr,
        qfr: qfr,
        qint: qint,
        qopf: qopf,
        Qopf: Qopf,
        qprime: qprime,
        Qscr: Qscr,
        qscr: qscr,
        quaternions: quaternions,
        quatint: quatint,
        quest: quest,
        questeq: questeq,
        quot: quot,
        QUOT: QUOT,
        rAarr: rAarr,
        race: race,
        Racute: Racute,
        racute: racute,
        radic: radic,
        raemptyv: raemptyv,
        rang: rang,
        Rang: Rang,
        rangd: rangd,
        range: range,
        rangle: rangle,
        raquo: raquo,
        rarrap: rarrap,
        rarrb: rarrb,
        rarrbfs: rarrbfs,
        rarrc: rarrc,
        rarr: rarr,
        Rarr: Rarr,
        rArr: rArr,
        rarrfs: rarrfs,
        rarrhk: rarrhk,
        rarrlp: rarrlp,
        rarrpl: rarrpl,
        rarrsim: rarrsim,
        Rarrtl: Rarrtl,
        rarrtl: rarrtl,
        rarrw: rarrw,
        ratail: ratail,
        rAtail: rAtail,
        ratio: ratio,
        rationals: rationals,
        rbarr: rbarr,
        rBarr: rBarr,
        RBarr: RBarr,
        rbbrk: rbbrk,
        rbrace: rbrace,
        rbrack: rbrack,
        rbrke: rbrke,
        rbrksld: rbrksld,
        rbrkslu: rbrkslu,
        Rcaron: Rcaron,
        rcaron: rcaron,
        Rcedil: Rcedil,
        rcedil: rcedil,
        rceil: rceil,
        rcub: rcub,
        Rcy: Rcy,
        rcy: rcy,
        rdca: rdca,
        rdldhar: rdldhar,
        rdquo: rdquo,
        rdquor: rdquor,
        rdsh: rdsh,
        real: real,
        realine: realine,
        realpart: realpart,
        reals: reals,
        Re: Re,
        rect: rect,
        reg: reg,
        REG: REG,
        ReverseElement: ReverseElement,
        ReverseEquilibrium: ReverseEquilibrium,
        ReverseUpEquilibrium: ReverseUpEquilibrium,
        rfisht: rfisht,
        rfloor: rfloor,
        rfr: rfr,
        Rfr: Rfr,
        rHar: rHar,
        rhard: rhard,
        rharu: rharu,
        rharul: rharul,
        Rho: Rho,
        rho: rho,
        rhov: rhov,
        RightAngleBracket: RightAngleBracket,
        RightArrowBar: RightArrowBar,
        rightarrow: rightarrow,
        RightArrow: RightArrow,
        Rightarrow: Rightarrow,
        RightArrowLeftArrow: RightArrowLeftArrow,
        rightarrowtail: rightarrowtail,
        RightCeiling: RightCeiling,
        RightDoubleBracket: RightDoubleBracket,
        RightDownTeeVector: RightDownTeeVector,
        RightDownVectorBar: RightDownVectorBar,
        RightDownVector: RightDownVector,
        RightFloor: RightFloor,
        rightharpoondown: rightharpoondown,
        rightharpoonup: rightharpoonup,
        rightleftarrows: rightleftarrows,
        rightleftharpoons: rightleftharpoons,
        rightrightarrows: rightrightarrows,
        rightsquigarrow: rightsquigarrow,
        RightTeeArrow: RightTeeArrow,
        RightTee: RightTee,
        RightTeeVector: RightTeeVector,
        rightthreetimes: rightthreetimes,
        RightTriangleBar: RightTriangleBar,
        RightTriangle: RightTriangle,
        RightTriangleEqual: RightTriangleEqual,
        RightUpDownVector: RightUpDownVector,
        RightUpTeeVector: RightUpTeeVector,
        RightUpVectorBar: RightUpVectorBar,
        RightUpVector: RightUpVector,
        RightVectorBar: RightVectorBar,
        RightVector: RightVector,
        ring: ring,
        risingdotseq: risingdotseq,
        rlarr: rlarr,
        rlhar: rlhar,
        rlm: rlm,
        rmoustache: rmoustache,
        rmoust: rmoust,
        rnmid: rnmid,
        roang: roang,
        roarr: roarr,
        robrk: robrk,
        ropar: ropar,
        ropf: ropf,
        Ropf: Ropf,
        roplus: roplus,
        rotimes: rotimes,
        RoundImplies: RoundImplies,
        rpar: rpar,
        rpargt: rpargt,
        rppolint: rppolint,
        rrarr: rrarr,
        Rrightarrow: Rrightarrow,
        rsaquo: rsaquo,
        rscr: rscr,
        Rscr: Rscr,
        rsh: rsh,
        Rsh: Rsh,
        rsqb: rsqb,
        rsquo: rsquo,
        rsquor: rsquor,
        rthree: rthree,
        rtimes: rtimes,
        rtri: rtri,
        rtrie: rtrie,
        rtrif: rtrif,
        rtriltri: rtriltri,
        RuleDelayed: RuleDelayed,
        ruluhar: ruluhar,
        rx: rx,
        Sacute: Sacute,
        sacute: sacute,
        sbquo: sbquo,
        scap: scap,
        Scaron: Scaron,
        scaron: scaron,
        Sc: Sc,
        sc: sc,
        sccue: sccue,
        sce: sce,
        scE: scE,
        Scedil: Scedil,
        scedil: scedil,
        Scirc: Scirc,
        scirc: scirc,
        scnap: scnap,
        scnE: scnE,
        scnsim: scnsim,
        scpolint: scpolint,
        scsim: scsim,
        Scy: Scy,
        scy: scy,
        sdotb: sdotb,
        sdot: sdot,
        sdote: sdote,
        searhk: searhk,
        searr: searr,
        seArr: seArr,
        searrow: searrow,
        sect: sect,
        semi: semi,
        seswar: seswar,
        setminus: setminus,
        setmn: setmn,
        sext: sext,
        Sfr: Sfr,
        sfr: sfr,
        sfrown: sfrown,
        sharp: sharp,
        SHCHcy: SHCHcy,
        shchcy: shchcy,
        SHcy: SHcy,
        shcy: shcy,
        ShortDownArrow: ShortDownArrow,
        ShortLeftArrow: ShortLeftArrow,
        shortmid: shortmid,
        shortparallel: shortparallel,
        ShortRightArrow: ShortRightArrow,
        ShortUpArrow: ShortUpArrow,
        shy: shy,
        Sigma: Sigma,
        sigma: sigma,
        sigmaf: sigmaf,
        sigmav: sigmav,
        sim: sim,
        simdot: simdot,
        sime: sime,
        simeq: simeq,
        simg: simg,
        simgE: simgE,
        siml: siml,
        simlE: simlE,
        simne: simne,
        simplus: simplus,
        simrarr: simrarr,
        slarr: slarr,
        SmallCircle: SmallCircle,
        smallsetminus: smallsetminus,
        smashp: smashp,
        smeparsl: smeparsl,
        smid: smid,
        smile: smile,
        smt: smt,
        smte: smte,
        smtes: smtes,
        SOFTcy: SOFTcy,
        softcy: softcy,
        solbar: solbar,
        solb: solb,
        sol: sol,
        Sopf: Sopf,
        sopf: sopf,
        spades: spades,
        spadesuit: spadesuit,
        spar: spar,
        sqcap: sqcap,
        sqcaps: sqcaps,
        sqcup: sqcup,
        sqcups: sqcups,
        Sqrt: Sqrt,
        sqsub: sqsub,
        sqsube: sqsube,
        sqsubset: sqsubset,
        sqsubseteq: sqsubseteq,
        sqsup: sqsup,
        sqsupe: sqsupe,
        sqsupset: sqsupset,
        sqsupseteq: sqsupseteq,
        square: square,
        Square: Square,
        SquareIntersection: SquareIntersection,
        SquareSubset: SquareSubset,
        SquareSubsetEqual: SquareSubsetEqual,
        SquareSuperset: SquareSuperset,
        SquareSupersetEqual: SquareSupersetEqual,
        SquareUnion: SquareUnion,
        squarf: squarf,
        squ: squ,
        squf: squf,
        srarr: srarr,
        Sscr: Sscr,
        sscr: sscr,
        ssetmn: ssetmn,
        ssmile: ssmile,
        sstarf: sstarf,
        Star: Star,
        star: star,
        starf: starf,
        straightepsilon: straightepsilon,
        straightphi: straightphi,
        strns: strns,
        sub: sub,
        Sub: Sub,
        subdot: subdot,
        subE: subE,
        sube: sube,
        subedot: subedot,
        submult: submult,
        subnE: subnE,
        subne: subne,
        subplus: subplus,
        subrarr: subrarr,
        subset: subset,
        Subset: Subset,
        subseteq: subseteq,
        subseteqq: subseteqq,
        SubsetEqual: SubsetEqual,
        subsetneq: subsetneq,
        subsetneqq: subsetneqq,
        subsim: subsim,
        subsub: subsub,
        subsup: subsup,
        succapprox: succapprox,
        succ: succ,
        succcurlyeq: succcurlyeq,
        Succeeds: Succeeds,
        SucceedsEqual: SucceedsEqual,
        SucceedsSlantEqual: SucceedsSlantEqual,
        SucceedsTilde: SucceedsTilde,
        succeq: succeq,
        succnapprox: succnapprox,
        succneqq: succneqq,
        succnsim: succnsim,
        succsim: succsim,
        SuchThat: SuchThat,
        sum: sum,
        Sum: Sum,
        sung: sung,
        sup1: sup1,
        sup2: sup2,
        sup3: sup3,
        sup: sup,
        Sup: Sup,
        supdot: supdot,
        supdsub: supdsub,
        supE: supE,
        supe: supe,
        supedot: supedot,
        Superset: Superset,
        SupersetEqual: SupersetEqual,
        suphsol: suphsol,
        suphsub: suphsub,
        suplarr: suplarr,
        supmult: supmult,
        supnE: supnE,
        supne: supne,
        supplus: supplus,
        supset: supset,
        Supset: Supset,
        supseteq: supseteq,
        supseteqq: supseteqq,
        supsetneq: supsetneq,
        supsetneqq: supsetneqq,
        supsim: supsim,
        supsub: supsub,
        supsup: supsup,
        swarhk: swarhk,
        swarr: swarr,
        swArr: swArr,
        swarrow: swarrow,
        swnwar: swnwar,
        szlig: szlig,
        Tab: Tab,
        target: target,
        Tau: Tau,
        tau: tau,
        tbrk: tbrk,
        Tcaron: Tcaron,
        tcaron: tcaron,
        Tcedil: Tcedil,
        tcedil: tcedil,
        Tcy: Tcy,
        tcy: tcy,
        tdot: tdot,
        telrec: telrec,
        Tfr: Tfr,
        tfr: tfr,
        there4: there4,
        therefore: therefore,
        Therefore: Therefore,
        Theta: Theta,
        theta: theta,
        thetasym: thetasym,
        thetav: thetav,
        thickapprox: thickapprox,
        thicksim: thicksim,
        ThickSpace: ThickSpace,
        ThinSpace: ThinSpace,
        thinsp: thinsp,
        thkap: thkap,
        thksim: thksim,
        THORN: THORN,
        thorn: thorn,
        tilde: tilde,
        Tilde: Tilde,
        TildeEqual: TildeEqual,
        TildeFullEqual: TildeFullEqual,
        TildeTilde: TildeTilde,
        timesbar: timesbar,
        timesb: timesb,
        times: times,
        timesd: timesd,
        tint: tint,
        toea: toea,
        topbot: topbot,
        topcir: topcir,
        top: top,
        Topf: Topf,
        topf: topf,
        topfork: topfork,
        tosa: tosa,
        tprime: tprime,
        trade: trade,
        TRADE: TRADE,
        triangle: triangle,
        triangledown: triangledown,
        triangleleft: triangleleft,
        trianglelefteq: trianglelefteq,
        triangleq: triangleq,
        triangleright: triangleright,
        trianglerighteq: trianglerighteq,
        tridot: tridot,
        trie: trie,
        triminus: triminus,
        TripleDot: TripleDot,
        triplus: triplus,
        trisb: trisb,
        tritime: tritime,
        trpezium: trpezium,
        Tscr: Tscr,
        tscr: tscr,
        TScy: TScy,
        tscy: tscy,
        TSHcy: TSHcy,
        tshcy: tshcy,
        Tstrok: Tstrok,
        tstrok: tstrok,
        twixt: twixt,
        twoheadleftarrow: twoheadleftarrow,
        twoheadrightarrow: twoheadrightarrow,
        Uacute: Uacute,
        uacute: uacute,
        uarr: uarr,
        Uarr: Uarr,
        uArr: uArr,
        Uarrocir: Uarrocir,
        Ubrcy: Ubrcy,
        ubrcy: ubrcy,
        Ubreve: Ubreve,
        ubreve: ubreve,
        Ucirc: Ucirc,
        ucirc: ucirc,
        Ucy: Ucy,
        ucy: ucy,
        udarr: udarr,
        Udblac: Udblac,
        udblac: udblac,
        udhar: udhar,
        ufisht: ufisht,
        Ufr: Ufr,
        ufr: ufr,
        Ugrave: Ugrave,
        ugrave: ugrave,
        uHar: uHar,
        uharl: uharl,
        uharr: uharr,
        uhblk: uhblk,
        ulcorn: ulcorn,
        ulcorner: ulcorner,
        ulcrop: ulcrop,
        ultri: ultri,
        Umacr: Umacr,
        umacr: umacr,
        uml: uml,
        UnderBar: UnderBar,
        UnderBrace: UnderBrace,
        UnderBracket: UnderBracket,
        UnderParenthesis: UnderParenthesis,
        Union: Union,
        UnionPlus: UnionPlus,
        Uogon: Uogon,
        uogon: uogon,
        Uopf: Uopf,
        uopf: uopf,
        UpArrowBar: UpArrowBar,
        uparrow: uparrow,
        UpArrow: UpArrow,
        Uparrow: Uparrow,
        UpArrowDownArrow: UpArrowDownArrow,
        updownarrow: updownarrow,
        UpDownArrow: UpDownArrow,
        Updownarrow: Updownarrow,
        UpEquilibrium: UpEquilibrium,
        upharpoonleft: upharpoonleft,
        upharpoonright: upharpoonright,
        uplus: uplus,
        UpperLeftArrow: UpperLeftArrow,
        UpperRightArrow: UpperRightArrow,
        upsi: upsi,
        Upsi: Upsi,
        upsih: upsih,
        Upsilon: Upsilon,
        upsilon: upsilon,
        UpTeeArrow: UpTeeArrow,
        UpTee: UpTee,
        upuparrows: upuparrows,
        urcorn: urcorn,
        urcorner: urcorner,
        urcrop: urcrop,
        Uring: Uring,
        uring: uring,
        urtri: urtri,
        Uscr: Uscr,
        uscr: uscr,
        utdot: utdot,
        Utilde: Utilde,
        utilde: utilde,
        utri: utri,
        utrif: utrif,
        uuarr: uuarr,
        Uuml: Uuml,
        uuml: uuml,
        uwangle: uwangle,
        vangrt: vangrt,
        varepsilon: varepsilon,
        varkappa: varkappa,
        varnothing: varnothing,
        varphi: varphi,
        varpi: varpi,
        varpropto: varpropto,
        varr: varr,
        vArr: vArr,
        varrho: varrho,
        varsigma: varsigma,
        varsubsetneq: varsubsetneq,
        varsubsetneqq: varsubsetneqq,
        varsupsetneq: varsupsetneq,
        varsupsetneqq: varsupsetneqq,
        vartheta: vartheta,
        vartriangleleft: vartriangleleft,
        vartriangleright: vartriangleright,
        vBar: vBar,
        Vbar: Vbar,
        vBarv: vBarv,
        Vcy: Vcy,
        vcy: vcy,
        vdash: vdash,
        vDash: vDash,
        Vdash: Vdash,
        VDash: VDash,
        Vdashl: Vdashl,
        veebar: veebar,
        vee: vee,
        Vee: Vee,
        veeeq: veeeq,
        vellip: vellip,
        verbar: verbar,
        Verbar: Verbar,
        vert: vert,
        Vert: Vert,
        VerticalBar: VerticalBar,
        VerticalLine: VerticalLine,
        VerticalSeparator: VerticalSeparator,
        VerticalTilde: VerticalTilde,
        VeryThinSpace: VeryThinSpace,
        Vfr: Vfr,
        vfr: vfr,
        vltri: vltri,
        vnsub: vnsub,
        vnsup: vnsup,
        Vopf: Vopf,
        vopf: vopf,
        vprop: vprop,
        vrtri: vrtri,
        Vscr: Vscr,
        vscr: vscr,
        vsubnE: vsubnE,
        vsubne: vsubne,
        vsupnE: vsupnE,
        vsupne: vsupne,
        Vvdash: Vvdash,
        vzigzag: vzigzag,
        Wcirc: Wcirc,
        wcirc: wcirc,
        wedbar: wedbar,
        wedge: wedge,
        Wedge: Wedge,
        wedgeq: wedgeq,
        weierp: weierp,
        Wfr: Wfr,
        wfr: wfr,
        Wopf: Wopf,
        wopf: wopf,
        wp: wp,
        wr: wr,
        wreath: wreath,
        Wscr: Wscr,
        wscr: wscr,
        xcap: xcap,
        xcirc: xcirc,
        xcup: xcup,
        xdtri: xdtri,
        Xfr: Xfr,
        xfr: xfr,
        xharr: xharr,
        xhArr: xhArr,
        Xi: Xi,
        xi: xi,
        xlarr: xlarr,
        xlArr: xlArr,
        xmap: xmap,
        xnis: xnis,
        xodot: xodot,
        Xopf: Xopf,
        xopf: xopf,
        xoplus: xoplus,
        xotime: xotime,
        xrarr: xrarr,
        xrArr: xrArr,
        Xscr: Xscr,
        xscr: xscr,
        xsqcup: xsqcup,
        xuplus: xuplus,
        xutri: xutri,
        xvee: xvee,
        xwedge: xwedge,
        Yacute: Yacute,
        yacute: yacute,
        YAcy: YAcy,
        yacy: yacy,
        Ycirc: Ycirc,
        ycirc: ycirc,
        Ycy: Ycy,
        ycy: ycy,
        yen: yen,
        Yfr: Yfr,
        yfr: yfr,
        YIcy: YIcy,
        yicy: yicy,
        Yopf: Yopf,
        yopf: yopf,
        Yscr: Yscr,
        yscr: yscr,
        YUcy: YUcy,
        yucy: yucy,
        yuml: yuml,
        Yuml: Yuml,
        Zacute: Zacute,
        zacute: zacute,
        Zcaron: Zcaron,
        zcaron: zcaron,
        Zcy: Zcy,
        zcy: zcy,
        Zdot: Zdot,
        zdot: zdot,
        zeetrf: zeetrf,
        ZeroWidthSpace: ZeroWidthSpace,
        Zeta: Zeta,
        zeta: zeta,
        zfr: zfr,
        Zfr: Zfr,
        ZHcy: ZHcy,
        zhcy: zhcy,
        zigrarr: zigrarr,
        zopf: zopf,
        Zopf: Zopf,
        Zscr: Zscr,
        zscr: zscr,
        zwj: zwj,
        zwnj: zwnj,
        'default': entities
    });

    var Aacute$1 = "Á";
    var aacute$1 = "á";
    var Acirc$1 = "Â";
    var acirc$1 = "â";
    var acute$1 = "´";
    var AElig$1 = "Æ";
    var aelig$1 = "æ";
    var Agrave$1 = "À";
    var agrave$1 = "à";
    var amp$1 = "&";
    var AMP$1 = "&";
    var Aring$1 = "Å";
    var aring$1 = "å";
    var Atilde$1 = "Ã";
    var atilde$1 = "ã";
    var Auml$1 = "Ä";
    var auml$1 = "ä";
    var brvbar$1 = "¦";
    var Ccedil$1 = "Ç";
    var ccedil$1 = "ç";
    var cedil$1 = "¸";
    var cent$1 = "¢";
    var copy$1 = "©";
    var COPY$1 = "©";
    var curren$1 = "¤";
    var deg$1 = "°";
    var divide$1 = "÷";
    var Eacute$1 = "É";
    var eacute$1 = "é";
    var Ecirc$1 = "Ê";
    var ecirc$1 = "ê";
    var Egrave$1 = "È";
    var egrave$1 = "è";
    var ETH$1 = "Ð";
    var eth$1 = "ð";
    var Euml$1 = "Ë";
    var euml$1 = "ë";
    var frac12$1 = "½";
    var frac14$1 = "¼";
    var frac34$1 = "¾";
    var gt$1 = ">";
    var GT$1 = ">";
    var Iacute$1 = "Í";
    var iacute$1 = "í";
    var Icirc$1 = "Î";
    var icirc$1 = "î";
    var iexcl$1 = "¡";
    var Igrave$1 = "Ì";
    var igrave$1 = "ì";
    var iquest$1 = "¿";
    var Iuml$1 = "Ï";
    var iuml$1 = "ï";
    var laquo$1 = "«";
    var lt$1 = "<";
    var LT$1 = "<";
    var macr$1 = "¯";
    var micro$1 = "µ";
    var middot$1 = "·";
    var nbsp$1 = " ";
    var not$1 = "¬";
    var Ntilde$1 = "Ñ";
    var ntilde$1 = "ñ";
    var Oacute$1 = "Ó";
    var oacute$1 = "ó";
    var Ocirc$1 = "Ô";
    var ocirc$1 = "ô";
    var Ograve$1 = "Ò";
    var ograve$1 = "ò";
    var ordf$1 = "ª";
    var ordm$1 = "º";
    var Oslash$1 = "Ø";
    var oslash$1 = "ø";
    var Otilde$1 = "Õ";
    var otilde$1 = "õ";
    var Ouml$1 = "Ö";
    var ouml$1 = "ö";
    var para$1 = "¶";
    var plusmn$1 = "±";
    var pound$1 = "£";
    var quot$1 = "\"";
    var QUOT$1 = "\"";
    var raquo$1 = "»";
    var reg$1 = "®";
    var REG$1 = "®";
    var sect$1 = "§";
    var shy$1 = "­";
    var sup1$1 = "¹";
    var sup2$1 = "²";
    var sup3$1 = "³";
    var szlig$1 = "ß";
    var THORN$1 = "Þ";
    var thorn$1 = "þ";
    var times$1 = "×";
    var Uacute$1 = "Ú";
    var uacute$1 = "ú";
    var Ucirc$1 = "Û";
    var ucirc$1 = "û";
    var Ugrave$1 = "Ù";
    var ugrave$1 = "ù";
    var uml$1 = "¨";
    var Uuml$1 = "Ü";
    var uuml$1 = "ü";
    var Yacute$1 = "Ý";
    var yacute$1 = "ý";
    var yen$1 = "¥";
    var yuml$1 = "ÿ";
    var legacy = {
    	Aacute: Aacute$1,
    	aacute: aacute$1,
    	Acirc: Acirc$1,
    	acirc: acirc$1,
    	acute: acute$1,
    	AElig: AElig$1,
    	aelig: aelig$1,
    	Agrave: Agrave$1,
    	agrave: agrave$1,
    	amp: amp$1,
    	AMP: AMP$1,
    	Aring: Aring$1,
    	aring: aring$1,
    	Atilde: Atilde$1,
    	atilde: atilde$1,
    	Auml: Auml$1,
    	auml: auml$1,
    	brvbar: brvbar$1,
    	Ccedil: Ccedil$1,
    	ccedil: ccedil$1,
    	cedil: cedil$1,
    	cent: cent$1,
    	copy: copy$1,
    	COPY: COPY$1,
    	curren: curren$1,
    	deg: deg$1,
    	divide: divide$1,
    	Eacute: Eacute$1,
    	eacute: eacute$1,
    	Ecirc: Ecirc$1,
    	ecirc: ecirc$1,
    	Egrave: Egrave$1,
    	egrave: egrave$1,
    	ETH: ETH$1,
    	eth: eth$1,
    	Euml: Euml$1,
    	euml: euml$1,
    	frac12: frac12$1,
    	frac14: frac14$1,
    	frac34: frac34$1,
    	gt: gt$1,
    	GT: GT$1,
    	Iacute: Iacute$1,
    	iacute: iacute$1,
    	Icirc: Icirc$1,
    	icirc: icirc$1,
    	iexcl: iexcl$1,
    	Igrave: Igrave$1,
    	igrave: igrave$1,
    	iquest: iquest$1,
    	Iuml: Iuml$1,
    	iuml: iuml$1,
    	laquo: laquo$1,
    	lt: lt$1,
    	LT: LT$1,
    	macr: macr$1,
    	micro: micro$1,
    	middot: middot$1,
    	nbsp: nbsp$1,
    	not: not$1,
    	Ntilde: Ntilde$1,
    	ntilde: ntilde$1,
    	Oacute: Oacute$1,
    	oacute: oacute$1,
    	Ocirc: Ocirc$1,
    	ocirc: ocirc$1,
    	Ograve: Ograve$1,
    	ograve: ograve$1,
    	ordf: ordf$1,
    	ordm: ordm$1,
    	Oslash: Oslash$1,
    	oslash: oslash$1,
    	Otilde: Otilde$1,
    	otilde: otilde$1,
    	Ouml: Ouml$1,
    	ouml: ouml$1,
    	para: para$1,
    	plusmn: plusmn$1,
    	pound: pound$1,
    	quot: quot$1,
    	QUOT: QUOT$1,
    	raquo: raquo$1,
    	reg: reg$1,
    	REG: REG$1,
    	sect: sect$1,
    	shy: shy$1,
    	sup1: sup1$1,
    	sup2: sup2$1,
    	sup3: sup3$1,
    	szlig: szlig$1,
    	THORN: THORN$1,
    	thorn: thorn$1,
    	times: times$1,
    	Uacute: Uacute$1,
    	uacute: uacute$1,
    	Ucirc: Ucirc$1,
    	ucirc: ucirc$1,
    	Ugrave: Ugrave$1,
    	ugrave: ugrave$1,
    	uml: uml$1,
    	Uuml: Uuml$1,
    	uuml: uuml$1,
    	Yacute: Yacute$1,
    	yacute: yacute$1,
    	yen: yen$1,
    	yuml: yuml$1
    };

    var legacy$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Aacute: Aacute$1,
        aacute: aacute$1,
        Acirc: Acirc$1,
        acirc: acirc$1,
        acute: acute$1,
        AElig: AElig$1,
        aelig: aelig$1,
        Agrave: Agrave$1,
        agrave: agrave$1,
        amp: amp$1,
        AMP: AMP$1,
        Aring: Aring$1,
        aring: aring$1,
        Atilde: Atilde$1,
        atilde: atilde$1,
        Auml: Auml$1,
        auml: auml$1,
        brvbar: brvbar$1,
        Ccedil: Ccedil$1,
        ccedil: ccedil$1,
        cedil: cedil$1,
        cent: cent$1,
        copy: copy$1,
        COPY: COPY$1,
        curren: curren$1,
        deg: deg$1,
        divide: divide$1,
        Eacute: Eacute$1,
        eacute: eacute$1,
        Ecirc: Ecirc$1,
        ecirc: ecirc$1,
        Egrave: Egrave$1,
        egrave: egrave$1,
        ETH: ETH$1,
        eth: eth$1,
        Euml: Euml$1,
        euml: euml$1,
        frac12: frac12$1,
        frac14: frac14$1,
        frac34: frac34$1,
        gt: gt$1,
        GT: GT$1,
        Iacute: Iacute$1,
        iacute: iacute$1,
        Icirc: Icirc$1,
        icirc: icirc$1,
        iexcl: iexcl$1,
        Igrave: Igrave$1,
        igrave: igrave$1,
        iquest: iquest$1,
        Iuml: Iuml$1,
        iuml: iuml$1,
        laquo: laquo$1,
        lt: lt$1,
        LT: LT$1,
        macr: macr$1,
        micro: micro$1,
        middot: middot$1,
        nbsp: nbsp$1,
        not: not$1,
        Ntilde: Ntilde$1,
        ntilde: ntilde$1,
        Oacute: Oacute$1,
        oacute: oacute$1,
        Ocirc: Ocirc$1,
        ocirc: ocirc$1,
        Ograve: Ograve$1,
        ograve: ograve$1,
        ordf: ordf$1,
        ordm: ordm$1,
        Oslash: Oslash$1,
        oslash: oslash$1,
        Otilde: Otilde$1,
        otilde: otilde$1,
        Ouml: Ouml$1,
        ouml: ouml$1,
        para: para$1,
        plusmn: plusmn$1,
        pound: pound$1,
        quot: quot$1,
        QUOT: QUOT$1,
        raquo: raquo$1,
        reg: reg$1,
        REG: REG$1,
        sect: sect$1,
        shy: shy$1,
        sup1: sup1$1,
        sup2: sup2$1,
        sup3: sup3$1,
        szlig: szlig$1,
        THORN: THORN$1,
        thorn: thorn$1,
        times: times$1,
        Uacute: Uacute$1,
        uacute: uacute$1,
        Ucirc: Ucirc$1,
        ucirc: ucirc$1,
        Ugrave: Ugrave$1,
        ugrave: ugrave$1,
        uml: uml$1,
        Uuml: Uuml$1,
        uuml: uuml$1,
        Yacute: Yacute$1,
        yacute: yacute$1,
        yen: yen$1,
        yuml: yuml$1,
        'default': legacy
    });

    var amp$2 = "&";
    var apos$1 = "'";
    var gt$2 = ">";
    var lt$2 = "<";
    var quot$2 = "\"";
    var xml = {
    	amp: amp$2,
    	apos: apos$1,
    	gt: gt$2,
    	lt: lt$2,
    	quot: quot$2
    };

    var xml$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        amp: amp$2,
        apos: apos$1,
        gt: gt$2,
        lt: lt$2,
        quot: quot$2,
        'default': xml
    });

    var decode = {
    	"0": 65533,
    	"128": 8364,
    	"130": 8218,
    	"131": 402,
    	"132": 8222,
    	"133": 8230,
    	"134": 8224,
    	"135": 8225,
    	"136": 710,
    	"137": 8240,
    	"138": 352,
    	"139": 8249,
    	"140": 338,
    	"142": 381,
    	"145": 8216,
    	"146": 8217,
    	"147": 8220,
    	"148": 8221,
    	"149": 8226,
    	"150": 8211,
    	"151": 8212,
    	"152": 732,
    	"153": 8482,
    	"154": 353,
    	"155": 8250,
    	"156": 339,
    	"158": 382,
    	"159": 376
    };

    var decode$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': decode
    });

    var require$$0 = getCjsExportFromNamespace(decode$1);

    var decode_codepoint = createCommonjsModule(function (module, exports) {
    var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var decode_json_1 = __importDefault(require$$0);
    // modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
    function decodeCodePoint(codePoint) {
        if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
            return "\uFFFD";
        }
        if (codePoint in decode_json_1.default) {
            // @ts-ignore
            codePoint = decode_json_1.default[codePoint];
        }
        var output = "";
        if (codePoint > 0xffff) {
            codePoint -= 0x10000;
            output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
            codePoint = 0xdc00 | (codePoint & 0x3ff);
        }
        output += String.fromCharCode(codePoint);
        return output;
    }
    exports.default = decodeCodePoint;
    });

    unwrapExports(decode_codepoint);

    var require$$1 = getCjsExportFromNamespace(entities$1);

    var require$$1$1 = getCjsExportFromNamespace(legacy$1);

    var require$$0$1 = getCjsExportFromNamespace(xml$1);

    var decode$2 = createCommonjsModule(function (module, exports) {
    var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var entities_json_1 = __importDefault(require$$1);
    var legacy_json_1 = __importDefault(require$$1$1);
    var xml_json_1 = __importDefault(require$$0$1);
    var decode_codepoint_1 = __importDefault(decode_codepoint);
    exports.decodeXML = getStrictDecoder(xml_json_1.default);
    exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
    function getStrictDecoder(map) {
        var keys = Object.keys(map).join("|");
        var replace = getReplacer(map);
        keys += "|#[xX][\\da-fA-F]+|#\\d+";
        var re = new RegExp("&(?:" + keys + ");", "g");
        return function (str) { return String(str).replace(re, replace); };
    }
    var sorter = function (a, b) { return (a < b ? 1 : -1); };
    exports.decodeHTML = (function () {
        var legacy = Object.keys(legacy_json_1.default).sort(sorter);
        var keys = Object.keys(entities_json_1.default).sort(sorter);
        for (var i = 0, j = 0; i < keys.length; i++) {
            if (legacy[j] === keys[i]) {
                keys[i] += ";?";
                j++;
            }
            else {
                keys[i] += ";";
            }
        }
        var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
        var replace = getReplacer(entities_json_1.default);
        function replacer(str) {
            if (str.substr(-1) !== ";")
                str += ";";
            return replace(str);
        }
        //TODO consider creating a merged map
        return function (str) {
            return String(str).replace(re, replacer);
        };
    })();
    function getReplacer(map) {
        return function replace(str) {
            if (str.charAt(1) === "#") {
                if (str.charAt(2) === "X" || str.charAt(2) === "x") {
                    return decode_codepoint_1.default(parseInt(str.substr(3), 16));
                }
                return decode_codepoint_1.default(parseInt(str.substr(2), 10));
            }
            return map[str.slice(1, -1)];
        };
    }
    });

    unwrapExports(decode$2);
    var decode_1 = decode$2.decodeXML;
    var decode_2 = decode$2.decodeHTMLStrict;
    var decode_3 = decode$2.decodeHTML;

    var encode$1 = createCommonjsModule(function (module, exports) {
    var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var xml_json_1 = __importDefault(require$$0$1);
    var inverseXML = getInverseObj(xml_json_1.default);
    var xmlReplacer = getInverseReplacer(inverseXML);
    exports.encodeXML = getInverse(inverseXML, xmlReplacer);
    var entities_json_1 = __importDefault(require$$1);
    var inverseHTML = getInverseObj(entities_json_1.default);
    var htmlReplacer = getInverseReplacer(inverseHTML);
    exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
    function getInverseObj(obj) {
        return Object.keys(obj)
            .sort()
            .reduce(function (inverse, name) {
            inverse[obj[name]] = "&" + name + ";";
            return inverse;
        }, {});
    }
    function getInverseReplacer(inverse) {
        var single = [];
        var multiple = [];
        Object.keys(inverse).forEach(function (k) {
            return k.length === 1
                ? // Add value to single array
                    single.push("\\" + k)
                : // Add value to multiple array
                    multiple.push(k);
        });
        //TODO add ranges
        multiple.unshift("[" + single.join("") + "]");
        return new RegExp(multiple.join("|"), "g");
    }
    var reNonASCII = /[^\0-\x7F]/g;
    var reAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    function singleCharReplacer(c) {
        return "&#x" + c
            .charCodeAt(0)
            .toString(16)
            .toUpperCase() + ";";
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    function astralReplacer(c, _) {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var high = c.charCodeAt(0);
        var low = c.charCodeAt(1);
        var codePoint = (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000;
        return "&#x" + codePoint.toString(16).toUpperCase() + ";";
    }
    function getInverse(inverse, re) {
        return function (data) {
            return data
                .replace(re, function (name) { return inverse[name]; })
                .replace(reAstralSymbols, astralReplacer)
                .replace(reNonASCII, singleCharReplacer);
        };
    }
    var reXmlChars = getInverseReplacer(inverseXML);
    function escape(data) {
        return data
            .replace(reXmlChars, singleCharReplacer)
            .replace(reAstralSymbols, astralReplacer)
            .replace(reNonASCII, singleCharReplacer);
    }
    exports.escape = escape;
    });

    unwrapExports(encode$1);
    var encode_1$1 = encode$1.encodeXML;
    var encode_2 = encode$1.encodeHTML;
    var encode_3 = encode$1.escape;

    var lib = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });


    function decode(data, level) {
        return (!level || level <= 0 ? decode$2.decodeXML : decode$2.decodeHTML)(data);
    }
    exports.decode = decode;
    function decodeStrict(data, level) {
        return (!level || level <= 0 ? decode$2.decodeXML : decode$2.decodeHTMLStrict)(data);
    }
    exports.decodeStrict = decodeStrict;
    function encode(data, level) {
        return (!level || level <= 0 ? encode$1.encodeXML : encode$1.encodeHTML)(data);
    }
    exports.encode = encode;
    var encode_2 = encode$1;
    exports.encodeXML = encode_2.encodeXML;
    exports.encodeHTML = encode_2.encodeHTML;
    exports.escape = encode_2.escape;
    // Legacy aliases
    exports.encodeHTML4 = encode_2.encodeHTML;
    exports.encodeHTML5 = encode_2.encodeHTML;
    var decode_2 = decode$2;
    exports.decodeXML = decode_2.decodeXML;
    exports.decodeHTML = decode_2.decodeHTML;
    exports.decodeHTMLStrict = decode_2.decodeHTMLStrict;
    // Legacy aliases
    exports.decodeHTML4 = decode_2.decodeHTML;
    exports.decodeHTML5 = decode_2.decodeHTML;
    exports.decodeHTML4Strict = decode_2.decodeHTMLStrict;
    exports.decodeHTML5Strict = decode_2.decodeHTMLStrict;
    exports.decodeXMLStrict = decode_2.decodeXML;
    });

    unwrapExports(lib);
    var lib_1 = lib.decode;
    var lib_2 = lib.decodeStrict;
    var lib_3 = lib.encode;
    var lib_4 = lib.encodeXML;
    var lib_5 = lib.encodeHTML;
    var lib_6 = lib.escape;
    var lib_7 = lib.encodeHTML4;
    var lib_8 = lib.encodeHTML5;
    var lib_9 = lib.decodeXML;
    var lib_10 = lib.decodeHTML;
    var lib_11 = lib.decodeHTMLStrict;
    var lib_12 = lib.decodeHTML4;
    var lib_13 = lib.decodeHTML5;
    var lib_14 = lib.decodeHTML4Strict;
    var lib_15 = lib.decodeHTML5Strict;
    var lib_16 = lib.decodeXMLStrict;

    var C_BACKSLASH = 92;

    var ENTITY = "&(?:#x[a-f0-9]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});";

    var TAGNAME = "[A-Za-z][A-Za-z0-9-]*";
    var ATTRIBUTENAME = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
    var UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+";
    var SINGLEQUOTEDVALUE = "'[^']*'";
    var DOUBLEQUOTEDVALUE = '"[^"]*"';
    var ATTRIBUTEVALUE =
        "(?:" +
        UNQUOTEDVALUE +
        "|" +
        SINGLEQUOTEDVALUE +
        "|" +
        DOUBLEQUOTEDVALUE +
        ")";
    var ATTRIBUTEVALUESPEC = "(?:" + "\\s*=" + "\\s*" + ATTRIBUTEVALUE + ")";
    var ATTRIBUTE = "(?:" + "\\s+" + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + "?)";
    var OPENTAG = "<" + TAGNAME + ATTRIBUTE + "*" + "\\s*/?>";
    var CLOSETAG = "</" + TAGNAME + "\\s*[>]";
    var HTMLCOMMENT = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->";
    var PROCESSINGINSTRUCTION = "[<][?][\\s\\S]*?[?][>]";
    var DECLARATION = "<![A-Z]+" + "\\s+[^>]*>";
    var CDATA = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
    var HTMLTAG =
        "(?:" +
        OPENTAG +
        "|" +
        CLOSETAG +
        "|" +
        HTMLCOMMENT +
        "|" +
        PROCESSINGINSTRUCTION +
        "|" +
        DECLARATION +
        "|" +
        CDATA +
        ")";
    var reHtmlTag = new RegExp("^" + HTMLTAG);

    var reBackslashOrAmp = /[\\&]/;

    var ESCAPABLE = "[!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]";

    var reEntityOrEscapedChar = new RegExp("\\\\" + ESCAPABLE + "|" + ENTITY, "gi");

    var XMLSPECIAL = '[&<>"]';

    var reXmlSpecial = new RegExp(XMLSPECIAL, "g");

    var unescapeChar = function(s) {
        if (s.charCodeAt(0) === C_BACKSLASH) {
            return s.charAt(1);
        } else {
            return lib_10(s);
        }
    };

    // Replace entities and backslash escapes with literal characters.
    var unescapeString = function(s) {
        if (reBackslashOrAmp.test(s)) {
            return s.replace(reEntityOrEscapedChar, unescapeChar);
        } else {
            return s;
        }
    };

    var normalizeURI = function(uri) {
        try {
            return encode_1(uri);
        } catch (err) {
            return uri;
        }
    };

    var replaceUnsafeChar = function(s) {
        switch (s) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            default:
                return s;
        }
    };

    var escapeXml = function(s) {
        if (reXmlSpecial.test(s)) {
            return s.replace(reXmlSpecial, replaceUnsafeChar);
        } else {
            return s;
        }
    };

    // derived from https://github.com/mathiasbynens/String.fromCodePoint
    /*! http://mths.be/fromcodepoint v0.2.1 by @mathias */

    var _fromCodePoint;

    function fromCodePoint(_) {
        return _fromCodePoint(_);
    }

    if (String.fromCodePoint) {
        _fromCodePoint = function(_) {
            try {
                return String.fromCodePoint(_);
            } catch (e) {
                if (e instanceof RangeError) {
                    return String.fromCharCode(0xfffd);
                }
                throw e;
            }
        };
    } else {
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;
        _fromCodePoint = function() {
            var MAX_SIZE = 0x4000;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index = -1;
            var length = arguments.length;
            if (!length) {
                return "";
            }
            var result = "";
            while (++index < length) {
                var codePoint = Number(arguments[index]);
                if (
                    !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                    codePoint < 0 || // not a valid Unicode code point
                    codePoint > 0x10ffff || // not a valid Unicode code point
                    floor(codePoint) !== codePoint // not an integer
                ) {
                    return String.fromCharCode(0xfffd);
                }
                if (codePoint <= 0xffff) {
                    // BMP code point
                    codeUnits.push(codePoint);
                } else {
                    // Astral code point; split in surrogate halves
                    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                    codePoint -= 0x10000;
                    highSurrogate = (codePoint >> 10) + 0xd800;
                    lowSurrogate = (codePoint % 0x400) + 0xdc00;
                    codeUnits.push(highSurrogate, lowSurrogate);
                }
                if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                    result += stringFromCharCode.apply(null, codeUnits);
                    codeUnits.length = 0;
                }
            }
            return result;
        };
    }

    /*! http://mths.be/repeat v0.2.0 by @mathias */
    if (!String.prototype.repeat) {
    	(function() {
    		var defineProperty = (function() {
    			// IE 8 only supports `Object.defineProperty` on DOM elements
    			try {
    				var object = {};
    				var $defineProperty = Object.defineProperty;
    				var result = $defineProperty(object, object, object) && $defineProperty;
    			} catch(error) {}
    			return result;
    		}());
    		var repeat = function(count) {
    			if (this == null) {
    				throw TypeError();
    			}
    			var string = String(this);
    			// `ToInteger`
    			var n = count ? Number(count) : 0;
    			if (n != n) { // better `isNaN`
    				n = 0;
    			}
    			// Account for out-of-bounds indices
    			if (n < 0 || n == Infinity) {
    				throw RangeError();
    			}
    			var result = '';
    			while (n) {
    				if (n % 2 == 1) {
    					result += string;
    				}
    				if (n > 1) {
    					string += string;
    				}
    				n >>= 1;
    			}
    			return result;
    		};
    		if (defineProperty) {
    			defineProperty(String.prototype, 'repeat', {
    				'value': repeat,
    				'configurable': true,
    				'writable': true
    			});
    		} else {
    			String.prototype.repeat = repeat;
    		}
    	}());
    }

    var normalizeURI$1 = normalizeURI;
    var unescapeString$1 = unescapeString;

    // Constants for character codes:

    var C_NEWLINE = 10;
    var C_ASTERISK = 42;
    var C_UNDERSCORE = 95;
    var C_BACKTICK = 96;
    var C_OPEN_BRACKET = 91;
    var C_CLOSE_BRACKET = 93;
    var C_LESSTHAN = 60;
    var C_BANG = 33;
    var C_BACKSLASH$1 = 92;
    var C_AMPERSAND = 38;
    var C_OPEN_PAREN = 40;
    var C_CLOSE_PAREN = 41;
    var C_COLON = 58;
    var C_SINGLEQUOTE = 39;
    var C_DOUBLEQUOTE = 34;

    // Some regexps used in inline parser:

    var ESCAPABLE$1 = ESCAPABLE;
    var ESCAPED_CHAR = "\\\\" + ESCAPABLE$1;

    var ENTITY$1 = ENTITY;
    var reHtmlTag$1 = reHtmlTag;

    var rePunctuation = new RegExp(
        /[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/
    );

    var reLinkTitle = new RegExp(
        '^(?:"(' +
            ESCAPED_CHAR +
            '|[^"\\x00])*"' +
            "|" +
            "'(" +
            ESCAPED_CHAR +
            "|[^'\\x00])*'" +
            "|" +
            "\\((" +
            ESCAPED_CHAR +
            "|[^()\\x00])*\\))"
    );

    var reLinkDestinationBraces = /^(?:<(?:[^<>\n\\\x00]|\\.)*>)/;

    var reEscapable = new RegExp("^" + ESCAPABLE$1);

    var reEntityHere = new RegExp("^" + ENTITY$1, "i");

    var reTicks = /`+/;

    var reTicksHere = /^`+/;

    var reEllipses = /\.\.\./g;

    var reDash = /--+/g;

    var reEmailAutolink = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;

    var reAutolink = /^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i;

    var reSpnl = /^ *(?:\n *)?/;

    var reWhitespaceChar = /^[ \t\n\x0b\x0c\x0d]/;

    var reUnicodeWhitespaceChar = /^\s/;

    var reFinalSpace = / *$/;

    var reInitialSpace = /^ */;

    var reSpaceAtEndOfLine = /^ *(?:\n|$)/;

    var reLinkLabel = /^\[(?:[^\\\[\]]|\\.){0,1000}\]/;

    // Matches a string of non-special characters.
    var reMain = /^[^\n`\[\]\\!<&*_'"]+/m;

    var text = function(s) {
        var node = new Node("text");
        node._literal = s;
        return node;
    };

    // normalize a reference in reference link (remove []s, trim,
    // collapse internal space, unicode case fold.
    // See commonmark/commonmark.js#168.
    var normalizeReference = function(string) {
        return string
            .slice(1, string.length - 1)
            .trim()
            .replace(/[ \t\r\n]+/, " ")
            .toLowerCase()
            .toUpperCase();
    };

    // INLINE PARSER

    // These are methods of an InlineParser object, defined below.
    // An InlineParser keeps track of a subject (a string to be
    // parsed) and a position in that subject.

    // If re matches at current position in the subject, advance
    // position in subject and return the match; otherwise return null.
    var match = function(re) {
        var m = re.exec(this.subject.slice(this.pos));
        if (m === null) {
            return null;
        } else {
            this.pos += m.index + m[0].length;
            return m[0];
        }
    };

    // Returns the code for the character at the current subject position, or -1
    // there are no more characters.
    var peek = function() {
        if (this.pos < this.subject.length) {
            return this.subject.charCodeAt(this.pos);
        } else {
            return -1;
        }
    };

    // Parse zero or more space characters, including at most one newline
    var spnl = function() {
        this.match(reSpnl);
        return true;
    };

    // All of the parsers below try to match something at the current position
    // in the subject.  If they succeed in matching anything, they
    // return the inline matched, advancing the subject.

    // Attempt to parse backticks, adding either a backtick code span or a
    // literal sequence of backticks.
    var parseBackticks = function(block) {
        var ticks = this.match(reTicksHere);
        if (ticks === null) {
            return false;
        }
        var afterOpenTicks = this.pos;
        var matched;
        var node;
        var contents;
        while ((matched = this.match(reTicks)) !== null) {
            if (matched === ticks) {
                node = new Node("code");
                contents = this.subject
                    .slice(afterOpenTicks, this.pos - ticks.length)
                    .replace(/\n/gm, " ");
                if (
                    contents.length > 0 &&
                    contents.match(/[^ ]/) !== null &&
                    contents[0] == " " &&
                    contents[contents.length - 1] == " "
                ) {
                    node._literal = contents.slice(1, contents.length - 1);
                } else {
                    node._literal = contents;
                }
                block.appendChild(node);
                return true;
            }
        }
        // If we got here, we didn't match a closing backtick sequence.
        this.pos = afterOpenTicks;
        block.appendChild(text(ticks));
        return true;
    };

    // Parse a backslash-escaped special character, adding either the escaped
    // character, a hard line break (if the backslash is followed by a newline),
    // or a literal backslash to the block's children.  Assumes current character
    // is a backslash.
    var parseBackslash = function(block) {
        var subj = this.subject;
        var node;
        this.pos += 1;
        if (this.peek() === C_NEWLINE) {
            this.pos += 1;
            node = new Node("linebreak");
            block.appendChild(node);
        } else if (reEscapable.test(subj.charAt(this.pos))) {
            block.appendChild(text(subj.charAt(this.pos)));
            this.pos += 1;
        } else {
            block.appendChild(text("\\"));
        }
        return true;
    };

    // Attempt to parse an autolink (URL or email in pointy brackets).
    var parseAutolink = function(block) {
        var m;
        var dest;
        var node;
        if ((m = this.match(reEmailAutolink))) {
            dest = m.slice(1, m.length - 1);
            node = new Node("link");
            node._destination = normalizeURI$1("mailto:" + dest);
            node._title = "";
            node.appendChild(text(dest));
            block.appendChild(node);
            return true;
        } else if ((m = this.match(reAutolink))) {
            dest = m.slice(1, m.length - 1);
            node = new Node("link");
            node._destination = normalizeURI$1(dest);
            node._title = "";
            node.appendChild(text(dest));
            block.appendChild(node);
            return true;
        } else {
            return false;
        }
    };

    // Attempt to parse a raw HTML tag.
    var parseHtmlTag = function(block) {
        var m = this.match(reHtmlTag$1);
        if (m === null) {
            return false;
        } else {
            var node = new Node("html_inline");
            node._literal = m;
            block.appendChild(node);
            return true;
        }
    };

    // Scan a sequence of characters with code cc, and return information about
    // the number of delimiters and whether they are positioned such that
    // they can open and/or close emphasis or strong emphasis.  A utility
    // function for strong/emph parsing.
    var scanDelims = function(cc) {
        var numdelims = 0;
        var char_before, char_after, cc_after;
        var startpos = this.pos;
        var left_flanking, right_flanking, can_open, can_close;
        var after_is_whitespace,
            after_is_punctuation,
            before_is_whitespace,
            before_is_punctuation;

        if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
            numdelims++;
            this.pos++;
        } else {
            while (this.peek() === cc) {
                numdelims++;
                this.pos++;
            }
        }

        if (numdelims === 0) {
            return null;
        }

        char_before = startpos === 0 ? "\n" : this.subject.charAt(startpos - 1);

        cc_after = this.peek();
        if (cc_after === -1) {
            char_after = "\n";
        } else {
            char_after = fromCodePoint(cc_after);
        }

        after_is_whitespace = reUnicodeWhitespaceChar.test(char_after);
        after_is_punctuation = rePunctuation.test(char_after);
        before_is_whitespace = reUnicodeWhitespaceChar.test(char_before);
        before_is_punctuation = rePunctuation.test(char_before);

        left_flanking =
            !after_is_whitespace &&
            (!after_is_punctuation ||
                before_is_whitespace ||
                before_is_punctuation);
        right_flanking =
            !before_is_whitespace &&
            (!before_is_punctuation || after_is_whitespace || after_is_punctuation);
        if (cc === C_UNDERSCORE) {
            can_open = left_flanking && (!right_flanking || before_is_punctuation);
            can_close = right_flanking && (!left_flanking || after_is_punctuation);
        } else if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
            can_open = left_flanking && !right_flanking;
            can_close = right_flanking;
        } else {
            can_open = left_flanking;
            can_close = right_flanking;
        }
        this.pos = startpos;
        return { numdelims: numdelims, can_open: can_open, can_close: can_close };
    };

    // Handle a delimiter marker for emphasis or a quote.
    var handleDelim = function(cc, block) {
        var res = this.scanDelims(cc);
        if (!res) {
            return false;
        }
        var numdelims = res.numdelims;
        var startpos = this.pos;
        var contents;

        this.pos += numdelims;
        if (cc === C_SINGLEQUOTE) {
            contents = "\u2019";
        } else if (cc === C_DOUBLEQUOTE) {
            contents = "\u201C";
        } else {
            contents = this.subject.slice(startpos, this.pos);
        }
        var node = text(contents);
        block.appendChild(node);

        // Add entry to stack for this opener
        if (
            (res.can_open || res.can_close) &&
            (this.options.smart || (cc !== C_SINGLEQUOTE && cc !== C_DOUBLEQUOTE))
        ) {
            this.delimiters = {
                cc: cc,
                numdelims: numdelims,
                origdelims: numdelims,
                node: node,
                previous: this.delimiters,
                next: null,
                can_open: res.can_open,
                can_close: res.can_close
            };
            if (this.delimiters.previous !== null) {
                this.delimiters.previous.next = this.delimiters;
            }
        }

        return true;
    };

    var removeDelimiter = function(delim) {
        if (delim.previous !== null) {
            delim.previous.next = delim.next;
        }
        if (delim.next === null) {
            // top of stack
            this.delimiters = delim.previous;
        } else {
            delim.next.previous = delim.previous;
        }
    };

    var removeDelimitersBetween = function(bottom, top) {
        if (bottom.next !== top) {
            bottom.next = top;
            top.previous = bottom;
        }
    };

    var processEmphasis = function(stack_bottom) {
        var opener, closer, old_closer;
        var opener_inl, closer_inl;
        var tempstack;
        var use_delims;
        var tmp, next;
        var opener_found;
        var openers_bottom = [[], [], []];
        var odd_match = false;

        for (var i = 0; i < 3; i++) {
            openers_bottom[i][C_UNDERSCORE] = stack_bottom;
            openers_bottom[i][C_ASTERISK] = stack_bottom;
            openers_bottom[i][C_SINGLEQUOTE] = stack_bottom;
            openers_bottom[i][C_DOUBLEQUOTE] = stack_bottom;
        }
        // find first closer above stack_bottom:
        closer = this.delimiters;
        while (closer !== null && closer.previous !== stack_bottom) {
            closer = closer.previous;
        }
        // move forward, looking for closers, and handling each
        while (closer !== null) {
            var closercc = closer.cc;
            if (!closer.can_close) {
                closer = closer.next;
            } else {
                // found emphasis closer. now look back for first matching opener:
                opener = closer.previous;
                opener_found = false;
                while (
                    opener !== null &&
                    opener !== stack_bottom &&
                    opener !== openers_bottom[closer.origdelims % 3][closercc]
                ) {
                    odd_match =
                        (closer.can_open || opener.can_close) &&
                        closer.origdelims % 3 !== 0 &&
                        (opener.origdelims + closer.origdelims) % 3 === 0;
                    if (opener.cc === closer.cc && opener.can_open && !odd_match) {
                        opener_found = true;
                        break;
                    }
                    opener = opener.previous;
                }
                old_closer = closer;

                if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {
                    if (!opener_found) {
                        closer = closer.next;
                    } else {
                        // calculate actual number of delimiters used from closer
                        use_delims =
                            closer.numdelims >= 2 && opener.numdelims >= 2 ? 2 : 1;

                        opener_inl = opener.node;
                        closer_inl = closer.node;

                        // remove used delimiters from stack elts and inlines
                        opener.numdelims -= use_delims;
                        closer.numdelims -= use_delims;
                        opener_inl._literal = opener_inl._literal.slice(
                            0,
                            opener_inl._literal.length - use_delims
                        );
                        closer_inl._literal = closer_inl._literal.slice(
                            0,
                            closer_inl._literal.length - use_delims
                        );

                        // build contents for new emph element
                        var emph = new Node(use_delims === 1 ? "emph" : "strong");

                        tmp = opener_inl._next;
                        while (tmp && tmp !== closer_inl) {
                            next = tmp._next;
                            tmp.unlink();
                            emph.appendChild(tmp);
                            tmp = next;
                        }

                        opener_inl.insertAfter(emph);

                        // remove elts between opener and closer in delimiters stack
                        removeDelimitersBetween(opener, closer);

                        // if opener has 0 delims, remove it and the inline
                        if (opener.numdelims === 0) {
                            opener_inl.unlink();
                            this.removeDelimiter(opener);
                        }

                        if (closer.numdelims === 0) {
                            closer_inl.unlink();
                            tempstack = closer.next;
                            this.removeDelimiter(closer);
                            closer = tempstack;
                        }
                    }
                } else if (closercc === C_SINGLEQUOTE) {
                    closer.node._literal = "\u2019";
                    if (opener_found) {
                        opener.node._literal = "\u2018";
                    }
                    closer = closer.next;
                } else if (closercc === C_DOUBLEQUOTE) {
                    closer.node._literal = "\u201D";
                    if (opener_found) {
                        opener.node.literal = "\u201C";
                    }
                    closer = closer.next;
                }
                if (!opener_found) {
                    // Set lower bound for future searches for openers:
                    openers_bottom[old_closer.origdelims % 3][closercc] =
                        old_closer.previous;
                    if (!old_closer.can_open) {
                        // We can remove a closer that can't be an opener,
                        // once we've seen there's no matching opener:
                        this.removeDelimiter(old_closer);
                    }
                }
            }
        }

        // remove all delimiters
        while (this.delimiters !== null && this.delimiters !== stack_bottom) {
            this.removeDelimiter(this.delimiters);
        }
    };

    // Attempt to parse link title (sans quotes), returning the string
    // or null if no match.
    var parseLinkTitle = function() {
        var title = this.match(reLinkTitle);
        if (title === null) {
            return null;
        } else {
            // chop off quotes from title and unescape:
            return unescapeString$1(title.substr(1, title.length - 2));
        }
    };

    // Attempt to parse link destination, returning the string or
    // null if no match.
    var parseLinkDestination = function() {
        var res = this.match(reLinkDestinationBraces);
        if (res === null) {
            if (this.peek() === C_LESSTHAN) {
                return null;
            }
            // TODO handrolled parser; res should be null or the string
            var savepos = this.pos;
            var openparens = 0;
            var c;
            while ((c = this.peek()) !== -1) {
                if (
                    c === C_BACKSLASH$1 &&
                    reEscapable.test(this.subject.charAt(this.pos + 1))
                ) {
                    this.pos += 1;
                    if (this.peek() !== -1) {
                        this.pos += 1;
                    }
                } else if (c === C_OPEN_PAREN) {
                    this.pos += 1;
                    openparens += 1;
                } else if (c === C_CLOSE_PAREN) {
                    if (openparens < 1) {
                        break;
                    } else {
                        this.pos += 1;
                        openparens -= 1;
                    }
                } else if (reWhitespaceChar.exec(fromCodePoint(c)) !== null) {
                    break;
                } else {
                    this.pos += 1;
                }
            }
            if (this.pos === savepos && c !== C_CLOSE_PAREN) {
                return null;
            }
            if (openparens !== 0) {
                return null;
            }
            res = this.subject.substr(savepos, this.pos - savepos);
            return normalizeURI$1(unescapeString$1(res));
        } else {
            // chop off surrounding <..>:
            return normalizeURI$1(unescapeString$1(res.substr(1, res.length - 2)));
        }
    };

    // Attempt to parse a link label, returning number of characters parsed.
    var parseLinkLabel = function() {
        var m = this.match(reLinkLabel);
        if (m === null || m.length > 1001) {
            return 0;
        } else {
            return m.length;
        }
    };

    // Add open bracket to delimiter stack and add a text node to block's children.
    var parseOpenBracket = function(block) {
        var startpos = this.pos;
        this.pos += 1;

        var node = text("[");
        block.appendChild(node);

        // Add entry to stack for this opener
        this.addBracket(node, startpos, false);
        return true;
    };

    // IF next character is [, and ! delimiter to delimiter stack and
    // add a text node to block's children.  Otherwise just add a text node.
    var parseBang = function(block) {
        var startpos = this.pos;
        this.pos += 1;
        if (this.peek() === C_OPEN_BRACKET) {
            this.pos += 1;

            var node = text("![");
            block.appendChild(node);

            // Add entry to stack for this opener
            this.addBracket(node, startpos + 1, true);
        } else {
            block.appendChild(text("!"));
        }
        return true;
    };

    // Try to match close bracket against an opening in the delimiter
    // stack.  Add either a link or image, or a plain [ character,
    // to block's children.  If there is a matching delimiter,
    // remove it from the delimiter stack.
    var parseCloseBracket = function(block) {
        var startpos;
        var is_image;
        var dest;
        var title;
        var matched = false;
        var reflabel;
        var opener;

        this.pos += 1;
        startpos = this.pos;

        // get last [ or ![
        opener = this.brackets;

        if (opener === null) {
            // no matched opener, just return a literal
            block.appendChild(text("]"));
            return true;
        }

        if (!opener.active) {
            // no matched opener, just return a literal
            block.appendChild(text("]"));
            // take opener off brackets stack
            this.removeBracket();
            return true;
        }

        // If we got here, open is a potential opener
        is_image = opener.image;

        // Check to see if we have a link/image

        var savepos = this.pos;

        // Inline link?
        if (this.peek() === C_OPEN_PAREN) {
            this.pos++;
            if (
                this.spnl() &&
                (dest = this.parseLinkDestination()) !== null &&
                this.spnl() &&
                // make sure there's a space before the title:
                ((reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) &&
                    (title = this.parseLinkTitle())) ||
                    true) &&
                this.spnl() &&
                this.peek() === C_CLOSE_PAREN
            ) {
                this.pos += 1;
                matched = true;
            } else {
                this.pos = savepos;
            }
        }

        if (!matched) {
            // Next, see if there's a link label
            var beforelabel = this.pos;
            var n = this.parseLinkLabel();
            if (n > 2) {
                reflabel = this.subject.slice(beforelabel, beforelabel + n);
            } else if (!opener.bracketAfter) {
                // Empty or missing second label means to use the first label as the reference.
                // The reference must not contain a bracket. If we know there's a bracket, we don't even bother checking it.
                reflabel = this.subject.slice(opener.index, startpos);
            }
            if (n === 0) {
                // If shortcut reference link, rewind before spaces we skipped.
                this.pos = savepos;
            }

            if (reflabel) {
                // lookup rawlabel in refmap
                var link = this.refmap[normalizeReference(reflabel)];
                if (link) {
                    dest = link.destination;
                    title = link.title;
                    matched = true;
                }
            }
        }

        if (matched) {
            var node = new Node(is_image ? "image" : "link");
            node._destination = dest;
            node._title = title || "";

            var tmp, next;
            tmp = opener.node._next;
            while (tmp) {
                next = tmp._next;
                tmp.unlink();
                node.appendChild(tmp);
                tmp = next;
            }
            block.appendChild(node);
            this.processEmphasis(opener.previousDelimiter);
            this.removeBracket();
            opener.node.unlink();

            // We remove this bracket and processEmphasis will remove later delimiters.
            // Now, for a link, we also deactivate earlier link openers.
            // (no links in links)
            if (!is_image) {
                opener = this.brackets;
                while (opener !== null) {
                    if (!opener.image) {
                        opener.active = false; // deactivate this opener
                    }
                    opener = opener.previous;
                }
            }

            return true;
        } else {
            // no match

            this.removeBracket(); // remove this opener from stack
            this.pos = startpos;
            block.appendChild(text("]"));
            return true;
        }
    };

    var addBracket = function(node, index, image) {
        if (this.brackets !== null) {
            this.brackets.bracketAfter = true;
        }
        this.brackets = {
            node: node,
            previous: this.brackets,
            previousDelimiter: this.delimiters,
            index: index,
            image: image,
            active: true
        };
    };

    var removeBracket = function() {
        this.brackets = this.brackets.previous;
    };

    // Attempt to parse an entity.
    var parseEntity = function(block) {
        var m;
        if ((m = this.match(reEntityHere))) {
            block.appendChild(text(lib_10(m)));
            return true;
        } else {
            return false;
        }
    };

    // Parse a run of ordinary characters, or a single character with
    // a special meaning in markdown, as a plain string.
    var parseString = function(block) {
        var m;
        if ((m = this.match(reMain))) {
            if (this.options.smart) {
                block.appendChild(
                    text(
                        m
                            .replace(reEllipses, "\u2026")
                            .replace(reDash, function(chars) {
                                var enCount = 0;
                                var emCount = 0;
                                if (chars.length % 3 === 0) {
                                    // If divisible by 3, use all em dashes
                                    emCount = chars.length / 3;
                                } else if (chars.length % 2 === 0) {
                                    // If divisible by 2, use all en dashes
                                    enCount = chars.length / 2;
                                } else if (chars.length % 3 === 2) {
                                    // If 2 extra dashes, use en dash for last 2; em dashes for rest
                                    enCount = 1;
                                    emCount = (chars.length - 2) / 3;
                                } else {
                                    // Use en dashes for last 4 hyphens; em dashes for rest
                                    enCount = 2;
                                    emCount = (chars.length - 4) / 3;
                                }
                                return (
                                    "\u2014".repeat(emCount) +
                                    "\u2013".repeat(enCount)
                                );
                            })
                    )
                );
            } else {
                block.appendChild(text(m));
            }
            return true;
        } else {
            return false;
        }
    };

    // Parse a newline.  If it was preceded by two spaces, return a hard
    // line break; otherwise a soft line break.
    var parseNewline = function(block) {
        this.pos += 1; // assume we're at a \n
        // check previous node for trailing spaces
        var lastc = block._lastChild;
        if (
            lastc &&
            lastc.type === "text" &&
            lastc._literal[lastc._literal.length - 1] === " "
        ) {
            var hardbreak = lastc._literal[lastc._literal.length - 2] === " ";
            lastc._literal = lastc._literal.replace(reFinalSpace, "");
            block.appendChild(new Node(hardbreak ? "linebreak" : "softbreak"));
        } else {
            block.appendChild(new Node("softbreak"));
        }
        this.match(reInitialSpace); // gobble leading spaces in next line
        return true;
    };

    // Attempt to parse a link reference, modifying refmap.
    var parseReference = function(s, refmap) {
        this.subject = s;
        this.pos = 0;
        var rawlabel;
        var dest;
        var title;
        var matchChars;
        var startpos = this.pos;

        // label:
        matchChars = this.parseLinkLabel();
        if (matchChars === 0) {
            return 0;
        } else {
            rawlabel = this.subject.substr(0, matchChars);
        }

        // colon:
        if (this.peek() === C_COLON) {
            this.pos++;
        } else {
            this.pos = startpos;
            return 0;
        }

        //  link url
        this.spnl();

        dest = this.parseLinkDestination();
        if (dest === null) {
            this.pos = startpos;
            return 0;
        }

        var beforetitle = this.pos;
        this.spnl();
        if (this.pos !== beforetitle) {
            title = this.parseLinkTitle();
        }
        if (title === null) {
            title = "";
            // rewind before spaces
            this.pos = beforetitle;
        }

        // make sure we're at line end:
        var atLineEnd = true;
        if (this.match(reSpaceAtEndOfLine) === null) {
            if (title === "") {
                atLineEnd = false;
            } else {
                // the potential title we found is not at the line end,
                // but it could still be a legal link reference if we
                // discard the title
                title = "";
                // rewind before spaces
                this.pos = beforetitle;
                // and instead check if the link URL is at the line end
                atLineEnd = this.match(reSpaceAtEndOfLine) !== null;
            }
        }

        if (!atLineEnd) {
            this.pos = startpos;
            return 0;
        }

        var normlabel = normalizeReference(rawlabel);
        if (normlabel === "") {
            // label must contain non-whitespace characters
            this.pos = startpos;
            return 0;
        }

        if (!refmap[normlabel]) {
            refmap[normlabel] = { destination: dest, title: title };
        }
        return this.pos - startpos;
    };

    // Parse the next inline element in subject, advancing subject position.
    // On success, add the result to block's children and return true.
    // On failure, return false.
    var parseInline = function(block) {
        var res = false;
        var c = this.peek();
        if (c === -1) {
            return false;
        }
        switch (c) {
            case C_NEWLINE:
                res = this.parseNewline(block);
                break;
            case C_BACKSLASH$1:
                res = this.parseBackslash(block);
                break;
            case C_BACKTICK:
                res = this.parseBackticks(block);
                break;
            case C_ASTERISK:
            case C_UNDERSCORE:
                res = this.handleDelim(c, block);
                break;
            case C_SINGLEQUOTE:
            case C_DOUBLEQUOTE:
                res = this.options.smart && this.handleDelim(c, block);
                break;
            case C_OPEN_BRACKET:
                res = this.parseOpenBracket(block);
                break;
            case C_BANG:
                res = this.parseBang(block);
                break;
            case C_CLOSE_BRACKET:
                res = this.parseCloseBracket(block);
                break;
            case C_LESSTHAN:
                res = this.parseAutolink(block) || this.parseHtmlTag(block);
                break;
            case C_AMPERSAND:
                res = this.parseEntity(block);
                break;
            default:
                res = this.parseString(block);
                break;
        }
        if (!res) {
            this.pos += 1;
            block.appendChild(text(fromCodePoint(c)));
        }

        return true;
    };

    // Parse string content in block into inline children,
    // using refmap to resolve references.
    var parseInlines = function(block) {
        this.subject = block._string_content.trim();
        this.pos = 0;
        this.delimiters = null;
        this.brackets = null;
        while (this.parseInline(block)) {}
        block._string_content = null; // allow raw string to be garbage collected
        this.processEmphasis(null);
    };

    // The InlineParser object.
    function InlineParser(options) {
        return {
            subject: "",
            delimiters: null, // used by handleDelim method
            brackets: null,
            pos: 0,
            refmap: {},
            match: match,
            peek: peek,
            spnl: spnl,
            parseBackticks: parseBackticks,
            parseBackslash: parseBackslash,
            parseAutolink: parseAutolink,
            parseHtmlTag: parseHtmlTag,
            scanDelims: scanDelims,
            handleDelim: handleDelim,
            parseLinkTitle: parseLinkTitle,
            parseLinkDestination: parseLinkDestination,
            parseLinkLabel: parseLinkLabel,
            parseOpenBracket: parseOpenBracket,
            parseBang: parseBang,
            parseCloseBracket: parseCloseBracket,
            addBracket: addBracket,
            removeBracket: removeBracket,
            parseEntity: parseEntity,
            parseString: parseString,
            parseNewline: parseNewline,
            parseReference: parseReference,
            parseInline: parseInline,
            processEmphasis: processEmphasis,
            removeDelimiter: removeDelimiter,
            options: options || {},
            parse: parseInlines
        };
    }

    var CODE_INDENT = 4;

    var C_TAB = 9;
    var C_NEWLINE$1 = 10;
    var C_GREATERTHAN = 62;
    var C_LESSTHAN$1 = 60;
    var C_SPACE = 32;
    var C_OPEN_BRACKET$1 = 91;

    var reHtmlBlockOpen = [
        /./, // dummy for 0
        /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
        /^<!--/,
        /^<[?]/,
        /^<![A-Z]/,
        /^<!\[CDATA\[/,
        /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
        new RegExp("^(?:" + OPENTAG + "|" + CLOSETAG + ")\\s*$", "i")
    ];

    var reHtmlBlockClose = [
        /./, // dummy for 0
        /<\/(?:script|pre|textarea|style)>/i,
        /-->/,
        /\?>/,
        />/,
        /\]\]>/
    ];

    var reThematicBreak = /^(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})[ \t]*$/;

    var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;

    var reNonSpace = /[^ \t\f\v\r\n]/;

    var reBulletListMarker = /^[*+-]/;

    var reOrderedListMarker = /^(\d{1,9})([.)])/;

    var reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;

    var reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;

    var reClosingCodeFence = /^(?:`{3,}|~{3,})(?= *$)/;

    var reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;

    var reLineEnding = /\r\n|\n|\r/;

    // Returns true if string contains only space characters.
    var isBlank = function(s) {
        return !reNonSpace.test(s);
    };

    var isSpaceOrTab = function(c) {
        return c === C_SPACE || c === C_TAB;
    };

    var peek$1 = function(ln, pos) {
        if (pos < ln.length) {
            return ln.charCodeAt(pos);
        } else {
            return -1;
        }
    };

    // DOC PARSER

    // These are methods of a Parser object, defined below.

    // Returns true if block ends with a blank line, descending if needed
    // into lists and sublists.
    var endsWithBlankLine = function(block) {
        while (block) {
            if (block._lastLineBlank) {
                return true;
            }
            var t = block.type;
            if (!block._lastLineChecked && (t === "list" || t === "item")) {
                block._lastLineChecked = true;
                block = block._lastChild;
            } else {
                block._lastLineChecked = true;
                break;
            }
        }
        return false;
    };

    // Add a line to the block at the tip.  We assume the tip
    // can accept lines -- that check should be done before calling this.
    var addLine = function() {
        if (this.partiallyConsumedTab) {
            this.offset += 1; // skip over tab
            // add space characters:
            var charsToTab = 4 - (this.column % 4);
            this.tip._string_content += " ".repeat(charsToTab);
        }
        this.tip._string_content += this.currentLine.slice(this.offset) + "\n";
    };

    // Add block of type tag as a child of the tip.  If the tip can't
    // accept children, close and finalize it and try its parent,
    // and so on til we find a block that can accept children.
    var addChild = function(tag, offset) {
        while (!this.blocks[this.tip.type].canContain(tag)) {
            this.finalize(this.tip, this.lineNumber - 1);
        }

        var column_number = offset + 1; // offset 0 = column 1
        var newBlock = new Node(tag, [
            [this.lineNumber, column_number],
            [0, 0]
        ]);
        newBlock._string_content = "";
        this.tip.appendChild(newBlock);
        this.tip = newBlock;
        return newBlock;
    };

    // Parse a list marker and return data on the marker (type,
    // start, delimiter, bullet character, padding) or null.
    var parseListMarker = function(parser, container) {
        var rest = parser.currentLine.slice(parser.nextNonspace);
        var match;
        var nextc;
        var spacesStartCol;
        var spacesStartOffset;
        var data = {
            type: null,
            tight: true, // lists are tight by default
            bulletChar: null,
            start: null,
            delimiter: null,
            padding: null,
            markerOffset: parser.indent
        };
        if (parser.indent >= 4) {
            return null;
        }
        if ((match = rest.match(reBulletListMarker))) {
            data.type = "bullet";
            data.bulletChar = match[0][0];
        } else if (
            (match = rest.match(reOrderedListMarker)) &&
            (container.type !== "paragraph" || match[1] === "1")
        ) {
            data.type = "ordered";
            data.start = parseInt(match[1]);
            data.delimiter = match[2];
        } else {
            return null;
        }
        // make sure we have spaces after
        nextc = peek$1(parser.currentLine, parser.nextNonspace + match[0].length);
        if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
            return null;
        }

        // if it interrupts paragraph, make sure first line isn't blank
        if (
            container.type === "paragraph" &&
            !parser.currentLine
                .slice(parser.nextNonspace + match[0].length)
                .match(reNonSpace)
        ) {
            return null;
        }

        // we've got a match! advance offset and calculate padding
        parser.advanceNextNonspace(); // to start of marker
        parser.advanceOffset(match[0].length, true); // to end of marker
        spacesStartCol = parser.column;
        spacesStartOffset = parser.offset;
        do {
            parser.advanceOffset(1, true);
            nextc = peek$1(parser.currentLine, parser.offset);
        } while (parser.column - spacesStartCol < 5 && isSpaceOrTab(nextc));
        var blank_item = peek$1(parser.currentLine, parser.offset) === -1;
        var spaces_after_marker = parser.column - spacesStartCol;
        if (spaces_after_marker >= 5 || spaces_after_marker < 1 || blank_item) {
            data.padding = match[0].length + 1;
            parser.column = spacesStartCol;
            parser.offset = spacesStartOffset;
            if (isSpaceOrTab(peek$1(parser.currentLine, parser.offset))) {
                parser.advanceOffset(1, true);
            }
        } else {
            data.padding = match[0].length + spaces_after_marker;
        }
        return data;
    };

    // Returns true if the two list items are of the same type,
    // with the same delimiter and bullet character.  This is used
    // in agglomerating list items into lists.
    var listsMatch = function(list_data, item_data) {
        return (
            list_data.type === item_data.type &&
            list_data.delimiter === item_data.delimiter &&
            list_data.bulletChar === item_data.bulletChar
        );
    };

    // Finalize and close any unmatched blocks.
    var closeUnmatchedBlocks = function() {
        if (!this.allClosed) {
            // finalize any blocks not matched
            while (this.oldtip !== this.lastMatchedContainer) {
                var parent = this.oldtip._parent;
                this.finalize(this.oldtip, this.lineNumber - 1);
                this.oldtip = parent;
            }
            this.allClosed = true;
        }
    };

    // 'finalize' is run when the block is closed.
    // 'continue' is run to check whether the block is continuing
    // at a certain line and offset (e.g. whether a block quote
    // contains a `>`.  It returns 0 for matched, 1 for not matched,
    // and 2 for "we've dealt with this line completely, go to next."
    var blocks = {
        document: {
            continue: function() {
                return 0;
            },
            finalize: function() {
                return;
            },
            canContain: function(t) {
                return t !== "item";
            },
            acceptsLines: false
        },
        list: {
            continue: function() {
                return 0;
            },
            finalize: function(parser, block) {
                var item = block._firstChild;
                while (item) {
                    // check for non-final list item ending with blank line:
                    if (endsWithBlankLine(item) && item._next) {
                        block._listData.tight = false;
                        break;
                    }
                    // recurse into children of list item, to see if there are
                    // spaces between any of them:
                    var subitem = item._firstChild;
                    while (subitem) {
                        if (
                            endsWithBlankLine(subitem) &&
                            (item._next || subitem._next)
                        ) {
                            block._listData.tight = false;
                            break;
                        }
                        subitem = subitem._next;
                    }
                    item = item._next;
                }
            },
            canContain: function(t) {
                return t === "item";
            },
            acceptsLines: false
        },
        block_quote: {
            continue: function(parser) {
                var ln = parser.currentLine;
                if (
                    !parser.indented &&
                    peek$1(ln, parser.nextNonspace) === C_GREATERTHAN
                ) {
                    parser.advanceNextNonspace();
                    parser.advanceOffset(1, false);
                    if (isSpaceOrTab(peek$1(ln, parser.offset))) {
                        parser.advanceOffset(1, true);
                    }
                } else {
                    return 1;
                }
                return 0;
            },
            finalize: function() {
                return;
            },
            canContain: function(t) {
                return t !== "item";
            },
            acceptsLines: false
        },
        item: {
            continue: function(parser, container) {
                if (parser.blank) {
                    if (container._firstChild == null) {
                        // Blank line after empty list item
                        return 1;
                    } else {
                        parser.advanceNextNonspace();
                    }
                } else if (
                    parser.indent >=
                    container._listData.markerOffset + container._listData.padding
                ) {
                    parser.advanceOffset(
                        container._listData.markerOffset +
                            container._listData.padding,
                        true
                    );
                } else {
                    return 1;
                }
                return 0;
            },
            finalize: function() {
                return;
            },
            canContain: function(t) {
                return t !== "item";
            },
            acceptsLines: false
        },
        heading: {
            continue: function() {
                // a heading can never container > 1 line, so fail to match:
                return 1;
            },
            finalize: function() {
                return;
            },
            canContain: function() {
                return false;
            },
            acceptsLines: false
        },
        thematic_break: {
            continue: function() {
                // a thematic break can never container > 1 line, so fail to match:
                return 1;
            },
            finalize: function() {
                return;
            },
            canContain: function() {
                return false;
            },
            acceptsLines: false
        },
        code_block: {
            continue: function(parser, container) {
                var ln = parser.currentLine;
                var indent = parser.indent;
                if (container._isFenced) {
                    // fenced
                    var match =
                        indent <= 3 &&
                        ln.charAt(parser.nextNonspace) === container._fenceChar &&
                        ln.slice(parser.nextNonspace).match(reClosingCodeFence);
                    if (match && match[0].length >= container._fenceLength) {
                        // closing fence - we're at end of line, so we can return
                        parser.lastLineLength =
                            parser.offset + indent + match[0].length;
                        parser.finalize(container, parser.lineNumber);
                        return 2;
                    } else {
                        // skip optional spaces of fence offset
                        var i = container._fenceOffset;
                        while (i > 0 && isSpaceOrTab(peek$1(ln, parser.offset))) {
                            parser.advanceOffset(1, true);
                            i--;
                        }
                    }
                } else {
                    // indented
                    if (indent >= CODE_INDENT) {
                        parser.advanceOffset(CODE_INDENT, true);
                    } else if (parser.blank) {
                        parser.advanceNextNonspace();
                    } else {
                        return 1;
                    }
                }
                return 0;
            },
            finalize: function(parser, block) {
                if (block._isFenced) {
                    // fenced
                    // first line becomes info string
                    var content = block._string_content;
                    var newlinePos = content.indexOf("\n");
                    var firstLine = content.slice(0, newlinePos);
                    var rest = content.slice(newlinePos + 1);
                    block.info = unescapeString(firstLine.trim());
                    block._literal = rest;
                } else {
                    // indented
                    block._literal = block._string_content.replace(
                        /(\n *)+$/,
                        "\n"
                    );
                }
                block._string_content = null; // allow GC
            },
            canContain: function() {
                return false;
            },
            acceptsLines: true
        },
        html_block: {
            continue: function(parser, container) {
                return parser.blank &&
                    (container._htmlBlockType === 6 ||
                        container._htmlBlockType === 7)
                    ? 1
                    : 0;
            },
            finalize: function(parser, block) {
                block._literal = block._string_content.replace(/(\n *)+$/, "");
                block._string_content = null; // allow GC
            },
            canContain: function() {
                return false;
            },
            acceptsLines: true
        },
        paragraph: {
            continue: function(parser) {
                return parser.blank ? 1 : 0;
            },
            finalize: function(parser, block) {
                var pos;
                var hasReferenceDefs = false;

                // try parsing the beginning as link reference definitions:
                while (
                    peek$1(block._string_content, 0) === C_OPEN_BRACKET$1 &&
                    (pos = parser.inlineParser.parseReference(
                        block._string_content,
                        parser.refmap
                    ))
                ) {
                    block._string_content = block._string_content.slice(pos);
                    hasReferenceDefs = true;
                }
                if (hasReferenceDefs && isBlank(block._string_content)) {
                    block.unlink();
                }
            },
            canContain: function() {
                return false;
            },
            acceptsLines: true
        }
    };

    // block start functions.  Return values:
    // 0 = no match
    // 1 = matched container, keep going
    // 2 = matched leaf, no more block starts
    var blockStarts = [
        // block quote
        function(parser) {
            if (
                !parser.indented &&
                peek$1(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN
            ) {
                parser.advanceNextNonspace();
                parser.advanceOffset(1, false);
                // optional following space
                if (isSpaceOrTab(peek$1(parser.currentLine, parser.offset))) {
                    parser.advanceOffset(1, true);
                }
                parser.closeUnmatchedBlocks();
                parser.addChild("block_quote", parser.nextNonspace);
                return 1;
            } else {
                return 0;
            }
        },

        // ATX heading
        function(parser) {
            var match;
            if (
                !parser.indented &&
                (match = parser.currentLine
                    .slice(parser.nextNonspace)
                    .match(reATXHeadingMarker))
            ) {
                parser.advanceNextNonspace();
                parser.advanceOffset(match[0].length, false);
                parser.closeUnmatchedBlocks();
                var container = parser.addChild("heading", parser.nextNonspace);
                container.level = match[0].trim().length; // number of #s
                // remove trailing ###s:
                container._string_content = parser.currentLine
                    .slice(parser.offset)
                    .replace(/^[ \t]*#+[ \t]*$/, "")
                    .replace(/[ \t]+#+[ \t]*$/, "");
                parser.advanceOffset(parser.currentLine.length - parser.offset);
                return 2;
            } else {
                return 0;
            }
        },

        // Fenced code block
        function(parser) {
            var match;
            if (
                !parser.indented &&
                (match = parser.currentLine
                    .slice(parser.nextNonspace)
                    .match(reCodeFence))
            ) {
                var fenceLength = match[0].length;
                parser.closeUnmatchedBlocks();
                var container = parser.addChild("code_block", parser.nextNonspace);
                container._isFenced = true;
                container._fenceLength = fenceLength;
                container._fenceChar = match[0][0];
                container._fenceOffset = parser.indent;
                parser.advanceNextNonspace();
                parser.advanceOffset(fenceLength, false);
                return 2;
            } else {
                return 0;
            }
        },

        // HTML block
        function(parser, container) {
            if (
                !parser.indented &&
                peek$1(parser.currentLine, parser.nextNonspace) === C_LESSTHAN$1
            ) {
                var s = parser.currentLine.slice(parser.nextNonspace);
                var blockType;

                for (blockType = 1; blockType <= 7; blockType++) {
                    if (
                        reHtmlBlockOpen[blockType].test(s) &&
                        (blockType < 7 || container.type !== "paragraph")
                    ) {
                        parser.closeUnmatchedBlocks();
                        // We don't adjust parser.offset;
                        // spaces are part of the HTML block:
                        var b = parser.addChild("html_block", parser.offset);
                        b._htmlBlockType = blockType;
                        return 2;
                    }
                }
            }

            return 0;
        },

        // Setext heading
        function(parser, container) {
            var match;
            if (
                !parser.indented &&
                container.type === "paragraph" &&
                (match = parser.currentLine
                    .slice(parser.nextNonspace)
                    .match(reSetextHeadingLine))
            ) {
                parser.closeUnmatchedBlocks();
                // resolve reference link definitiosn
                var pos;
                while (
                    peek$1(container._string_content, 0) === C_OPEN_BRACKET$1 &&
                    (pos = parser.inlineParser.parseReference(
                        container._string_content,
                        parser.refmap
                    ))
                ) {
                    container._string_content = container._string_content.slice(
                        pos
                    );
                }
                if (container._string_content.length > 0) {
                    var heading = new Node("heading", container.sourcepos);
                    heading.level = match[0][0] === "=" ? 1 : 2;
                    heading._string_content = container._string_content;
                    container.insertAfter(heading);
                    container.unlink();
                    parser.tip = heading;
                    parser.advanceOffset(
                        parser.currentLine.length - parser.offset,
                        false
                    );
                    return 2;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        },

        // thematic break
        function(parser) {
            if (
                !parser.indented &&
                reThematicBreak.test(parser.currentLine.slice(parser.nextNonspace))
            ) {
                parser.closeUnmatchedBlocks();
                parser.addChild("thematic_break", parser.nextNonspace);
                parser.advanceOffset(
                    parser.currentLine.length - parser.offset,
                    false
                );
                return 2;
            } else {
                return 0;
            }
        },

        // list item
        function(parser, container) {
            var data;

            if (
                (!parser.indented || container.type === "list") &&
                (data = parseListMarker(parser, container))
            ) {
                parser.closeUnmatchedBlocks();

                // add the list if needed
                if (
                    parser.tip.type !== "list" ||
                    !listsMatch(container._listData, data)
                ) {
                    container = parser.addChild("list", parser.nextNonspace);
                    container._listData = data;
                }

                // add the list item
                container = parser.addChild("item", parser.nextNonspace);
                container._listData = data;
                return 1;
            } else {
                return 0;
            }
        },

        // indented code block
        function(parser) {
            if (
                parser.indented &&
                parser.tip.type !== "paragraph" &&
                !parser.blank
            ) {
                // indented code
                parser.advanceOffset(CODE_INDENT, true);
                parser.closeUnmatchedBlocks();
                parser.addChild("code_block", parser.offset);
                return 2;
            } else {
                return 0;
            }
        }
    ];

    var advanceOffset = function(count, columns) {
        var currentLine = this.currentLine;
        var charsToTab, charsToAdvance;
        var c;
        while (count > 0 && (c = currentLine[this.offset])) {
            if (c === "\t") {
                charsToTab = 4 - (this.column % 4);
                if (columns) {
                    this.partiallyConsumedTab = charsToTab > count;
                    charsToAdvance = charsToTab > count ? count : charsToTab;
                    this.column += charsToAdvance;
                    this.offset += this.partiallyConsumedTab ? 0 : 1;
                    count -= charsToAdvance;
                } else {
                    this.partiallyConsumedTab = false;
                    this.column += charsToTab;
                    this.offset += 1;
                    count -= 1;
                }
            } else {
                this.partiallyConsumedTab = false;
                this.offset += 1;
                this.column += 1; // assume ascii; block starts are ascii
                count -= 1;
            }
        }
    };

    var advanceNextNonspace = function() {
        this.offset = this.nextNonspace;
        this.column = this.nextNonspaceColumn;
        this.partiallyConsumedTab = false;
    };

    var findNextNonspace = function() {
        var currentLine = this.currentLine;
        var i = this.offset;
        var cols = this.column;
        var c;

        while ((c = currentLine.charAt(i)) !== "") {
            if (c === " ") {
                i++;
                cols++;
            } else if (c === "\t") {
                i++;
                cols += 4 - (cols % 4);
            } else {
                break;
            }
        }
        this.blank = c === "\n" || c === "\r" || c === "";
        this.nextNonspace = i;
        this.nextNonspaceColumn = cols;
        this.indent = this.nextNonspaceColumn - this.column;
        this.indented = this.indent >= CODE_INDENT;
    };

    // Analyze a line of text and update the document appropriately.
    // We parse markdown text by calling this on each line of input,
    // then finalizing the document.
    var incorporateLine = function(ln) {
        var all_matched = true;
        var t;

        var container = this.doc;
        this.oldtip = this.tip;
        this.offset = 0;
        this.column = 0;
        this.blank = false;
        this.partiallyConsumedTab = false;
        this.lineNumber += 1;

        // replace NUL characters for security
        if (ln.indexOf("\u0000") !== -1) {
            ln = ln.replace(/\0/g, "\uFFFD");
        }

        this.currentLine = ln;

        // For each containing block, try to parse the associated line start.
        // Bail out on failure: container will point to the last matching block.
        // Set all_matched to false if not all containers match.
        var lastChild;
        while ((lastChild = container._lastChild) && lastChild._open) {
            container = lastChild;

            this.findNextNonspace();

            switch (this.blocks[container.type].continue(this, container)) {
                case 0: // we've matched, keep going
                    break;
                case 1: // we've failed to match a block
                    all_matched = false;
                    break;
                case 2: // we've hit end of line for fenced code close and can return
                    return;
                default:
                    throw "continue returned illegal value, must be 0, 1, or 2";
            }
            if (!all_matched) {
                container = container._parent; // back up to last matching block
                break;
            }
        }

        this.allClosed = container === this.oldtip;
        this.lastMatchedContainer = container;

        var matchedLeaf =
            container.type !== "paragraph" && blocks[container.type].acceptsLines;
        var starts = this.blockStarts;
        var startsLen = starts.length;
        // Unless last matched container is a code block, try new container starts,
        // adding children to the last matched container:
        while (!matchedLeaf) {
            this.findNextNonspace();

            // this is a little performance optimization:
            if (
                !this.indented &&
                !reMaybeSpecial.test(ln.slice(this.nextNonspace))
            ) {
                this.advanceNextNonspace();
                break;
            }

            var i = 0;
            while (i < startsLen) {
                var res = starts[i](this, container);
                if (res === 1) {
                    container = this.tip;
                    break;
                } else if (res === 2) {
                    container = this.tip;
                    matchedLeaf = true;
                    break;
                } else {
                    i++;
                }
            }

            if (i === startsLen) {
                // nothing matched
                this.advanceNextNonspace();
                break;
            }
        }

        // What remains at the offset is a text line.  Add the text to the
        // appropriate container.

        // First check for a lazy paragraph continuation:
        if (!this.allClosed && !this.blank && this.tip.type === "paragraph") {
            // lazy paragraph continuation
            this.addLine();
        } else {
            // not a lazy continuation

            // finalize any blocks not matched
            this.closeUnmatchedBlocks();
            if (this.blank && container.lastChild) {
                container.lastChild._lastLineBlank = true;
            }

            t = container.type;

            // Block quote lines are never blank as they start with >
            // and we don't count blanks in fenced code for purposes of tight/loose
            // lists or breaking out of lists.  We also don't set _lastLineBlank
            // on an empty list item, or if we just closed a fenced block.
            var lastLineBlank =
                this.blank &&
                !(
                    t === "block_quote" ||
                    (t === "code_block" && container._isFenced) ||
                    (t === "item" &&
                        !container._firstChild &&
                        container.sourcepos[0][0] === this.lineNumber)
                );

            // propagate lastLineBlank up through parents:
            var cont = container;
            while (cont) {
                cont._lastLineBlank = lastLineBlank;
                cont = cont._parent;
            }

            if (this.blocks[t].acceptsLines) {
                this.addLine();
                // if HtmlBlock, check for end condition
                if (
                    t === "html_block" &&
                    container._htmlBlockType >= 1 &&
                    container._htmlBlockType <= 5 &&
                    reHtmlBlockClose[container._htmlBlockType].test(
                        this.currentLine.slice(this.offset)
                    )
                ) {
                    this.lastLineLength = ln.length;
                    this.finalize(container, this.lineNumber);
                }
            } else if (this.offset < ln.length && !this.blank) {
                // create paragraph container for line
                container = this.addChild("paragraph", this.offset);
                this.advanceNextNonspace();
                this.addLine();
            }
        }
        this.lastLineLength = ln.length;
    };

    // Finalize a block.  Close it and do any necessary postprocessing,
    // e.g. creating string_content from strings, setting the 'tight'
    // or 'loose' status of a list, and parsing the beginnings
    // of paragraphs for reference definitions.  Reset the tip to the
    // parent of the closed block.
    var finalize = function(block, lineNumber) {
        var above = block._parent;
        block._open = false;
        block.sourcepos[1] = [lineNumber, this.lastLineLength];

        this.blocks[block.type].finalize(this, block);

        this.tip = above;
    };

    // Walk through a block & children recursively, parsing string content
    // into inline content where appropriate.
    var processInlines = function(block) {
        var node, event, t;
        var walker = block.walker();
        this.inlineParser.refmap = this.refmap;
        this.inlineParser.options = this.options;
        while ((event = walker.next())) {
            node = event.node;
            t = node.type;
            if (!event.entering && (t === "paragraph" || t === "heading")) {
                this.inlineParser.parse(node);
            }
        }
    };

    var Document = function() {
        var doc = new Node("document", [
            [1, 1],
            [0, 0]
        ]);
        return doc;
    };

    // The main parsing function.  Returns a parsed document AST.
    var parse = function(input) {
        this.doc = new Document();
        this.tip = this.doc;
        this.refmap = {};
        this.lineNumber = 0;
        this.lastLineLength = 0;
        this.offset = 0;
        this.column = 0;
        this.lastMatchedContainer = this.doc;
        this.currentLine = "";
        if (this.options.time) {
            console.time("preparing input");
        }
        var lines = input.split(reLineEnding);
        var len = lines.length;
        if (input.charCodeAt(input.length - 1) === C_NEWLINE$1) {
            // ignore last blank line created by final newline
            len -= 1;
        }
        if (this.options.time) {
            console.timeEnd("preparing input");
        }
        if (this.options.time) {
            console.time("block parsing");
        }
        for (var i = 0; i < len; i++) {
            this.incorporateLine(lines[i]);
        }
        while (this.tip) {
            this.finalize(this.tip, len);
        }
        if (this.options.time) {
            console.timeEnd("block parsing");
        }
        if (this.options.time) {
            console.time("inline parsing");
        }
        this.processInlines(this.doc);
        if (this.options.time) {
            console.timeEnd("inline parsing");
        }
        return this.doc;
    };

    // The Parser object.
    function Parser(options) {
        return {
            doc: new Document(),
            blocks: blocks,
            blockStarts: blockStarts,
            tip: this.doc,
            oldtip: this.doc,
            currentLine: "",
            lineNumber: 0,
            offset: 0,
            column: 0,
            nextNonspace: 0,
            nextNonspaceColumn: 0,
            indent: 0,
            indented: false,
            blank: false,
            partiallyConsumedTab: false,
            allClosed: true,
            lastMatchedContainer: this.doc,
            refmap: {},
            lastLineLength: 0,
            inlineParser: new InlineParser(options),
            findNextNonspace: findNextNonspace,
            advanceOffset: advanceOffset,
            advanceNextNonspace: advanceNextNonspace,
            addLine: addLine,
            addChild: addChild,
            incorporateLine: incorporateLine,
            finalize: finalize,
            processInlines: processInlines,
            closeUnmatchedBlocks: closeUnmatchedBlocks,
            parse: parse,
            options: options || {}
        };
    }

    function Renderer() {}

    /**
     *  Walks the AST and calls member methods for each Node type.
     *
     *  @param ast {Node} The root of the abstract syntax tree.
     */
    function render(ast) {
        var walker = ast.walker(),
            event,
            type;

        this.buffer = "";
        this.lastOut = "\n";

        while ((event = walker.next())) {
            type = event.node.type;
            if (this[type]) {
                this[type](event.node, event.entering);
            }
        }
        return this.buffer;
    }

    /**
     *  Concatenate a literal string to the buffer.
     *
     *  @param str {String} The string to concatenate.
     */
    function lit(str) {
        this.buffer += str;
        this.lastOut = str;
    }

    /**
     *  Output a newline to the buffer.
     */
    function cr() {
        if (this.lastOut !== "\n") {
            this.lit("\n");
        }
    }

    /**
     *  Concatenate a string to the buffer possibly escaping the content.
     *
     *  Concrete renderer implementations should override this method.
     *
     *  @param str {String} The string to concatenate.
     */
    function out(str) {
        this.lit(str);
    }

    /**
     *  Escape a string for the target renderer.
     *
     *  Abstract function that should be implemented by concrete
     *  renderer implementations.
     *
     *  @param str {String} The string to escape.
     */
    function esc(str) {
        return str;
    }

    Renderer.prototype.render = render;
    Renderer.prototype.out = out;
    Renderer.prototype.lit = lit;
    Renderer.prototype.cr = cr;
    Renderer.prototype.esc = esc;

    var reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
    var reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

    var potentiallyUnsafe = function(url) {
        return reUnsafeProtocol.test(url) && !reSafeDataProtocol.test(url);
    };

    // Helper function to produce an HTML tag.
    function tag(name, attrs, selfclosing) {
        if (this.disableTags > 0) {
            return;
        }
        this.buffer += "<" + name;
        if (attrs && attrs.length > 0) {
            var i = 0;
            var attrib;
            while ((attrib = attrs[i]) !== undefined) {
                this.buffer += " " + attrib[0] + '="' + attrib[1] + '"';
                i++;
            }
        }
        if (selfclosing) {
            this.buffer += " /";
        }
        this.buffer += ">";
        this.lastOut = ">";
    }

    function HtmlRenderer(options) {
        options = options || {};
        // by default, soft breaks are rendered as newlines in HTML
        options.softbreak = options.softbreak || "\n";
        // set to "<br />" to make them hard breaks
        // set to " " if you want to ignore line wrapping in source

        this.disableTags = 0;
        this.lastOut = "\n";
        this.options = options;
    }

    /* Node methods */

    function text$1(node) {
        this.out(node.literal);
    }

    function softbreak() {
        this.lit(this.options.softbreak);
    }

    function linebreak() {
        this.tag("br", [], true);
        this.cr();
    }

    function link(node, entering) {
        var attrs = this.attrs(node);
        if (entering) {
            if (!(this.options.safe && potentiallyUnsafe(node.destination))) {
                attrs.push(["href", this.esc(node.destination)]);
            }
            if (node.title) {
                attrs.push(["title", this.esc(node.title)]);
            }
            this.tag("a", attrs);
        } else {
            this.tag("/a");
        }
    }

    function image$1(node, entering) {
        if (entering) {
            if (this.disableTags === 0) {
                if (this.options.safe && potentiallyUnsafe(node.destination)) {
                    this.lit('<img src="" alt="');
                } else {
                    this.lit('<img src="' + this.esc(node.destination) + '" alt="');
                }
            }
            this.disableTags += 1;
        } else {
            this.disableTags -= 1;
            if (this.disableTags === 0) {
                if (node.title) {
                    this.lit('" title="' + this.esc(node.title));
                }
                this.lit('" />');
            }
        }
    }

    function emph(node, entering) {
        this.tag(entering ? "em" : "/em");
    }

    function strong(node, entering) {
        this.tag(entering ? "strong" : "/strong");
    }

    function paragraph(node, entering) {
        var grandparent = node.parent.parent,
            attrs = this.attrs(node);
        if (grandparent !== null && grandparent.type === "list") {
            if (grandparent.listTight) {
                return;
            }
        }
        if (entering) {
            this.cr();
            this.tag("p", attrs);
        } else {
            this.tag("/p");
            this.cr();
        }
    }

    function heading(node, entering) {
        var tagname = "h" + node.level,
            attrs = this.attrs(node);
        if (entering) {
            this.cr();
            this.tag(tagname, attrs);
        } else {
            this.tag("/" + tagname);
            this.cr();
        }
    }

    function code(node) {
        this.tag("code");
        this.out(node.literal);
        this.tag("/code");
    }

    function code_block(node) {
        var info_words = node.info ? node.info.split(/\s+/) : [],
            attrs = this.attrs(node);
        if (info_words.length > 0 && info_words[0].length > 0) {
            attrs.push(["class", "language-" + this.esc(info_words[0])]);
        }
        this.cr();
        this.tag("pre");
        this.tag("code", attrs);
        this.out(node.literal);
        this.tag("/code");
        this.tag("/pre");
        this.cr();
    }

    function thematic_break(node) {
        var attrs = this.attrs(node);
        this.cr();
        this.tag("hr", attrs, true);
        this.cr();
    }

    function block_quote(node, entering) {
        var attrs = this.attrs(node);
        if (entering) {
            this.cr();
            this.tag("blockquote", attrs);
            this.cr();
        } else {
            this.cr();
            this.tag("/blockquote");
            this.cr();
        }
    }

    function list(node, entering) {
        var tagname = node.listType === "bullet" ? "ul" : "ol",
            attrs = this.attrs(node);

        if (entering) {
            var start = node.listStart;
            if (start !== null && start !== 1) {
                attrs.push(["start", start.toString()]);
            }
            this.cr();
            this.tag(tagname, attrs);
            this.cr();
        } else {
            this.cr();
            this.tag("/" + tagname);
            this.cr();
        }
    }

    function item(node, entering) {
        var attrs = this.attrs(node);
        if (entering) {
            this.tag("li", attrs);
        } else {
            this.tag("/li");
            this.cr();
        }
    }

    function html_inline(node) {
        if (this.options.safe) {
            this.lit("<!-- raw HTML omitted -->");
        } else {
            this.lit(node.literal);
        }
    }

    function html_block(node) {
        this.cr();
        if (this.options.safe) {
            this.lit("<!-- raw HTML omitted -->");
        } else {
            this.lit(node.literal);
        }
        this.cr();
    }

    function custom_inline(node, entering) {
        if (entering && node.onEnter) {
            this.lit(node.onEnter);
        } else if (!entering && node.onExit) {
            this.lit(node.onExit);
        }
    }

    function custom_block(node, entering) {
        this.cr();
        if (entering && node.onEnter) {
            this.lit(node.onEnter);
        } else if (!entering && node.onExit) {
            this.lit(node.onExit);
        }
        this.cr();
    }

    /* Helper methods */

    function out$1(s) {
        this.lit(this.esc(s));
    }

    function attrs(node) {
        var att = [];
        if (this.options.sourcepos) {
            var pos = node.sourcepos;
            if (pos) {
                att.push([
                    "data-sourcepos",
                    String(pos[0][0]) +
                        ":" +
                        String(pos[0][1]) +
                        "-" +
                        String(pos[1][0]) +
                        ":" +
                        String(pos[1][1])
                ]);
            }
        }
        return att;
    }

    // quick browser-compatible inheritance
    HtmlRenderer.prototype = Object.create(Renderer.prototype);

    HtmlRenderer.prototype.text = text$1;
    HtmlRenderer.prototype.html_inline = html_inline;
    HtmlRenderer.prototype.html_block = html_block;
    HtmlRenderer.prototype.softbreak = softbreak;
    HtmlRenderer.prototype.linebreak = linebreak;
    HtmlRenderer.prototype.link = link;
    HtmlRenderer.prototype.image = image$1;
    HtmlRenderer.prototype.emph = emph;
    HtmlRenderer.prototype.strong = strong;
    HtmlRenderer.prototype.paragraph = paragraph;
    HtmlRenderer.prototype.heading = heading;
    HtmlRenderer.prototype.code = code;
    HtmlRenderer.prototype.code_block = code_block;
    HtmlRenderer.prototype.thematic_break = thematic_break;
    HtmlRenderer.prototype.block_quote = block_quote;
    HtmlRenderer.prototype.list = list;
    HtmlRenderer.prototype.item = item;
    HtmlRenderer.prototype.custom_inline = custom_inline;
    HtmlRenderer.prototype.custom_block = custom_block;

    HtmlRenderer.prototype.esc = escapeXml;

    HtmlRenderer.prototype.out = out$1;
    HtmlRenderer.prototype.tag = tag;
    HtmlRenderer.prototype.attrs = attrs;

    var reXMLTag = /\<[^>]*\>/;

    function toTagName(s) {
        return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
    }

    function XmlRenderer(options) {
        options = options || {};

        this.disableTags = 0;
        this.lastOut = "\n";

        this.indentLevel = 0;
        this.indent = "  ";

        this.options = options;
    }

    function render$1(ast) {
        this.buffer = "";

        var attrs;
        var tagname;
        var walker = ast.walker();
        var event, node, entering;
        var container;
        var selfClosing;
        var nodetype;

        var options = this.options;

        if (options.time) {
            console.time("rendering");
        }

        this.buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
        this.buffer += '<!DOCTYPE document SYSTEM "CommonMark.dtd">\n';

        while ((event = walker.next())) {
            entering = event.entering;
            node = event.node;
            nodetype = node.type;

            container = node.isContainer;

            selfClosing =
                nodetype === "thematic_break" ||
                nodetype === "linebreak" ||
                nodetype === "softbreak";

            tagname = toTagName(nodetype);

            if (entering) {
                attrs = [];

                switch (nodetype) {
                    case "document":
                        attrs.push(["xmlns", "http://commonmark.org/xml/1.0"]);
                        break;
                    case "list":
                        if (node.listType !== null) {
                            attrs.push(["type", node.listType.toLowerCase()]);
                        }
                        if (node.listStart !== null) {
                            attrs.push(["start", String(node.listStart)]);
                        }
                        if (node.listTight !== null) {
                            attrs.push([
                                "tight",
                                node.listTight ? "true" : "false"
                            ]);
                        }
                        var delim = node.listDelimiter;
                        if (delim !== null) {
                            var delimword = "";
                            if (delim === ".") {
                                delimword = "period";
                            } else {
                                delimword = "paren";
                            }
                            attrs.push(["delimiter", delimword]);
                        }
                        break;
                    case "code_block":
                        if (node.info) {
                            attrs.push(["info", node.info]);
                        }
                        break;
                    case "heading":
                        attrs.push(["level", String(node.level)]);
                        break;
                    case "link":
                    case "image":
                        attrs.push(["destination", node.destination]);
                        attrs.push(["title", node.title]);
                        break;
                    case "custom_inline":
                    case "custom_block":
                        attrs.push(["on_enter", node.onEnter]);
                        attrs.push(["on_exit", node.onExit]);
                        break;
                }
                if (options.sourcepos) {
                    var pos = node.sourcepos;
                    if (pos) {
                        attrs.push([
                            "sourcepos",
                            String(pos[0][0]) +
                                ":" +
                                String(pos[0][1]) +
                                "-" +
                                String(pos[1][0]) +
                                ":" +
                                String(pos[1][1])
                        ]);
                    }
                }

                this.cr();
                this.out(this.tag(tagname, attrs, selfClosing));
                if (container) {
                    this.indentLevel += 1;
                } else if (!container && !selfClosing) {
                    var lit = node.literal;
                    if (lit) {
                        this.out(this.esc(lit));
                    }
                    this.out(this.tag("/" + tagname));
                }
            } else {
                this.indentLevel -= 1;
                this.cr();
                this.out(this.tag("/" + tagname));
            }
        }
        if (options.time) {
            console.timeEnd("rendering");
        }
        this.buffer += "\n";
        return this.buffer;
    }

    function out$2(s) {
        if (this.disableTags > 0) {
            this.buffer += s.replace(reXMLTag, "");
        } else {
            this.buffer += s;
        }
        this.lastOut = s;
    }

    function cr$1() {
        if (this.lastOut !== "\n") {
            this.buffer += "\n";
            this.lastOut = "\n";
            for (var i = this.indentLevel; i > 0; i--) {
                this.buffer += this.indent;
            }
        }
    }

    // Helper function to produce an XML tag.
    function tag$1(name, attrs, selfclosing) {
        var result = "<" + name;
        if (attrs && attrs.length > 0) {
            var i = 0;
            var attrib;
            while ((attrib = attrs[i]) !== undefined) {
                result += " " + attrib[0] + '="' + this.esc(attrib[1]) + '"';
                i++;
            }
        }
        if (selfclosing) {
            result += " /";
        }
        result += ">";
        return result;
    }

    // quick browser-compatible inheritance
    XmlRenderer.prototype = Object.create(Renderer.prototype);

    XmlRenderer.prototype.render = render$1;
    XmlRenderer.prototype.out = out$2;
    XmlRenderer.prototype.cr = cr$1;
    XmlRenderer.prototype.tag = tag$1;
    XmlRenderer.prototype.esc = escapeXml;

    exports.HtmlRenderer = HtmlRenderer;
    exports.Node = Node;
    exports.Parser = Parser;
    exports.Renderer = Renderer;
    exports.XmlRenderer = XmlRenderer;

    Object.defineProperty(exports, '__esModule', { value: true });

})));


/***/ }),

/***/ 9488:
/***/ ((module) => {

"use strict";

const peq = new Uint32Array(0x10000);
const myers_32 = (a, b) => {
  const n = a.length;
  const m = b.length;
  const lst = 1 << (n - 1);
  let pv = -1;
  let mv = 0;
  let sc = n;
  let i = n;
  while (i--) {
    peq[a.charCodeAt(i)] |= 1 << i;
  }
  for (i = 0; i < m; i++) {
    let eq = peq[b.charCodeAt(i)];
    const xv = eq | mv;
    eq |= ((eq & pv) + pv) ^ pv;
    mv |= ~(eq | pv);
    pv &= eq;
    if (mv & lst) {
      sc++;
    }
    if (pv & lst) {
      sc--;
    }
    mv = (mv << 1) | 1;
    pv = (pv << 1) | ~(xv | mv);
    mv &= xv;
  }
  i = n;
  while (i--) {
    peq[a.charCodeAt(i)] = 0;
  }
  return sc;
};

const myers_x = (a, b) => {
  const n = a.length;
  const m = b.length;
  const mhc = [];
  const phc = [];
  const hsize = Math.ceil(n / 32);
  const vsize = Math.ceil(m / 32);
  let score = m;
  for (let i = 0; i < hsize; i++) {
    phc[i] = -1;
    mhc[i] = 0;
  }
  let j = 0;
  for (; j < vsize - 1; j++) {
    let mv = 0;
    let pv = -1;
    const start = j * 32;
    const end = Math.min(32, m) + start;
    for (let k = start; k < end; k++) {
      peq[b.charCodeAt(k)] |= 1 << k;
    }
    score = m;
    for (let i = 0; i < n; i++) {
      const eq = peq[a.charCodeAt(i)];
      const pb = (phc[(i / 32) | 0] >>> i) & 1;
      const mb = (mhc[(i / 32) | 0] >>> i) & 1;
      const xv = eq | mv;
      const xh = ((((eq | mb) & pv) + pv) ^ pv) | eq | mb;
      let ph = mv | ~(xh | pv);
      let mh = pv & xh;
      if ((ph >>> 31) ^ pb) {
        phc[(i / 32) | 0] ^= 1 << i;
      }
      if ((mh >>> 31) ^ mb) {
        mhc[(i / 32) | 0] ^= 1 << i;
      }
      ph = (ph << 1) | pb;
      mh = (mh << 1) | mb;
      pv = mh | ~(xv | ph);
      mv = ph & xv;
    }
    for (let k = start; k < end; k++) {
      peq[b.charCodeAt(k)] = 0;
    }
  }
  let mv = 0;
  let pv = -1;
  const start = j * 32;
  const end = Math.min(32, m - start) + start;
  for (let k = start; k < end; k++) {
    peq[b.charCodeAt(k)] |= 1 << k;
  }
  score = m;
  for (let i = 0; i < n; i++) {
    const eq = peq[a.charCodeAt(i)];
    const pb = (phc[(i / 32) | 0] >>> i) & 1;
    const mb = (mhc[(i / 32) | 0] >>> i) & 1;
    const xv = eq | mv;
    const xh = ((((eq | mb) & pv) + pv) ^ pv) | eq | mb;
    let ph = mv | ~(xh | pv);
    let mh = pv & xh;
    score += (ph >>> (m - 1)) & 1;
    score -= (mh >>> (m - 1)) & 1;
    if ((ph >>> 31) ^ pb) {
      phc[(i / 32) | 0] ^= 1 << i;
    }
    if ((mh >>> 31) ^ mb) {
      mhc[(i / 32) | 0] ^= 1 << i;
    }
    ph = (ph << 1) | pb;
    mh = (mh << 1) | mb;
    pv = mh | ~(xv | ph);
    mv = ph & xv;
  }
  for (let k = start; k < end; k++) {
    peq[b.charCodeAt(k)] = 0;
  }
  return score;
};

const distance = (a, b) => {
  if (a.length > b.length) {
    const tmp = b;
    b = a;
    a = tmp;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (a.length <= 32) {
    return myers_32(a, b);
  }
  return myers_x(a, b);
};

const closest = (str, arr) => {
  let min_distance = Infinity;
  let min_index = 0;
  for (let i = 0; i < arr.length; i++) {
    const dist = distance(str, arr[i]);
    if (dist < min_distance) {
      min_distance = dist;
      min_index = i;
    }
  }
  return arr[min_index];
};

module.exports = {
  closest, distance
}


/***/ }),

/***/ 27:
/***/ ((module) => {

"use strict";


module.exports = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};


/***/ }),

/***/ 7797:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const os = __nccwpck_require__(2087);
const tty = __nccwpck_require__(3867);
const hasFlag = __nccwpck_require__(27);

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};


/***/ }),

/***/ 2357:
/***/ ((module) => {

"use strict";
module.exports = require("assert");;

/***/ }),

/***/ 3129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");;

/***/ }),

/***/ 8614:
/***/ ((module) => {

"use strict";
module.exports = require("events");;

/***/ }),

/***/ 5747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 2087:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 5622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 4304:
/***/ ((module) => {

"use strict";
module.exports = require("string_decoder");;

/***/ }),

/***/ 8213:
/***/ ((module) => {

"use strict";
module.exports = require("timers");;

/***/ }),

/***/ 3867:
/***/ ((module) => {

"use strict";
module.exports = require("tty");;

/***/ }),

/***/ 8835:
/***/ ((module) => {

"use strict";
module.exports = require("url");;

/***/ }),

/***/ 1669:
/***/ ((module) => {

"use strict";
module.exports = require("util");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__nccwpck_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(3109);
/******/ })()
;
//# sourceMappingURL=index.js.map