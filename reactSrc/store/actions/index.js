//believe this is now obselete

import { UPDATE_CALL_STATUS } from "../constants/action-types";
import { TEXT_UPDATED} from "../constants/action-types";
import {ADD_T140_ARRAY} from "../constants/action-types";
import {BACKSPACE_T140_ARRAY} from '../constants/action-types';
import {UPDATE_SETTINGS} from '../constants/action-types';
import {LOAD_SETTING} from '../constants/action-types';
import {SET_CURRENT_USER} from '../constants/action-types';
import {GET_CURRENT_USER} from '../constants/action-types';
import {LOAD_DEFAULT_USER_SETTINGS} from '../constants/action-types';
import {RTT_REGISTER} from '../constants/action-types';
import {RTT_INIT} from '../constants/action-types';

export default function callConnected(payload) {
  return { type: UPDATE_CALL_STATUS, payload }
};

export function textUpdated(payload) {
  return { type: TEXT_UPDATED, payload }
};

export function addT140Array(payload) {
  return { type: ADD_T140_ARRAY, payload }
};

export function backspaceT140Array(payload) {
  return { type: BACKSPACE_T140_ARRAY, payload }
};

export function updateSettings(payload) {
  return { type: UPDATE_SETTINGS, payload }
};

export function loadSetting(payload) {
  return { type: LOAD_SETTING, payload }
};

export function setCurrentUser(payload) {
  return { type: SET_CURRENT_USER, payload }
};

export function getCurrentUser(payload) {
  return { type: GET_CURRENT_USER, payload }
};

export function loadDefaultUserSettings(payload) {
  return { type: LOAD_DEFAULT_USER_SETTINGS, payload }
};

export function rttRegister(payload){
  return { type: RTT_REGISTER, payload}
};

export function rttInit(payload){
  return { type: RTT_INIT, payload}
}