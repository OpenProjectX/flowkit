import { useState, ChangeEvent } from 'react'
import { useTheme } from '@mui/material/styles'
import { FormControl, Button } from '@mui/material'
import { IconUpload } from '@tabler/icons-react'

// copied from Flowise's `utils/genericHelper.getFileName` (kept local to stay decoupled)
const getFileName = (fileBase64: string): string => {
    const fileNames: string[] = []
    if (fileBase64.startsWith('FILE-STORAGE::')) {
        const names = fileBase64.substring(14)
        if (names.includes('[') && names.includes(']')) {
            const files = JSON.parse(names)
            return files.join(', ')
        } else {
            return fileBase64.substring(14)
        }
    }
    if (fileBase64.startsWith('[') && fileBase64.endsWith(']')) {
        const files = JSON.parse(fileBase64)
        for (const file of files) {
            const splitDataURI = file.split(',')
            const filename = splitDataURI[splitDataURI.length - 1].split(':')[1]
            fileNames.push(filename)
        }
        return fileNames.join(', ')
    } else {
        const splitDataURI = fileBase64.split(',')
        const filename = splitDataURI[splitDataURI.length - 1].split(':')[1]
        return filename
    }
}

export interface FileProps {
    value?: string
    fileType?: string
    formDataUpload?: boolean
    onChange?: (value: string) => void
    /**
     * Receives the multipart `FormData` (files appended under the `files` key) when
     * `formDataUpload` is enabled — the consumer decides where/how to upload it.
     */
    onFormDataChange?: (formData: FormData) => void
    disabled?: boolean
}

export const File = ({ value, formDataUpload, fileType, onChange, onFormDataChange, disabled = false }: FileProps) => {
    const theme = useTheme()

    const [myValue, setMyValue] = useState(value ?? '')

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return

        if (e.target.files.length === 1) {
            const file = e.target.files[0]
            const { name } = file

            const reader = new FileReader()
            reader.onload = (evt) => {
                if (!evt?.target?.result) {
                    return
                }
                const { result } = evt.target

                const value = result + `,filename:${name}`

                setMyValue(value as string)
                onChange?.(value as string)
            }
            reader.readAsDataURL(file)
        } else if (e.target.files.length > 0) {
            const files = Array.from(e.target.files).map((file) => {
                const reader = new FileReader()
                const { name } = file

                return new Promise<string>((resolve) => {
                    reader.onload = (evt) => {
                        if (!evt?.target?.result) {
                            return
                        }
                        const { result } = evt.target
                        const value = result + `,filename:${name}`
                        resolve(value as string)
                    }
                    reader.readAsDataURL(file)
                })
            })

            const res = await Promise.all(files)
            setMyValue(JSON.stringify(res))
            onChange?.(JSON.stringify(res))
        }
    }

    const handleFormDataUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return

        if (e.target.files.length === 1) {
            const file = e.target.files[0]
            const { name } = file
            const formData = new FormData()
            formData.append('files', file)
            setMyValue(`,filename:${name}`)
            onChange?.(`,filename:${name}`)
            onFormDataChange?.(formData)
        } else if (e.target.files.length > 0) {
            const formData = new FormData()
            const values: string[] = []
            for (let i = 0; i < e.target.files.length; i++) {
                formData.append('files', e.target.files[i])
                values.push(`,filename:${e.target.files[i].name}`)
            }
            setMyValue(JSON.stringify(values))
            onChange?.(JSON.stringify(values))
            onFormDataChange?.(formData)
        }
    }

    return (
        <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
            {!formDataUpload && (
                <span
                    style={{
                        fontStyle: 'italic',
                        color: theme.palette.grey['800'],
                        marginBottom: '1rem'
                    }}
                >
                    {myValue ? getFileName(myValue) : 'Choose a file to upload'}
                </span>
            )}
            <Button
                disabled={disabled}
                variant='outlined'
                component='label'
                fullWidth
                startIcon={<IconUpload />}
                sx={{ marginRight: '1rem' }}
            >
                {'Upload File'}
                <input
                    type='file'
                    multiple
                    accept={fileType}
                    hidden
                    onChange={(e) => (formDataUpload ? handleFormDataUpload(e) : handleFileUpload(e))}
                />
            </Button>
        </FormControl>
    )
}

export default File
