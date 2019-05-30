import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'

const uuidv4 = require('uuid/v4');

const defaultUser = {
  _id: 1,
  name: 'News Reader',
}

export default class App extends React.Component {
  state = {
    messages: [],
    loading: true,
    dataSource: [],
  }

  loadData() {
    fetch("https://chautr.com/collection.json")
    .then(response => response.json())
    .then((responseJson)=> {
      this.setState({
        loading: false,
        dataSource: responseJson
      })
    })
    .catch(error=>console.warn(error)) //to catch the errors if any
  }

  getNewMsg() {
    if (this.state.dataSource.length > 0) {
      let data = this.state.dataSource.shift()
      this.buildMsgFromData(data)
    } else {
      this.loadData()
    }
  }

  buildMsgFromData(data) {
    let newMsg = []
    let items = data.sequence || [];
    for (i in items) {
      let item = items[i]
      let msg = {
        _id: item.id,
        text: '',
        createdAt: new Date(item.createdAt),
        user: defaultUser,
      }
      let url = item.url || ''
      switch (item.type) {
        case 1:
        case 2:
        case 6:
            msg.text = item.value + ' ' + url
          break
        case 3:
        case 4:
            msg.image = item.value
          break
        case 7:
            msg.text = item.url
            msg.image = item.value
          break
        default:
          msg.text = item.value
      }
      newMsg.push(msg)
    }
    newMsg.push({
      _id: uuidv4(),
      text: 'Do you like this article?',
      createdAt: new Date(),
      quickReplies: {
        type: 'radio', // or 'checkbox',
        keepIt: true,
        system: true,
        values: [
          {
            title: '😋 Yes. Tell me more!',
            value: 'yes',
          },
          {
            title: '😞 Nope. Next...',
            value: 'no',
          },
        ],
      },
      user: defaultUser,
    })
    newMsg.reverse()
    this.setState({
      messages: newMsg,
    })
  }

  componentWillMount() {
    this.loadData()
  }

  componentDidMount() {
    this.getNewMsg()
    this.timer = setInterval(() => this.getNewMsg(), 10000)
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  onQuickReply(quickReply) {
    console.warn(quickReply)
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        onQuickReply={quickReply => this.onQuickReply(quickReply)}
        loadEarlier={true}
        user={{
          _id: 2,
        }}
        renderAvatar={() => null}
        renderDay={() => null}
        renderTime={() => null}
        renderInputToolbar={() => null}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
