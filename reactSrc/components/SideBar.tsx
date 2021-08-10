import React from 'react';
import ActivePanel from '../services/ActivePanelEnum';
import JssipService from '../services/JssipService';
import { Button, Dropdown, DropdownButton, OverlayTrigger, Tooltip, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect, ConnectedProps } from 'react-redux';
import { IntUpdateSettingsType } from '../store/settings/types';
import './SideBar.scss'

const log = require('electron-log');
const mapStateToProps = (state: any) => {
  return {
    settings: state.settingsManager.settings,
    janusState : state.settingsManager.janusState
  };
};

const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch({type: 'UPDATE_SETTING', payload: name})
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
  setActivePanel   : Function
  activePanel      : ActivePanel
  jssipService     : JssipService
  setNotRegistered : Function
};
type SidebarState = {
  expanded   : boolean,
  fullText   : boolean,
  width      : number,
};

class SideBar extends React.Component<Props, SidebarState> {
  
  constructor(props: Props) {
    super(props);

    this.state = {
      expanded: true,
      fullText: true,
      width: 0
    };

    this.collapseSidebar       = this.collapseSidebar.bind(this);
    this.setActivePanelSidebar = this.setActivePanelSidebar.bind(this);
    this.signOut               = this.signOut.bind(this);
  }

  componentDidMount() {
    if (window.innerWidth < 600) {
      this.setState({width: 4});
    }
    else {
      this.setState({width: 3});
    }
  }

  setActivePanelSidebar(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, panelValue : ActivePanel){
    event.preventDefault();

    // Only switch active panel, if the panel clicked is different from the one we're already on
    if(this.props.activePanel !== panelValue){
      this.props.setActivePanel(panelValue);
    }
  }

  signOut(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
    event.preventDefault();
    if(this.props.settings.VATRPmode === "FullJanusCommunication"){
      let newSetting = {
        name: 'VATRPmode',
        value: 'Unregistered'
      }
      this.props.UpdateUserSetting(newSetting);
      console.dir(this.props.settings);
      this.props.janusState.janus.destroy();
      this.forceUpdate();
    }else{
      if(this.props.jssipService.sessions.currentSession){
        this.props.jssipService.terminateCall();
      }
      log.info("User is logging out of VATRP");
      this.props.jssipService.unregister();
    }
    this.props.setNotRegistered();
  }

  collapseSidebar(){
      if(this.state.expanded === true){
        this.setState({expanded: false});
        this.setState({fullText: false});
        this.setState({width: 2});
      }
      else{
        this.setState({fullText: true});
        if (window.innerWidth < 600) {
          this.setState({width: 4});
        }
        else {
          this.setState({width: 3});
        }
        setTimeout(()=> this.setState({expanded: true}), 300)
      }
  }

  render() { 
  
    let expandIcon
    if (this.state.expanded) {
      expandIcon = <FontAwesomeIcon icon="angle-left" />
    } else {
      expandIcon = <FontAwesomeIcon icon="angle-right" />
    }
    return(
        <div className={"wrapper justify-content-center col-" + (this.state.width)}> 
        <Container>
        <nav id="sidebar">
          <div id="skip"><a href="#content">Skip to Main Content</a></div>
          <div className={this.state.fullText ? "sidenav-number-region" : "compressed sidenav-number-region"}>
          <p className="sidenav-text mt-2">{this.props.settings.currentUser.substring(0, 3) + '-' 
              + this.props.settings.currentUser.substring(3,6) + '-' 
              + this.props.settings.currentUser.substring(6, this.props.settings.currentUser.length)}</p>
          <Button type="button" 
            id="sidebar-collapse" 
            className="btn btn-info float-right mb-2"
            aria-label="Toggle Sidebar Collapse"
            onClick={() => {this.collapseSidebar()}}>
            {expandIcon}
          </Button>
          </div>

          <ul className="list-unstyled components">

          <li className="sidenav-list">
            {this.state.expanded ?
                <Button className={"btn " + (this.props.activePanel === ActivePanel.dialPad ? "btn-secondary" : "btn-primary") + " sidenav-button"} 
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.dialPad)} 
                  name="dialpad"
                  id="DialpadTab"
                  aria-label="Dialpad Page"
                  block>
                  <FontAwesomeIcon icon="phone-square" /> Dialpad
                </Button>
              :
              <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={`tooltip-right`}>
                  Dialpad
                </Tooltip>
              }>
              <Button className={"btn " + (this.props.activePanel === ActivePanel.dialPad ? "btn-secondary" : "btn-primary") + " sidenav-button"} 
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.dialPad)} 
                name="dialpad"
                id="DialpadTab"
                aria-label="Dialpad Page"
                block>
                <FontAwesomeIcon icon="phone-square" />
              </Button>
              </OverlayTrigger>}
            </li>
            
            <li className="sidenav-list">
            {this.state.expanded ?              
            <Button className={"btn " + (this.props.activePanel === ActivePanel.callPage ? "btn-secondary" : "btn-primary") + " sidenav-button"}
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.callPage)}
                name="callpage"
                id="CallpageTab"
                aria-label="Call Page"
                block>
                <FontAwesomeIcon icon="phone-volume" /> Callpage
              </Button>
            :
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={`tooltip-right`}>
                  Callpage
                </Tooltip>
              }>
              <Button className={"btn " + (this.props.activePanel === ActivePanel.callPage ? "btn-secondary" : "btn-primary") + " sidenav-button"}
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.callPage)}
                name="callpage"
                id="CallpageTab"
                aria-label="Call Page"
                block>
                <FontAwesomeIcon icon="phone-volume" />
              </Button>
               </OverlayTrigger>}
            </li> 

            <li className="sidenav-list">
            {this.state.expanded ?
                <Button 
                className= {"btn " + (this.props.activePanel === ActivePanel.contacts ? "btn-secondary" : " btn-primary") + " sidenav-button"} 
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.contacts)}
                name="Contacts"
                id="ContactsTab"
                aria-label="Contacts Page"
                block>
                  <FontAwesomeIcon icon="address-book" /> Contacts
                </Button>
              :
              <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={`tooltip-right`}>
                  Contacts
                </Tooltip>
              }>
              <Button 
                className= {"btn " + (this.props.activePanel === ActivePanel.contacts ? "btn-secondary" : " btn-primary") + " sidenav-button"} 
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.contacts)}
                name="Contacts"
                id="ContactsTab"
                aria-label="Contacts Page"
                block>
                <FontAwesomeIcon icon="address-book" />
              </Button>
              </OverlayTrigger>}
            </li>

            <li className="sidenav-list">
            {this.state.expanded ?
                <Button className={"btn " + (this.props.activePanel === ActivePanel.callHistory ? "btn-secondary" : "btn-primary") + " sidenav-button"} 
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.callHistory)} 
                name="CallHistory"
                id="CallHistoryTab"
                aria-label="Call History Page"
                block>
                  <FontAwesomeIcon icon="list-alt" /> History
                </Button>
              :
              <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={`tooltip-right`}>
                  Call History
                </Tooltip>
              }>
              <Button className={"btn " + (this.props.activePanel === ActivePanel.callHistory ? "btn-secondary" : "btn-primary") + " sidenav-button"} 
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.callHistory)} 
                name="CallHistory"
                id="CallHistoryTab"
                aria-label="Call History Page"
                block>
                <FontAwesomeIcon icon="list-alt" />
              </Button>
              </OverlayTrigger>}
            </li>

            <li className="sidenav-list">
            {this.state.expanded ?
                <Button className={"btn " + (this.props.activePanel === ActivePanel.videoMail ? "btn-secondary" : "btn-primary") + " sidenav-button"} 
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.videoMail)} 
                name="videoMail"
                id="VideomailTab"
                aria-label="Videomail Page"
                block>
                  <FontAwesomeIcon icon="voicemail" /> Videomail
                </Button>
              :
              <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={`tooltip-right`}>
                  Videomail
                </Tooltip>
              }>
              <Button className={"btn " + (this.props.activePanel === ActivePanel.videoMail ? "btn-secondary" : "btn-primary") + " sidenav-button"} 
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.videoMail)} 
                name="videoMail"
                id="VideomailTab"
                aria-label="Videomail Page"
                block>
                <FontAwesomeIcon icon="voicemail" /> {this.state.expanded ? "Videomail" : null}
              </Button>
              </OverlayTrigger>}
            </li>

            <li className="sidenav-list">
            {this.state.expanded ?
                <DropdownButton 
                title={<span><FontAwesomeIcon icon="cogs" /> Settings</span>}
                id="bg-vertical-dropdown-1"
                className="dropdown-list sidenav-button">
                <Dropdown.Item eventKey="1" as={Button}
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.network)}>
                  <FontAwesomeIcon icon="wifi" /> Network and Authentification
                </Dropdown.Item>
                <Dropdown.Item eventKey="2" as={Button}
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.debug)}>
                  <FontAwesomeIcon icon="bug" /> Debug
                </Dropdown.Item>
                <Dropdown.Item eventKey="3" as={Button}
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.callSettings)}>
                  <FontAwesomeIcon icon="phone-square" /> Call Settings
                </Dropdown.Item>
              </DropdownButton>
              :
              <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={`tooltip-right`}>
                  Settings
                </Tooltip>
              }>
              <DropdownButton 
                title={<span><FontAwesomeIcon icon="cogs" /></span>}
                id="bg-vertical-dropdown-1"
                className="dropdown-list sidenav-button">
                <Dropdown.Item eventKey="1" as={Button}
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.network)}>
                  <FontAwesomeIcon icon="wifi" /> Network and Authentification
                </Dropdown.Item>
                <Dropdown.Item eventKey="2" as={Button}
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.debug)}>
                  <FontAwesomeIcon icon="bug" /> Debug
                </Dropdown.Item>
                <Dropdown.Item eventKey="3" as={Button}
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.setActivePanelSidebar(e, ActivePanel.callSettings)}>
                  <FontAwesomeIcon icon="phone-square" /> Call Settings
                </Dropdown.Item>
              </DropdownButton>
              </OverlayTrigger>}
            </li>

            <li className="sidenav-list" >
              {this.props.settings.debug === true ?
              <p className={this.state.fullText ? "sidenav-text" : "compressed-sidenav-text"}>Server :<br/>{this.props.jssipService.jssipconfiguration.uri.toString().split('@')[1]}</p> : null}
            </li>
             <li>
             
            </li>  
          </ul>
          <div id="parentSignout">
              {this.state.expanded ?
                <Button
                  id="signoutButton"
                  className="btn btn-primary sidenav-button"
                  block
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.signOut(e)}>
                  <FontAwesomeIcon icon="sign-out-alt" /> Sign Out
                </Button>
              :
              <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={`tooltip-right`}>
                  Sign Out
                </Tooltip>
              }>
              <Button
                id="signoutButton"
                className="btn btn-primary sidenav-button"
                block
                onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.signOut(e)}>
                <FontAwesomeIcon icon="sign-out-alt" />
              </Button>
              </OverlayTrigger>}
          </div>
          </nav>
        </Container>
      </div>
      
    );
  }
}
export default connector(SideBar);