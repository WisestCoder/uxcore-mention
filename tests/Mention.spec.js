import expect from 'expect.js';
import React from 'react';
import ReactDOM from 'react-dom';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import TestUtils, { Simulate } from 'react-addons-test-utils';
import Tinymce from 'uxcore-tinymce';
import Mention, { ContenteditableEditor, TextareaEditor, InputEditor, TinymceMention } from '../src';
import { KEYCODE } from '../src/utils/keycode';

Enzyme.configure({ adapter: new Adapter() });

// TinymceMention.prototype.runMatcher = function runMatcher(str) {
//   this._matcher(str);
// };

function setEndOfContentEditable(contentEditableElement) {
  let range;
  let selection;
  if (document.createRange) {
    range = document.createRange();
    range.selectNodeContents(contentEditableElement);
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  } else if (document.selection) {
    range = document.body.createTextRange();
    range.moveToElementText(contentEditableElement);
    range.collapse(false);
    range.select();
  }
}

function renderIntoDoc(Target) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  ReactDOM.render(Target, container);
  return container;
}

const mentionProps = {
  matchRange: [1, 3],
  source: ['aaaaa', 'aabbb', 'aaccc', 'bbbcc', 'dddee', 'fffqq', 'pppaa', 'ppccc'],
  formatter: data => data.map(item => ({ text: item })),
};

const editorProps = {
  defaultValue: 'defaultContent',
  maxLength: 10,
};


describe('Mention', () => {
  it('should render correctly with defaltProps', () => {
    const wrapper = mount(<Mention />);
    expect(wrapper.instance()).to.be.ok();
  });
  describe('InputEditor', () => {
    let wrapper;
    let inputEditor;
    let input;

    beforeEach('initialize', () => {
      wrapper = mount(
        <Mention {...mentionProps}>
          <InputEditor {...editorProps} />
        </Mention>
      );
      inputEditor = wrapper.find(InputEditor);
      input = wrapper.find('input');
      input.simulate('focus');
    });

    it('should render correctly', () => {
      expect(wrapper.instance()).to.be.ok();
      expect(inputEditor.instance()).to.be.ok();
      expect(input.length).to.be(1);
    });
    it('should assign state.value correctly', done => {
      const editorWrapper = mount(<InputEditor value="1" />);
      expect(editorWrapper.instance().props.value).to.be('1');
      expect(editorWrapper.instance().state.value).to.be('1');
      editorWrapper.setProps({ value: '2' }, () => {
        expect(editorWrapper.instance().props.value).to.be('2');
        expect(editorWrapper.instance().state.value).to.be('2');
        done();
      });
    });
    it('should change value correctly', done => {
      input.instance().value = '@a';
      input.simulate('change');
      expect(inputEditor.instance().state.value).to.be('@a');
      input.instance().value = '';
      input.simulate('change');
      expect(inputEditor.instance().state.value).to.be('');
      inputEditor.instance().setState({ value: '@a' });
      setTimeout(() => {
        expect(input.instance().value).to.be('@a');
        done();
      }, 100);
    });
    it('should show panel when typed: @a', done => {
      input.simulate('change', { target: { value: '@a' } });
      input.simulate('keydown', { keyCode: 65 });
      input.simulate('keyup', { keyCode: 65 });
      setTimeout(() => {
        expect(inputEditor.instance().state.value).to.be('@a');
        input.simulate('keydown', { keyCode: KEYCODE.DOWN });
        input.simulate('keyup', { keyCode: KEYCODE.DOWN }); // 触发选择的浮层
        expect(wrapper.instance().state.panelVisible).to.be(true);
        expect(wrapper.instance().state.mentionList.length).to.be(4);
        done();
      }, 100);
    });
    it('should insert mention target correctly by click', done => {
      input.simulate('change', { target: { value: '@a' } });
      input.simulate('keydown', { keyCode: 65 });
      input.simulate('keyup', { keyCode: 65 });
      setTimeout(() => {
        input.simulate('keydown', { keyCode: KEYCODE.DOWN });
        input.simulate('keyup', { keyCode: KEYCODE.DOWN });
        setTimeout(() => {
          expect(wrapper.instance().state.panelVisible).to.be(true);
          wrapper
            .find('li')
            .at(1)
            .simulate('click');
          expect(input.instance().value).to.be(' @aabbb ');
          expect(wrapper.instance().state.panelVisible).to.be(false);
          // input.simulate('keydown', { keyCode: KEYCODE.ENTER });
          // input.simulate('keyup', { keyCode: KEYCODE.ENTER });
          // expect(input.instance().value).to.be(' @aabbb ');
          done();
        }, 100);
      }, 100);
    });
    it('should insert mention target correctly by enter', done => {
      input.simulate('change', { target: { value: '@a' } });
      input.simulate('keydown', { keyCode: 65 });
      input.simulate('keyup', { keyCode: 65 });
      setTimeout(() => {
        input.simulate('keydown', { keyCode: KEYCODE.DOWN });
        input.simulate('keyup', { keyCode: KEYCODE.DOWN });
        setTimeout(() => {
          expect(wrapper.instance().state.panelVisible).to.be(true);
          input.simulate('keydown', { keyCode: KEYCODE.ENTER });
          input.simulate('keyup', { keyCode: KEYCODE.ENTER });
          expect(input.instance().value).to.be(' @aabbb ');
          expect(wrapper.instance().state.panelVisible).to.be(false);
          done();
        }, 100);
      }, 100);
    });
    it('should be limited by maxLength', done => {
      input.simulate('change', { target: { value: 'a1a1a1a1a1' } });
      input.simulate('keydown', { keyCode: 65 });
      setTimeout(() => {
        expect(input.instance().value).to.have.length(10);
        expect(input.instance().value).to.be('a1a1a1a1a1');
        done();
      }, 100);
    });
  });

  describe('TextareaEditor', () => {
    let wrapper;
    let textareaEditor;
    let textarea;

    beforeEach('initialize', () => {
      wrapper = mount(
        <Mention {...mentionProps}>
          <TextareaEditor {...editorProps} />
        </Mention>
      );
      textareaEditor = wrapper.find(TextareaEditor);
      textarea = wrapper.find('textarea');
      textarea.simulate('focus');
    });
    it('should render correctly', () => {
      expect(wrapper.instance()).to.be.ok();
      expect(textareaEditor.instance()).to.be.ok();
      expect(textarea.length).to.be(1);
    });
    it('should assign state.value correctly', done => {
      const editorWrapper = mount(<TextareaEditor value="1" />);
      expect(editorWrapper.instance().props.value).to.be('1');
      expect(editorWrapper.instance().state.value).to.be('1');
      editorWrapper.setProps({ value: '2' }, () => {
        expect(editorWrapper.instance().props.value).to.be('2');
        expect(editorWrapper.instance().state.value).to.be('2');
        done();
      });
    });
    it('should change value correctly', done => {
      textarea.instance().value = '@a';
      textarea.simulate('change');
      expect(textareaEditor.instance().state.value).to.be('@a');
      textarea.instance().value = '';
      textarea.simulate('change');
      expect(textareaEditor.instance().state.value).to.be('');
      textareaEditor.instance().setState({ value: '@a' });
      setTimeout(() => {
        expect(textarea.instance().value).to.be('@a');
        done();
      }, 100);
    });
    it('should show panel when typed: @a', done => {
      textarea.instance().value = '@a';
      textarea.simulate('change');
      textarea.simulate('keydown', { keyCode: 65 });
      textarea.simulate('keyup', { keyCode: 65 });
      setTimeout(() => {
        textarea.simulate('keydown', { keyCode: KEYCODE.DOWN });
        textarea.simulate('keyup', { keyCode: KEYCODE.DOWN });
        expect(wrapper.instance().state.panelVisible).to.be(true);
        expect(wrapper.instance().state.mentionList.length).to.be(4);
        done();
      }, 500);
    });
    it('should insert mention target correctly by click', done => {
      textarea.instance().value = '@a';
      textarea.simulate('change');
      textarea.simulate('keydown', { keyCode: 65 });
      textarea.simulate('keyup', { keyCode: 65 });
      setTimeout(() => {
        textarea.simulate('keydown', { keyCode: KEYCODE.DOWN });
        textarea.simulate('keyup', { keyCode: KEYCODE.DOWN });
        setTimeout(() => {
          expect(wrapper.instance().state.panelVisible).to.be(true);
          wrapper
            .find('li')
            .at(1)
            .simulate('click');
          expect(textarea.instance().value).to.be(' @aabbb ');
          expect(wrapper.instance().state.panelVisible).to.be(false);
          done();
        }, 100);
      }, 100);
    });
    it('should insert mention target correctly by enter', done => {
      textarea.instance().value = '@a';
      textarea.simulate('change');
      textarea.simulate('keydown', { keyCode: 65 });
      textarea.simulate('keyup', { keyCode: 65 });
      setTimeout(() => {
        textarea.simulate('keydown', { keyCode: KEYCODE.DOWN });
        textarea.simulate('keyup', { keyCode: KEYCODE.DOWN });
        setTimeout(() => {
          expect(wrapper.instance().state.panelVisible).to.be(true);
          textarea.simulate('keydown', { keyCode: KEYCODE.ENTER });
          textarea.simulate('keyup', { keyCode: KEYCODE.ENTER });
          expect(textarea.instance().value).to.be(' @aabbb ');
          expect(wrapper.instance().state.panelVisible).to.be(false);
          done();
        }, 100);
      }, 100);
    });
    it('should insert correctly', done => {
      textareaEditor.instance().insert('test');
      setTimeout(() => {
        expect(textarea.instance().value).to.be('testdefaultContent');
        done();
      }, 100);
    });
    it('should be limited by maxLength', done => {
      textarea.simulate('change', { target: { value: 'a1a1a1a1a1' } });
      textarea.simulate('keydown', { keyCode: 65 });
      setTimeout(() => {
        expect(textarea.instance().value).to.have.length(10);
        expect(textarea.instance().value).to.be('a1a1a1a1a1');
        done();
      }, 100);
    });
  });

  describe('ContentEditableEditor', () => {
    function setEndOfContentEditable(contentEditableElement) {
      let range;
      let selection;
      if (document.createRange) {
        range = document.createRange();
        range.selectNodeContents(contentEditableElement);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (document.selection) {
        range = document.body.createTextRange();
        range.moveToElementText(contentEditableElement);
        range.collapse(false);
        range.select();
      }
    }
    let dom;
    let mention;
    let contentEditableEditor;

    beforeEach('initialize', () => {
      dom = renderIntoDoc(
        <Mention {...mentionProps} ref={node => (mention = node)}>
          <ContenteditableEditor ref={node => (contentEditableEditor = node)} />
        </Mention>
      );
    });

    afterEach('cleanup', () => {
      ReactDOM.unmountComponentAtNode(dom);
    });

    // Mention.prototype.runMatcher = function runMatcher(str) {
    //   this._matcher(str);
    // };

    it('should render correctly', () => {
      expect(contentEditableEditor.editor.tagName.toLowerCase()).to.be('div');
    });
    it('should editor.innerHTML is correctly set', done => {
      const editorWrapper = mount(<ContenteditableEditor value="hello" />);
      expect(editorWrapper.instance().editor.innerHTML).to.be('hello');
      editorWrapper.setProps({ value: 'world' });
      setTimeout(() => {
        expect(editorWrapper.instance().editor.innerHTML).to.be('world');
        done();
      }, 100);
    });
    it('should control the placeholder correctly', () => {
      const editorWrapper = mount(
        <Mention {...mentionProps}>
          <ContenteditableEditor />
        </Mention>
      );
      const placeholder = editorWrapper.find('.kuma-mention-placeholder');
      expect(editorWrapper.find('.kuma-mention-placeholder').length).to.be(1);
      placeholder.simulate('click');
      expect(editorWrapper.find('.kuma-mention-placeholder').length).to.be(0);
    });
    it('should blur & focus works correctly', () => {
      Simulate.input(contentEditableEditor.editor);
      Simulate.blur(contentEditableEditor.editor);
      expect(contentEditableEditor.state.focus).to.be(false);
      Simulate.focus(contentEditableEditor.editor);
      expect(contentEditableEditor.state.focus).to.be(true);
    });
    it('should change value correctly', done => {
      contentEditableEditor.editor.innerHTML = 'test';
      Simulate.input(contentEditableEditor.editor);
      setTimeout(() => {
        expect(contentEditableEditor.state.value).to.be('test');
        done();
      }, 100);
    });
    it('should insert br correctly by enter', done => {
      Simulate.focus(contentEditableEditor.editor);
      contentEditableEditor.editor.innerHTML = 'hello ';
      Simulate.input(contentEditableEditor.editor);
      setTimeout(() => {
        setEndOfContentEditable(contentEditableEditor.editor.childNodes[0]);
        setTimeout(() => {
          Simulate.keyDown(contentEditableEditor.editor, { keyCode: KEYCODE.ENTER });
          Simulate.keyUp(contentEditableEditor.editor, { keyCode: KEYCODE.ENTER });
          expect(contentEditableEditor.editor.innerHTML).to.be('hello <br><br>');
          done();
        }, 100);
      }, 100);
    });
    it('should show panel when typed: @a', done => {
      contentEditableEditor.editor.innerHTML = '@a';
      Simulate.input(contentEditableEditor.editor);
      setTimeout(() => {
        setEndOfContentEditable(contentEditableEditor.editor.childNodes[0]);
        Simulate.keyDown(contentEditableEditor.editor, { keyCode: 65 });
        Simulate.keyUp(contentEditableEditor.editor, { keyCode: 65 });
        setTimeout(() => {
          expect(mention.state.panelVisible).to.be(true);
          done();
        }, 500);
      }, 100);
    });
    it('should rerender mention target when typing', done => {
      Simulate.focus(contentEditableEditor.editor);
      contentEditableEditor.editor.innerHTML = '@a';
      Simulate.input(contentEditableEditor.editor);
      setTimeout(() => {
        setEndOfContentEditable(contentEditableEditor.editor.childNodes[0]);
        Simulate.keyDown(contentEditableEditor.editor, { keyCode: 65 });
        Simulate.keyUp(contentEditableEditor.editor, { keyCode: 65 });
        setTimeout(() => {
          expect(mention.state.panelVisible).to.be(true);
          const ul = TestUtils.findRenderedDOMComponentWithClass(mention, 'kuma-mention-panel-visible');
          Simulate.keyDown(ul, { keyCode: 65 });
          Simulate.keyUp(ul, { keyCode: 65 });
          expect(mention.state.mentionList.length).to.be(0);
          done();
        }, 100);
      }, 100);
    });
    it('should insert mention target correctly by click', done => {
      Simulate.focus(contentEditableEditor.editor);
      contentEditableEditor.editor.innerHTML = '@a';
      Simulate.input(contentEditableEditor.editor);
      setTimeout(() => {
        setEndOfContentEditable(contentEditableEditor.editor.childNodes[0]);
        Simulate.keyDown(contentEditableEditor.editor, { keyCode: 65 });
        Simulate.keyUp(contentEditableEditor.editor, { keyCode: 65 });
        setTimeout(() => {
          expect(mention.state.panelVisible).to.be(true);
          const li = TestUtils.findRenderedDOMComponentWithClass(mention, 'kuma-mention-panel-item-current');
          expect(li.children[0].innerHTML).to.be('aaaaa');
          Simulate.click(li);
          expect(contentEditableEditor.editor.innerHTML).to.be('<input type="button" tabindex="-1" class="kuma-mention-node" value="@aaaaa">');
          done();
        }, 100);
      }, 100);
    });
    it('should insert mention target correctly by enter', done => {
      Simulate.focus(contentEditableEditor.editor);
      contentEditableEditor.editor.innerHTML = '@a';
      Simulate.input(contentEditableEditor.editor);
      setTimeout(() => {
        setEndOfContentEditable(contentEditableEditor.editor.childNodes[0]);
        Simulate.keyDown(contentEditableEditor.editor, { keyCode: 65 });
        Simulate.keyUp(contentEditableEditor.editor, { keyCode: 65 });
        setTimeout(() => {
          expect(mention.state.panelVisible).to.be(true);
          Simulate.keyDown(contentEditableEditor.editor, { keyCode: KEYCODE.DOWN });
          Simulate.keyUp(contentEditableEditor.editor, { keyCode: KEYCODE.DOWN });
          Simulate.keyDown(contentEditableEditor.editor, { keyCode: KEYCODE.UP });
          Simulate.keyUp(contentEditableEditor.editor, { keyCode: KEYCODE.UP });
          Simulate.keyDown(contentEditableEditor.editor, { keyCode: KEYCODE.DOWN });
          Simulate.keyUp(contentEditableEditor.editor, { keyCode: KEYCODE.DOWN });
          Simulate.keyDown(contentEditableEditor.editor, { keyCode: KEYCODE.ENTER });
          Simulate.keyUp(contentEditableEditor.editor, { keyCode: KEYCODE.ENTER });
          expect(contentEditableEditor.editor.innerHTML).to.be('<input type="button" tabindex="-1" class="kuma-mention-node" value="@aabbb">');
          done();
        }, 100);
      }, 100);
    });
    it('should work well without observer', done => {
      contentEditableEditor.observer.disconnect();
      delete contentEditableEditor.observer;
      Simulate.focus(contentEditableEditor.editor);
      contentEditableEditor.editor.innerHTML = '@a';
      Simulate.input(contentEditableEditor.editor);
      setTimeout(() => {
        setEndOfContentEditable(contentEditableEditor.editor.childNodes[0]);
        Simulate.keyDown(contentEditableEditor.editor, { keyCode: 65 });
        Simulate.keyUp(contentEditableEditor.editor, { keyCode: 65 });
        setTimeout(() => {
          expect(mention.state.panelVisible).to.be(true);
          Simulate.keyDown(contentEditableEditor.editor, { keyCode: KEYCODE.DOWN });
          Simulate.keyUp(contentEditableEditor.editor, { keyCode: KEYCODE.DOWN });
          Simulate.keyDown(contentEditableEditor.editor, { keyCode: KEYCODE.ENTER });
          Simulate.keyUp(contentEditableEditor.editor, { keyCode: KEYCODE.ENTER });
          expect(contentEditableEditor.editor.innerHTML).to.be('<input type="button" tabindex="-1" class="kuma-mention-node" value="@aabbb">');
          done();
        }, 100);
      }, 100);
    });
    it('should be limited by maxLength', done => {
      contentEditableEditor.editor.innerHTML = 'a1a1a1a1a1';
      Simulate.keyDown(contentEditableEditor.editor, { keyCode: 65 });
      setTimeout(() => {
        expect(contentEditableEditor.editor.innerHTML).to.have.length(10);
        expect(contentEditableEditor.editor.innerHTML).to.be('a1a1a1a1a1');
        done();
      }, 100);
    });
  });

  describe('TinymceMention', () => {
    let editor;
    let btn;
    class TinymceMentionTest extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          insertMode: 'TEXT_NODE',
        };
        this.handleChangeMode = this.handleChangeMode.bind(this);
      }
      handleChangeMode() {
        const { insertMode } = this.state;
        this.setState({
          insertMode: insertMode === 'TEXT_NODE' ? 'ELEMENT_NODE' : 'TEXT_NODE',
        });
      }
      render() {
        return (
          <TinymceMention {...mentionProps} insertMode={this.state.insertMode} ref={node => (editor = node)}>
            <button ref={node => (btn = node)} onClick={this.handleChangeMode}>
              change inser mode
            </button>
            <Tinymce placeholder={'tinymce placeholder'} />
          </TinymceMention>
        );
      }
    }

    // idk why but you
    // should only render this comp before page onload
    // should only this comp once
    // or it will be totally broken!

    const dom = renderIntoDoc(<TinymceMentionTest />);

    it('should render correctly', () => {
      expect(editor.mceNode.tagName.toLowerCase()).to.be('div');
    });

    it('should action correctly when input', done => {
      editor.editor.insertContent('@a');
      editor.onKeyup({
        keyCode: 65,
      });
      setTimeout(() => {
        expect(editor.state.panelVisible).to.be(true);
        editor.editor.fire('keydown', { keyCode: KEYCODE.DOWN });
        editor.editor.fire('keyup', { keyCode: KEYCODE.DOWN });
        editor.editor.fire('keydown', { keyCode: KEYCODE.ENTER });
        editor.editor.fire('keyup', { keyCode: KEYCODE.ENTER });
        expect(editor.editor.getContent()).to.be('<div>@aabbb</div>');
        btn.click();
        expect(editor.props.insertMode).to.be('ELEMENT_NODE');
        editor.editor.insertContent('@a');
        editor.editor.fire('keydown', { keyCode: 65 });
        editor.editor.fire('keyup', { keyCode: 65 });
        setTimeout(() => {
          editor.editor.fire('keydown', { keyCode: KEYCODE.ENTER });
          editor.editor.fire('keyup', { keyCode: KEYCODE.ENTER });
          expect(editor.editor.getContent()).to.be('<div>@aabbb<input class="kuma-mention-node" tabindex="-1" type="button" value="@aaaaa" /></div>');
          done();
        }, 100);
      }, 100);
    });

    it('should ummount correctly', () => {
      ReactDOM.unmountComponentAtNode(dom);
    });
  });
});
