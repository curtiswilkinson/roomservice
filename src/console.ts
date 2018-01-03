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
const updateRows = (rooms: string[], status: string) => {
  rooms.forEach(room => {
    outputColumns[room] = status
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
