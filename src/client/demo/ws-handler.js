export function extractInfoFromURL (url) {
  // Create a new URL object from the parameter
  const urlObj = new URL(url)

  // Get the type, id, sessionId and sftpId from the pathname and search parameters
  const pathname = urlObj.pathname // /${type}/${id}
  const searchParams = urlObj.searchParams // ?sessionId=${sessionId}&sftpId=${sftpId}

  // Split the pathname by "/" and get the second and third elements
  const pathArray = pathname.split('/')
  const type = pathArray[1] // ${type}
  const id = pathArray[2] // ${id}

  // Get the sessionId and sftpId from the search parameters
  const sessionId = searchParams.get('sessionId') // ${sessionId}
  const sftpId = searchParams.get('sftpId') // ${sftpId}

  // Return an object with the extracted information
  return {
    type,
    id,
    sessionId,
    sftpId
  }
}
