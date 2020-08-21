import * as _ from 'lodash';
import { createValidate, isEmptyArray, isEmptyString, isInvalidDates } from './pureFunctions';
// import { isAllUnique } from 'utils/array';
type TDocument = { id: string; type: string };

const webSitePattern = /^((https?|s?ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

export const isRequired = {
  ...createValidate(
    v => v === undefined || v === null || isEmptyString(v),
    'This field is required!'
  ),
  validateType: 'requiredValidator',
};

// export const isUnique = (err: string) => {
//   return {
//     ...createValidate(v => (v ? !isAllUnique(v) : false), err),
//     validateType: 'requiredValidator',
//   };
// };

export const isLess = (limit: number, err: string) => ({
  ...createValidate(v => Number(v) > limit, err),
  validateType: 'requiredValidator',
});

export const minLength = (limit: number, err: string) => ({
  ...createValidate(v => (v ? v.length < limit : true), err),
  validateType: 'requiredValidator',
});

export const maxLength = (limit: number, err: string) => ({
  ...createValidate(v => (v ? v.length >= limit : true), err),
  validateType: 'requiredValidator',
});

export const isCorrectDates = {
  ...createValidate(isInvalidDates, 'Please fill this field!'),
  validateType: 'requiredValidator',
};

export const isNotEmptyArray = {
  ...createValidate(isEmptyArray, 'Пожалуйста, заполните поле!'),
  validateType: 'requiredValidator',
};

export const isNotEmptyImageList = {
  ...createValidate(isEmptyArray, 'Please add image here!'),
  validateType: 'requiredValidator',
};

export const isNotEmptyDocumentList = {
  ...createValidate(isEmptyArray, 'Please add document here!'),
  validateType: 'requiredValidator',
};

export const isHasTypeDocumentList = {
  ...createValidate(
    (documents: TDocument[]) => documents && documents.some((doc: TDocument) => doc.type === null),
    'Все документы должны иметь тип'
  ),
  validateType: 'requiredValidator',
};

export const isDocumentHasType = {
  ...createValidate(
    (document: TDocument) => document && document.type === null,
    'Документ должен иметь тип'
  ),
  validateType: 'requiredValidator',
};

export const isConfirm = {
  ...createValidate(value => value !== true, 'You must confirm this block before next actions'),
  validateType: 'requiredValidator',
};

export const isConfirmSimplex = {
  ...createValidate(
    value => value !== true,
    'Please read the Agreement and accept its terms before purchase'
  ),
  validateType: 'requiredValidator',
};

export const isBoolean = {
  ...createValidate(value => typeof value !== 'boolean', 'You must fill this field!'),
  validateType: 'requiredValidator',
};

export const isName = {
  pattern: /^[\s\dA-Za-z'.-]+$/gi,
  message: "Please use latin characters and symbols '.-",
};

export const isAddress = {
  pattern: /^[\s\dA-Za-z,.\-"']+$/gi,
  message: 'Please use latin characters and symbols ,.-"\'',
};

export const notEnoughCharacters = { min: 2, message: 'Not enough characters' };

export const maxCharacters = { max: 255, message: 'Maximum string length is 255 characters' };

export const isNumber = {
  pattern: /^[\d]+$/gi,
  message: 'Numbers only, no dash or any other separator.',
  whitespace: true,
};

export const isFloatingNumber = {
  pattern: /^[+-]?([0-9]*[.])?[0-9]+$/gi,
  message: 'Numbers only, no dash or any other separator.',
  whitespace: true,
};

export const isWebsite = {
  pattern: webSitePattern,
  message: 'Website url not correct',
};

export const isYoutube = createValidate(v => !webSitePattern.test(v), 'Youtube url not correct');

export const isNotChannel = createValidate(
  v => v.indexOf('channel') !== -1,
  `Can't be a channel url`
);

export const isEmail = {
  pattern: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
  message: 'Некорректный e-mail',
};

export const isPositive = createValidate(v => _.isNumber(v) && v <= 0, 'Positive number only!');

// * Kits - grouping rules * //
export const def = {
  name: [isName, notEnoughCharacters, maxCharacters],
  address: [isAddress, notEnoughCharacters],
};
