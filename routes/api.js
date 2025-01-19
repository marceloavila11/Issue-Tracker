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
        const issues = await Issue.find(filters).select('-__v'); // Exclude __v field
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve issues' });
      }
    })
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

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
          status_text,
          open: true,
          created_on: new Date(),
          updated_on: new Date()
        });

        const savedIssue = await issue.save();
        res.json({
          _id: savedIssue._id,
          issue_title: savedIssue.issue_title,
          issue_text: savedIssue.issue_text,
          created_by: savedIssue.created_by,
          assigned_to: savedIssue.assigned_to,
          status_text: savedIssue.status_text,
          created_on: savedIssue.created_on,
          updated_on: savedIssue.updated_on,
          open: savedIssue.open
        });
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
        updates.updated_on = new Date(); // Update the updated_on field
        const updatedIssue = await Issue.findByIdAndUpdate(
          _id,
          { ...updates },
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
