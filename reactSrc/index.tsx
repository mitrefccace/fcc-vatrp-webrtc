import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.scss';
import { Provider } from "react-redux";
import store from "./store/index";
import Vatrp from './Vatrp'
import * as serviceWorker from './serviceWorker';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAddressBook, faAngleLeft, faAngleRight, faBug, faCaretLeft, faCogs,
  faEdit, faEnvelope,faFileImport, faFileExport, faExpand, faCompress, faKeyboard, faListAlt,
  faMicrophone, faMicrophoneSlash, faPause, faPhone, faPhoneSlash, faPhoneSquare,
  faPhoneVolume, faPlay, faSignOutAlt, faSync, faUpload, faUserMinus, faUserPlus,
  faVideo, faVideoSlash, faVoicemail, faWifi, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons'

library.add( faAddressBook, faAngleLeft, faAngleRight, faBug, faCaretLeft, faCogs,
  faEdit, faEnvelope,faFileImport, faFileExport, faExpand, faCompress, faKeyboard, faListAlt,
  faMicrophone, faMicrophoneSlash, faPause, faPhone, faPhoneSlash, faPhoneSquare,
  faPhoneVolume, faPlay, faSignOutAlt, faSync, faUpload, faUserMinus, faUserPlus,
  faVideo, faVideoSlash, faVoicemail, faWifi, faMinusCircle, faPlusCircle )

//ReactDOM.render(<Vatrp />, document.getElementById('root'));
ReactDOM.render(<Provider store={store}>
  <Vatrp />
</Provider>,
document.getElementById('root'))
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
