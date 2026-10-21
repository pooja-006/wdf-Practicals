const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
})

taskSchema.pre('save', function trimTitle(next) {
  this.title = this.title.trim()
  next()
})

module.exports = mongoose.model('Task', taskSchema)
