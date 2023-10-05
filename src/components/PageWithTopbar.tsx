import React from 'react'
import { Topbar } from './Topbar'

const PageWithTopbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      {children}
    </div>
  )
}

export default PageWithTopbar
