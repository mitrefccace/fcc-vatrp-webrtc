import React from 'react';
import './CallChat.css';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Alert from 'react-bootstrap/Alert';
import {connect, ConnectedProps} from 'react-redux';
import { 
  janusRTTSend 
 } from '../../store/settings/actions';
import { 
  JanusRTTSendType
 } from '../../store/settings/types';

interface RootState {
  chat : string,
  t140Array : Message[]
}
const mapStateToProps = (state: any) => {
  return {
    t140: state.t140Array,
    settings: state.settingsManager.settings,
    janusState : state.settingsManager.janusState
  };
};

const mapDispatchToProps = (dispatch: (arg0: JanusRTTSendType) => any) => ({
  janusRTTSend: (config: object) => dispatch(janusRTTSend(config))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>

type CallChatProps = PropsFromRedux & {
}

type CallChatState = {
  chatValue     : string,
  typing        : boolean,
  RTTchat       : Message[],
  count         : number
}

type Chat = {
  chatMessage : String,
  variant : String
}

//These are temporary types until the janus connection is set up
//Will be replaced with sipcall.localMessages, and sipcall.remoteMessages eventually
type Message = {
  timeStamp : Date,
  text      : String,
  sender    : String
}

class CallChat extends React.Component<CallChatProps, CallChatState> {
  private scrollTarget = React.createRef<HTMLDivElement>();
  constructor(props: CallChatProps){
    super(props);
    this.state = {
      chatValue     : "",
      typing        : false,
      RTTchat       : [],
      count         : 0
    };

    this.textValueChanged = this.textValueChanged.bind(this);
    this.keyPressed = this.keyPressed.bind(this);
    this.loadChat = this.loadChat.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  textValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    this.setState({chatValue: value});
  }

  //special handler for carriage return (RTT encoding: [226, 128, 168])
  keyPressed(event: React.KeyboardEvent<HTMLInputElement>){
    event.preventDefault();
    if(this.props.settings.VATRPmode === "FullJanusCommunication"){
      if(event.key === 'Enter' || event.key === 'Returned'){
        this.setState({chatValue : ''});
      }
      else{
        this.setState({chatValue : this.state.chatValue+event.key});
      }
      this.loadChat();
      this.props.janusRTTSend({'characterKey' : event.which, 'characterValue' : event.key});
    }
  }

  //handler for backspace only
  keyDown(event: React.KeyboardEvent<HTMLInputElement>){
    if(event.keyCode === 8){
      event.preventDefault();
      this.setState({chatValue : this.state.chatValue.slice(0, -1)})
      this.loadChat();
      this.props.janusRTTSend({'characterKey' : event.which, 'characterValue' : event.key});
    }
  }

  onClick(event : React.MouseEvent<HTMLInputElement, MouseEvent>){
    event.currentTarget.selectionStart = this.state.chatValue.length;
  }

  loadChat(){
    var messages = [];
    for(var lm of this.props.janusState.sipHandler.localMessages){
      lm["sender"] = "local";
      messages.push(lm);
    }
    for(var rm of this.props.janusState.sipHandler.remoteMessages){
      rm["sender"] = "remote";
      messages.push(rm);
    }
    messages.sort(function(a,b) {
      return a.timestamp-b.timestamp;
    });
    
    return messages.map((displayChat : {sender:String, timestamp:Date,text:String},index:any) => {
      const {sender,timestamp,text} = displayChat;
      //@ts-ignore Need ts-ignore as typescript expects to see an exact variant value
      return  <Alert 
                    id="RTTchat" 
                    variant={sender==="remote"?"success":"primary"} 
                    key={index}>
                      {timestamp.toString()} : {text}
                  </Alert>
    });
  }

  scrollToBottom = () => {
    const node : HTMLDivElement | null = this.scrollTarget.current;
    if(node){
      node.scrollIntoView({behavior:'smooth'});
    }
  };

  componentDidMount() {
    this.scrollToBottom();
  }
  
  componentDidUpdate() {
    this.scrollToBottom();
    this.loadChat();
  }
  
  render(){
  return (
    <div id="chat">
      <div id="chatBody" className="col">
        {this.loadChat()}
        <div ref={this.scrollTarget}/>
      </div>
      <div><span>{this.props.janusState.sipHandler.remoteText.length > 0 ? "User is typing " + this.props.janusState.sipHandler.remoteText : ""}</span></div>
      <div id="chat-footer">
        <form name="chatsend">
          <InputGroup size="sm" className="mb-2">
            <FormControl 
              as="textarea" 
              aria-label="With text area" 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.textValueChanged(e)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => this.keyPressed(e)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => this.keyDown(e)}
              onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) => this.onClick(e)}
              value={this.state.chatValue}>
            </FormControl>
          </InputGroup>
        </form>
      </div>
    </div>
    );
  }
}

export default connector(CallChat)