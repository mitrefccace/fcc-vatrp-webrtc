import React from 'react';
import JssipService from '../services/JssipService';
import Network from './Network';
import Debug from './Debug';
import CallSettings from './CallSettings';
import ActivePanel from '../services/ActivePanelEnum';
import { connect, ConnectedProps } from 'react-redux';

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};

const connector = connect(mapStateToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type SettingsProps = PropsFromRedux & {
  activePanel: ActivePanel
  jssipService : JssipService
  setLoggingLevel   : Function
  setLoggerPath : Function
  displayUserMessage: Function
  setLogName : Function
};
type SettingsState = {
  expanded: boolean,
  expandIcon: string,
  width: number,
};

class Settings extends React.Component<SettingsProps, SettingsState>{
  constructor(props: SettingsProps) {
    super(props);
    this.state = {
      expanded: true,
      expandIcon: "fa fa-angle-left",
      width: 3
    };

  }

  render() {
    let panel;

    switch (this.props.activePanel) { 
      case ActivePanel.network:
        panel=<Network jssipService={this.props.jssipService} displayUserMessage = {this.props.displayUserMessage} />
        break;
      case ActivePanel.debug:
        panel=<Debug setLoggingLevel={this.props.setLoggingLevel} setLoggerPath={this.props.setLoggerPath} setLogName={this.props.setLogName}/>
        break;
      case ActivePanel.callSettings:
        panel=<CallSettings jssipService={this.props.jssipService} displayUserMessage={this.props.displayUserMessage} />
        break; 
      default:        
        break;
      }

    return (
      <div>     
        {panel}
    </div>
    );
  }
}

export default connector(Settings);