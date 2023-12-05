import ErrorBoundary from '../electerm-react/components/main/error-wrapper'
import Main from '../electerm-react/components/main/main.jsx'
import store from './web-store'
import FileSelectDialog from '../file-select-dialog/file-select-dialog'

export default function MainEntry () {
  return (
    <ErrorBoundary>
      <Main store={store} />
      <FileSelectDialog store={store} />
    </ErrorBoundary>
  )
}
