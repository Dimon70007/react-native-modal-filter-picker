import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Modal,
  View,
  ListView,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native'


import styles from './styles'


export default class ModalFilterPicker extends Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    placeholderText: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    androidUnderlineColor: PropTypes.string,
    cancelButtonText: PropTypes.string,
    title: PropTypes.string,
    noResultsText: PropTypes.string,
    visible: PropTypes.bool,
    showFilter: PropTypes.bool,
    modal: PropTypes.object,
    selectedOption: PropTypes.string,
    renderOption: PropTypes.func,
    renderCancelButton: PropTypes.func,
    renderList: PropTypes.func,
    listViewProps: PropTypes.object,
    filterTextInputContainerStyle: PropTypes.any,
    filterTextInputStyle: PropTypes.any,
    cancelContainerStyle: PropTypes.any,
    cancelButtonStyle: PropTypes.any,
    cancelButtonTextStyle: PropTypes.any,
    titleTextStyle: PropTypes.any,
    overlayStyle: PropTypes.any,
    listContainerStyle: PropTypes.any,
    optionTextStyle:PropTypes.any,
    selectedOptionTextStyle:PropTypes.any,
    keyboardShouldPersistTaps: PropTypes.string
  }

  static defaultProps = {
    placeholderText: 'Filter...',
    placeholderTextColor: '#ccc',
    androidUnderlineColor: 'rgba(0,0,0,0)',
    cancelButtonText: 'Cancel',
    noResultsText: 'No matches',
    visible: true,
    showFilter: true,
    keyboardShouldPersistTaps: 'never',
    options: [],
    filterTextInputContainerStyle: null,
    filterTextInputStyle: null,
    cancelContainerStyle: null,
    cancelButtonStyle: null,
    cancelButtonTextStyle: null,
    titleTextStyle: null,
    overlayStyle: null,
    listContainerStyle: null,
    optionTextStyle:null,
    selectedOptionTextStyle:null,
    asyncTimeout: 700,
  }

  constructor (props, ctx) {
    super(props, ctx)

    this.state = {
      filter: '',
      ds: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1.key !== r2.key
      }).cloneWithRows(props.options)
    }
  }

  componentWillReceiveProps (newProps) {
    const {
      options,
      visible,
      onFilterChangeAsync,
    } = this.props;
    const oldFirst = options[0] || {};
    const newFirst = newProps.options[0] || {};
    const enabledAsyncLoading = !!onFilterChangeAsync;
    if ((!visible && newProps.visible)
      || (options.length !== newProps.options.length)
      || (oldFirst.key && oldFirst.key !== newFirst.key)) {
      this.setState(prevState => ({
        filter: enabledAsyncLoading ? prevState.filter : '',
        ds: this.state.ds.cloneWithRows(newProps.options),
      }))
    }
    if (!visible
      && newProps.visible
      && onFilterChangeAsync) {
      onFilterChangeAsync('', newProps.options)
    }

  }

  componentWillUnmount() {
    clearTimeout(this.filterTimer);
  }

  render () {
    const {
      title,
      titleTextStyle,
      overlayStyle,
      cancelContainerStyle,
      renderList,
      renderCancelButton,
      visible,
      modal,
      onCancel
    } = this.props

    const renderedTitle = (!title) ? null : (
      <Text style={[styles.titleTextStyle, titleTextStyle]}>{title}</Text>
    )

    return (
      <Modal
        onRequestClose={onCancel}
        {...modal}
        visible={visible}
        supportedOrientations={['portrait', 'landscape']}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={[styles.overlay, overlayStyle]}
          enabled={Platform.OS === 'ios'}
        >
          <View>{renderedTitle}</View>
          {(renderList || this.renderList)()}
          <View style={[styles.cancelContainer, cancelContainerStyle]}>
            {(renderCancelButton || this.renderCancelButton)()}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    )
  }

  renderList = () => {
    const {
      showFilter,
      autoFocus,
      listContainerStyle,
      androidUnderlineColor,
      placeholderText,
      placeholderTextColor,
      filterTextInputContainerStyle,
      filterTextInputStyle,
      isLoading
    } = this.props

    const filter = (!showFilter) ? null : (
      <View style={[styles.filterTextInputContainer, filterTextInputContainerStyle]}>
        <TextInput
          onChangeText={this.onFilterChange}
          autoCorrect={false}
          blurOnSubmit={true}
          autoFocus={autoFocus}
          autoCapitalize="none"
          underlineColorAndroid={androidUnderlineColor}
          placeholderTextColor={placeholderTextColor}
          placeholder={placeholderText}
          style={[styles.filterTextInput, filterTextInputStyle]} />
          {isLoading && <ActivityIndicator style={[styles.filterTextInput, styles.loadingIndicator]} />}
      </View>
    )

    return (
      <View style={[styles.listContainer, listContainerStyle]}>
        {filter}
        {this.renderOptionList()}
      </View>
    )
  }

  renderOptionList = () => {
    const {
      noResultsText,
      listViewProps,
      keyboardShouldPersistTaps
    } = this.props

    const { ds } = this.state

    if (1 > ds.getRowCount()) {
      return (
        <ListView
          enableEmptySections={false}
          {...listViewProps}
          dataSource={ds.cloneWithRows([{ key: '_none' }])}
          renderRow={() => (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>{noResultsText}</Text>
            </View>
          )}
        />
      )
    } else {
      return (
        <ListView
          enableEmptySections={false}
          {...listViewProps}
          dataSource={ds}
          renderRow={this.renderOption}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        />
      )
    }
  }

  renderOption = (rowData) => {
    const {
      selectedOption,
      renderOption,
      optionTextStyle,
      selectedOptionTextStyle
    } = this.props

    const { key, label } = rowData

    let style = styles.optionStyle
    let textStyle = [styles.optionTextStyle, optionTextStyle]

    if (key === selectedOption) {
      style = styles.selectedOptionStyle
      textStyle = [styles.selectedOptionTextStyle, selectedOptionTextStyle]
    }

    if (renderOption) {
      return renderOption(rowData, key === selectedOption)
    } else {
      return (
        <TouchableOpacity activeOpacity={0.7}
          style={style}
          onPress={() => this.props.onSelect(rowData)}
        >
          <Text style={textStyle}>{label}</Text>
        </TouchableOpacity>
      )
    }
  }

  renderCancelButton = () => {
    const {
      cancelButtonStyle,
      cancelButtonTextStyle,
      cancelButtonText
    } = this.props

    return (
      <TouchableOpacity onPress={this.props.onCancel}
        activeOpacity={0.7}
        style={[styles.cancelButton, cancelButtonStyle]}
      >
        <Text style={[styles.cancelButtonText, cancelButtonTextStyle]}>{cancelButtonText}</Text>
      </TouchableOpacity>
    )
  }

  onFilterChange = async (text) => {
    const { options, onFilterChangeAsync, asyncTimeout } = this.props
    const filter = text.toLowerCase();
    let filtered = options;
    if (onFilterChangeAsync) {
      clearTimeout(this.filterTimer);
      this.filterTimer = setTimeout(() => onFilterChangeAsync(filter, options), asyncTimeout);
    }
    // apply filter to incoming data
    filtered = (!filter.length)
      ? options
      : options.filter(({ searchKey, label, key }) => (
        0 <= label.toLowerCase().indexOf(filter) ||
          (searchKey && 0 <= searchKey.toLowerCase().indexOf(filter))
      ))
    this.setState({
      filter: text.toLowerCase(),
      ds: this.state.ds.cloneWithRows(filtered)
    });
  }
}
