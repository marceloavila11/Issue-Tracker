'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Issue schema
const issueSchema = new Schema({
  project: { type: String },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true }
});

// Create the Issue model
const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(async function (req, res) {
      const project = req.params.project;
      const filters = { project, ...req.query };

      try {
        const issues = await Issue.find(filters);
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve issues' });
      }
    })
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const issue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        });
        const savedIssue = await issue.save();
        res.json(savedIssue);
      } catch (err) {
        res.status(500).json({ error: 'Failed to create issue' });
      }
    })
    .put(async function (req, res) {
      const project = req.params.project;
      const { _id, ...updates } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      try {
        const updatedIssue = await Issue.findByIdAndUpdate(
          _id,
          { ...updates, updated_on: new Date() },
          { new: true }
        );
        if (!updatedIssue) {
          return res.json({ error: 'could not update', _id });
        }
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })
    .delete(async function (req, res) {
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id);
        if (!deletedIssue) {
          return res.json({ error: 'could not delete', _id });
        }
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
