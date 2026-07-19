import type { FieldRendererMap } from '../../types'
import { StringField, NumberField, PasswordField } from './TextFields'
import { OptionsField, MultiOptionsField, BooleanField } from './ChoiceFields'
import { CodeField, JsonField } from './EditorFields'
import { FileField, DataGridField } from './FileAndGridFields'
import { DatePickerField, MonthDaysPickerField, TimePickerField, WeekDaysPickerField } from './PickerFields'
import ArrayField from './ArrayField'
import TabsField from './TabsField'
import AsyncOptionsField from './AsyncOptionsField'

/**
 * Kit default field renderers. Consumers merge over these via
 * `config.fieldRenderers`; key by param `type`, or `"nodeName:paramName"`
 * for one-off overrides.
 *
 * Domain types the kit intentionally does NOT know about (e.g. Flowise's
 * `credential`, `conditionFunction`) fall through to `default` (plain text)
 * unless the consumer registers a renderer.
 */
export const defaultFieldRenderers: FieldRendererMap = {
    default: StringField,
    string: StringField,
    password: PasswordField,
    number: NumberField,
    boolean: BooleanField,
    options: OptionsField,
    multiOptions: MultiOptionsField,
    asyncOptions: AsyncOptionsField,
    asyncMultiOptions: AsyncOptionsField,
    json: JsonField,
    code: CodeField,
    file: FileField,
    folder: FileField,
    date: DatePickerField,
    datePicker: DatePickerField,
    timePicker: TimePickerField,
    weekDaysPicker: WeekDaysPickerField,
    monthDaysPicker: MonthDaysPickerField,
    datagrid: DataGridField,
    array: ArrayField,
    tabs: TabsField
}

export { StringField, NumberField, PasswordField, OptionsField, MultiOptionsField, BooleanField }
export { CodeField, JsonField, FileField, DataGridField }
export { DatePickerField, TimePickerField, WeekDaysPickerField, MonthDaysPickerField }
export { ArrayField, TabsField, AsyncOptionsField }
export { default as FieldWrapper } from './FieldWrapper'
