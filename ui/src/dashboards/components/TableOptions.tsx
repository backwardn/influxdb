import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import GraphOptionsCustomizeFields from 'src/dashboards/components/GraphOptionsCustomizeFields'
import GraphOptionsFixFirstColumn from 'src/dashboards/components/GraphOptionsFixFirstColumn'
import GraphOptionsSortBy from 'src/dashboards/components/GraphOptionsSortBy'
import GraphOptionsTimeAxis from 'src/dashboards/components/GraphOptionsTimeAxis'
import GraphOptionsTimeFormat from 'src/dashboards/components/GraphOptionsTimeFormat'
import FancyScrollbar from 'src/shared/components/FancyScrollbar'

import _ from 'lodash'

import ThresholdsList from 'src/shared/components/ThresholdsList'
import ThresholdsListTypeToggle from 'src/shared/components/ThresholdsListTypeToggle'

import {updateTableOptions} from 'src/dashboards/actions/cellEditorOverlay'
import {TIME_FIELD_DEFAULT} from 'src/shared/constants/tableGraph'
import {QueryConfig} from 'src/types/query'

interface Option {
  text: string
  key: string
}

interface RenamableField {
  internalName: string
  displayName: string
  visible: boolean
}

interface Options {
  timeFormat: string
  verticalTimeAxis: boolean
  sortBy: RenamableField
  fieldNames: RenamableField[]
  fixFirstColumn: boolean
}

interface Props {
  queryConfigs: QueryConfig[]
  handleUpdateTableOptions: (options: Options) => void
  tableOptions: Options
  onResetFocus: () => void
}

export class TableOptions extends PureComponent<Props, {}> {
  constructor(props) {
    super(props)
    this.moveField = this.moveField.bind(this)
  }

  public render() {
    const {
      tableOptions: {timeFormat, fieldNames, verticalTimeAxis, fixFirstColumn},
      onResetFocus,
      tableOptions,
    } = this.props

    const tableSortByOptions = fieldNames.map(field => ({
      key: field.internalName,
      text: field.displayName || field.internalName,
    }))

    return (
      <FancyScrollbar
        className="display-options--cell y-axis-controls"
        autoHide={false}
      >
        <div className="display-options--cell-wrapper">
          <h5 className="display-options--header">Table Controls</h5>
          <div className="form-group-wrapper">
            <GraphOptionsTimeFormat
              timeFormat={timeFormat}
              onTimeFormatChange={this.handleTimeFormatChange}
            />
            <GraphOptionsTimeAxis
              verticalTimeAxis={verticalTimeAxis}
              onToggleVerticalTimeAxis={this.handleToggleVerticalTimeAxis}
            />
            <GraphOptionsSortBy
              selected={tableOptions.sortBy || TIME_FIELD_DEFAULT}
              sortByOptions={tableSortByOptions}
              onChooseSortBy={this.handleChooseSortBy}
            />
            <GraphOptionsFixFirstColumn
              fixed={fixFirstColumn}
              onToggleFixFirstColumn={this.handleToggleFixFirstColumn}
            />
          </div>
          <GraphOptionsCustomizeFields
            fields={fieldNames}
            onFieldUpdate={this.handleFieldUpdate}
            moveField={this.moveField}
          />
          <ThresholdsList showListHeading={true} onResetFocus={onResetFocus} />
          <div className="form-group-wrapper graph-options-group">
            <ThresholdsListTypeToggle containerClass="form-group col-xs-6" />
          </div>
        </div>
      </FancyScrollbar>
    )
  }

  private moveField(dragIndex, hoverIndex) {
    const {handleUpdateTableOptions, tableOptions} = this.props
    const {fieldNames} = tableOptions

    const dragField = fieldNames[dragIndex]
    const removedFields = _.concat(
      _.slice(fieldNames, 0, dragIndex),
      _.slice(fieldNames, dragIndex + 1)
    )
    const addedFields = _.concat(
      _.slice(removedFields, 0, hoverIndex),
      [dragField],
      _.slice(removedFields, hoverIndex)
    )
    handleUpdateTableOptions({
      ...tableOptions,
      fieldNames: addedFields,
    })
  }

  private handleChooseSortBy = (option: Option) => {
    const {tableOptions, handleUpdateTableOptions} = this.props
    const sortBy = {
      displayName: option.text === option.key ? '' : option.text,
      internalName: option.key,
      visible: true,
    }

    handleUpdateTableOptions({...tableOptions, sortBy})
  }

  private handleTimeFormatChange = timeFormat => {
    const {tableOptions, handleUpdateTableOptions} = this.props
    handleUpdateTableOptions({...tableOptions, timeFormat})
  }

  private handleToggleVerticalTimeAxis = verticalTimeAxis => () => {
    const {tableOptions, handleUpdateTableOptions} = this.props
    handleUpdateTableOptions({...tableOptions, verticalTimeAxis})
  }

  private handleToggleFixFirstColumn = () => {
    const {handleUpdateTableOptions, tableOptions} = this.props
    const fixFirstColumn = !tableOptions.fixFirstColumn
    handleUpdateTableOptions({...tableOptions, fixFirstColumn})
  }

  private handleFieldUpdate = field => {
    const {handleUpdateTableOptions, tableOptions} = this.props
    const {sortBy, fieldNames} = tableOptions
    const updatedFields = fieldNames.map(
      f => (f.internalName === field.internalName ? field : f)
    )
    const updatedSortBy =
      sortBy.internalName === field.internalName
        ? {...sortBy, displayName: field.displayName}
        : sortBy

    handleUpdateTableOptions({
      ...tableOptions,
      fieldNames: updatedFields,
      sortBy: updatedSortBy,
    })
  }
}

const mapStateToProps = ({cellEditorOverlay: {cell: {tableOptions}}}) => ({
  tableOptions,
})

const mapDispatchToProps = dispatch => ({
  handleUpdateTableOptions: bindActionCreators(updateTableOptions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(TableOptions)
