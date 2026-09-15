/** @type {import('stylelint').Config} */
export default {
  "extends": ["stylelint-config-standard"],
  "plugins": [
    "stylelint-selector-bem-pattern"
  ],
  "rules": {
    // ...
    "plugin/selector-bem-pattern": {
      "componentName": "[A-Z]+",
      "componentSelectors": {
        "initial": "^\\.{componentName}(?:-[a-z]+)?$",
        "combined": "^\\.combined-{componentName}-[a-z]+$"
      },
      "preset": "bem", 
      "utilitySelectors": "^\\.util-[a-z]+$"
    }
  }
};
