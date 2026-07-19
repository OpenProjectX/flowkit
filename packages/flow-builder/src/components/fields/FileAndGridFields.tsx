import { memo } from 'react'
import { DataGrid, File } from '@openprojectx/ui-foundation'
import type { GridColDef } from '@mui/x-data-grid'
import type { FieldRendererProps } from '../../types'
import FieldWrapper from './FieldWrapper'

/** `file` — file picker; stores the base64/string content in the input value. */
export const FileField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => (
    <FieldWrapper inputParam={inputParam}>
        <File
            disabled={disabled}
            fileType={(inputParam.fileType as string) || '*'}
            onChange={onChange}
            value={(value as string) ?? (inputParam.default as string) ?? 'Choose a file to upload'}
        />
    </FieldWrapper>
))
FileField.displayName = 'FileField'

/**
 * `datagrid` — editable grid; value is a JSON string of row objects
 * (Flowise convention). Column defs come from `inputParam.datagrid`.
 */
export const DataGridField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => (
    <FieldWrapper inputParam={inputParam}>
        <DataGrid
            disabled={disabled}
            columns={(inputParam.datagrid as GridColDef[]) ?? []}
            hideFooter={true}
            rows={(value as string) ?? JSON.stringify(inputParam.default) ?? []}
            onChange={onChange}
        />
    </FieldWrapper>
))
DataGridField.displayName = 'DataGridField'
