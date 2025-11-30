import { ComponentType } from 'react'
import { useUpdateVersion, UseUpdateVersionOptions } from './use-update-version'

export const withVersionUpdateCheck = <P extends object>(
  Component: ComponentType<P>,
  options?: UseUpdateVersionOptions
) => {
  const WithVersionUpdateCheck = (props: P) => {
    useUpdateVersion(options)

    return <Component {...props} />
  }

  return WithVersionUpdateCheck
}
