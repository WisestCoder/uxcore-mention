/**
 * example index
 */
import React, { Component } from 'react';
import Tinymce from 'uxcore-tinymce';
import Dialog from 'uxcore-dialog';
import Mention, {
  ContenteditableEditor,
  TextareaEditor,
  InputEditor,
  TinymceMention,
} from '../src';
import mockData from './mockData.json';

function formatter(data) {
  return data.map((text) => ({ text }));
}

const source = ['aaaaa', 'aabbb', 'aaccc', 'bbbcc', 'dddee', 'fffqq', 'pppaa', 'ppccc'];

function getPersonData(keyword, next) {
  setTimeout(() => next(mockData), 100);
}

function personDataFormatter(data) {
  return data.map((item) => Object.assign(item, {
    displayName: item.name + (item.nickNameCn ? `(${item.nickNameCn})` : ''),
  }));
}

function personPanelFormatter(data) {
  return `<img src="${data.avatar}" width="25" height="25" title="${data.name}">
      ${data.displayName} - ${data.emplId}`;
}

function personMentionFormatter(data) {
  return `@${data.name}(${data.emplId})`;
}

export default class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: 'xxx',
      basicContent: 'basic content',
      personContent: '',
      readOnly: false,
      showDialog: false,
    };
  }
  onToggleReadOnly() {
    this.setState({
      readOnly: !this.state.readOnly,
    });
  }
  toggleDialog() {
    this.setState({
      showDialog: !this.state.showDialog,
    });
  }
  render() {
    return (
      <div>
        <button onClick={this.toggleDialog.bind(this)}>show dialog</button>
        <Dialog
          title="mention in dialog"
          visible={this.state.showDialog}
          onOk={this.toggleDialog.bind(this)}
          onCancel={this.toggleDialog.bind(this)}
          formatter={formatter}
        >
          <Mention
            matchRange={[1, 6]}
            formatter={personDataFormatter}
            panelFormatter={personPanelFormatter}
            source={getPersonData}
          >
            <InputEditor
              width={250}
              height={30}
              mentionFormatter={personMentionFormatter}
              placeholder="input editor placeholder"
            />
          </Mention>
        </Dialog>
        <div>
          <label>
            <input
              type="checkbox"
              checked={this.state.readOnly}
              onChange={this.onToggleReadOnly.bind(this)}
            />
            只读
          </label>
        </div>
        <h1>BASIC:</h1>
        <Mention
          matchRange={[0, 6]}
          source={source}
          onChange={(e, content) => global.console.log(e, content)}
          formatter={formatter}
        >
          <ContenteditableEditor
            width={250}
            height={150}
            readOnly={this.state.readOnly}
            placeholder="contenteditable editor placeholder"
            defaultValue={'defaultValue'}
            value={this.state.content}
            maxLength={10}
          />
          <TextareaEditor
            width={250}
            height={100}
            readOnly={this.state.readOnly}
            placeholder="textarea editor placeholder"
            defaultValue={'defaultValue'}
            value={this.state.content}
          />
          <InputEditor
            width={250}
            height={30}
            readOnly={this.state.readOnly}
            placeholder="input editor placeholder"
            defaultValue={'defaultValue'}
            value={this.state.content}
            maxLength={10}
          />
        </Mention>
        <button onClick={() => this.setState({ content: new Date() })}>change content</button>
        <h1>SELECT PERSON:</h1>
        <Mention
          matchRange={[2, 6]}
          source={getPersonData}
          formatter={personDataFormatter}
          panelFormatter={personPanelFormatter}
          onChange={() => {}}
        >
          <ContenteditableEditor mentionFormatter={personMentionFormatter} />
        </Mention>
        <h1>Tinymce</h1>
        <TinymceMention
          insertMode={'TEXT_NODE'}
          source={getPersonData}
          formatter={personDataFormatter}
          mentionFormatter={personMentionFormatter}
          panelFormatter={personPanelFormatter}
        >
          <Tinymce placeholder={'tinymce placeholder'} />
        </TinymceMention>
      </div>
    );
  }
}
