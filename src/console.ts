import * as chalk from 'chalk'
import * as logUpdate from 'log-update'
const columnify = require('columnify')

const startBuild = (rooms: string[]) => {
  outputColumns = rooms.reduce((acc: any, room: string) => {
    acc[room] = ''
    return acc
  }, {})

  updateRows(rooms, 'Ready...')
}

let outputColumns: any = {}
const updateRows = (
  rooms: string[],
  status: string,
  alternateStatus = 'Waiting...'
) => {
  // default all to alternate status
  Object.keys(outputColumns).forEach(room => {
    if (rooms.includes(room)) {
      outputColumns[room] = status
    } else if (!outputColumns[room].includes('Cached')) {
      // Use the alternate status, UNLESS it is flagged as cached
      outputColumns[room] = alternateStatus
    }
  })

  logUpdate(
    columnify(outputColumns, {
      columns: ['Room', 'Status']
    })
  )
}

export default {
  startBuild,
  updateRows
}
