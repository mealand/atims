require('dotenv').config()
const app = require('./app')
const logger = require('./utils/logger')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(`ATiMs API running on port ${PORT} [${process.env.NODE_ENV}]`)
})
