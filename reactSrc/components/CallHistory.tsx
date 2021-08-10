import React from 'react';
import './CallHistory.css';
//import SettingsService from '../services/SettingsService';
import JssipService from '../services/JssipService';
import { Button, Table, Tooltip, OverlayTrigger} from 'react-bootstrap';
import ActivePanel from '../services/ActivePanelEnum';
import EditContactModal from './modals/EditContactModal/EditContactModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect, ConnectedProps } from 'react-redux';
import { UpdateUserSetting } from '../store/settings/actions';
import { IntUpdateSettingsType } from '../store/settings/types';

const Store = require('electron-store');
const store = new Store();
const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};

const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch(UpdateUserSetting(name))
}); 

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type CallHistoryProps = PropsFromRedux & {
  jssipService   : JssipService,
  setActivePanel : Function,
};

type CallHistoryState = {
  currentUser     : string,
  showContactModal: boolean,
  newContactNumber : string,
  numberActive: boolean,
};

class CallHistory extends React.Component<CallHistoryProps, CallHistoryState>{
  constructor(props: CallHistoryProps){
    super(props);
    this.state = {
      currentUser       : props.settings.currentUser ? props.settings.currentUser : '',
      showContactModal: false,
      newContactNumber : "",
      numberActive: true,
    }

    this.loadCallHistoryHeader = this.loadCallHistoryHeader.bind(this);
    this.setContactModalVisibility = this.setContactModalVisibility.bind(this);
    this.toggleListingPreference = this.toggleListingPreference.bind(this); 
    
    if(!store.has('currentUser')){
      store.set('currentUser','');
    }
    if (!store.has(this.state.currentUser + '.callHistory.callHistoryList')) {
      store.set(this.state.currentUser + '.callHistory.callHistoryList', []);
    }
  }

  toggleListingPreference(event : React.ChangeEvent<HTMLInputElement>) {
    if (event.target.value === 'Name')
      this.setState({ numberActive: false });
    else
      this.setState({ numberActive: true });
  }

  setContactModalVisibility(visible: boolean) {
    this.setState({showContactModal: visible});
  }

  loadCallHistoryHeader(){
    let header = ["Caller Info", "Direction", "Duration (s)", "Date", "Actions"];

    return header.map((key, index) => {
      return <th key={index}>{key}</th>
    })
  }
  
  findName(number: string) {
    let name: string = ''
    const contactList= this.props.settings.contacts.contactsList
    contactList.forEach((i: any) => i.numbers.forEach((j: any) => {
      if (number === j.number) name = i.name;
     }));
    return name;
  }

  loadCallHistory(){
    console.dir(store.get(this.state.currentUser + '.callHistory.callHistoryList'))
    const callHistory = this.props.settings.callHistory.callHistoryList
    
    return callHistory.map((callHistory: {number : any, type : string, duration : string, date : Date}, index : any) => {
      const { number, type, duration, date } = callHistory
      let contactName = this.findName(number)
      if (contactName === ''){
        contactName = 'Unnamed Contact'
      }
      return (
        <tr key={index}>
          <td style={{ whiteSpace: "pre-line" }}>{contactName + '\n' + number}</td>
          <td>{type}</td>
          <td>{duration}</td>
          <td>{date}</td>
          <td>
          <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={'callbacktooltip' + index}>
                  Call back
                </Tooltip>
              }>
            <Button variant="success"
              id="callback"
              className="m-1"
              aria-label="Call back"
              onClick={() => this.callHistoryCall(number)}><FontAwesomeIcon icon="phone" /> </Button>
          </OverlayTrigger>
          <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={'createContacttooltip' + index}>
                  Create new contact
                </Tooltip>
              }>
            <Button variant="info"
              id="createContact"
              className="m-1"
              aria-label="Create contact"
              onClick={() => {this.setState({newContactNumber: number, showContactModal: true})}}>
                <FontAwesomeIcon icon="edit" /> </Button>
          </OverlayTrigger>
          </td>
        </tr>
      )
    })
  }

  callHistoryCall(phoneNumber : string){
    this.props.jssipService.registerSessionConnectingCallback(() => this.props.setActivePanel(ActivePanel.callPage));
    this.props.jssipService.startCall(phoneNumber, this.props.settings.anonymous);    
  }

  render(){
    let newContactID = this.props.settings.contacts.nextUniqueID + 1
    return(
      <div className={this.props.settings.anonymous ? "row justify-content-center pt-3" : "row justify-content-center pt-5"}>
        {this.state.showContactModal ? <EditContactModal 
                                        contact={{ name: "", uniqueID: newContactID, numbers: [ { number: this.state.newContactNumber, type: "Cell", default: false }]}} 
                                        setContactModalVisibility={this.setContactModalVisibility}/> : null}
        <Table id="callHistoryTable" aria-label="Call History Table">
              <thead>
              <tr>
              {this.loadCallHistoryHeader()}
            </tr>
          </thead>
          <tbody>
            {this.loadCallHistory()}
          </tbody>
        </Table>
      </div>
    )
  }
}

export default connector(CallHistory);