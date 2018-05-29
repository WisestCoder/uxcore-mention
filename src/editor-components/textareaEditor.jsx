import React from 'react';
import PropTypes from 'prop-types';
import BaseEditor from './baseEditor';
import { parseStrByDelimiter, getCaretOffset, getCaretPosition, createEvent } from '../utils/util';

/**
 * @i18n {zh-CN} textarea中使用mention
 * @i18n {en-US} mention in textarea
 */
export default class TextareaEditor extends BaseEditor {

  static displayName = 'TextareaEditor';
  static propTypes = {
    /**
     * @i18n {zh-CN} class前缀
     * @i18n {en-US} class prefix
     */
    prefixCls: PropTypes.string,
    /**
     * @i18n {zh-CN} 编辑区域宽度
     * @i18n {en-US} editor's width
     */
    width: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    /**
     * @i18n {zh-CN} 编辑区域高度
     * @i18n {en-US} editor's height
     */
    height: PropTypes.number,
    /**
     * @i18n {zh-CN} placeholder
     * @i18n {en-US} placeholder
     */
    placeholder: PropTypes.string,
    /**
     * @i18n {zh-CN} 自定义插入的mention内容
     * @i18n {en-US} customize the insert content with this function | function
     */
    mentionFormatter: PropTypes.func,
    /**
     * @i18n {zh-CN} 发生变化后的触发
     * @i18n {en-US} trigger when editor content change
     */
    // onChange: PropTypes.func,
    /**
     * @i18n {zh-CN} 添加mention后触发
     * @i18n {en-US} Callback invoked when a mention has been added
     */
    onAdd: PropTypes.func,
    /**
     * @i18n {zh-CN} 默认内容
     * @i18n {en-US} default value
     */
    defaultValue: PropTypes.string,
    /**
     * @i18n {zh-CN} 内容
     * @i18n {en-US} value
     */
    value: PropTypes.string,
    /**
     * @i18n {zh-CN} 只读
     * @i18n {en-US} read only
     */
    readOnly: PropTypes.bool,
    /**
     * @i18n {zh-CN} 触发字符
     * @i18n {en-US} Defines the char sequence upon which to trigger querying the data source
     */
    delimiter: PropTypes.string,
    /**
     * @i18n {zh-CN} 最大长度
     * @i18n {en-US} max length of content
     */
    maxLength: PropTypes.number,
  };
  static defaultProps = {
    prefixCls: '',
    width: 200,
    height: 100,
    placeholder: '',
    mentionFormatter: (data) => ` @${data.text} `,
    // onChange: () => {},
    onAdd: () => {},
    defaultValue: '',
    readOnly: false,
    delimiter: '@',
    value: '',
    maxLength: -1,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || props.defaultValue,
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }
  componentDidMount() {
    this.selectionPosition = {
      start: 0,
      end: 0,
    };
  }
  handleDefaultKeyup() {
    const editor = this.editor;
    const { delimiter } = this.props;
    const offset = getCaretOffset(editor);
    let { value } = this.state;
    value = value.replace(/(\r\n)|\n|\r/g, '\n');
    const originStr = value.slice(0, offset.end);
    const str = parseStrByDelimiter(originStr, delimiter);
    this.props.matcher(str);
    this.selectionPosition = {
      start: offset.start - str.length - 1,
      end: offset.end,
    };
    if (str !== false) {
      const position = getCaretPosition(editor);
      this.props.setCursorPos({
        x: position.left,
        y: position.top,
      });
    }
  }
  insert(mentionContent) {
    this.insertContentAtCaret(mentionContent);
  }
  insertContentAtCaret(text) {
    const editor = this.editor;
    if (document.selection) {
      editor.focus();
      if (editor.createTextRange) {
        const range = editor.createTextRange();
        range.collapse(true);
        range.moveStart('character', this.selectionPosition.start);
        range.moveEnd('character', this.selectionPosition.end - this.selectionPosition.start);
        range.text = text;
      } else if (editor.setSelectionRange) {
        editor.setSelectionRange(this.selectionPosition.start, this.selectionPosition.end);
      }
    } else {
      const scrollTop = editor.scrollTop;
      let { value } = this.state;
      value = value.substring(0, this.selectionPosition.start) +
        text +
        value.substring(this.selectionPosition.end, value.length);
      this.setState({
        value,
      }, () => {
        editor.focus();
        editor.scrollTop = scrollTop;
      });
    }
    const changeEvt = createEvent(editor, 'change');
    this.props.onChange(changeEvt, this.state.value);
  }
  handleChange(e) {
    this.setState({
      value: e.target.value,
    });
    this.props.onChange(e, this.state.value);
  }
  render() {
    const { value } = this.state;
    const { readOnly, placeholder, maxLength } = this.props;
    let style = {
      width: this.props.width,
      height: this.props.height,
    };
    return (
      <div className={this.props.prefixCls}>
        <textarea
          {...(Number(maxLength) > 0 ? { maxLength } : {})}
          ref={el => (this.editor = el)}
          className={`${this.props.prefixCls}-editor kuma-textarea`}
          style={style}
          readOnly={readOnly}
          placeholder={placeholder}
          onKeyDown={this.onKeydown.bind(this)}
          onKeyUp={this.onKeyup.bind(this)}
          onFocus={this.onFocus.bind(this)}
          onChange={this.handleChange}
          value={value}
        />
      </div>
    );
  }
}
