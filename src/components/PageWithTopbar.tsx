import React from 'react'
import { Topbar } from './Topbar'

const PageWithTopbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Topbar />
      {children}
    </>
  )
}

export default PageWithTopbar
