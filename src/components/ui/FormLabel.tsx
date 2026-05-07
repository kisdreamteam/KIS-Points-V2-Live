import type { FC, ReactNode } from 'react'

type FormLabelProps = {
  htmlFor: string
  children: ReactNode
  className?: string
}

const FormLabel: FC<FormLabelProps> = ({
  htmlFor,
  children,
  className = '',
}) => {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  )
}

export default FormLabel
