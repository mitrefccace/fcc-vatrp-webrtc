import React from 'react';
import JssipService from '../services/JssipService';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect, ConnectedProps } from 'react-redux';

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};

const connector = connect(mapStateToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type videomailPageProps = PropsFromRedux & {
  jssipService   : JssipService,
  displayUserMessage: Function
}

type videomailPageState = {
  messageStatus : string,
  messageCount : string
}

class Videomail extends React.Component <videomailPageProps, videomailPageState> {
  constructor(props: videomailPageProps){
    super(props);
    this.state = {
      messageStatus : this.props.settings.voicemailStatus ? this.props.settings.voicemailStatus : "No",
      messageCount : this.props.settings.messageCount ? this.props.settings.messageCount : "0"
    };
    
    if(this.state.messageStatus !== "No"){
      this.props.displayUserMessage("Success", "Videomail", "You have " + this.state.messageCount + " unread videomail(s).");
    }
  }

  render() {
    return(<div>
      You have {this.state.messageCount} unread video messages.
      <Table>
        <thead>
          <tr>
            <th>Server Number</th>
            <th>Call</th>
          </tr>
        </thead>
        <tbody>
          <tr key="1">
            <th>5552935832</th>
            <th><Button variant="success"
              id="callback"
              className="m-1"
              aria-label="Call back"
              onClick={() => this.props.jssipService.startCall('5552935832', this.props.settings.anonymous)}><FontAwesomeIcon icon="phone" /> </Button></th>
          </tr>
          <tr key="2">
            <th>5552935030</th>
            <th><Button variant="success"
              id="callback"
              className="m-1"
              aria-label="Call back"
              onClick={() => this.props.jssipService.startCall('5552935030', this.props.settings.anonymous)}><FontAwesomeIcon icon="phone" /> </Button></th>
          </tr>
          <tr key="3">
            <th>5552700322</th>
            <th><Button variant="success"
              id="callback"
              className="m-1"
              aria-label="Call back"
              onClick={() => this.props.jssipService.startCall('5552700322', this.props.settings.anonymous)}><FontAwesomeIcon icon="phone" /> </Button></th>
          </tr>
          <tr key="4">
            <th>5552159453</th>
            <th><Button variant="success"
              id="callback"
              className="m-1"
              aria-label="Call back"
              onClick={() => this.props.jssipService.startCall('5552159453', this.props.settings.anonymous)}><FontAwesomeIcon icon="phone" /> </Button></th>
          </tr>
        </tbody>
      </Table>
    </div>);
  }
}
export default connector(Videomail);